import { describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import { getDiagnosticQuestionSet, startOrResumeDiagnostic, scoreDiagnostic } from '@/lib/diagnostic-engine';
import { evaluateAndRecordResponse } from '@/lib/response-engine';
import { createFixtureExam, createFixtureUser, deleteFixtureExam, deleteFixtureUser } from './helpers';

describe('getDiagnosticQuestionSet', () => {
  it('selects questions spanning every domain and is stable across calls with the same seed', async () => {
    const { exam } = await createFixtureExam('question-selection');

    const first = await getDiagnosticQuestionSet(exam.id, 'fixed-seed-1');
    const second = await getDiagnosticQuestionSet(exam.id, 'fixed-seed-1');

    expect(first.length).toBeGreaterThan(0);
    expect(first.map((q) => q.id)).toEqual(second.map((q) => q.id));

    // Both fixture skills (one per domain) should be represented.
    const skillIds = new Set(first.map((q) => q.skillId));
    expect(skillIds.size).toBe(2);

    await deleteFixtureExam(exam.id);
  });

  it('produces a different order for a different seed', async () => {
    const { exam } = await createFixtureExam('question-selection-seeds');

    const a = await getDiagnosticQuestionSet(exam.id, 'seed-a');
    const b = await getDiagnosticQuestionSet(exam.id, 'seed-b');

    // Not guaranteed to differ in theory, but with 6 questions and two
    // independent seeds collision is astronomically unlikely; this guards
    // against the seed silently not being used at all.
    expect(a.map((q) => q.id)).not.toEqual(b.map((q) => q.id));

    await deleteFixtureExam(exam.id);
  });
});

describe('scoreDiagnostic', () => {
  it('computes overall score and ranks domains by ascending accuracy', async () => {
    const { exam, questionsA, questionsB } = await createFixtureExam('scoring');
    const { user } = await createFixtureUser('scoring');

    const assessment = await startOrResumeDiagnostic(user.id, exam.id);
    const attemptId = assessment.attempt!.id;

    // Domain A (via questionsA / skillA): answer all correct.
    for (const question of questionsA) {
      const correctOptionId = question.options.find((o) => o.isCorrect)!.id;
      await evaluateAndRecordResponse({ attemptId, questionId: question.id, selectedOptionIds: [correctOptionId] });
    }
    // Domain B (via questionsB / skillB): answer all incorrect.
    for (const question of questionsB) {
      const wrongOptionId = question.options.find((o) => !o.isCorrect)!.id;
      await evaluateAndRecordResponse({ attemptId, questionId: question.id, selectedOptionIds: [wrongOptionId] });
    }

    const result = await scoreDiagnostic(assessment.id);

    expect(result.overallScore).toBeCloseTo(50, 5); // 3 correct out of 6

    const priorities = result.priorities as unknown as { rank: number; domainName: string; accuracy: number }[];
    expect(priorities[0].domainName).toBe('Domain B'); // weakest domain first
    expect(priorities[0].accuracy).toBe(0);
    expect(priorities[1].accuracy).toBe(100);

    await deleteFixtureExam(exam.id);
    await deleteFixtureUser(user.id);
  });

  it('is idempotent: calling it twice for the same assessment does not error and returns the same result', async () => {
    const { exam, questionsA } = await createFixtureExam('scoring-idempotent');
    const { user } = await createFixtureUser('scoring-idempotent');

    const assessment = await startOrResumeDiagnostic(user.id, exam.id);
    const attemptId = assessment.attempt!.id;
    const correctOptionId = questionsA[0].options.find((o) => o.isCorrect)!.id;
    await evaluateAndRecordResponse({ attemptId, questionId: questionsA[0].id, selectedOptionIds: [correctOptionId] });

    const first = await scoreDiagnostic(assessment.id);
    const second = await scoreDiagnostic(assessment.id);

    expect(second.id).toBe(first.id);

    const count = await prisma.diagnosticResult.count({ where: { diagnosticAssessmentId: assessment.id } });
    expect(count).toBe(1);

    await deleteFixtureExam(exam.id);
    await deleteFixtureUser(user.id);
  });
});

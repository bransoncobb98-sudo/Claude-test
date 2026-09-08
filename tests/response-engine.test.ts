import { describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import { evaluateAndRecordResponse, startAttempt } from '@/lib/response-engine';
import { createFixtureExam, createFixtureUser, deleteFixtureExam, deleteFixtureUser } from './helpers';

describe('evaluateAndRecordResponse', () => {
  it('marks a correct multiple-choice answer correct and records a Response row', async () => {
    const { exam, skillA, questionsA } = await createFixtureExam('response-correct');
    const { user } = await createFixtureUser('response-correct');
    const attempt = await startAttempt({ userId: user.id, type: 'STUDY_PRACTICE', skillId: skillA.id });

    const question = questionsA[0];
    const correctOptionId = question.options.find((o) => o.isCorrect)!.id;

    const result = await evaluateAndRecordResponse({
      attemptId: attempt.id,
      questionId: question.id,
      selectedOptionIds: [correctOptionId],
    });

    expect(result.isCorrect).toBe(true);
    expect(result.explanation).toBe('Fixture explanation.');

    const responses = await prisma.response.findMany({ where: { attemptId: attempt.id } });
    expect(responses).toHaveLength(1);
    expect(responses[0].isCorrect).toBe(true);

    await deleteFixtureExam(exam.id);
    await deleteFixtureUser(user.id);
  });

  it('marks an incorrect answer incorrect and creates a Mistake row', async () => {
    const { exam, skillA, questionsA } = await createFixtureExam('response-incorrect');
    const { user } = await createFixtureUser('response-incorrect');
    const attempt = await startAttempt({ userId: user.id, type: 'STUDY_PRACTICE', skillId: skillA.id });

    const question = questionsA[0];
    const wrongOptionId = question.options.find((o) => !o.isCorrect)!.id;

    const result = await evaluateAndRecordResponse({
      attemptId: attempt.id,
      questionId: question.id,
      selectedOptionIds: [wrongOptionId],
    });
    expect(result.isCorrect).toBe(false);

    const mistake = await prisma.mistake.findUnique({
      where: { userId_questionId: { userId: user.id, questionId: question.id } },
    });
    expect(mistake).not.toBeNull();
    expect(mistake?.timesMissed).toBe(1);

    await deleteFixtureExam(exam.id);
    await deleteFixtureUser(user.id);
  });

  it('increments timesMissed on repeated misses of the same question', async () => {
    const { exam, skillA, questionsA } = await createFixtureExam('response-repeat-miss');
    const { user } = await createFixtureUser('response-repeat-miss');
    const attempt = await startAttempt({ userId: user.id, type: 'STUDY_PRACTICE', skillId: skillA.id });

    const question = questionsA[0];
    const wrongOptionId = question.options.find((o) => !o.isCorrect)!.id;

    await evaluateAndRecordResponse({ attemptId: attempt.id, questionId: question.id, selectedOptionIds: [wrongOptionId] });
    await evaluateAndRecordResponse({ attemptId: attempt.id, questionId: question.id, selectedOptionIds: [wrongOptionId] });

    const mistake = await prisma.mistake.findUnique({
      where: { userId_questionId: { userId: user.id, questionId: question.id } },
    });
    expect(mistake?.timesMissed).toBe(2);

    await deleteFixtureExam(exam.id);
    await deleteFixtureUser(user.id);
  });
});

import { describe, expect, it } from 'vitest';
import { getPracticeExamQuestionSet } from '@/lib/practice-exam-engine';
import { createFixtureExam, deleteFixtureExam } from './helpers';

describe('getPracticeExamQuestionSet', () => {
  it('balances questions across domains rather than drawing entirely from one', async () => {
    const { exam, skillA, skillB } = await createFixtureExam('practice-exam-balance');

    const questions = await getPracticeExamQuestionSet(exam.id, 4, 'seed-balance');

    const skillIds = new Set(questions.map((q) => q.skillId));
    // Both fixture skills (one per domain) should be represented, confirming
    // selection isn't drawing entirely from a single domain.
    expect(skillIds.has(skillA.id)).toBe(true);
    expect(skillIds.has(skillB.id)).toBe(true);

    await deleteFixtureExam(exam.id);
  });

  it('never returns more questions than requested', async () => {
    const { exam } = await createFixtureExam('practice-exam-cap');

    const questions = await getPracticeExamQuestionSet(exam.id, 2, 'seed-cap');
    expect(questions.length).toBeLessThanOrEqual(2);

    await deleteFixtureExam(exam.id);
  });

  it('is stable across calls with the same seed', async () => {
    const { exam } = await createFixtureExam('practice-exam-stable');

    const a = await getPracticeExamQuestionSet(exam.id, 6, 'stable-seed');
    const b = await getPracticeExamQuestionSet(exam.id, 6, 'stable-seed');
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));

    await deleteFixtureExam(exam.id);
  });
});

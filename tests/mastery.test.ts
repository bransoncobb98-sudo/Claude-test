import { describe, expect, it } from 'vitest';
import { updateMasteryForResponse, nextDifficultyForMastery } from '@/lib/mastery';
import { createFixtureExam, createFixtureUser, deleteFixtureExam, deleteFixtureUser } from './helpers';

describe('updateMasteryForResponse', () => {
  it('sets mastery directly from the first response (no history to blend with)', async () => {
    const { exam, skillA } = await createFixtureExam('mastery-first');
    const { user } = await createFixtureUser('mastery-first');

    const record = await updateMasteryForResponse({ userId: user.id, skillId: skillA.id, isCorrect: true, difficulty: 3 });

    expect(record.questionsAttempted).toBe(1);
    expect(record.questionsCorrect).toBe(1);
    expect(record.trend).toBe('NEW');
    expect(record.masteryScore).toBeCloseTo(40 + 3 * 12, 5); // 76

    await deleteFixtureExam(exam.id);
    await deleteFixtureUser(user.id);
  });

  it('increases mastery on a correct streak and marks the trend improving', async () => {
    const { exam, skillA } = await createFixtureExam('mastery-streak');
    const { user } = await createFixtureUser('mastery-streak');

    await updateMasteryForResponse({ userId: user.id, skillId: skillA.id, isCorrect: false, difficulty: 3 });
    const second = await updateMasteryForResponse({ userId: user.id, skillId: skillA.id, isCorrect: true, difficulty: 5 });

    expect(second.correctStreak).toBe(1);
    expect(second.incorrectStreak).toBe(0);
    expect(second.trend).toBe('IMPROVING');

    await deleteFixtureExam(exam.id);
    await deleteFixtureUser(user.id);
  });

  it('resets the correct streak and marks declining on a miss', async () => {
    const { exam, skillA } = await createFixtureExam('mastery-decline');
    const { user } = await createFixtureUser('mastery-decline');

    await updateMasteryForResponse({ userId: user.id, skillId: skillA.id, isCorrect: true, difficulty: 5 });
    const second = await updateMasteryForResponse({ userId: user.id, skillId: skillA.id, isCorrect: false, difficulty: 1 });

    expect(second.correctStreak).toBe(0);
    expect(second.incorrectStreak).toBe(1);
    expect(second.trend).toBe('DECLINING');
    expect(second.nextReviewAt).not.toBeNull();

    await deleteFixtureExam(exam.id);
    await deleteFixtureUser(user.id);
  });

  it('accumulates questionsAttempted/Correct across multiple responses', async () => {
    const { exam, skillA } = await createFixtureExam('mastery-accum');
    const { user } = await createFixtureUser('mastery-accum');

    await updateMasteryForResponse({ userId: user.id, skillId: skillA.id, isCorrect: true, difficulty: 3 });
    await updateMasteryForResponse({ userId: user.id, skillId: skillA.id, isCorrect: true, difficulty: 3 });
    const third = await updateMasteryForResponse({ userId: user.id, skillId: skillA.id, isCorrect: false, difficulty: 3 });

    expect(third.questionsAttempted).toBe(3);
    expect(third.questionsCorrect).toBe(2);

    await deleteFixtureExam(exam.id);
    await deleteFixtureUser(user.id);
  });
});

describe('nextDifficultyForMastery', () => {
  it('recommends easy questions for low mastery', () => {
    expect(nextDifficultyForMastery(5, 0)).toBe(1);
  });

  it('recommends hard questions for high mastery', () => {
    expect(nextDifficultyForMastery(85, 0)).toBe(5);
  });

  it('lowers difficulty after repeated misses regardless of stored mastery', () => {
    const withoutStreak = nextDifficultyForMastery(85, 0);
    const withStreak = nextDifficultyForMastery(85, 2);
    expect(withStreak).toBeLessThan(withoutStreak);
  });
});

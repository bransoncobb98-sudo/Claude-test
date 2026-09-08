import { describe, expect, it } from 'vitest';
import { nextReviewIntervalDays, computeNextReviewAt } from '@/lib/spaced-repetition';

describe('nextReviewIntervalDays', () => {
  it('schedules low mastery for review tomorrow', () => {
    expect(nextReviewIntervalDays({ masteryScore: 10, incorrectStreak: 0 })).toBe(1);
    expect(nextReviewIntervalDays({ masteryScore: 39, incorrectStreak: 0 })).toBe(1);
  });

  it('schedules moderate mastery for review in a few days', () => {
    expect(nextReviewIntervalDays({ masteryScore: 50, incorrectStreak: 0 })).toBe(3);
  });

  it('schedules high mastery for review in about a week', () => {
    expect(nextReviewIntervalDays({ masteryScore: 70, incorrectStreak: 0 })).toBe(7);
  });

  it('schedules very high mastery for review in about a month', () => {
    expect(nextReviewIntervalDays({ masteryScore: 95, incorrectStreak: 0 })).toBe(30);
  });

  it('always resets to tomorrow after two consecutive misses, regardless of prior mastery', () => {
    expect(nextReviewIntervalDays({ masteryScore: 95, incorrectStreak: 2 })).toBe(1);
    expect(nextReviewIntervalDays({ masteryScore: 60, incorrectStreak: 3 })).toBe(1);
  });
});

describe('computeNextReviewAt', () => {
  it('adds the correct number of days to the reference date', () => {
    const from = new Date('2026-01-01T00:00:00.000Z');
    const next = computeNextReviewAt({ masteryScore: 95, incorrectStreak: 0 }, from);
    expect(next.toISOString()).toBe('2026-01-31T00:00:00.000Z');
  });
});

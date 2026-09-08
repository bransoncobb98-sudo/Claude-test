import { describe, expect, it } from 'vitest';
import { computeStudyStreak } from '@/lib/streak';

const DAY = 24 * 60 * 60 * 1000;

describe('computeStudyStreak', () => {
  it('returns 0 with no activity', () => {
    expect(computeStudyStreak([])).toBe(0);
  });

  it('counts a single day of activity today as a 1-day streak', () => {
    const now = new Date('2026-03-10T18:00:00.000Z');
    expect(computeStudyStreak([new Date('2026-03-10T09:00:00.000Z')], now)).toBe(1);
  });

  it('counts consecutive days ending today', () => {
    const now = new Date('2026-03-10T18:00:00.000Z');
    const activity = [0, 1, 2, 3].map((d) => new Date(now.getTime() - d * DAY));
    expect(computeStudyStreak(activity, now)).toBe(4);
  });

  it('still counts the streak if the user has not studied yet today but did yesterday', () => {
    const now = new Date('2026-03-10T08:00:00.000Z');
    const activity = [1, 2, 3].map((d) => new Date(now.getTime() - d * DAY));
    expect(computeStudyStreak(activity, now)).toBe(3);
  });

  it('breaks the streak on a gap day', () => {
    const now = new Date('2026-03-10T18:00:00.000Z');
    const activity = [new Date(now.getTime()), new Date(now.getTime() - 1 * DAY), new Date(now.getTime() - 3 * DAY)];
    expect(computeStudyStreak(activity, now)).toBe(2);
  });

  it('returns 0 when the last activity was more than a day ago', () => {
    const now = new Date('2026-03-10T18:00:00.000Z');
    expect(computeStudyStreak([new Date(now.getTime() - 5 * DAY)], now)).toBe(0);
  });
});

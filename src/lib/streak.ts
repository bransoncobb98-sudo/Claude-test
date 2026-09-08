const DAY_MS = 1000 * 60 * 60 * 24;

function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Consecutive-day study streak. Counts backward from today (or yesterday,
 * so a streak isn't lost just because the user hasn't studied yet today)
 * through unbroken days of activity.
 */
export function computeStudyStreak(activityDates: Date[], now: Date = new Date()): number {
  const days = new Set(activityDates.map(toDayKey));

  let cursor = new Date(now);
  if (!days.has(toDayKey(cursor))) {
    cursor = new Date(cursor.getTime() - DAY_MS);
    if (!days.has(toDayKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(toDayKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}

import { weekKey } from '@/lib/dates'

/**
 * Weeks in a row with at least one entry (concept 6.8, CLAUDE.md 7.1).
 *
 * Deliberately a *week* streak, not a day streak: a daily one creates pressure
 * and produces alibi entries. The current week counts only once it has an entry —
 * a Monday morning must not look like a broken streak, so counting starts at the
 * previous week when this one is still empty.
 */
export function weekStreak(entryWeekKeys: readonly string[], now: Date = new Date()): number {
  const weeks = new Set(entryWeekKeys)
  const cursor = new Date(now)

  if (!weeks.has(weekKey(cursor))) {
    cursor.setDate(cursor.getDate() - 7)
    if (!weeks.has(weekKey(cursor))) return 0
  }

  let streak = 0
  while (weeks.has(weekKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 7)
  }
  return streak
}

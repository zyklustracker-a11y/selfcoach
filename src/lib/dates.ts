/**
 * Day and week keys are stored as strings so they can be compared and grouped
 * without reading timestamps back (concept 9).
 */

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** Local calendar day, `2026-08-11`. Local, not UTC — an entry belongs to the day the user had. */
export function dayKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * ISO-8601 week, `2026-W33`. Weeks start on Monday and a week belongs to the year
 * containing its Thursday, which is why the year here can differ from the date's
 * own year around New Year.
 */
export function weekKey(date: Date = new Date()): string {
  const thursday = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const weekday = thursday.getUTCDay() || 7 // Sunday counts as 7
  thursday.setUTCDate(thursday.getUTCDate() + 4 - weekday)

  const yearStart = Date.UTC(thursday.getUTCFullYear(), 0, 1)
  const week = Math.ceil(((thursday.getTime() - yearStart) / 86_400_000 + 1) / 7)
  return `${thursday.getUTCFullYear()}-W${pad(week)}`
}

/**
 * 7 → 30 → 90 days (concept 6.7). After the last step an entry stops coming back
 * on its own; three passes over a year are enough to know whether it stuck.
 */
export const REVIEW_INTERVALS = [7, 30, 90] as const
export const FIRST_REVIEW_DAYS = REVIEW_INTERVALS[0]

/** Days until the next flashback, or null when the ladder is used up. */
export function nextReviewInterval(reviewCount: number): number | null {
  return REVIEW_INTERVALS[reviewCount] ?? null
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

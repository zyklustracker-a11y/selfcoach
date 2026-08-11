import type { Timestamp } from 'firebase/firestore'

export type Theme = 'dark' | 'light'

/**
 * Concept chapter 9, with the deviations recorded in CLAUDE.md section 7.1a:
 * `reminderTime` is gone because the app has no reminders at all.
 */
export interface UserSettings {
  theme: Theme
  /** ISO weekday the weekly review opens on. 6 = Saturday (concept 6.5). */
  reviewDay: number
  /** Editable in settings; seeded from the five questions in concept 6.5. */
  reviewQuestions: string[]
  locale: string
}

export interface UserStats {
  currentStreakWeeks: number
  longestStreakWeeks: number
  totalEntries: number
}

/** Document at `users/{uid}`. */
export interface UserDocument {
  displayName: string | null
  email: string | null
  photoURL: string | null
  createdAt: Timestamp
  /** Null until the one-time onboarding is finished (concept 7.2, screen 2). */
  onboardedAt: Timestamp | null
  settings: UserSettings
  stats: UserStats
}

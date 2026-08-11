import type { Timestamp } from 'firebase/firestore'

/**
 * Document at `users/{uid}/reviews/{weekKey}` — the key is the ISO week, so a week
 * can only ever have one review (concept 9).
 *
 * Deviation from concept 9: instead of five fixed field names the review stores
 * the questions it was asked next to the answers. The questions are editable in
 * the settings, and a review written last month must keep showing the wording it
 * was actually answered under. `principleRatings[]` is gone with the 0–3 scale.
 */
export interface Review {
  weekKey: string
  weekStart: string
  weekEnd: string
  /** The wording in force when this review was written. */
  questions: string[]
  /** Same length and order as `questions`. */
  answers: string[]
  /** Question 1 is a selection, not free text. */
  topInsightIds: string[]
  entryCount: number
  todoDoneCount: number
  todoTotalCount: number
  /** Null while the review is still in progress — the flow is interruptible. */
  completedAt: Timestamp | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ReviewWithId extends Review {
  id: string
}

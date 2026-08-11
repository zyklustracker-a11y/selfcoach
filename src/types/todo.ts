import type { Timestamp } from 'firebase/firestore'

/**
 * Concept 6.4. Two kinds, deliberately separate: a `daily` is a dated task that
 * expires or gets postponed, a `principle` is a standing intention that is never
 * ticked off — it is looked at again in the weekly review.
 *
 * `principleScores[]` from concept 9 is gone with the 0–3 scale (CLAUDE.md 7.1a).
 */
export type TodoKind = 'daily' | 'principle'
export type TodoStatus = 'open' | 'done' | 'dropped'

export interface Todo {
  title: string
  notes: string | null
  kind: TodoKind
  /** The entry this came from. Seeing why you took it on is the point (concept 6.4). */
  sourceEntryId: string | null
  bookId: string | null
  /** `daily` only. A principle has no due date. */
  dueDate: string | null
  status: TodoStatus
  doneAt: Timestamp | null
  postponedCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface TodoWithId extends Todo {
  id: string
}

export interface TodoInput {
  title: string
  notes: string | null
  kind: TodoKind
  sourceEntryId: string | null
  bookId: string | null
}

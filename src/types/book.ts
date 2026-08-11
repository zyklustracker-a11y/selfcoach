import type { Timestamp } from 'firebase/firestore'

/** Concept 6.2. Stored in English, shown in German (see lib/strings). */
export type BookStatus = 'planned' | 'reading' | 'finished' | 'abandoned'

export const BOOK_STATUSES: readonly BookStatus[] = [
  'reading',
  'planned',
  'finished',
  'abandoned',
]

/**
 * Document at `users/{uid}/books/{bookId}`.
 *
 * Deviations from concept chapter 9, all recorded in CLAUDE.md 7.1a:
 * no totalPages/currentPage (no progress tracking), no rating (no scales), and
 * `summary` is a reference to the closing entry rather than a second copy of it.
 */
export interface Book {
  title: string
  author: string
  isbn: string | null
  coverUrl: string | null
  status: BookStatus
  startedAt: Timestamp | null
  finishedAt: Timestamp | null
  tags: string[]
  /** Points at the `book_summary` entry written when the book was finished. */
  summaryEntryId: string | null
  /** At most one book carries this, and only while its status is `reading`. */
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface BookWithId extends Book {
  id: string
}

/** The fields a form can set; everything else is maintained by the repository. */
export interface BookInput {
  title: string
  author: string
  isbn: string | null
  coverUrl: string | null
  status: BookStatus
  tags: string[]
}

import type { Timestamp } from 'firebase/firestore'

/**
 * Concept 6.3 and 9, as a discriminated union rather than one shared schema
 * (CLAUDE.md 7.1a). An insight carries the three-part chain; a book summary is the
 * look back at a finished book and has no new action to derive, because the
 * actions already became their own entries while reading.
 */
export type EntryType = 'insight' | 'book_summary'

/** What the user answered when an entry resurfaced (concept 6.7). */
export type FlashbackAnswer = 'still_true' | 'again' | 'obsolete'

export interface ReviewHistoryItem {
  /** dayKey of the answer. */
  day: string
  answer: FlashbackAnswer
}

interface EntryBase {
  /** Denormalised so archive lists render without a second read (concept 9). */
  bookId: string | null
  bookTitle: string | null
  quote: string | null
  /** A single page — the one the insight came from. No progress tracking. */
  page: number | null
  tags: string[]
  /** Normalised, lower case, for filtering and the client-side search. */
  keywords: string[]
  /** Local calendar day, `2026-08-11`. */
  dayKey: string
  /** ISO week, `2026-W33`. */
  weekKey: string
  /**
   * When this entry surfaces again. Null once it has been marked obsolete —
   * then it stays in the archive but never comes back on its own.
   */
  nextReviewAt: Timestamp | null
  /** How often it has already come back; drives the 7 → 30 → 90 ladder. */
  reviewCount?: number
  reviewHistory?: ReviewHistoryItem[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface InsightEntry extends EntryBase {
  type: 'insight'
  learning: string
  meaning: string
  action: string
}

export interface BookSummaryEntry extends EntryBase {
  type: 'book_summary'
  /** „Die drei Dinge, die bleiben." */
  summary: string
  meaning: string | null
  action: string | null
}

export type Entry = InsightEntry | BookSummaryEntry
export type EntryWithId = Entry & { id: string }

/** What the form collects; the repository derives the rest. */
export interface InsightInput {
  type: 'insight'
  bookId: string | null
  learning: string
  meaning: string
  action: string
  quote: string | null
  page: number | null
  tags: string[]
}

export interface BookSummaryInput {
  type: 'book_summary'
  bookId: string | null
  summary: string
  meaning: string | null
  action: string | null
  quote: string | null
  page: number | null
  tags: string[]
}

export type EntryInput = InsightInput | BookSummaryInput

/** The one line that stands for an entry in a list (DESIGN.md, archive). */
export function entryHeadline(entry: Entry): string {
  return entry.type === 'insight' ? entry.action : entry.summary
}

/** The quieter second line: where the headline came from. */
export function entrySupport(entry: Entry): string {
  return entry.type === 'insight' ? entry.learning : (entry.meaning ?? '')
}

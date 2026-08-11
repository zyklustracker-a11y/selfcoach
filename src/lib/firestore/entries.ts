import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type CollectionReference,
  type DocumentReference,
  type Unsubscribe,
} from 'firebase/firestore'

import { addDays, dayKey, FIRST_REVIEW_DAYS, weekKey } from '@/lib/dates'
import { db } from '@/lib/firebase'
import { buildKeywords } from '@/lib/keywords'
import type { Entry, EntryInput, EntryWithId } from '@/types'

function entriesRef(uid: string): CollectionReference<Entry> {
  return collection(db, 'users', uid, 'entries') as CollectionReference<Entry>
}

function entryRef(uid: string, entryId: string): DocumentReference<Entry> {
  return doc(db, 'users', uid, 'entries', entryId) as DocumentReference<Entry>
}

/**
 * Newest first. The cap keeps the initial read bounded; the archive in phase 6
 * pages beyond it.
 */
export function subscribeToEntries(
  uid: string,
  onChange: (entries: EntryWithId[]) => void,
  onError: (error: Error) => void,
  max = 300,
): Unsubscribe {
  return onSnapshot(
    query(entriesRef(uid), orderBy('createdAt', 'desc'), limit(max)),
    (snapshot) => onChange(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  )
}

function keywordsFor(input: EntryInput, bookTitle: string | null): string[] {
  const texts =
    input.type === 'insight'
      ? [input.learning, input.meaning, input.action]
      : [input.summary, input.meaning, input.action]
  return buildKeywords([...texts, input.quote, bookTitle, ...input.tags])
}

/** Fields shared by both entry types, derived rather than entered. */
function derived(input: EntryInput, bookTitle: string | null, now: Date) {
  return {
    bookId: input.bookId,
    bookTitle,
    quote: input.quote,
    page: input.page,
    tags: input.tags,
    keywords: keywordsFor(input, bookTitle),
    dayKey: dayKey(now),
    weekKey: weekKey(now),
  }
}

export async function createEntry(
  uid: string,
  input: EntryInput,
  bookTitle: string | null,
): Promise<string> {
  const now = new Date()
  const timestamp = serverTimestamp()

  const shape =
    input.type === 'insight'
      ? { type: 'insight' as const, learning: input.learning, meaning: input.meaning, action: input.action }
      : {
          type: 'book_summary' as const,
          summary: input.summary,
          meaning: input.meaning,
          action: input.action,
        }

  const created = await addDoc(entriesRef(uid), {
    ...shape,
    ...derived(input, bookTitle, now),
    // Every entry resurfaces, so the first due date is set on creation. Writing it
    // now rather than in phase 9 spares a backfill over entries written meanwhile.
    nextReviewAt: Timestamp.fromDate(addDays(now, FIRST_REVIEW_DAYS)),
    createdAt: timestamp,
    updatedAt: timestamp,
  })

  return created.id
}

export async function updateEntry(
  uid: string,
  entryId: string,
  input: EntryInput,
  bookTitle: string | null,
  previous: Entry,
): Promise<void> {
  const shape =
    input.type === 'insight'
      ? { learning: input.learning, meaning: input.meaning, action: input.action }
      : { summary: input.summary, meaning: input.meaning, action: input.action }

  await updateDoc(entryRef(uid, entryId), {
    ...shape,
    // An entry created while offline still has a pending server timestamp.
    ...derived(input, bookTitle, previous.createdAt?.toDate() ?? new Date()),
    // dayKey and weekKey stay tied to when the entry was written, not when it was
    // last corrected — the weekly review depends on that.
    updatedAt: serverTimestamp(),
  })
}

export async function deleteEntry(uid: string, entryId: string): Promise<void> {
  await deleteDoc(entryRef(uid, entryId))
}

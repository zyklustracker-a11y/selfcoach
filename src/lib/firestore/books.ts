import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
  type CollectionReference,
  type DocumentReference,
  type Unsubscribe,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import type { Book, BookInput, BookStatus, BookWithId } from '@/types'

function booksRef(uid: string): CollectionReference<Book> {
  return collection(db, 'users', uid, 'books') as CollectionReference<Book>
}

function bookRef(uid: string, bookId: string): DocumentReference<Book> {
  return doc(db, 'users', uid, 'books', bookId) as DocumentReference<Book>
}

export function subscribeToBooks(
  uid: string,
  onChange: (books: BookWithId[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(booksRef(uid), orderBy('updatedAt', 'desc')),
    (snapshot) => onChange(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  )
}

/**
 * Exactly one book may be active, and only a book that is currently being read
 * (concept 6.2). Everything that can break that invariant goes through here.
 *
 * `nextActiveId` of null clears the flag everywhere. Runs as one batch so the app
 * never observes two active books, not even for a frame.
 */
async function writeActiveFlag(uid: string, nextActiveId: string | null): Promise<void> {
  const snapshot = await getDocs(booksRef(uid))
  const batch = writeBatch(db)
  let changed = false

  for (const document of snapshot.docs) {
    const shouldBeActive = document.id === nextActiveId
    if (document.data().isActive !== shouldBeActive) {
      batch.update(document.ref, { isActive: shouldBeActive, updatedAt: serverTimestamp() })
      changed = true
    }
  }

  if (changed) await batch.commit()
}

/**
 * Picks the book that should hold the active flag. An existing active book keeps it:
 * starting a second book does not silently move the focus, that stays an explicit
 * choice. Only when nothing valid holds the flag does the freshly touched book —
 * or failing that the most recently updated one being read — take over.
 * Returns null when no book is being read at all.
 */
function chooseActive(books: BookWithId[], touchedId: string | null): string | null {
  const reading = books.filter((book) => book.status === 'reading')
  if (reading.length === 0) return null
  const alreadyActive = reading.find((book) => book.isActive)
  if (alreadyActive) return alreadyActive.id
  const touched = reading.find((book) => book.id === touchedId)
  return (touched ?? reading[0]).id
}

export async function setActiveBook(uid: string, bookId: string): Promise<void> {
  await writeActiveFlag(uid, bookId)
}

export async function createBook(uid: string, input: BookInput): Promise<string> {
  const now = serverTimestamp()
  const created = await addDoc(booksRef(uid), {
    ...input,
    // A book you start reading right away carries its start date from the beginning.
    startedAt: input.status === 'reading' ? Timestamp.now() : null,
    finishedAt: input.status === 'finished' ? Timestamp.now() : null,
    summaryEntryId: null,
    isActive: false,
    createdAt: now,
    updatedAt: now,
  })

  await reconcileActive(uid, created.id)
  return created.id
}

export async function updateBook(
  uid: string,
  bookId: string,
  previous: Book,
  input: BookInput,
): Promise<void> {
  const statusChanged = previous.status !== input.status

  await writeBatch(db)
    .update(bookRef(uid, bookId), {
      ...input,
      // Dates follow the status instead of being typed in — one less field in the
      // form, and they can no longer contradict the status.
      startedAt:
        input.status === 'reading' && !previous.startedAt ? Timestamp.now() : previous.startedAt,
      finishedAt:
        input.status === 'finished'
          ? (previous.finishedAt ?? Timestamp.now())
          : input.status === 'abandoned'
            ? previous.finishedAt
            : null,
      updatedAt: serverTimestamp(),
    })
    .commit()

  if (statusChanged) await reconcileActive(uid, bookId)
}

export async function deleteBook(uid: string, bookId: string): Promise<void> {
  await deleteDoc(bookRef(uid, bookId))
  await reconcileActive(uid, null)
}

/**
 * Re-establishes the single-active-book invariant after any status change. Called
 * with the book that just changed, so it gets first claim on the flag.
 */
async function reconcileActive(uid: string, touchedId: string | null): Promise<void> {
  const snapshot = await getDocs(booksRef(uid))
  const books: BookWithId[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
  await writeActiveFlag(uid, chooseActive(books, touchedId))
}

export type { BookStatus }

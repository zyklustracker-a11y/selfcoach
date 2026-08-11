import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type CollectionReference,
  type DocumentReference,
  type Unsubscribe,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import type { Review, ReviewWithId } from '@/types'

function reviewsRef(uid: string): CollectionReference<Review> {
  return collection(db, 'users', uid, 'reviews') as CollectionReference<Review>
}

function reviewRef(uid: string, weekKey: string): DocumentReference<Review> {
  return doc(db, 'users', uid, 'reviews', weekKey) as DocumentReference<Review>
}

export function subscribeToReviews(
  uid: string,
  onChange: (reviews: ReviewWithId[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(reviewsRef(uid), orderBy('weekKey', 'desc')),
    (snapshot) => onChange(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  )
}

export type ReviewDraft = Omit<Review, 'createdAt' | 'updatedAt' | 'completedAt'>

/**
 * Written on every step, not only at the end. The document id is the week, so an
 * interrupted review simply resumes on the next open — no separate draft storage,
 * and unlike localStorage it survives a device change.
 *
 * `isNew` decides whether createdAt is stamped; otherwise every autosave would
 * push it forward.
 */
export async function saveReview(
  uid: string,
  draft: ReviewDraft,
  options: { completed: boolean; isNew: boolean },
): Promise<void> {
  await setDoc(
    reviewRef(uid, draft.weekKey),
    {
      ...draft,
      completedAt: options.completed ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
      ...(options.isNew ? { createdAt: serverTimestamp() } : {}),
    },
    { merge: true },
  )
}

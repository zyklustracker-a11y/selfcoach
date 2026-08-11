import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type DocumentReference,
} from 'firebase/firestore'
import type { User } from 'firebase/auth'

import { db } from '@/lib/firebase'
import { t } from '@/lib/strings'
import type { UserDocument, UserSettings, UserStats } from '@/types'

/** Every Firestore access goes through this module — never from a component. */
function userRef(uid: string): DocumentReference<UserDocument> {
  return doc(db, 'users', uid) as DocumentReference<UserDocument>
}

function defaultSettings(): UserSettings {
  return {
    theme: 'dark',
    reviewDay: 6, // Saturday — the review opens on the weekend (concept 6.5)
    reviewQuestions: [...t.review.defaultQuestions],
    locale: 'de',
  }
}

function defaultStats(): UserStats {
  return { currentStreakWeeks: 0, longestStreakWeeks: 0, totalEntries: 0 }
}

export async function getUserDocument(uid: string): Promise<UserDocument | null> {
  const snapshot = await getDoc(userRef(uid))
  return snapshot.exists() ? snapshot.data() : null
}

/**
 * Creates `users/{uid}` on first sign-in and returns it. An existing document is
 * returned untouched — the defaults must never overwrite settings the user changed.
 */
export async function ensureUserDocument(user: User): Promise<UserDocument | null> {
  const ref = userRef(user.uid)
  const snapshot = await getDoc(ref)
  if (snapshot.exists()) return snapshot.data()

  await setDoc(ref, {
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    createdAt: serverTimestamp(),
    settings: defaultSettings(),
    stats: defaultStats(),
  })

  // Read back so the caller gets the resolved server timestamp rather than a
  // pending sentinel. Offline this resolves from the local cache.
  const created = await getDoc(ref)
  return created.exists() ? created.data() : null
}

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
    onboardedAt: null,
    settings: defaultSettings(),
    stats: defaultStats(),
  })

  // Read back so the caller gets the resolved server timestamp rather than a
  // pending sentinel. Offline this resolves from the local cache.
  const created = await getDoc(ref)
  return created.exists() ? created.data() : null
}

/**
 * Deletes every document under `users/{uid}` and finally the user document itself
 * (DSGVO Art. 17, concept 12).
 *
 * Not atomic: Firestore has no recursive delete on the client, and without server
 * code there is nothing to make it one. Accepted by the user — if it breaks off
 * halfway, running it again finishes the job.
 */
export async function deleteAllUserData(uid: string): Promise<void> {
  const { collection, getDocs, writeBatch, deleteDoc } = await import('firebase/firestore')

  for (const name of ['entries', 'todos', 'reviews', 'books']) {
    // Batches cap at 500 writes, so the collection is drained in chunks.
    for (;;) {
      const snapshot = await getDocs(collection(db, 'users', uid, name))
      if (snapshot.empty) break

      const chunk = snapshot.docs.slice(0, 400)
      const batch = writeBatch(db)
      for (const document of chunk) batch.delete(document.ref)
      await batch.commit()

      if (chunk.length === snapshot.docs.length) break
    }
  }

  await deleteDoc(userRef(uid))
}

export async function setUserSettings(
  uid: string,
  settings: Partial<UserSettings>,
): Promise<void> {
  const { updateDoc } = await import('firebase/firestore')
  // Dotted paths so a single setting can change without rewriting the whole object.
  const patch = Object.fromEntries(
    Object.entries(settings).map(([key, value]) => [`settings.${key}`, value]),
  )
  await updateDoc(userRef(uid), patch as never)
}

/** Marks the one-time onboarding as done. */
export async function markOnboarded(uid: string): Promise<void> {
  const { updateDoc } = await import('firebase/firestore')
  await updateDoc(userRef(uid), { onboardedAt: serverTimestamp() })
}

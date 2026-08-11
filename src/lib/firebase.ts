import { initializeApp, type FirebaseOptions } from 'firebase/app'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore'

/**
 * Reads a required environment variable. Failing loudly at startup is better
 * than a Firebase error deep inside the first query.
 */
function required(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name]
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.local.example to .env.local and fill in the Firebase config.`,
    )
  }
  return value
}

// No storageBucket: the app uses no Cloud Storage.
const options: FirebaseOptions = {
  apiKey: required('VITE_FIREBASE_API_KEY'),
  authDomain: required('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: required('VITE_FIREBASE_PROJECT_ID'),
  messagingSenderId: required('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: required('VITE_FIREBASE_APP_ID'),
}

export const firebaseApp = initializeApp(options)

/**
 * Offline persistence is switched on at initialisation — `enableIndexedDbPersistence`
 * is deprecated. Writes are buffered locally and replayed once the device is back
 * online, which is the whole offline story of the app (concept 8.3).
 *
 * Note that Safari may evict IndexedDB under storage pressure. The cache is a cache,
 * not a backup; Firestore in the cloud stays the source of truth.
 */
export const db: Firestore = initializeFirestore(firebaseApp, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})

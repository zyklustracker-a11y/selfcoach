import { initializeApp, type FirebaseOptions } from 'firebase/app'
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  connectAuthEmulator,
  initializeAuth,
  type Auth,
} from 'firebase/auth'
import {
  connectFirestoreEmulator,
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
  // A value copied out of a masked field keeps its bullet characters and still
  // looks plausible — right length, right prefix. Firebase then rejects it with
  // an error that points nowhere near the real cause, so catch it here instead.
  if (!/^[\x21-\x7e]+$/.test(value)) {
    throw new Error(
      `${name} contains characters that cannot occur in a Firebase config value. ` +
        'It was probably copied from a masked display — copy it again from the console.',
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

/**
 * Persistence is set at initialisation rather than through a later setPersistence
 * call, so no sign-in can race an unconfigured Auth instance. `browserLocalPersistence`
 * keeps the session across launches — no daily re-login (concept 6.1).
 *
 * The redirect resolver has to be passed explicitly here: with `initializeAuth`
 * nothing is registered by default, and `signInWithRedirect` would fail with
 * auth/argument-error.
 */
export const auth: Auth = initializeAuth(firebaseApp, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
})

// Development only: `VITE_USE_EMULATORS=true npm run build` points the app at the
// local Firebase emulators so the redirect sign-in and the security rules can be
// exercised without touching the real project. Never set in a deployed build.
if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)

  // Sign-in shortcut for automated tests. The Google redirect cannot run in a
  // sandbox without network access to apis.google.com, and the screens behind the
  // guard still need to be exercised. Constant-folded away in a normal build.
  Object.assign(window, {
    __devSignIn: (email: string, password: string) =>
      import('firebase/auth').then((firebaseAuth) =>
        firebaseAuth
          .signInWithEmailAndPassword(auth, email, password)
          .catch(() => firebaseAuth.createUserWithEmailAndPassword(auth, email, password)),
      ),
  })
}

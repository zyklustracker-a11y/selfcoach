import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { auth } from '@/lib/firebase'
import { ensureUserDocument } from '@/lib/firestore/users'
import { t } from '@/lib/strings'
import type { UserDocument } from '@/types'

export type AuthStatus = 'loading' | 'signingIn' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  status: AuthStatus
  user: User | null
  profile: UserDocument | null
  error: string | null
  signIn: () => Promise<void>
  signOutUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

/** Maps the Firebase error codes we can actually act on to German copy. */
function describe(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/network-request-failed':
        return t.auth.error.network
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
      case 'auth/user-cancelled':
        return t.auth.error.cancelled
      case 'auth/unauthorized-domain':
        return t.auth.error.unauthorizedDomain
      default:
        return t.auth.error.generic
    }
  }
  return t.auth.error.generic
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserDocument | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    // Must run before we conclude anything about the session: after returning from
    // the Google redirect this is what completes the sign-in. Skipping it would
    // flash the login screen at a user who just signed in.
    const redirectSettled = getRedirectResult(auth).catch((cause: unknown) => {
      if (active) setError(describe(cause))
      return null
    })

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      void (async () => {
        await redirectSettled
        if (!active) return

        if (!nextUser) {
          setUser(null)
          setProfile(null)
          setStatus('unauthenticated')
          return
        }

        setUser(nextUser)
        try {
          const document = await ensureUserDocument(nextUser)
          if (!active) return
          setProfile(document)
        } catch (cause: unknown) {
          // The session is valid even when the profile write fails — offline, for
          // instance. Surface it, but do not lock the user out.
          if (!active) return
          setError(describe(cause))
        }
        if (active) setStatus('authenticated')
      })()
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const signIn = useCallback(async () => {
    setError(null)
    setStatus('signingIn')
    const provider = new GoogleAuthProvider()
    try {
      // Never signInWithPopup: Safari blocks popups in standalone mode (concept 6.1).
      await signInWithRedirect(auth, provider)
    } catch (cause: unknown) {
      setError(describe(cause))
      setStatus('unauthenticated')
    }
  }, [])

  const signOutUser = useCallback(async () => {
    setError(null)
    await signOut(auth)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, profile, error, signIn, signOutUser }),
    [status, user, profile, error, signIn, signOutUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

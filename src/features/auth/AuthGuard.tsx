import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

import { t } from '@/lib/strings'

import { useAuth } from './useAuth'

/**
 * While the redirect result is still being evaluated nothing may be decided yet —
 * rendering the login screen here would flash it at a user who is already signed in.
 */
export function AuthGuard({
  children,
  requireOnboarding = true,
}: {
  children: ReactNode
  requireOnboarding?: boolean
}) {
  const { status, profile } = useAuth()

  if (status === 'loading' || status === 'signingIn') {
    return (
      <div className="mx-auto flex min-h-full max-w-app items-center justify-center px-6.5">
        <p className="font-mono text-caption uppercase text-text-muted">{t.auth.checking}</p>
      </div>
    )
  }

  if (status === 'unauthenticated') return <Navigate to="/login" replace />

  // Only once the profile is actually loaded — offline it may be null for a
  // moment, and sending a returning user through onboarding would be wrong.
  if (requireOnboarding && profile && profile.onboardedAt === null) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}

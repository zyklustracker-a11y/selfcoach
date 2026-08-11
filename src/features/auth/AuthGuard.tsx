import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

import { t } from '@/lib/strings'

import { useAuth } from './useAuth'

/**
 * While the redirect result is still being evaluated nothing may be decided yet —
 * rendering the login screen here would flash it at a user who is already signed in.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth()

  if (status === 'loading' || status === 'signingIn') {
    return (
      <div className="flex min-h-full items-center justify-center px-6.5">
        <p className="font-mono text-caption uppercase text-text-muted">{t.auth.checking}</p>
      </div>
    )
  }

  if (status === 'unauthenticated') return <Navigate to="/login" replace />

  return <>{children}</>
}

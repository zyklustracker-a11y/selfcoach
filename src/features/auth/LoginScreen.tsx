import { Navigate } from 'react-router-dom'

import { Button } from '@/components'
import { t } from '@/lib/strings'

import { useAuth } from './useAuth'

/**
 * Concept 7.2, screen 1: Google button and a short claim. One screen, one action
 * (DESIGN.md, prose rule 5) — the button is the only thing in the accent colour.
 */
export function LoginScreen() {
  const { status, error, signIn } = useAuth()

  if (status === 'authenticated') return <Navigate to="/" replace />

  const busy = status === 'signingIn'

  return (
    <div
      className="mx-auto flex min-h-full max-w-app flex-col justify-between px-6.5"
      style={{
        paddingTop: 'max(64px, calc(env(safe-area-inset-top) + 56px))',
        paddingBottom: 'calc(32px + env(safe-area-inset-bottom))',
      }}
    >
      <div>
        <p className="font-mono text-caption uppercase text-text-muted">{t.app.name}</p>
        <h1 className="mt-3.5 font-serif text-screen-title text-text-primary">{t.auth.claim}</h1>
        <p className="mt-6.5 text-body text-text-secondary">{t.auth.intro}</p>
      </div>

      <div>
        {error && <p className="mb-3.5 text-field-error text-danger">{error}</p>}

        <Button fullWidth onClick={() => void signIn()} disabled={busy}>
          {t.auth.signIn}
        </Button>

        {busy && (
          <p className="mt-3.5 text-center font-mono text-caption text-text-muted">
            {t.auth.signingIn}
          </p>
        )}
      </div>
    </div>
  )
}

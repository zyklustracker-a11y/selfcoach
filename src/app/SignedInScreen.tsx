import { Button } from '@/components'
import { useAuth } from '@/features/auth'
import { t } from '@/lib/strings'

/**
 * Temporary. It exists so phase 2 can be verified on the device — sign in, see the
 * session survive a relaunch, sign out again. Phase 3 replaces it with the real
 * Heute screen.
 */
export function SignedInScreen() {
  const { user, profile, error, signOutUser } = useAuth()

  return (
    <div
      className="flex min-h-full flex-col justify-between px-6.5"
      style={{
        paddingTop: 'max(24px, calc(env(safe-area-inset-top) + 16px))',
        paddingBottom: 'calc(32px + env(safe-area-inset-bottom))',
      }}
    >
      <div>
        <p className="font-mono text-caption uppercase text-text-muted">{t.signedIn.label}</p>
        <h1 className="mt-3.5 font-serif text-screen-title text-text-primary">
          {user?.displayName ?? t.app.name}
        </h1>
        {user?.email && (
          <p className="mt-2 font-mono text-caption text-text-muted">{user.email}</p>
        )}

        <p className="mt-6.5 border-t border-border pt-6.5 text-body text-text-secondary">
          {t.signedIn.note}
        </p>

        <p className="mt-3.5 text-body text-text-muted">
          {profile ? t.signedIn.profileCreated : t.signedIn.profilePending}
        </p>

        {error && <p className="mt-3.5 text-field-error text-danger">{error}</p>}
      </div>

      <Button variant="secondary" fullWidth onClick={() => void signOutUser()}>
        {t.auth.signOut}
      </Button>
    </div>
  )
}

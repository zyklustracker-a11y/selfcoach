import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { BottomSheet, Button, TabBar } from '@/components'
import { GearIcon } from '@/components/GearIcon'
import { useAuth } from '@/features/auth'
import { BooksProvider } from '@/features/books'
import { EntriesProvider } from '@/features/entries'
import { t } from '@/lib/strings'

const TABS = [
  { key: '/', label: t.nav.today },
  { key: '/books', label: t.nav.books },
  { key: '/archive', label: t.nav.archive },
  { key: '/todos', label: t.nav.todos },
]

/**
 * The frame every signed-in screen sits in: header with the settings gear, the
 * scrolling content, and the fixed tab bar.
 *
 * The gear opens a minimal account sheet for now — sign-out has to stay reachable.
 * Phase 8 replaces it with the real settings screen.
 */
export function AppShell() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, signOutUser } = useAuth()
  const [accountOpen, setAccountOpen] = useState(false)

  const activeTab = TABS.slice(1).find((tab) => pathname.startsWith(tab.key))?.key ?? '/'

  return (
    <BooksProvider>
      <EntriesProvider>
      <div className="mx-auto flex min-h-full max-w-app flex-col">
        <header
          className="flex items-start justify-end px-6.5"
          style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}
        >
          <button
            type="button"
            aria-label={t.nav.settings}
            onClick={() => setAccountOpen(true)}
            className="-mr-1 flex h-11 w-11 items-center justify-center text-text-muted active:text-text-primary"
          >
            <GearIcon className="h-[22px] w-[22px]" />
          </button>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <TabBar items={TABS} activeKey={activeTab} onSelect={(key) => navigate(key)} />

        <BottomSheet open={accountOpen} onClose={() => setAccountOpen(false)} title={t.account.title}>
          <div className="space-y-5 pb-2">
            {user?.email && <p className="font-mono text-caption text-text-muted">{user.email}</p>}
            <p className="text-body text-text-secondary">{t.account.note}</p>
            <Button variant="secondary" fullWidth onClick={() => void signOutUser()}>
              {t.auth.signOut}
            </Button>
          </div>
        </BottomSheet>
      </div>
      </EntriesProvider>
    </BooksProvider>
  )
}

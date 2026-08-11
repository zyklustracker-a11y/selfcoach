import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { TabBar } from '@/components'
import { GearIcon } from '@/components/GearIcon'
import { useAuth } from '@/features/auth'
import { BooksProvider } from '@/features/books'
import { EntriesProvider } from '@/features/entries'
import { InstallHint } from '@/features/onboarding'
import { ReviewsProvider } from '@/features/reviews'
import { TodosProvider } from '@/features/todos'
import { useOnline } from '@/lib/platform'
import { applyTheme } from './theme'
import { t } from '@/lib/strings'

const TABS = [
  { key: '/', label: t.nav.today },
  { key: '/books', label: t.nav.books },
  { key: '/archive', label: t.nav.archive },
  { key: '/todos', label: t.nav.todos },
]

/**
 * The frame every signed-in screen sits in: header with the offline indicator and
 * the settings gear, the scrolling content, and the fixed tab bar.
 */
export function AppShell() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const online = useOnline()
  const { profile } = useAuth()

  // Dark is the default until the stored preference arrives.
  useEffect(() => {
    if (profile) applyTheme(profile.settings.theme)
  }, [profile])

  const activeTab = TABS.slice(1).find((tab) => pathname.startsWith(tab.key))?.key ?? '/'

  return (
    <BooksProvider>
      <EntriesProvider>
        <TodosProvider>
          <ReviewsProvider>
            <div className="app-shell relative mx-auto flex max-w-app flex-col overflow-hidden">
              <header
                className="shrink-0 flex items-center justify-between px-6.5"
                style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}
              >
                {/* Offline is a state, not a failure — muted, never in danger red. */}
                <span className="font-mono text-caption uppercase text-text-muted">
                  {online ? '' : t.offline.indicator}
                </span>
                <button
                  type="button"
                  aria-label={t.nav.settings}
                  onClick={() => navigate('/settings')}
                  className="-mr-1 flex h-11 w-11 items-center justify-center text-text-muted active:text-text-primary"
                >
                  <GearIcon className="h-[22px] w-[22px]" />
                </button>
              </header>

              <main className="scroll-area flex-1 pb-24">
                <Outlet />
              </main>

              <InstallHint />
              <TabBar items={TABS} activeKey={activeTab} onSelect={(key) => navigate(key)} />
            </div>
          </ReviewsProvider>
        </TodosProvider>
      </EntriesProvider>
    </BooksProvider>
  )
}

import { cx } from '@/lib/cx'

export interface TabItem {
  key: string
  label: string
}

export interface TabBarProps {
  items: TabItem[]
  activeKey: string
  onSelect: (key: string) => void
}

/**
 * No icons on purpose: each tab is a 16x2px stroke above its label
 * (DESIGN.md section 5). It is the last child of the shell rather than a fixed
 * element, and pads itself against the home indicator.
 */
export function TabBar({ items, activeKey, onSelect }: TabBarProps) {
  return (
    <nav
      className="shrink-0 border-t border-border bg-bg-base"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex h-14">
        {items.map((item) => {
          const active = item.key === activeKey
          return (
            <li key={item.key} className="flex-1">
              <button
                type="button"
                onClick={() => onSelect(item.key)}
                aria-current={active ? 'page' : undefined}
                className="flex h-full w-full min-h-touch flex-col items-center justify-center gap-1.5"
              >
                <span
                  aria-hidden
                  className={cx('h-0.5 w-4', active ? 'bg-accent' : 'bg-transparent')}
                />
                <span className={cx('text-tab', active ? 'font-medium text-accent' : 'text-text-muted')}>
                  {item.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

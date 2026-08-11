import { useDeferredValue, useMemo, useState } from 'react'

import { Input, TagChip } from '@/components'
import { EntryRow, useEntries } from '@/features/entries'
import { ReviewRow, useReviews } from '@/features/reviews'
import { useTodos } from '@/features/todos'
import { createEntryIndex, searchEntries } from '@/lib/search'
import { t } from '@/lib/strings'
import type { EntryWithId, TodoWithId } from '@/types'


type View = 'chronological' | 'byBook' | 'byTag' | 'quotes' | 'reviews'
type Period = 'all' | 'month' | 'quarter' | 'year'
type Implementation = 'all' | 'done' | 'openOnly'

const VIEWS: { key: View; label: string }[] = [
  { key: 'chronological', label: t.archive.view.chronological },
  { key: 'byBook', label: t.archive.view.byBook },
  { key: 'byTag', label: t.archive.view.byTag },
  { key: 'quotes', label: t.archive.view.quotes },
  { key: 'reviews', label: t.archive.view.reviews },
]

const PERIODS: { key: Period; label: string; days: number | null }[] = [
  { key: 'all', label: t.archive.period.all, days: null },
  { key: 'month', label: t.archive.period.month, days: 30 },
  { key: 'quarter', label: t.archive.period.quarter, days: 90 },
  { key: 'year', label: t.archive.period.year, days: 365 },
]

const MONTH = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' })

export function ArchiveScreen() {
  const { entries, knownTags } = useEntries()
  const { todos } = useTodos()
  const { reviews } = useReviews()

  const [view, setView] = useState<View>('chronological')
  const [term, setTerm] = useState('')
  const [period, setPeriod] = useState<Period>('all')
  const [book, setBook] = useState<string | null>(null)
  const [tag, setTag] = useState<string | null>(null)
  const [implementation, setImplementation] = useState<Implementation>('all')

  // Rebuilt only when the entries themselves change — not on every keystroke.
  const index = useMemo(() => createEntryIndex(entries), [entries])
  // And the term itself lags behind typing, so a fast typist never waits on a search.
  const deferredTerm = useDeferredValue(term)

  const books = useMemo(
    () => [...new Set(entries.map((entry) => entry.bookTitle).filter(Boolean))] as string[],
    [entries],
  )

  const filtered = useMemo(() => {
    let result = deferredTerm.trim().length >= 2 ? searchEntries(index, deferredTerm) : entries

    const days = PERIODS.find((item) => item.key === period)?.days ?? null
    if (days !== null) {
      const cutoff = Date.now() - days * 86_400_000
      result = result.filter((entry) => (entry.createdAt?.toDate().getTime() ?? 0) >= cutoff)
    }
    if (book) result = result.filter((entry) => entry.bookTitle === book)
    if (tag) result = result.filter((entry) => entry.tags.includes(tag))
    if (implementation !== 'all') {
      // Firestore cannot join, so the state of an entry's to-dos is resolved here
      // over the cached collection (concept 6.6).
      result = result.filter((entry) => matchesImplementation(entry, todos, implementation))
    }
    return result
  }, [entries, index, deferredTerm, period, book, tag, implementation, todos])

  const hasFilter = period !== 'all' || book !== null || tag !== null || implementation !== 'all'

  return (
    <div className="px-6.5">
      <h1 className="font-serif text-screen-title text-text-primary">{t.nav.archive}</h1>
      <p className="mt-2 font-mono text-caption uppercase text-text-muted">
        {t.archive.count(view === 'reviews' ? reviews.length : filtered.length)}
      </p>

      <div className="mt-5">
        <Input
          search
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={t.archive.searchPlaceholder}
          aria-label={t.archive.searchPlaceholder}
        />
      </div>

      <div className="mt-3.5 flex flex-wrap gap-2">
        {VIEWS.map((item) => (
          <Chip key={item.key} active={view === item.key} onClick={() => setView(item.key)}>
            {item.label}
          </Chip>
        ))}
      </div>

      {view !== 'reviews' && (
        <div className="mt-3.5 space-y-2.5 border-t border-border pt-3.5">
          <FilterRow label={t.archive.filter.period}>
            {PERIODS.map((item) => (
              <Chip key={item.key} active={period === item.key} onClick={() => setPeriod(item.key)}>
                {item.label}
              </Chip>
            ))}
          </FilterRow>

          {books.length > 0 && (
            <FilterRow label={t.archive.filter.book}>
              {books.map((title) => (
                <Chip
                  key={title}
                  active={book === title}
                  onClick={() => setBook(book === title ? null : title)}
                >
                  {title}
                </Chip>
              ))}
            </FilterRow>
          )}

          {knownTags.length > 0 && (
            <FilterRow label={t.archive.filter.tag}>
              {knownTags.map((item) => (
                <Chip key={item} active={tag === item} onClick={() => setTag(tag === item ? null : item)}>
                  {item}
                </Chip>
              ))}
            </FilterRow>
          )}

          <FilterRow label={t.archive.filter.implementation}>
            <Chip active={implementation === 'done'} onClick={() => setImplementation(implementation === 'done' ? 'all' : 'done')}>
              {t.archive.filter.implemented}
            </Chip>
            <Chip active={implementation === 'openOnly'} onClick={() => setImplementation(implementation === 'openOnly' ? 'all' : 'openOnly')}>
              {t.archive.filter.notImplemented}
            </Chip>
          </FilterRow>

          {hasFilter && (
            <button
              type="button"
              onClick={() => {
                setPeriod('all')
                setBook(null)
                setTag(null)
                setImplementation('all')
              }}
              className="min-h-touch text-input-sans text-text-muted active:text-text-primary"
            >
              {t.archive.resetFilters}
            </button>
          )}
        </div>
      )}

      <div className="mt-[30px] border-t border-border pt-[30px]">
        {view === 'reviews' ? (
          reviews.length === 0 ? (
            <p className="text-body text-text-muted">{t.archive.empty.reviews}</p>
          ) : (
            <ul>
              {reviews.map((review) => (
                <li key={review.id}>
                  <ReviewRow review={review} />
                </li>
              ))}
            </ul>
          )
        ) : filtered.length === 0 ? (
          <p className="text-body text-text-muted">
            {term.trim() ? t.archive.empty.search : t.archive.empty.entries}
          </p>
        ) : (
          <Grouped view={view} entries={filtered} />
        )}
      </div>
    </div>
  )
}

function matchesImplementation(
  entry: EntryWithId,
  todos: TodoWithId[],
  mode: Implementation,
): boolean {
  const own = todos.filter((todo) => todo.sourceEntryId === entry.id)
  if (own.length === 0) return mode === 'openOnly'
  return mode === 'done'
    ? own.some((todo) => todo.status === 'done')
    : own.every((todo) => todo.status !== 'done')
}

function Grouped({ view, entries }: { view: View; entries: EntryWithId[] }) {
  if (view === 'quotes') {
    const withQuote = entries.filter((entry) => entry.quote)
    if (withQuote.length === 0) {
      return <p className="text-body text-text-muted">{t.archive.empty.quotes}</p>
    }
    return (
      <ul>
        {withQuote.map((entry) => (
          <li key={entry.id} className="border-b border-border py-3">
            <blockquote className="border-l border-border-strong pl-4 font-serif text-entry italic text-text-secondary">
              {entry.quote}
            </blockquote>
            {entry.bookTitle && (
              <p className="mt-1.5 pl-4 font-mono text-caption uppercase text-text-muted">
                {entry.bookTitle}
                {entry.page ? ` · ${t.entries.page(entry.page)}` : ''}
              </p>
            )}
          </li>
        ))}
      </ul>
    )
  }

  const groups = new Map<string, EntryWithId[]>()
  const push = (key: string, entry: EntryWithId) => {
    const list = groups.get(key)
    if (list) list.push(entry)
    else groups.set(key, [entry])
  }

  for (const entry of entries) {
    if (view === 'byBook') push(entry.bookTitle ?? t.entries.noBook, entry)
    else if (view === 'byTag') {
      if (entry.tags.length === 0) push(t.archive.withoutTag, entry)
      else for (const tag of entry.tags) push(tag, entry)
    } else {
      const created = entry.createdAt?.toDate()
      push(created ? MONTH.format(created) : t.archive.undated, entry)
    }
  }

  return (
    <>
      {[...groups.entries()].map(([label, list]) => (
        <section key={label} className="mb-7">
          <h2 className="font-mono text-section uppercase text-text-muted">{label}</h2>
          <ul className="mt-2">
            {list.map((entry) => (
              <li key={`${label}-${entry.id}`}>
                <EntryRow entry={entry} showMeta={view !== 'byBook'} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-16 shrink-0 pt-2 font-mono text-caption uppercase text-text-muted">
        {label}
      </span>
      <div className="flex flex-1 flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <TagChip filter selected={active} onClick={onClick}>
      {children}
    </TagChip>
  )
}

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { useAuth } from '@/features/auth'
import { dayKey } from '@/lib/dates'
import { subscribeToEntries } from '@/lib/firestore/entries'
import type { EntryWithId } from '@/types'

interface EntriesContextValue {
  entries: EntryWithId[]
  loading: boolean
  error: string | null
  today: EntryWithId[]
  /** Every tag ever used, for the autocomplete in the form. */
  knownTags: string[]
}

const EntriesContext = createContext<EntriesContextValue | null>(null)

export function EntriesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<EntryWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setEntries([])
      setLoading(false)
      return
    }

    setLoading(true)
    return subscribeToEntries(
      user.uid,
      (next) => {
        setEntries(next)
        setError(null)
        setLoading(false)
      },
      (cause) => {
        setError(cause.message)
        setLoading(false)
      },
    )
  }, [user])

  const value = useMemo<EntriesContextValue>(() => {
    const key = dayKey()
    return {
      entries,
      loading,
      error,
      today: entries.filter((entry) => entry.dayKey === key),
      knownTags: [...new Set(entries.flatMap((entry) => entry.tags))].sort((a, b) =>
        a.localeCompare(b, 'de'),
      ),
    }
  }, [entries, loading, error])

  return <EntriesContext.Provider value={value}>{children}</EntriesContext.Provider>
}

export function useEntries(): EntriesContextValue {
  const value = useContext(EntriesContext)
  if (!value) throw new Error('useEntries must be used inside <EntriesProvider>')
  return value
}

export function useEntry(entryId: string | undefined): EntryWithId | null {
  const { entries } = useEntries()
  return entries.find((entry) => entry.id === entryId) ?? null
}

export function useEntriesForBook(bookId: string | undefined): EntryWithId[] {
  const { entries } = useEntries()
  return bookId ? entries.filter((entry) => entry.bookId === bookId) : []
}

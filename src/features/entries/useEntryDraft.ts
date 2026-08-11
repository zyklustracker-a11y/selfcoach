import { useEffect, useRef, useState } from 'react'

/**
 * Keeps the entry form recoverable. Safari discards backgrounded tabs without
 * warning, and a lost entry destroys trust in the app immediately (concept 6.3).
 *
 * Drafts live in localStorage only. The concept also suggests mirroring them into
 * Firestore, but a half-written entry has no `action` yet and the security rules
 * reject it — see CLAUDE.md.
 */
const KEY = 'readcoach:entry-draft:v1'
const INTERVAL_MS = 3000

export interface EntryDraft {
  bookId: string | null
  learning: string
  meaning: string
  action: string
  quote: string
  page: string
  tags: string[]
  savedAt: number
}

export function readDraft(): EntryDraft | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed as EntryDraft
  } catch {
    return null
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // A full or blocked storage is not worth failing a save over.
  }
}

function writeDraft(draft: Omit<EntryDraft, 'savedAt'>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...draft, savedAt: Date.now() }))
  } catch {
    // Same here: losing the draft is bad, losing the entry would be worse.
  }
}

function isEmpty(draft: Omit<EntryDraft, 'savedAt'>): boolean {
  return (
    !draft.learning.trim() &&
    !draft.meaning.trim() &&
    !draft.action.trim() &&
    !draft.quote.trim() &&
    !draft.page.trim() &&
    draft.tags.length === 0
  )
}

/**
 * Writes every three seconds, and immediately whenever the page is hidden —
 * which is the moment iOS actually takes the app away.
 */
export function useEntryDraft(draft: Omit<EntryDraft, 'savedAt'>, enabled: boolean): void {
  const latest = useRef(draft)
  latest.current = draft

  useEffect(() => {
    if (!enabled) return

    const persist = () => {
      if (!isEmpty(latest.current)) writeDraft(latest.current)
    }

    const timer = window.setInterval(persist, INTERVAL_MS)
    const onHide = () => persist()
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', onHide)

    return () => {
      window.clearInterval(timer)
      window.removeEventListener('pagehide', onHide)
      document.removeEventListener('visibilitychange', onHide)
      persist()
    }
  }, [enabled])
}

/** Reads the stored draft once, on mount. */
export function useRestoredDraft(enabled: boolean): EntryDraft | null {
  const [restored] = useState(() => (enabled ? readDraft() : null))
  return restored
}

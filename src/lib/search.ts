import Fuse, { type IFuseOptions } from 'fuse.js'

import type { EntryWithId } from '@/types'

/**
 * Firestore has no full-text search and we are not adding a service for it
 * (concept 6.6). Everything is already in the offline cache, so the search runs
 * locally over the loaded entries.
 */
const OPTIONS: IFuseOptions<EntryWithId> = {
  // Weighted so the consequence and the insight outrank an incidental tag match.
  keys: [
    { name: 'action', weight: 3 },
    { name: 'summary', weight: 3 },
    { name: 'learning', weight: 2 },
    { name: 'meaning', weight: 2 },
    { name: 'quote', weight: 1 },
    { name: 'bookTitle', weight: 1 },
    { name: 'tags', weight: 1 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
}

export function createEntryIndex(entries: EntryWithId[]): Fuse<EntryWithId> {
  return new Fuse(entries, OPTIONS)
}

export function searchEntries(index: Fuse<EntryWithId>, term: string): EntryWithId[] {
  const needle = term.trim()
  if (needle.length < 2) return []
  return index.search(needle).map((hit) => hit.item)
}

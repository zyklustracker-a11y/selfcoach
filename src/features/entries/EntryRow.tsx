import { useNavigate } from 'react-router-dom'

import { t } from '@/lib/strings'
import { entryHeadline, entrySupport, type EntryWithId } from '@/types'

const DATE = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short' })

/**
 * Field 03 leads, because the consequence is what one wants to find again; the
 * learning follows as the quieter line of origin (DESIGN.md, archive).
 */
export function EntryRow({ entry, showMeta = true }: { entry: EntryWithId; showMeta?: boolean }) {
  const navigate = useNavigate()
  const created = entry.createdAt?.toDate()

  return (
    <button
      type="button"
      onClick={() => navigate(`/entries/${entry.id}`)}
      className="flex min-h-touch w-full flex-col items-start gap-1 border-b border-border py-3 text-left active:bg-bg-hover"
    >
      {showMeta && (
        <span className="font-mono text-caption uppercase text-text-muted">
          {[created ? DATE.format(created) : null, entry.bookTitle]
            .filter(Boolean)
            .join(' · ')}
        </span>
      )}
      <span className="font-serif text-entry text-text-primary">{entryHeadline(entry)}</span>
      {entrySupport(entry) && (
        <span className="text-body text-text-muted">{entrySupport(entry)}</span>
      )}
      {entry.page && (
        <span className="font-mono text-caption text-text-muted">{t.entries.page(entry.page)}</span>
      )}
    </button>
  )
}

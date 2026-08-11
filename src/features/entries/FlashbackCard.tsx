import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Card } from '@/components'
import { useAuth } from '@/features/auth'
import { useTodos } from '@/features/todos'
import { answerFlashback } from '@/lib/firestore/entries'
import { t } from '@/lib/strings'
import { entryHeadline, type EntryWithId, type FlashbackAnswer } from '@/types'

const DATE = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long' })

const OPTIONS: { answer: FlashbackAnswer; label: string }[] = [
  { answer: 'still_true', label: t.flashback.stillTrue },
  { answer: 'again', label: t.flashback.again },
  { answer: 'obsolete', label: t.flashback.obsolete },
]

/**
 * The mechanism that turns the archive from a graveyard into a system
 * (concept 6.7). It asks one thing and takes one tap to answer.
 */
export function FlashbackCard({ entry }: { entry: EntryWithId }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const { todos } = useTodos()

  // An entry that became a standing principle keeps coming back after the ladder.
  const keepsRecurring = todos.some(
    (todo) =>
      todo.sourceEntryId === entry.id && todo.kind === 'principle' && todo.status === 'open',
  )

  const created = entry.createdAt?.toDate()
  const days = created
    ? Math.max(1, Math.round((Date.now() - created.getTime()) / 86_400_000))
    : null

  return (
    <Card>
      <p className="font-mono text-section uppercase text-text-muted">
        {days ? t.flashback.title(days) : t.flashback.titlePlain}
      </p>

      <button
        type="button"
        onClick={() => navigate(`/entries/${entry.id}`)}
        className="mt-2 w-full text-left"
      >
        {/* Italic, because it is the user quoting their earlier self (DESIGN.md). */}
        <p className="font-serif text-entry italic text-text-primary">
          „{entryHeadline(entry)}"
        </p>
        <p className="mt-1.5 font-mono text-caption uppercase text-text-muted">
          {[entry.bookTitle, created ? DATE.format(created) : null].filter(Boolean).join(' · ')}
        </p>
      </button>

      <p className="mt-3.5 font-serif text-entry text-text-primary">{t.flashback.question}</p>

      <div className="mt-2 flex flex-col">
        {OPTIONS.map((option) => (
          <button
            key={option.answer}
            type="button"
            disabled={busy}
            onClick={() => {
              if (!user) return
              setBusy(true)
              void answerFlashback(user.uid, entry, option.answer, keepsRecurring)
            }}
            className="min-h-touch border-t border-border text-left text-input-sans text-text-secondary active:text-text-primary disabled:opacity-45"
          >
            {option.label}
          </button>
        ))}
      </div>
    </Card>
  )
}

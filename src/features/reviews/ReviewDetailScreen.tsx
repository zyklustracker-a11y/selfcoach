import { useNavigate, useParams } from 'react-router-dom'

import { EntryRow, useEntries } from '@/features/entries'
import { t } from '@/lib/strings'

import { useReviews } from './ReviewsProvider'

const DATE = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long' })

function formatRange(start: string, end: string): string {
  const from = new Date(`${start}T00:00:00`)
  const to = new Date(`${end}T00:00:00`)
  return `${DATE.format(from)} – ${DATE.format(to)}`
}

/** Concept 7.2, screen 11: a stored review, read-only. */
export function ReviewDetailScreen() {
  const { weekKey } = useParams()
  const navigate = useNavigate()
  const { reviews, current } = useReviews()
  const { entries } = useEntries()

  const review =
    reviews.find((item) => item.weekKey === weekKey) ??
    (current?.weekKey === weekKey ? current : null)

  if (!review) {
    return <p className="px-6.5 text-body text-text-muted">{t.reviews.notFound}</p>
  }

  const picked = review.topInsightIds
    .map((id) => entries.find((entry) => entry.id === id))
    .filter((entry) => entry !== undefined)

  return (
    <div className="px-6.5" style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom))' }}>
      <p className="font-mono text-caption uppercase text-text-muted">
        {t.reviews.weekLabel(review.weekKey)} · {formatRange(review.weekStart, review.weekEnd)}
      </p>
      <h1 className="mt-2 font-serif text-screen-title text-text-primary">{t.reviews.title}</h1>

      <p className="mt-3.5 font-mono text-caption uppercase text-text-muted">
        {t.reviews.entryCount(review.entryCount)}
        {review.todoTotalCount > 0
          ? ` · ${t.reviews.todoStats(review.todoDoneCount, review.todoTotalCount)}`
          : ''}
      </p>

      {review.completedAt === null && (
        <button
          type="button"
          onClick={() => navigate('/reviews/current')}
          className="mt-5 min-h-touch text-input-sans text-accent"
        >
          {t.reviews.resume}
        </button>
      )}

      {picked.length > 0 && (
        <section className="mt-[30px] border-t border-border pt-[30px]">
          <h2 className="font-mono text-section uppercase text-text-muted">
            {review.questions[0] ?? ''}
          </h2>
          <ul className="mt-2">
            {picked.map((entry) => (
              <li key={entry.id}>
                <EntryRow entry={entry} showMeta={false} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {review.questions.slice(1).map((question, index) => {
        const answer = review.answers[index + 1]?.trim()
        if (!answer) return null
        return (
          <section key={question} className="mt-7 border-t border-border pt-5">
            <h2 className="text-body text-text-muted">{question}</h2>
            <p className="mt-2 font-serif text-entry text-text-primary">{answer}</p>
          </section>
        )
      })}
    </div>
  )
}

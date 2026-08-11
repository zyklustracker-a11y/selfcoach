import { useNavigate } from 'react-router-dom'

import { t } from '@/lib/strings'
import type { ReviewWithId } from '@/types'

/** In the archive a review is its own kind of entry (concept 6.5). */
export function ReviewRow({ review }: { review: ReviewWithId }) {
  const navigate = useNavigate()
  // The focus for the coming week is the one line worth showing.
  const focus = review.answers[review.answers.length - 1]?.trim()

  return (
    <button
      type="button"
      onClick={() => navigate(`/reviews/${review.weekKey}`)}
      className="flex min-h-touch w-full flex-col items-start gap-1 border-b border-border py-3 text-left active:bg-bg-hover"
    >
      <span className="font-mono text-caption uppercase text-text-muted">
        {t.reviews.weekLabel(review.weekKey)} · {t.reviews.entryCount(review.entryCount)}
      </span>
      {focus ? (
        <span className="font-serif text-entry text-text-primary">{focus}</span>
      ) : (
        <span className="text-body text-text-muted">{t.reviews.noFocus}</span>
      )}
    </button>
  )
}

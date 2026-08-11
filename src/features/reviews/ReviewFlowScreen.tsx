import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Textarea } from '@/components'
import { useAuth } from '@/features/auth'
import { useEntries } from '@/features/entries'
import { useTodos } from '@/features/todos'
import { saveReview, type ReviewDraft } from '@/lib/firestore/reviews'
import { cx } from '@/lib/cx'
import { t } from '@/lib/strings'
import { entryHeadline, type EntryWithId } from '@/types'

import { useReviews } from './ReviewsProvider'
import { collectWeekMaterial } from './weekMath'

/**
 * Concept 6.5: one question per step, no preview of the next one, and the whole
 * thing interruptible — every step is written to `reviews/{weekKey}`, so closing
 * the app mid-review loses nothing.
 */
export function ReviewFlowScreen() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { entries } = useEntries()
  const { todos } = useTodos()
  const { current } = useReviews()

  const material = useMemo(() => collectWeekMaterial(entries, todos), [entries, todos])
  const questions = profile?.settings.reviewQuestions ?? [...t.review.defaultQuestions]

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>(() =>
    questions.map((_, index) => current?.answers[index] ?? ''),
  )
  const [topInsightIds, setTopInsightIds] = useState<string[]>(current?.topInsightIds ?? [])
  const [saving, setSaving] = useState(false)
  // A review that already exists must not have its createdAt pushed forward.
  const existedOnMount = useRef(current !== null)

  /**
   * Takes over the stored review once it arrives. The initial state cannot do this:
   * on a cold start the provider is still loading and `current` is null, so the
   * form would sit there empty and the next step would write those blanks over
   * the answers already in Firestore.
   */
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    if (hydrated || !current) return

    setAnswers(questions.map((_, index) => current.answers[index] ?? ''))
    setTopInsightIds(current.topInsightIds)

    // Question 1 is the entry picker and never writes to `answers`, so it counts
    // as done once something was picked or any later question was answered —
    // otherwise every resume would drop back to the first step.
    const firstStepDone =
      current.topInsightIds.length > 0 || current.answers.some((answer) => answer?.trim())
    const firstEmpty = questions.findIndex((_, index) =>
      index === 0 ? !firstStepDone : !current.answers[index]?.trim(),
    )
    setStep(firstEmpty === -1 ? questions.length - 1 : firstEmpty)
    setHydrated(true)
  }, [current, questions, hydrated])

  // Nothing may be written before the stored review has been taken over.
  const ready = current === null || hydrated

  const draft: ReviewDraft = {
    weekKey: material.weekKey,
    weekStart: material.weekStart,
    weekEnd: material.weekEnd,
    questions,
    answers,
    topInsightIds,
    entryCount: material.entries.length,
    todoDoneCount: material.todoDoneCount,
    todoTotalCount: material.todoTotalCount,
  }

  async function persist(completed: boolean) {
    if (!user || !ready) return
    setSaving(true)
    try {
      await saveReview(user.uid, draft, { completed, isNew: !existedOnMount.current })
      existedOnMount.current = true
    } finally {
      setSaving(false)
    }
  }

  async function next() {
    await persist(false)
    if (step < questions.length - 1) setStep(step + 1)
    else {
      await persist(true)
      navigate(`/reviews/${material.weekKey}`, { replace: true })
    }
  }

  const isLast = step === questions.length - 1
  const question = questions[step] ?? ''

  return (
    <div
      className="flex min-h-full flex-col px-6.5"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-caption uppercase text-text-muted">
          {t.reviews.stepOf(step + 1, questions.length)}
        </span>
        <Button
          variant="ghost"
          onClick={() => {
            void persist(false)
            navigate('/')
          }}
        >
          {t.action.later}
        </Button>
      </div>

      {/* Progress as a row of short strokes — no percentage, no reward. */}
      <div aria-hidden className="mt-2 flex gap-1">
        {questions.map((_, index) => (
          <span
            key={index}
            className={cx('h-0.5 flex-1', index <= step ? 'bg-accent' : 'bg-border-strong')}
          />
        ))}
      </div>

      <h1 className="mt-7 font-serif text-screen-title text-text-primary">{question}</h1>

      <div className="mt-6.5 flex-1">
        {step === 0 ? (
          <InsightPicker
            entries={material.entries}
            selected={topInsightIds}
            onToggle={(id) =>
              setTopInsightIds(
                topInsightIds.includes(id)
                  ? topInsightIds.filter((it) => it !== id)
                  : [...topInsightIds, id],
              )
            }
          />
        ) : (
          <Textarea
            size="review"
            value={answers[step] ?? ''}
            onChange={(event) => {
              const next = [...answers]
              next[step] = event.target.value
              setAnswers(next)
            }}
            showCount
          />
        )}

        {step === 1 && material.todoTotalCount > 0 && (
          <p className="mt-3.5 font-mono text-caption uppercase text-text-muted">
            {t.reviews.todoStats(material.todoDoneCount, material.todoTotalCount)}
          </p>
        )}

        {/* Question 4 is the pattern question; the app supplies the arithmetic,
            the user supplies the insight (concept 6.5). */}
        {step === 3 && (material.topTags.length > 0 || material.books.length > 0) && (
          <div className="mt-6.5 border-t border-border pt-5">
            <h2 className="font-mono text-section uppercase text-text-muted">
              {t.reviews.patternHelp}
            </h2>
            {material.topTags.length > 0 && (
              <p className="mt-2 text-body text-text-secondary">
                {material.topTags.map((item) => `${item.tag} (${item.count})`).join(' · ')}
              </p>
            )}
            {material.books.length > 0 && (
              <p className="mt-1.5 text-body text-text-muted">{material.books.join(' · ')}</p>
            )}
          </div>
        )}

        {isLast && material.openPrinciples.length > 0 && (
          <div className="mt-6.5 border-t border-border pt-5">
            <h2 className="font-mono text-section uppercase text-text-muted">
              {t.reviews.principlesInView}
            </h2>
            <ul className="mt-2">
              {material.openPrinciples.map((todo) => (
                <li key={todo.id} className="border-b border-border py-2">
                  <p className="font-serif text-entry text-text-primary">{todo.title}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-7 flex gap-3">
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep(step - 1)}>
            {t.action.back}
          </Button>
        )}
        <Button fullWidth disabled={saving || !ready} onClick={() => void next()}>
          {isLast ? t.reviews.finish : t.action.next}
        </Button>
      </div>
    </div>
  )
}

function InsightPicker({
  entries,
  selected,
  onToggle,
}: {
  entries: EntryWithId[]
  selected: string[]
  onToggle: (id: string) => void
}) {
  if (entries.length === 0) {
    return <p className="text-body text-text-muted">{t.reviews.noEntriesThisWeek}</p>
  }

  return (
    <ul>
      {entries.map((entry) => (
        <li key={entry.id}>
          <button
            type="button"
            onClick={() => onToggle(entry.id)}
            aria-pressed={selected.includes(entry.id)}
            className={cx(
              'flex min-h-touch w-full flex-col items-start border-b border-border py-2.5 text-left',
              selected.includes(entry.id) ? 'text-accent' : 'text-text-primary',
            )}
          >
            <span className="font-serif text-entry">{entryHeadline(entry)}</span>
            {entry.bookTitle && (
              <span className="font-mono text-caption uppercase text-text-muted">
                {entry.bookTitle}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Input } from '@/components'
import { useAuth } from '@/features/auth'
import { createBook } from '@/lib/firestore/books'
import { markOnboarded } from '@/lib/firestore/users'
import { cx } from '@/lib/cx'
import { t } from '@/lib/strings'

const SLIDES = t.onboarding.slides

/**
 * Concept 7.2, screen 2: three slides, then the first book. The reminder time the
 * concept asks for here is gone with the reminders themselves (CLAUDE.md 7.1).
 */
export function OnboardingScreen() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [busy, setBusy] = useState(false)

  const isBookStep = step === SLIDES.length

  async function finish(withBook: boolean) {
    if (!user) return
    setBusy(true)
    try {
      if (withBook && title.trim()) {
        await createBook(user.uid, {
          title: title.trim(),
          author: author.trim(),
          status: 'reading',
          coverUrl: null,
          isbn: null,
          tags: [],
        })
      }
      await markOnboarded(user.uid)
      await refreshProfile()
      navigate('/', { replace: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="mx-auto flex min-h-full max-w-app flex-col justify-between px-6.5"
      style={{
        paddingTop: 'max(56px, calc(env(safe-area-inset-top) + 48px))',
        paddingBottom: 'calc(32px + env(safe-area-inset-bottom))',
      }}
    >
      <div>
        <div aria-hidden className="flex gap-1">
          {[...SLIDES, 'book'].map((_, index) => (
            <span
              key={index}
              className={cx('h-0.5 flex-1', index <= step ? 'bg-accent' : 'bg-border-strong')}
            />
          ))}
        </div>

        {isBookStep ? (
          <div className="mt-7">
            <h1 className="font-serif text-screen-title text-text-primary">
              {t.onboarding.bookTitle}
            </h1>
            <p className="mt-3.5 text-body text-text-secondary">{t.onboarding.bookBody}</p>
            <div className="mt-6.5 space-y-5">
              <Input
                label={t.books.field.title}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={t.books.field.titlePlaceholder}
              />
              <Input
                label={t.books.field.author}
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder={t.books.field.authorPlaceholder}
              />
            </div>
          </div>
        ) : (
          <div className="mt-7">
            <h1 className="font-serif text-screen-title text-text-primary">
              {SLIDES[step]?.title}
            </h1>
            <p className="mt-5 text-body text-text-secondary">{SLIDES[step]?.body}</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {isBookStep ? (
          <>
            <Button fullWidth disabled={busy || !title.trim()} onClick={() => void finish(true)}>
              {t.onboarding.startWithBook}
            </Button>
            <Button variant="ghost" fullWidth disabled={busy} onClick={() => void finish(false)}>
              {t.onboarding.skipBook}
            </Button>
          </>
        ) : (
          <Button fullWidth onClick={() => setStep(step + 1)}>
            {t.action.next}
          </Button>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { BottomSheet, Button, Input } from '@/components'
import { useAuth } from '@/features/auth'
import { useBooks } from '@/features/books'
import { useEntries } from '@/features/entries'
import { useReviews } from '@/features/reviews'
import { useTodos } from '@/features/todos'
import { applyTheme } from '@/app/theme'
import { shareOrDownload, toJson, toMarkdown } from '@/lib/export'
import { deleteAllUserData, setUserSettings } from '@/lib/firestore/users'
import { cx } from '@/lib/cx'
import { t } from '@/lib/strings'
import type { Theme } from '@/types'

/** Concept 7.2, screen 13. Reached through the gear in the header. */
export function SettingsScreen() {
  const navigate = useNavigate()
  const { user, profile, refreshProfile, signOutUser } = useAuth()
  const { books } = useBooks()
  const { entries } = useEntries()
  const { todos } = useTodos()
  const { reviews } = useReviews()

  const theme: Theme = profile?.settings.theme ?? 'dark'
  const questions = profile?.settings.reviewQuestions ?? [...t.review.defaultQuestions]

  const [editing, setEditing] = useState<string[] | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function chooseTheme(next: Theme) {
    applyTheme(next)
    if (user) {
      await setUserSettings(user.uid, { theme: next })
      await refreshProfile()
    }
  }

  async function saveQuestions() {
    if (!user || !editing) return
    await setUserSettings(user.uid, { reviewQuestions: editing.map((q) => q.trim()).filter(Boolean) })
    await refreshProfile()
    setEditing(null)
  }

  async function exportAs(format: 'json' | 'markdown') {
    const data = { books, entries, todos, reviews }
    const stamp = new Date().toISOString().slice(0, 10)
    if (format === 'json') {
      await shareOrDownload(`readcoach-${stamp}.json`, toJson(data), 'application/json')
    } else {
      await shareOrDownload(`readcoach-${stamp}.md`, toMarkdown(data), 'text/markdown')
    }
  }

  async function deleteAccount() {
    if (!user) return
    setBusy(true)
    setDeleteError(null)
    try {
      await deleteAllUserData(user.uid)
      await user.delete()
      navigate('/login', { replace: true })
    } catch (cause: unknown) {
      // Firebase requires a fresh sign-in before deleting the account. The data is
      // already gone at this point, so signing in again and repeating finishes it.
      const code = cause instanceof Error && 'code' in cause ? String(cause.code) : ''
      setDeleteError(
        code === 'auth/requires-recent-login' ? t.settings.delete.reauth : t.settings.delete.failed,
      )
      setBusy(false)
    }
  }

  return (
    <div className="px-6.5">
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-screen-title text-text-primary">{t.nav.settings}</h1>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          {t.action.done}
        </Button>
      </div>

      {profile?.email && (
        <p className="mt-2 font-mono text-caption text-text-muted">{profile.email}</p>
      )}

      <Section title={t.settings.theme}>
        <div className="flex gap-2">
          {(['dark', 'light'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => void chooseTheme(option)}
              aria-pressed={theme === option}
              className={cx(
                'min-h-touch flex-1 rounded-md border px-3.5 text-body',
                theme === option
                  ? 'border-accent bg-bg-hover text-text-primary'
                  : 'border-border-strong text-text-secondary',
              )}
            >
              {option === 'dark' ? t.settings.themeDark : t.settings.themeLight}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t.settings.questions}>
        {editing ? (
          <div className="space-y-3.5">
            {editing.map((question, index) => (
              <Input
                key={index}
                value={question}
                // Question 1 drives the entry picker, so its wording is editable but
                // its role is not — it always stays the first step.
                label={index === 0 ? t.settings.questionFixed : undefined}
                onChange={(event) => {
                  const next = [...editing]
                  next[index] = event.target.value
                  setEditing(next)
                }}
              />
            ))}
            <div className="flex gap-3">
              <Button onClick={() => void saveQuestions()}>{t.action.save}</Button>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                {t.action.cancel}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ol className="mb-3 space-y-2">
              {questions.map((question, index) => (
                <li key={index} className="flex gap-3">
                  <span className="font-mono text-caption text-text-muted">{index + 1}</span>
                  <span className="flex-1 text-body text-text-secondary">{question}</span>
                </li>
              ))}
            </ol>
            <Button variant="secondary" onClick={() => setEditing([...questions])}>
              {t.action.edit}
            </Button>
          </>
        )}
      </Section>

      <Section title={t.settings.export}>
        <p className="mb-3 text-body text-text-muted">{t.settings.exportHint}</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => void exportAs('json')}>
            JSON
          </Button>
          <Button variant="secondary" onClick={() => void exportAs('markdown')}>
            Markdown
          </Button>
        </div>
      </Section>

      <Section title={t.settings.account}>
        <div className="space-y-3">
          <Button variant="secondary" fullWidth onClick={() => void signOutUser()}>
            {t.auth.signOut}
          </Button>
          <Button variant="ghost" destructive fullWidth onClick={() => setDeleteOpen(true)}>
            {t.settings.delete.action}
          </Button>
        </div>
      </Section>

      <BottomSheet
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t.settings.delete.title}
      >
        <div className="space-y-5 pb-2">
          <p className="text-body text-text-secondary">{t.settings.delete.body}</p>
          {deleteError && <p className="text-field-error text-danger">{deleteError}</p>}
          <Button variant="secondary" fullWidth onClick={() => setDeleteOpen(false)}>
            {t.settings.delete.cancel}
          </Button>
          <Button
            variant="ghost"
            destructive
            fullWidth
            disabled={busy}
            onClick={() => void deleteAccount()}
          >
            {t.settings.delete.confirm}
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-[30px] border-t border-border pt-[30px]">
      <h2 className="mb-3.5 font-mono text-section uppercase text-text-muted">{title}</h2>
      {children}
    </section>
  )
}

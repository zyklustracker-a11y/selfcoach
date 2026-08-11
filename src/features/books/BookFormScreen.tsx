import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button, Input, TagChip } from '@/components'
import { useAuth } from '@/features/auth'
import { createBook, updateBook } from '@/lib/firestore/books'
import { cx } from '@/lib/cx'
import { t } from '@/lib/strings'
import { BOOK_STATUSES, type BookInput, type BookStatus } from '@/types'

import { useBook } from './BooksProvider'

function isValidCoverUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export function BookFormScreen() {
  const navigate = useNavigate()
  const { bookId } = useParams()
  const { user } = useAuth()
  const existing = useBook(bookId)
  const isEdit = Boolean(bookId)

  const [title, setTitle] = useState(existing?.title ?? '')
  const [author, setAuthor] = useState(existing?.author ?? '')
  const [status, setStatus] = useState<BookStatus>(existing?.status ?? 'reading')
  const [coverUrl, setCoverUrl] = useState(existing?.coverUrl ?? '')
  const [isbn, setIsbn] = useState(existing?.isbn ?? '')
  const [tags, setTags] = useState<string[]>(existing?.tags ?? [])
  const [tagDraft, setTagDraft] = useState('')
  const [errors, setErrors] = useState<{ title?: string; coverUrl?: string; save?: string }>({})
  const [saving, setSaving] = useState(false)

  if (isEdit && !existing) {
    return <p className="px-6.5 text-body text-text-muted">{t.books.error.notFound}</p>
  }

  /** Normalised so `Fokus` and `fokus` never become two tags. */
  function normalise(value: string): string {
    return value.trim().toLowerCase()
  }

  function addTag() {
    const value = normalise(tagDraft)
    if (value && !tags.includes(value)) setTags([...tags, value])
    setTagDraft('')
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!user) return

    const nextErrors: typeof errors = {}
    if (!title.trim()) nextErrors.title = t.books.error.titleRequired
    if (coverUrl.trim() && !isValidCoverUrl(coverUrl.trim())) {
      nextErrors.coverUrl = t.books.error.coverUrl
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    // A tag still sitting in the input counts as entered. Committing it here rather
    // than on blur keeps the layout from growing under the thumb the moment the save
    // button is tapped — which made the tap miss.
    const pending = normalise(tagDraft)
    const finalTags = pending && !tags.includes(pending) ? [...tags, pending] : tags

    const input: BookInput = {
      title: title.trim(),
      author: author.trim(),
      status,
      coverUrl: coverUrl.trim() || null,
      isbn: isbn.trim() || null,
      tags: finalTags,
    }

    setSaving(true)
    try {
      if (existing) {
        await updateBook(user.uid, existing.id, existing, input)
        navigate(`/books/${existing.id}`, { replace: true })
      } else {
        const created = await createBook(user.uid, input)
        navigate(`/books/${created}`, { replace: true })
      }
    } catch {
      setErrors({ save: t.books.error.save })
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      className="px-6.5"
      style={{ paddingBottom: 'calc(130px + env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-screen-title text-text-primary">
          {isEdit ? t.books.editTitle : t.books.newTitle}
        </h1>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          {t.action.cancel}
        </Button>
      </div>

      <div className="mt-6.5 space-y-6.5">
        <Input
          label={t.books.field.title}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t.books.field.titlePlaceholder}
          {...(errors.title ? { error: errors.title } : {})}
        />

        <Input
          label={t.books.field.author}
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          placeholder={t.books.field.authorPlaceholder}
        />

        <fieldset>
          <legend className="mb-2 block text-caption font-mono uppercase text-text-muted">
            {t.books.field.status}
          </legend>
          <div className="space-y-2">
            {BOOK_STATUSES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatus(option)}
                aria-pressed={status === option}
                className={cx(
                  'flex min-h-touch w-full items-center rounded-md border px-3.5 text-left text-body',
                  status === option
                    ? 'border-accent bg-bg-hover text-text-primary'
                    : 'border-border-strong text-text-secondary',
                )}
              >
                {t.books.status[option]}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <Input
            label={t.books.field.coverUrl}
            value={coverUrl}
            onChange={(event) => setCoverUrl(event.target.value)}
            placeholder={t.books.field.coverUrlPlaceholder}
            inputMode="url"
            {...(errors.coverUrl ? { error: errors.coverUrl } : {})}
          />
          <p className="mt-1.5 text-field-error text-text-muted">{t.books.field.coverUrlHint}</p>
        </div>

        <Input
          label={t.books.field.isbn}
          value={isbn}
          onChange={(event) => setIsbn(event.target.value)}
          inputMode="numeric"
        />

        <div>
          <label
            htmlFor="book-tag-draft"
            className="mb-2 block text-caption font-mono uppercase text-text-muted"
          >
            {t.books.field.tags}
          </label>
          {tags.length > 0 && (
            <div className="mb-2.5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <TagChip key={tag} onRemove={() => setTags(tags.filter((it) => it !== tag))}>
                  {tag}
                </TagChip>
              ))}
            </div>
          )}
          <Input
            id="book-tag-draft"
            value={tagDraft}
            onChange={(event) => setTagDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addTag()
              }
            }}
            placeholder={t.books.field.tagPlaceholder}
          />
        </div>

        {errors.save && <p className="text-field-error text-danger">{errors.save}</p>}

        <Button type="submit" fullWidth disabled={saving}>
          {t.action.save}
        </Button>
      </div>
    </form>
  )
}

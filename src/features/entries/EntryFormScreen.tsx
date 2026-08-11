import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { BottomSheet, Button, Input, TagChip, Textarea } from '@/components'
import { useAuth } from '@/features/auth'
import { useBooks } from '@/features/books'
import { setBookSummaryEntry } from '@/lib/firestore/books'
import { createEntry, updateEntry } from '@/lib/firestore/entries'
import { cx } from '@/lib/cx'
import { t } from '@/lib/strings'
import type { EntryInput } from '@/types'

import { useEntries, useEntry } from './EntriesProvider'
import { clearDraft, useEntryDraft, useRestoredDraft } from './useEntryDraft'

type Errors = Partial<Record<'learning' | 'meaning' | 'action' | 'summary' | 'page' | 'save', string>>

export function EntryFormScreen() {
  const navigate = useNavigate()
  const { entryId } = useParams()
  const [params] = useSearchParams()
  const { user } = useAuth()
  const { books, activeBook } = useBooks()
  const { knownTags } = useEntries()
  const existing = useEntry(entryId)

  const isEdit = Boolean(entryId)
  // A book summary is written from the book detail screen and names its book.
  const summaryForBook = params.get('summaryFor')
  const isSummary = existing ? existing.type === 'book_summary' : Boolean(summaryForBook)

  // Only a fresh insight can restore a draft: an edit has its own content, and a
  // summary belongs to one specific book.
  const draftable = !isEdit && !isSummary
  const draft = useRestoredDraft(draftable)

  const [bookId, setBookId] = useState<string | null>(
    existing?.bookId ?? summaryForBook ?? draft?.bookId ?? activeBook?.id ?? null,
  )
  const [learning, setLearning] = useState(
    existing?.type === 'insight' ? existing.learning : (draft?.learning ?? ''),
  )
  const [meaning, setMeaning] = useState(existing?.meaning ?? draft?.meaning ?? '')
  const [action, setAction] = useState(existing?.action ?? draft?.action ?? '')
  const [summary, setSummary] = useState(existing?.type === 'book_summary' ? existing.summary : '')
  const [quote, setQuote] = useState(existing?.quote ?? draft?.quote ?? '')
  const [page, setPage] = useState(existing?.page ? String(existing.page) : (draft?.page ?? ''))
  const [tags, setTags] = useState<string[]>(existing?.tags ?? draft?.tags ?? [])
  const [tagDraft, setTagDraft] = useState('')

  const [showExtras, setShowExtras] = useState(
    Boolean(existing?.quote ?? existing?.page ?? existing?.tags.length),
  )
  const [bookSheetOpen, setBookSheetOpen] = useState(false)
  const [draftNoticeOpen, setDraftNoticeOpen] = useState(Boolean(draft))
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)

  useEntryDraft({ bookId, learning, meaning, action, quote, page, tags }, draftable)

  const book = useMemo(() => books.find((it) => it.id === bookId) ?? null, [books, bookId])
  const tagSuggestions = useMemo(() => {
    const needle = tagDraft.trim().toLowerCase()
    if (!needle) return []
    return knownTags.filter((tag) => tag.includes(needle) && !tags.includes(tag)).slice(0, 6)
  }, [knownTags, tagDraft, tags])

  if (isEdit && !existing) {
    return <p className="px-6.5 text-body text-text-muted">{t.entries.error.notFound}</p>
  }

  function commitTag(value: string) {
    const tag = value.trim().toLowerCase()
    if (tag && !tags.includes(tag)) setTags([...tags, tag])
    setTagDraft('')
  }

  function discardDraft() {
    clearDraft()
    setDraftNoticeOpen(false)
    setLearning('')
    setMeaning('')
    setAction('')
    setQuote('')
    setPage('')
    setTags([])
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!user) return

    const next: Errors = {}
    if (isSummary) {
      if (!summary.trim()) next.summary = t.entries.error.summary
    } else {
      if (!learning.trim()) next.learning = t.entries.error.learning
      if (!meaning.trim()) next.meaning = t.entries.error.meaning
      if (!action.trim()) next.action = t.entries.error.action
    }
    if (page.trim() && !/^\d+$/.test(page.trim())) next.page = t.entries.error.page

    setErrors(next)
    if (Object.keys(next).length > 0) return

    const pending = tagDraft.trim().toLowerCase()
    const finalTags = pending && !tags.includes(pending) ? [...tags, pending] : tags

    const shared = {
      bookId,
      quote: quote.trim() || null,
      page: page.trim() ? Number(page.trim()) : null,
      tags: finalTags,
    }
    const input: EntryInput = isSummary
      ? {
          type: 'book_summary',
          ...shared,
          summary: summary.trim(),
          meaning: meaning.trim() || null,
          action: action.trim() || null,
        }
      : {
          type: 'insight',
          ...shared,
          learning: learning.trim(),
          meaning: meaning.trim(),
          action: action.trim(),
        }

    setSaving(true)
    try {
      if (existing) {
        await updateEntry(user.uid, existing.id, input, book?.title ?? null, existing)
        navigate(`/entries/${existing.id}`, { replace: true })
      } else {
        const created = await createEntry(user.uid, input, book?.title ?? null)
        // The book points at its summary rather than holding a second copy of it.
        if (isSummary && bookId) await setBookSummaryEntry(user.uid, bookId, created)
        clearDraft()
        navigate(`/entries/${created}`, { replace: true })
      }
    } catch {
      setErrors({ save: t.entries.error.save })
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      className="px-6.5"
      aria-label={isSummary ? t.entries.summaryTitle : isEdit ? t.entries.editTitle : t.entries.newTitle}
      style={{ paddingBottom: 'calc(130px + env(safe-area-inset-bottom))' }}
    >
      {/* Mockup 2a: a slim action row, no screen title. Saving must not require
          scrolling past the optional fields first. */}
      <div className="-mx-1 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => {
            if (!isEdit) clearDraft()
            navigate(-1)
          }}
        >
          {t.action.cancel}
        </Button>
        <button
          type="submit"
          disabled={saving}
          className="min-h-touch px-1 text-input-sans font-medium text-accent active:text-accent-pressed disabled:opacity-45"
        >
          {t.action.save}
        </button>
      </div>

      {/* Book line: the active book is preselected, which saves a tap per entry. */}
      <button
        type="button"
        onClick={() => setBookSheetOpen(true)}
        disabled={isSummary}
        className="mt-5 flex min-h-touch w-full items-baseline justify-between border-b border-border pb-3 text-left disabled:opacity-60"
      >
        <span className="font-serif text-entry text-text-primary">
          {book?.title ?? t.entries.noBook}
        </span>
        {!isSummary && (
          <span className="font-mono text-caption uppercase text-text-muted">
            {t.entries.chooseBook}
          </span>
        )}
      </button>

      {draftNoticeOpen && (
        <div className="mt-3.5 flex items-center justify-between gap-3">
          <p className="text-body text-text-muted">{t.entries.draft.restored}</p>
          <Button variant="ghost" onClick={discardDraft}>
            {t.entries.draft.discard}
          </Button>
        </div>
      )}

      {isSummary ? (
        <ChainField
          index="—"
          title={t.entries.field.summaryTitle}
          {...(errors.summary ? { error: errors.summary } : {})}
        >
          <Textarea
            bare
            size="lead"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder={t.entries.field.summaryPlaceholder}
          />
        </ChainField>
      ) : (
        <>
          <ChainField
            index={t.entries.field.learningLabel}
            title={t.entries.field.learningTitle}
            {...(errors.learning ? { error: errors.learning } : {})}
          >
            <Textarea
              bare
              value={learning}
              onChange={(event) => setLearning(event.target.value)}
              placeholder={t.entries.field.learningPlaceholder}
            />
          </ChainField>

          <ChainField
            index={t.entries.field.meaningLabel}
            title={t.entries.field.meaningTitle}
            {...(errors.meaning ? { error: errors.meaning } : {})}
          >
            <Textarea
              bare
              value={meaning}
              onChange={(event) => setMeaning(event.target.value)}
              placeholder={t.entries.field.meaningPlaceholder}
            />
          </ChainField>

          {/* Field 03 is the heaviest thing on the screen, because it is what the
              user is meant to do tomorrow (DESIGN.md, prose rule 2). */}
          <ChainField
            index={t.entries.field.actionLabel}
            title={t.entries.field.actionTitle}
            accent
            {...(errors.action ? { error: errors.action } : {})}
          >
            <Textarea
              bare
              size="lead"
              value={action}
              onChange={(event) => setAction(event.target.value)}
              placeholder={t.entries.field.actionPlaceholder}
            />
          </ChainField>
        </>
      )}

      <div className="mt-[30px] border-t border-border pt-5">
        <Button variant="ghost" onClick={() => setShowExtras(!showExtras)}>
          {showExtras ? t.entries.moreOpen : t.entries.more}
        </Button>

        {showExtras && (
          <div className="mt-3.5 space-y-6.5">
            <Input
              label={t.entries.field.page}
              value={page}
              onChange={(event) => setPage(event.target.value)}
              inputMode="numeric"
              {...(errors.page ? { error: errors.page } : {})}
            />

            <Textarea
              label={t.entries.field.quote}
              value={quote}
              onChange={(event) => setQuote(event.target.value)}
            />

            <div>
              <label
                htmlFor="entry-tag-draft"
                className="mb-2 block font-mono text-caption uppercase text-text-muted"
              >
                {t.entries.field.tags}
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
                id="entry-tag-draft"
                value={tagDraft}
                onChange={(event) => setTagDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    commitTag(tagDraft)
                  }
                }}
                placeholder={t.entries.field.tagPlaceholder}
              />
              {tagSuggestions.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {tagSuggestions.map((tag) => (
                    <TagChip key={tag} onClick={() => commitTag(tag)}>
                      {tag}
                    </TagChip>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {errors.save && <p className="mt-5 text-field-error text-danger">{errors.save}</p>}

      <div className="mt-6.5">
        <Button type="submit" fullWidth disabled={saving}>
          {t.entries.save}
        </Button>
      </div>

      <BottomSheet
        open={bookSheetOpen}
        onClose={() => setBookSheetOpen(false)}
        title={t.entries.bookSheet}
      >
        <ul className="pb-2">
          {books.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => {
                  setBookId(option.id)
                  setBookSheetOpen(false)
                }}
                className={cx(
                  'flex min-h-touch w-full items-center border-b border-border py-2 text-left font-serif text-entry',
                  option.id === bookId ? 'text-accent' : 'text-text-primary',
                )}
              >
                {option.title}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => {
                setBookId(null)
                setBookSheetOpen(false)
              }}
              className="flex min-h-touch w-full items-center py-2 text-left text-body text-text-muted"
            >
              {t.entries.noBook}
            </button>
          </li>
        </ul>
      </BottomSheet>
    </form>
  )
}

/** One link of the chain: mono index, quiet title, then the field itself. */
function ChainField({
  index,
  title,
  accent = false,
  error,
  children,
}: {
  index: string
  title: string
  accent?: boolean
  error?: string
  children: ReactNode
}) {
  return (
    <section className="mt-7 flex gap-4">
      <span
        className={cx(
          'shrink-0 pt-1 font-mono text-caption',
          accent ? 'text-accent' : 'text-text-muted',
        )}
      >
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="mb-2 text-body text-text-muted">{title}</h2>
        {children}
        {error && <p className="mt-1.5 text-field-error text-danger">{error}</p>}
      </div>
    </section>
  )
}

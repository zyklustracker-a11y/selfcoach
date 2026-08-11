import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { BottomSheet, Button, TagChip } from '@/components'
import { useAuth } from '@/features/auth'
import { EntryRow, useEntriesForBook } from '@/features/entries'
import { TodoItem, useTodos } from '@/features/todos'
import { deleteBook, setActiveBook } from '@/lib/firestore/books'
import { t } from '@/lib/strings'
import type { Timestamp } from 'firebase/firestore'

import { useBook } from './BooksProvider'

const DATE_FORMAT = new Intl.DateTimeFormat('de-DE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function formatDate(value: Timestamp | null): string | null {
  return value ? DATE_FORMAT.format(value.toDate()) : null
}

export function BookDetailScreen() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const book = useBook(bookId)
  const entries = useEntriesForBook(bookId)
  const { todos } = useTodos()
  const bookTodos = todos.filter((todo) => todo.bookId === bookId)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!book) {
    return <p className="px-6.5 text-body text-text-muted">{t.books.error.notFound}</p>
  }

  const startedAt = formatDate(book.startedAt)
  const finishedAt = formatDate(book.finishedAt)

  async function onDelete() {
    if (!user || !book) return
    setBusy(true)
    await deleteBook(user.uid, book.id)
    navigate('/books', { replace: true })
  }

  return (
    <div className="px-6.5">
      <p className="font-mono text-caption uppercase text-text-muted">
        {t.books.status[book.status]}
      </p>
      <h1 className="mt-2 font-serif text-screen-title text-text-primary">{book.title}</h1>
      <p className="mt-1.5 text-body text-text-secondary">{book.author || t.books.noAuthor}</p>

      {book.isActive && (
        <p className="mt-3.5 font-mono text-caption uppercase text-accent">{t.books.active}</p>
      )}

      {book.coverUrl && (
        <img
          src={book.coverUrl}
          alt=""
          className="mt-6.5 h-auto w-32 rounded-md border border-border"
          loading="lazy"
        />
      )}

      {book.tags.length > 0 && (
        <div className="mt-6.5 flex flex-wrap gap-2">
          {book.tags.map((tag) => (
            <TagChip key={tag}>{tag}</TagChip>
          ))}
        </div>
      )}

      <dl className="mt-6.5 border-t border-border pt-6.5">
        {startedAt && (
          <Row label={t.books.startedAt} value={startedAt} />
        )}
        {finishedAt && <Row label={t.books.finishedAt} value={finishedAt} />}
        {book.isbn && <Row label={t.books.field.isbn} value={book.isbn} />}
      </dl>

      <section className="mt-[30px] border-t border-border pt-[30px]">
        <h2 className="font-mono text-section uppercase text-text-muted">{t.entries.forBook}</h2>
        {entries.length === 0 ? (
          <p className="mt-2 text-body text-text-muted">{t.entries.emptyForBook}</p>
        ) : (
          <ul className="mt-2">
            {entries.map((entry) => (
              <li key={entry.id}>
                <EntryRow entry={entry} showMeta={false} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {bookTodos.length > 0 && (
        <section className="mt-[30px] border-t border-border pt-[30px]">
          <h2 className="font-mono text-section uppercase text-text-muted">
            {t.entries.todosForBook}
          </h2>
          <ul className="mt-2">
            {bookTodos.map((todo) => (
              <li key={todo.id}>
                <TodoItem todo={todo} checkable={todo.kind !== 'principle'} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-[30px] space-y-3 border-t border-border pt-[30px]">
        {book.status === 'finished' &&
          (book.summaryEntryId ? (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate(`/entries/${book.summaryEntryId}`)}
            >
              {t.entries.summaryExists}
            </Button>
          ) : (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate(`/entries/new?summaryFor=${book.id}`)}
            >
              {t.entries.writeSummary}
            </Button>
          ))}

        {book.status === 'reading' && !book.isActive && (
          <Button
            variant="secondary"
            fullWidth
            disabled={busy}
            onClick={() => {
              if (user) void setActiveBook(user.uid, book.id)
            }}
          >
            {t.books.setActive}
          </Button>
        )}
        {book.isActive && <p className="text-body text-text-muted">{t.books.activeHint}</p>}

        <Button variant="secondary" fullWidth onClick={() => navigate(`/books/${book.id}/edit`)}>
          {t.action.edit}
        </Button>

        <Button variant="ghost" destructive fullWidth onClick={() => setConfirmOpen(true)}>
          {t.books.delete.action}
        </Button>
      </div>

      <BottomSheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t.books.delete.title}
      >
        <div className="space-y-5 pb-2">
          <p className="text-body text-text-secondary">{t.books.delete.body}</p>
          <Button variant="secondary" fullWidth onClick={() => setConfirmOpen(false)}>
            {t.books.delete.cancel}
          </Button>
          <Button variant="ghost" destructive fullWidth disabled={busy} onClick={() => void onDelete()}>
            {t.books.delete.confirm}
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border py-2">
      <dt className="text-body text-text-muted">{label}</dt>
      <dd className="font-mono text-caption text-text-secondary">{value}</dd>
    </div>
  )
}

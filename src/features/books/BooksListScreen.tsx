import { useNavigate } from 'react-router-dom'

import { Fab } from '@/components'
import { t } from '@/lib/strings'
import { BOOK_STATUSES, type BookStatus, type BookWithId } from '@/types'

import { useBooks } from './BooksProvider'

export function BooksListScreen() {
  const navigate = useNavigate()
  const { books, loading, error } = useBooks()

  const grouped = BOOK_STATUSES.map((status) => ({
    status,
    books: books.filter((book) => book.status === status),
  })).filter((group) => group.books.length > 0)

  return (
    <div className="px-6.5" style={{ paddingBottom: 'calc(130px + env(safe-area-inset-bottom))' }}>
      <h1 className="font-serif text-screen-title text-text-primary">{t.books.title}</h1>
      {books.length > 0 && (
        <p className="mt-2 font-mono text-caption uppercase text-text-muted">
          {t.books.count(books.length)}
        </p>
      )}

      {error && <p className="mt-6.5 text-body text-danger">{t.books.error.load}</p>}

      {!loading && !error && books.length === 0 && (
        <p className="mt-6.5 text-body text-text-muted">{t.books.empty}</p>
      )}

      {grouped.map((group) => (
        <section key={group.status} className="mt-[30px] border-t border-border pt-[30px]">
          <h2 className="font-mono text-section uppercase text-text-muted">
            {t.books.status[group.status]}
          </h2>
          <ul className="mt-2">
            {group.books.map((book) => (
              <li key={book.id}>
                <BookRow book={book} onOpen={() => navigate(`/books/${book.id}`)} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <Fab label={t.books.add} onClick={() => navigate('/books/new')} />
    </div>
  )
}

function BookRow({ book, onOpen }: { book: BookWithId; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex min-h-touch w-full flex-col items-start border-b border-border py-2.5 text-left active:bg-bg-hover"
    >
      {book.isActive && (
        <span className="font-mono text-caption uppercase text-accent">{t.books.active}</span>
      )}
      <span className="font-serif text-entry text-text-primary">{book.title}</span>
      <span className="text-body text-text-muted">{book.author || t.books.noAuthor}</span>
    </button>
  )
}

export type { BookStatus }

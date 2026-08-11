import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { useAuth } from '@/features/auth'
import { subscribeToBooks } from '@/lib/firestore/books'
import type { BookWithId } from '@/types'

interface BooksContextValue {
  books: BookWithId[]
  loading: boolean
  error: string | null
  activeBook: BookWithId | null
}

const BooksContext = createContext<BooksContextValue | null>(null)

/**
 * One snapshot listener for the whole app. The collection is small enough to keep
 * in memory, and every screen that needs a book reads it from here instead of
 * opening its own listener.
 */
export function BooksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [books, setBooks] = useState<BookWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setBooks([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToBooks(
      user.uid,
      (next) => {
        setBooks(next)
        setError(null)
        setLoading(false)
      },
      (cause) => {
        setError(cause.message)
        setLoading(false)
      },
    )
    return unsubscribe
  }, [user])

  const value = useMemo<BooksContextValue>(
    () => ({
      books,
      loading,
      error,
      activeBook: books.find((book) => book.isActive) ?? null,
    }),
    [books, loading, error],
  )

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>
}

export function useBooks(): BooksContextValue {
  const value = useContext(BooksContext)
  if (!value) throw new Error('useBooks must be used inside <BooksProvider>')
  return value
}

export function useBook(bookId: string | undefined): BookWithId | null {
  const { books } = useBooks()
  return books.find((book) => book.id === bookId) ?? null
}

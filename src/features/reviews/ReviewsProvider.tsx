import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { useAuth } from '@/features/auth'
import { weekKey } from '@/lib/dates'
import { subscribeToReviews } from '@/lib/firestore/reviews'
import type { ReviewWithId } from '@/types'

interface ReviewsContextValue {
  /** Finished reviews, newest week first. */
  reviews: ReviewWithId[]
  /** This week's review, finished or still in progress. */
  current: ReviewWithId | null
  loading: boolean
  error: string | null
}

const ReviewsContext = createContext<ReviewsContextValue | null>(null)

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [all, setAll] = useState<ReviewWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setAll([])
      setLoading(false)
      return
    }
    setLoading(true)
    return subscribeToReviews(
      user.uid,
      (next) => {
        setAll(next)
        setError(null)
        setLoading(false)
      },
      (cause) => {
        setError(cause.message)
        setLoading(false)
      },
    )
  }, [user])

  const value = useMemo<ReviewsContextValue>(() => {
    const key = weekKey()
    return {
      // The archive shows finished reviews only; an unfinished one is a draft.
      reviews: all.filter((review) => review.completedAt !== null),
      current: all.find((review) => review.weekKey === key) ?? null,
      loading,
      error,
    }
  }, [all, loading, error])

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>
}

export function useReviews(): ReviewsContextValue {
  const value = useContext(ReviewsContext)
  if (!value) throw new Error('useReviews must be used inside <ReviewsProvider>')
  return value
}

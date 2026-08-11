import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { useAuth } from '@/features/auth'
import { dayKey } from '@/lib/dates'
import { subscribeToTodos } from '@/lib/firestore/todos'
import type { TodoWithId } from '@/types'

interface TodosContextValue {
  todos: TodoWithId[]
  loading: boolean
  error: string | null
  /**
   * Everything due today, ticked off or not. A task that vanishes the moment it
   * is checked gives no feedback — and the struck-through state DESIGN.md
   * describes would never be seen.
   */
  today: TodoWithId[]
  /** Open dailies from earlier days, waiting for a decision. */
  overdue: TodoWithId[]
  /** Every open daily, today's and older. */
  open: TodoWithId[]
  principles: TodoWithId[]
  done: TodoWithId[]
}

const TodosContext = createContext<TodosContextValue | null>(null)

export function TodosProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [todos, setTodos] = useState<TodoWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setTodos([])
      setLoading(false)
      return
    }
    setLoading(true)
    return subscribeToTodos(
      user.uid,
      (next) => {
        setTodos(next)
        setError(null)
        setLoading(false)
      },
      (cause) => {
        setError(cause.message)
        setLoading(false)
      },
    )
  }, [user])

  const value = useMemo<TodosContextValue>(() => {
    const key = dayKey()
    const dailies = todos.filter((todo) => todo.kind === 'daily')
    const openDailies = dailies.filter((todo) => todo.status === 'open')
    return {
      todos,
      loading,
      error,
      today: dailies.filter((todo) => todo.dueDate === key && todo.status !== 'dropped'),
      overdue: openDailies.filter((todo) => todo.dueDate !== null && todo.dueDate < key),
      open: openDailies,
      principles: todos.filter((todo) => todo.kind === 'principle' && todo.status === 'open'),
      done: todos.filter((todo) => todo.status === 'done'),
    }
  }, [todos, loading, error])

  return <TodosContext.Provider value={value}>{children}</TodosContext.Provider>
}

export function useTodos(): TodosContextValue {
  const value = useContext(TodosContext)
  if (!value) throw new Error('useTodos must be used inside <TodosProvider>')
  return value
}

export function useTodosForEntry(entryId: string | undefined): TodoWithId[] {
  const { todos } = useTodos()
  return entryId ? todos.filter((todo) => todo.sourceEntryId === entryId) : []
}

import { useState } from 'react'

import { Button } from '@/components'
import { useAuth } from '@/features/auth'
import { dropTodo, postponeTodo } from '@/lib/firestore/todos'
import { cx } from '@/lib/cx'
import { t } from '@/lib/strings'
import type { TodoWithId } from '@/types'

import { TodoItem } from './TodoItem'
import { useTodos } from './TodosProvider'

type View = 'today' | 'open' | 'principles' | 'done'

const VIEWS: { key: View; label: string }[] = [
  { key: 'today', label: t.todos.view.today },
  { key: 'open', label: t.todos.view.open },
  { key: 'principles', label: t.todos.view.principles },
  { key: 'done', label: t.todos.view.done },
]

/** Concept 7.2, screen 9: the four sub-views live inside the To-dos tab. */
export function TodosScreen() {
  const [view, setView] = useState<View>('today')
  const { today, overdue, open, principles, done } = useTodos()

  const lists: Record<View, TodoWithId[]> = { today, open, principles, done }
  const empty: Record<View, string> = {
    today: t.todos.empty.today,
    open: t.todos.empty.open,
    principles: t.todos.empty.principles,
    done: t.todos.empty.done,
  }
  const list = lists[view]

  return (
    <div className="px-6.5" style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom))' }}>
      <h1 className="font-serif text-screen-title text-text-primary">{t.nav.todos}</h1>

      <div className="mt-5 flex flex-wrap gap-2">
        {VIEWS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setView(item.key)}
            aria-pressed={view === item.key}
            className={cx(
              "relative inline-flex min-h-[34px] items-center rounded-full border border-border-strong px-2.5 text-chip-filter",
              "before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-['']",
              view === item.key
                ? 'bg-bg-hover text-text-primary'
                : 'bg-transparent text-text-secondary',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {view === 'today' && overdue.length > 0 && <CarriedOver todos={overdue} />}

      <section className="mt-[30px] border-t border-border pt-[30px]">
        {list.length === 0 ? (
          <p className="text-body text-text-muted">{empty[view]}</p>
        ) : (
          <ul>
            {list.map((todo) => (
              <li key={todo.id}>
                {/* A principle is never ticked off — it is reviewed (concept 6.4). */}
                <TodoItem todo={todo} checkable={todo.kind !== 'principle'} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

/**
 * Yesterday's unfinished tasks demand a decision instead of accumulating quietly.
 * Two options only: move it to today, or let it go.
 */
function CarriedOver({ todos }: { todos: TodoWithId[] }) {
  const { user } = useAuth()

  return (
    <section className="mt-[30px] border-t border-border pt-[30px]">
      <h2 className="font-mono text-section uppercase text-text-muted">{t.todos.carriedOver}</h2>
      <p className="mt-2 text-body text-text-muted">{t.todos.carriedOverHint}</p>
      <ul className="mt-2">
        {todos.map((todo) => (
          <li key={todo.id} className="border-b border-border py-2.5">
            <p className="font-serif text-entry text-text-primary">{todo.title}</p>
            <div className="mt-1 flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  if (user) void postponeTodo(user.uid, todo)
                }}
              >
                {t.todos.postpone}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  if (user) void dropTodo(user.uid, todo.id)
                }}
              >
                {t.todos.drop}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

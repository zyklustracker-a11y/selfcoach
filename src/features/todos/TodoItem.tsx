import { useNavigate } from 'react-router-dom'

import { Checkbox } from '@/components'
import { useAuth } from '@/features/auth'
import { useEntries } from '@/features/entries'
import { setTodoDone } from '@/lib/firestore/todos'
import { t } from '@/lib/strings'
import { entryHeadline, type TodoWithId } from '@/types'

/**
 * The back-reference is the point of the whole feature: from the task you can
 * always see why you took it on (concept 6.4). It is a link, not a footnote.
 */
export function TodoItem({
  todo,
  checkable = true,
}: {
  todo: TodoWithId
  checkable?: boolean
}) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { entries } = useEntries()
  const source = todo.sourceEntryId
    ? (entries.find((entry) => entry.id === todo.sourceEntryId) ?? null)
    : null

  return (
    <div className="border-b border-border py-1">
      {checkable ? (
        <Checkbox
          label={todo.title}
          checked={todo.status === 'done'}
          onChange={(event) => {
            if (user) void setTodoDone(user.uid, todo.id, event.target.checked)
          }}
        />
      ) : (
        <p className="min-h-touch py-2 font-serif text-entry text-text-primary">{todo.title}</p>
      )}

      {todo.notes && <p className="pb-1 text-body text-text-muted">{todo.notes}</p>}

      {source && (
        <button
          type="button"
          onClick={() => navigate(`/entries/${source.id}`)}
          className="mb-1 flex min-h-touch w-full items-start gap-2 text-left"
        >
          <span className="shrink-0 font-mono text-caption uppercase text-text-muted">
            {t.todos.from}
          </span>
          <span className="text-body text-text-secondary">{entryHeadline(source)}</span>
        </button>
      )}

      {todo.postponedCount > 0 && todo.status === 'open' && (
        <p className="pb-1 font-mono text-caption text-text-muted">
          {t.todos.postponed(todo.postponedCount)}
        </p>
      )}
    </div>
  )
}

import { useNavigate } from 'react-router-dom'

import { Fab } from '@/components'
import { useBooks } from '@/features/books'
import { EntryRow, useEntries } from '@/features/entries'
import { TodoItem, useTodos } from '@/features/todos'
import { t } from '@/lib/strings'

const TODAY = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

/**
 * The smallest useful version of concept 6.8: the active book, whether today has
 * an entry yet, and the way to write one. Flashback, streak and the weekly review
 * card join it in their own phases.
 */
export function TodayScreen() {
  const navigate = useNavigate()
  const { activeBook } = useBooks()
  const { today } = useEntries()
  const { today: todosToday } = useTodos()

  return (
    <div className="px-6.5" style={{ paddingBottom: 'calc(130px + env(safe-area-inset-bottom))' }}>
      <p className="font-mono text-caption uppercase text-text-muted">{TODAY.format(new Date())}</p>

      {activeBook && (
        <button
          type="button"
          onClick={() => navigate(`/books/${activeBook.id}`)}
          className="mt-3.5 block w-full text-left"
        >
          <span className="block font-serif text-screen-title text-text-primary">
            {activeBook.title}
          </span>
          {activeBook.author && (
            <span className="mt-1 block text-body text-text-muted">{activeBook.author}</span>
          )}
        </button>
      )}

      <div className="mt-[30px] border-t border-border pt-[30px]">
        {today.length === 0 ? (
          <>
            <p className="font-serif text-entry text-text-primary">{t.today.noEntry}</p>
            <p className="mt-1.5 text-body text-text-muted">{t.today.prompt}</p>
          </>
        ) : (
          <>
            <h2 className="font-mono text-section uppercase text-text-muted">
              {t.today.entriesToday}
            </h2>
            <ul className="mt-2">
              {today.map((entry) => (
                <li key={entry.id}>
                  <EntryRow entry={entry} showMeta={false} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {todosToday.length > 0 && (
        <section className="mt-[30px] border-t border-border pt-[30px]">
          <h2 className="font-mono text-section uppercase text-text-muted">{t.today.todos}</h2>
          <ul className="mt-2">
            {todosToday.map((todo) => (
              <li key={todo.id}>
                <TodoItem todo={todo} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <Fab label={t.today.newEntry} onClick={() => navigate('/entries/new')} />
    </div>
  )
}

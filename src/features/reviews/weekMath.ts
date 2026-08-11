import { dayKey, weekKey } from '@/lib/dates'
import type { EntryWithId, TodoWithId } from '@/types'

/** Monday of the ISO week the date belongs to. */
export function weekStart(date: Date = new Date()): Date {
  const monday = new Date(date)
  const weekday = monday.getDay() || 7 // Sunday counts as 7
  monday.setDate(monday.getDate() - (weekday - 1))
  monday.setHours(0, 0, 0, 0)
  return monday
}

export function weekEnd(date: Date = new Date()): Date {
  const sunday = weekStart(date)
  sunday.setDate(sunday.getDate() + 6)
  return sunday
}

/**
 * The review opens on Saturday and is advertised on Sunday (CLAUDE.md 7.1).
 * ISO weekday: 6 = Saturday, 7 = Sunday.
 */
export function isReviewOpen(date: Date = new Date()): boolean {
  const weekday = date.getDay() || 7
  return weekday >= 6
}

export function isSunday(date: Date = new Date()): boolean {
  return date.getDay() === 0
}

export interface WeekMaterial {
  weekKey: string
  weekStart: string
  weekEnd: string
  entries: EntryWithId[]
  todoDoneCount: number
  todoTotalCount: number
  openPrinciples: TodoWithId[]
  /** Most used tags of the week, for the pattern question. */
  topTags: { tag: string; count: number }[]
  /** Books the week's entries came from. */
  books: string[]
}

/**
 * Everything the review is prefilled with. A blank reflection form is
 * demotivating (concept 2.2), so the app brings the material and the user brings
 * the thinking — all of it plain arithmetic over data already loaded.
 */
export function collectWeekMaterial(
  entries: EntryWithId[],
  todos: TodoWithId[],
  now: Date = new Date(),
): WeekMaterial {
  const key = weekKey(now)
  const weekEntries = entries.filter((entry) => entry.weekKey === key)

  const start = weekStart(now)
  const end = weekEnd(now)
  const inWeek = (todo: TodoWithId) =>
    todo.dueDate !== null && todo.dueDate >= dayKey(start) && todo.dueDate <= dayKey(end)

  const weekTodos = todos.filter((todo) => todo.kind === 'daily' && inWeek(todo))

  const tagCounts = new Map<string, number>()
  for (const entry of weekEntries) {
    for (const tag of entry.tags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
  }

  return {
    weekKey: key,
    weekStart: dayKey(start),
    weekEnd: dayKey(end),
    entries: weekEntries,
    todoDoneCount: weekTodos.filter((todo) => todo.status === 'done').length,
    todoTotalCount: weekTodos.length,
    openPrinciples: todos.filter((todo) => todo.kind === 'principle' && todo.status === 'open'),
    topTags: [...tagCounts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    books: [...new Set(weekEntries.map((entry) => entry.bookTitle).filter(Boolean))] as string[],
  }
}

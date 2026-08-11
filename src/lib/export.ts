import type { BookWithId, EntryWithId, ReviewWithId, TodoWithId } from '@/types'

export interface ExportData {
  books: BookWithId[]
  entries: EntryWithId[]
  todos: TodoWithId[]
  reviews: ReviewWithId[]
}

const DATE = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })

function isoDate(value: { toDate: () => Date } | null | undefined): string | null {
  return value ? value.toDate().toISOString() : null
}

/** Firestore timestamps do not survive JSON.stringify, so they become ISO strings. */
export function toJson(data: ExportData): string {
  const replacer = (_key: string, value: unknown): unknown =>
    value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function'
      ? (value as { toDate: () => Date }).toDate().toISOString()
      : value

  return JSON.stringify(
    { exportedAt: new Date().toISOString(), version: 1, ...data },
    replacer,
    2,
  )
}

/**
 * Markdown is the readable copy — no lock-in (concept 5, M8). Grouped by book,
 * because that is how the material was gathered.
 */
export function toMarkdown(data: ExportData): string {
  const lines: string[] = ['# ReadCoach', '', `Export vom ${DATE.format(new Date())}`, '']

  const byBook = new Map<string, EntryWithId[]>()
  for (const entry of data.entries) {
    const key = entry.bookTitle ?? 'Ohne Buch'
    const list = byBook.get(key)
    if (list) list.push(entry)
    else byBook.set(key, [entry])
  }

  lines.push('## Einträge', '')
  for (const [book, entries] of byBook) {
    lines.push(`### ${book}`, '')
    for (const entry of entries) {
      const created = entry.createdAt?.toDate()
      const meta = [created ? DATE.format(created) : null, entry.page ? `S. ${entry.page}` : null]
        .filter(Boolean)
        .join(' · ')
      if (meta) lines.push(`**${meta}**`, '')

      if (entry.type === 'insight') {
        lines.push(`- **Gelernt:** ${entry.learning}`)
        lines.push(`- **Bedeutung:** ${entry.meaning}`)
        lines.push(`- **Handlung:** ${entry.action}`)
      } else {
        lines.push(`- **Fazit:** ${entry.summary}`)
        if (entry.meaning) lines.push(`- **Bedeutung:** ${entry.meaning}`)
        if (entry.action) lines.push(`- **Handlung:** ${entry.action}`)
      }
      if (entry.quote) lines.push('', `> ${entry.quote}`)
      if (entry.tags.length > 0) lines.push('', `Tags: ${entry.tags.join(', ')}`)
      lines.push('')
    }
  }

  if (data.todos.length > 0) {
    lines.push('## To-dos', '')
    for (const todo of data.todos) {
      const box = todo.status === 'done' ? '[x]' : todo.status === 'dropped' ? '[-]' : '[ ]'
      const kind = todo.kind === 'principle' ? ' _(Vorsatz)_' : ''
      lines.push(`- ${box} ${todo.title}${kind}`)
    }
    lines.push('')
  }

  if (data.reviews.length > 0) {
    lines.push('## Wochenreviews', '')
    for (const review of data.reviews) {
      lines.push(`### ${review.weekKey}`, '')
      review.questions.forEach((question, index) => {
        const answer = review.answers[index]?.trim()
        if (answer) lines.push(`**${question}**`, '', answer, '')
      })
    }
  }

  if (data.books.length > 0) {
    lines.push('## Bücher', '')
    for (const book of data.books) {
      const started = isoDate(book.startedAt)?.slice(0, 10)
      lines.push(
        `- **${book.title}**${book.author ? ` — ${book.author}` : ''} (${book.status}${started ? `, ab ${started}` : ''})`,
      )
    }
  }

  return lines.join('\n')
}

/**
 * iOS Safari cannot simply download a file. Where the share sheet accepts files
 * it is used; otherwise a normal download link, which covers the desktop case.
 */
export async function shareOrDownload(
  filename: string,
  content: string,
  mime: string,
): Promise<void> {
  const file = new File([content], filename, { type: mime })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename })
      return
    } catch {
      // Cancelled or unavailable — fall through to the download.
    }
  }

  const url = URL.createObjectURL(new Blob([content], { type: mime }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

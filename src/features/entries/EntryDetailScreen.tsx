import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { BottomSheet, Button, TagChip } from '@/components'
import { useAuth } from '@/features/auth'
import { deleteEntry } from '@/lib/firestore/entries'
import { t } from '@/lib/strings'

import { useEntry } from './EntriesProvider'

const DATE = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })

export function EntryDetailScreen() {
  const { entryId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const entry = useEntry(entryId)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!entry) {
    return <p className="px-6.5 text-body text-text-muted">{t.entries.error.notFound}</p>
  }

  const created = entry.createdAt?.toDate()

  async function onDelete() {
    if (!user || !entry) return
    setBusy(true)
    await deleteEntry(user.uid, entry.id)
    navigate(-1)
  }

  return (
    <div className="px-6.5" style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom))' }}>
      <p className="font-mono text-caption uppercase text-text-muted">
        {[created ? DATE.format(created) : null, entry.bookTitle, entry.page ? t.entries.page(entry.page) : null]
          .filter(Boolean)
          .join(' · ')}
      </p>

      {entry.type === 'insight' ? (
        <>
          <Block index="01" title={t.entries.field.learningTitle} text={entry.learning} />
          <Block index="02" title={t.entries.field.meaningTitle} text={entry.meaning} />
          <Block index="03" title={t.entries.field.actionTitle} text={entry.action} lead accent />
        </>
      ) : (
        <>
          <Block index="—" title={t.entries.field.summaryTitle} text={entry.summary} lead />
          {entry.meaning && <Block index="02" title={t.entries.field.meaningTitle} text={entry.meaning} />}
          {entry.action && <Block index="03" title={t.entries.field.actionTitle} text={entry.action} />}
        </>
      )}

      {entry.quote && (
        <blockquote className="mt-7 border-l border-border-strong pl-4 font-serif text-entry italic text-text-secondary">
          {entry.quote}
        </blockquote>
      )}

      {entry.tags.length > 0 && (
        <div className="mt-7 flex flex-wrap gap-2">
          {entry.tags.map((tag: string) => (
            <TagChip key={tag}>{tag}</TagChip>
          ))}
        </div>
      )}

      <div className="mt-[30px] space-y-3 border-t border-border pt-[30px]">
        <Button variant="secondary" fullWidth onClick={() => navigate(`/entries/${entry.id}/edit`)}>
          {t.action.edit}
        </Button>
        <Button variant="ghost" destructive fullWidth onClick={() => setConfirmOpen(true)}>
          {t.entries.delete.action}
        </Button>
      </div>

      <BottomSheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t.entries.delete.title}
      >
        <div className="space-y-5 pb-2">
          <p className="text-body text-text-secondary">{t.entries.delete.body}</p>
          <Button variant="secondary" fullWidth onClick={() => setConfirmOpen(false)}>
            {t.entries.delete.cancel}
          </Button>
          <Button variant="ghost" destructive fullWidth disabled={busy} onClick={() => void onDelete()}>
            {t.entries.delete.confirm}
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}

function Block({
  index,
  title,
  text,
  lead = false,
  accent = false,
}: {
  index: string
  title: string
  text: string
  lead?: boolean
  accent?: boolean
}) {
  return (
    <section className="mt-7 flex gap-4">
      <span
        className={`shrink-0 pt-1 font-mono text-caption ${accent ? 'text-accent' : 'text-text-muted'}`}
      >
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="mb-2 text-body text-text-muted">{title}</h2>
        <p className={`font-serif text-text-primary ${lead ? 'text-entry-lead' : 'text-entry'}`}>
          {text}
        </p>
      </div>
    </section>
  )
}

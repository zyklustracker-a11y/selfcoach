import { useState, type ReactNode } from 'react'

import {
  BottomSheet,
  Button,
  Card,
  Checkbox,
  Fab,
  Input,
  TabBar,
  TagChip,
  Textarea,
} from '@/components'
import { GearIcon } from '@/components/GearIcon'
import { t } from '@/lib/strings'

/**
 * Temporary route. It exists so the design system can be judged on a real iPhone
 * before any feature is built, and it goes away before the release (phase 8).
 */
export function StyleguideScreen() {
  const [checked, setChecked] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [tab, setTab] = useState('today')
  const [text, setText] = useState('Willenskraft ist eine begrenzte Ressource.')
  const [tagSelected, setTagSelected] = useState(false)

  return (
    <div className="app-shell relative mx-auto flex max-w-app flex-col overflow-hidden bg-bg-base">
      <header
        className="shrink-0 flex items-center justify-between px-6.5 pb-4"
        style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}
      >
        <div>
          <p className="font-mono text-caption uppercase text-text-muted">{t.app.name}</p>
          <h1 className="font-serif text-screen-title text-text-primary">{t.styleguide.title}</h1>
        </div>
        <button
          type="button"
          aria-label={t.nav.settings}
          className="-mr-1 flex h-11 w-11 items-center justify-center text-text-muted active:text-text-primary"
        >
          <GearIcon className="h-[22px] w-[22px]" />
        </button>
      </header>

      <main className="scroll-area flex-1 px-6.5 pb-24">
        <p className="text-body text-text-muted">{t.styleguide.subtitle}</p>

        <Section title="Farben">
          <div className="grid grid-cols-2 gap-2">
            {[
              ['bg-elevated', 'bg-bg-elevated'],
              ['bg-hover', 'bg-bg-hover'],
              ['accent', 'bg-accent'],
              ['accent-quiet', 'bg-accent-quiet'],
              ['border', 'bg-border'],
              ['border-strong', 'bg-border-strong'],
              ['success', 'bg-success'],
              ['danger', 'bg-danger'],
            ].map(([name, klass]) => (
              <div key={name} className="flex items-center gap-2.5">
                <span className={`h-7 w-7 shrink-0 rounded-sm border border-border ${klass}`} />
                <span className="font-mono text-caption text-text-muted">{name}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Typografie">
          <div className="space-y-3">
            <p className="font-serif text-screen-title text-text-primary">Screen-Titel, Serif 30</p>
            <p className="font-sans text-screen-title-sm text-text-primary">Screen-Titel klein, Sans 22</p>
            <p className="font-serif text-entry-lead text-text-primary">
              Feld 03, Serif 23 — was ich anders mache
            </p>
            <p className="font-serif text-entry text-text-primary">
              Eintragstext, Serif 18. Alles, was der Nutzer selbst geschrieben hat.
            </p>
            <p className="font-serif text-entry italic text-text-secondary">
              „Kursiv ist Zitat und Rückblick, nie Betonung."
            </p>
            <p className="font-sans text-body text-text-secondary">
              Fließtext, Sans 15. Alles, was die App sagt oder anbietet.
            </p>
            <p className="font-mono text-caption text-text-muted">CAPTION · MONO 11 · S. 142</p>
          </div>
        </Section>

        <Section title="Button">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primary</Button>
              <Button disabled>Primary disabled</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary">To-do daraus erstellen</Button>
              <Button variant="secondary" disabled>
                Secondary disabled
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="ghost">Abbrechen</Button>
              <Button variant="ghost" destructive>
                Löschen
              </Button>
              <Button variant="ghost" disabled>
                Später
              </Button>
            </div>
            <Button fullWidth>Eintrag speichern</Button>
          </div>
        </Section>

        <Section title="Input">
          <div className="space-y-4">
            <Input label="Titel" placeholder="Die 1%-Methode" />
            <Input search placeholder="Einträge durchsuchen" />
            <Input label="Seite" defaultValue="142" error="Bitte eine Zahl eingeben." />
            <Input label="Gesperrt" placeholder="Nicht bearbeitbar" disabled />
          </div>
        </Section>

        <Section title="Textarea">
          <div className="space-y-4">
            <Textarea
              label="01 Gelernt"
              value={text}
              onChange={(event) => setText(event.target.value)}
              showCount
            />
            <Textarea label="Randlos, im Eintragsformular" bare placeholder="Was bedeutet das für mich?" />
            <Textarea label="Reviewantwort" size="review" placeholder="Ein Satz." />
            <Textarea label="Mit Fehler" error="Dieses Feld ist eine Pflichtangabe." />
            <Textarea label="Gesperrt" disabled placeholder="Nicht bearbeitbar" />
          </div>
        </Section>

        <Section title="Card">
          <div className="space-y-3">
            <Card>
              <p className="font-serif text-entry text-text-primary">
                Eine Karte trägt nur, was aus dem Lesefluss fällt.
              </p>
            </Card>
            <Card variant="pending">
              <p className="text-body text-text-muted">Leer oder ausstehend.</p>
            </Card>
            <Card interactive>
              <p className="text-body text-text-secondary">Antippbar — gedrückt wird die Fläche dunkler.</p>
            </Card>
          </div>
        </Section>

        <Section title="Checkbox">
          <div>
            <Checkbox
              label="Kalender-Slot Di 9:00 für Entscheidungen"
              checked={checked}
              onChange={(event) => setChecked(event.target.checked)}
            />
            <Checkbox label="Handy ab 21:00 in die Küche legen" checked={false} readOnly />
            <Checkbox label="Pflichtfeld, nicht bestätigt" checked={false} invalid readOnly />
            <Checkbox label="Gesperrt" checked={false} disabled readOnly />
          </div>
        </Section>

        <Section title="Tag-Chip">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <TagChip>Fokus</TagChip>
              <TagChip selected>Routine</TagChip>
              <TagChip onRemove={() => undefined}>Entfernbar</TagChip>
              <TagChip disabled>Gesperrt</TagChip>
            </div>
            <div className="flex flex-wrap gap-2">
              <TagChip filter onClick={() => setTagSelected(!tagSelected)} selected={tagSelected}>
                Buch
              </TagChip>
              <TagChip filter>Tag</TagChip>
              <TagChip filter>Zeitraum</TagChip>
            </div>
          </div>
        </Section>

        <Section title="Bottom-Sheet">
          <Button variant="secondary" onClick={() => setSheetOpen(true)}>
            Sheet öffnen
          </Button>
        </Section>

        <Section title="Zustandsfarben">
          <div className="space-y-2">
            <p className="text-body text-success">Gespeichert — success erscheint nur als Text.</p>
            <p className="text-body text-danger">Fehler — danger nie als Vollfläche.</p>
            <p className="text-body text-text-muted">
              Heute noch kein Eintrag. Fehlendes wird gemeldet, nicht getadelt.
            </p>
          </div>
        </Section>
      </main>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Tags">
        <div className="space-y-4 pb-2">
          <Input search placeholder="Tag suchen" />
          <div className="flex flex-wrap gap-2">
            <TagChip>Fokus</TagChip>
            <TagChip selected>Routine</TagChip>
            <TagChip>Entscheidungen</TagChip>
          </div>
          <Button fullWidth onClick={() => setSheetOpen(false)}>
            Übernehmen
          </Button>
        </div>
      </BottomSheet>

      <Fab label="Neuer Eintrag" onClick={() => setSheetOpen(true)} />

      <TabBar
        activeKey={tab}
        onSelect={setTab}
        items={[
          { key: 'today', label: t.nav.today },
          { key: 'books', label: t.nav.books },
          { key: 'archive', label: t.nav.archive },
          { key: 'todos', label: t.nav.todos },
        ]}
      />
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-[30px] border-t border-border pt-[30px]">
      <h2 className="mb-2 font-mono text-section uppercase text-text-muted">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  )
}

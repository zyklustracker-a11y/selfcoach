/**
 * Every user-facing string in the app. German is the only shipped locale, but all
 * texts live here so an English file can be added next to it without touching
 * components (CLAUDE.md section 3).
 *
 * Keys are English, values are German.
 */
export const de = {
  app: {
    name: 'ReadCoach',
    tagline: 'Aus gelesenen Seiten gelebte Veränderung.',
  },
  nav: {
    today: 'Heute',
    books: 'Bücher',
    archive: 'Archiv',
    todos: 'To-dos',
    settings: 'Einstellungen',
  },
  action: {
    save: 'Speichern',
    cancel: 'Abbrechen',
    back: 'Zurück',
    next: 'Weiter',
    done: 'Fertig',
    later: 'Später',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    add: 'Hinzufügen',
    remove: 'Entfernen',
  },
  styleguide: {
    title: 'Styleguide',
    subtitle: 'Alle Bausteine in allen Zuständen. Temporär, verschwindet vor dem Release.',
  },
} as const

export type Strings = typeof de

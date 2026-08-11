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
  configError: {
    title: 'Konfiguration unvollständig',
    body: 'Die App kann ohne gültige Firebase-Zugangsdaten nicht starten. Prüfe `.env.local` und baue neu.',
  },
  auth: {
    claim: 'Aus gelesenen Seiten gelebte Veränderung.',
    intro:
      'Jede Erkenntnis wird zu einer Handlung — und die wird überprüft. Deine Einträge bleiben in deinem eigenen Konto.',
    signIn: 'Mit Google anmelden',
    signOut: 'Abmelden',
    checking: 'Einen Moment.',
    signingIn: 'Anmeldung läuft.',
    error: {
      generic: 'Die Anmeldung hat nicht geklappt. Bitte versuch es noch einmal.',
      network: 'Keine Verbindung. Die Anmeldung braucht einmal Netz.',
      cancelled: 'Anmeldung abgebrochen.',
      unauthorizedDomain:
        'Diese Adresse ist in Firebase nicht als autorisierte Domain eingetragen.',
    },
  },
  books: {
    title: 'Bücher',
    count: (n: number) => (n === 1 ? '1 BUCH' : `${n} BÜCHER`),
    empty: 'Noch kein Buch angelegt. Fang mit dem an, das gerade neben dir liegt.',
    emptyGroup: 'Nichts hier.',
    active: 'Aktiv',
    activeHint: 'Neue Einträge werden diesem Buch zugeordnet.',
    setActive: 'Als aktives Buch setzen',
    add: 'Buch hinzufügen',
    newTitle: 'Neues Buch',
    editTitle: 'Buch bearbeiten',
    noAuthor: 'Ohne Autor',
    status: {
      reading: 'Lese ich',
      planned: 'Geplant',
      finished: 'Beendet',
      abandoned: 'Abgebrochen',
    },
    field: {
      title: 'Titel',
      titlePlaceholder: 'Die 1%-Methode',
      author: 'Autor',
      authorPlaceholder: 'James Clear',
      status: 'Status',
      coverUrl: 'Cover-URL',
      coverUrlPlaceholder: 'https://…',
      coverUrlHint: 'Nur verlinkt, nichts wird hochgeladen.',
      isbn: 'ISBN',
      tags: 'Themen-Tags',
      tagPlaceholder: 'Tag hinzufügen',
    },
    error: {
      titleRequired: 'Ohne Titel geht es nicht.',
      coverUrl: 'Das muss eine vollständige Adresse sein, die mit https:// beginnt.',
      save: 'Speichern hat nicht geklappt.',
      load: 'Die Bücher konnten nicht geladen werden.',
      notFound: 'Dieses Buch gibt es nicht mehr.',
    },
    delete: {
      action: 'Buch löschen',
      title: 'Buch löschen?',
      body: 'Das Buch verschwindet dauerhaft. Einträge, die daran hängen, bleiben erhalten.',
      confirm: 'Endgültig löschen',
      cancel: 'Behalten',
    },
    startedAt: 'Begonnen',
    finishedAt: 'Beendet am',
  },
  account: {
    title: 'Konto',
    note: 'Der Einstellungen-Screen kommt in Phase 8. Bis dahin steht hier nur die Abmeldung.',
  },
  comingSoon: {
    today: 'Der Heute-Screen entsteht mit den kommenden Phasen.',
    archive: 'Das Archiv kommt in Phase 6.',
    todos: 'Die To-dos kommen in Phase 5.',
  },
  review: {
    // The five guiding questions from concept 6.5. Question 6 was dropped with the
    // 0-3 rating scale. Seeded into settings.reviewQuestions and editable later.
    defaultQuestions: [
      'Welche 3 Erkenntnisse dieser Woche waren die stärksten?',
      'Was habe ich davon tatsächlich umgesetzt?',
      'Wo habe ich es mir vorgenommen und nicht getan — und woran lag es ehrlich?',
      'Welches Muster erkenne ich über die Woche hinweg?',
      'Was ist mein einer Fokus für die kommende Woche?',
    ],
  },
  styleguide: {
    title: 'Styleguide',
    subtitle: 'Alle Bausteine in allen Zuständen. Temporär, verschwindet vor dem Release.',
  },
} as const

export type Strings = typeof de

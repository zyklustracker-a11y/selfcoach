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
  entries: {
    newTitle: 'Neuer Eintrag',
    editTitle: 'Eintrag bearbeiten',
    summaryTitle: 'Buchfazit',
    save: 'Eintrag speichern',
    noBook: 'Ohne Buch',
    chooseBook: 'Buch wählen',
    bookSheet: 'Buch',
    // The chain. Numbers are part of the design, not decoration (DESIGN.md rule 2).
    field: {
      learningLabel: '01',
      learningTitle: 'Gelernt',
      learningPlaceholder: 'Was habe ich gelernt?',
      meaningLabel: '02',
      meaningTitle: 'Bedeutung für mich',
      meaningPlaceholder: 'Was heißt das für mich konkret?',
      actionLabel: '03',
      actionTitle: 'Was ich anders mache',
      actionPlaceholder: 'Was mache ich ab wann anders?',
      summaryTitle: 'Die drei Dinge, die bleiben',
      summaryPlaceholder: 'Was nehme ich aus diesem Buch mit?',
      page: 'Seitenzahl',
      quote: 'Wörtliches Zitat',
      tags: 'Tags',
      tagPlaceholder: 'Tag hinzufügen',
    },
    more: 'Zusatzfelder',
    moreOpen: 'Zusatzfelder ausblenden',
    error: {
      learning: 'Ohne die Erkenntnis fehlt der Anfang der Kette.',
      meaning: 'Ohne die Bedeutung bleibt es fremdes Wissen.',
      action: 'Ohne Handlung ist der Eintrag unvollständig.',
      summary: 'Das Fazit braucht mindestens einen Satz.',
      page: 'Bitte eine Zahl eingeben.',
      save: 'Speichern hat nicht geklappt.',
      notFound: 'Diesen Eintrag gibt es nicht mehr.',
    },
    draft: {
      restored: 'Angefangener Eintrag wiederhergestellt.',
      discard: 'Entwurf verwerfen',
    },
    delete: {
      action: 'Eintrag löschen',
      title: 'Eintrag löschen?',
      body: 'Der Eintrag verschwindet dauerhaft.',
      confirm: 'Endgültig löschen',
      cancel: 'Behalten',
    },
    page: (n: number) => `S. ${n}`,
    emptyForBook: 'Zu diesem Buch gibt es noch keinen Eintrag.',
    forBook: 'Einträge',
    writeSummary: 'Fazit schreiben',
    summaryExists: 'Fazit ansehen',
  },
  today: {
    noEntry: 'Heute noch kein Eintrag.',
    prompt: 'Drei Fragen, unter 90 Sekunden.',
    entriesToday: 'Heute festgehalten',
    newEntry: 'Neuer Eintrag',
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

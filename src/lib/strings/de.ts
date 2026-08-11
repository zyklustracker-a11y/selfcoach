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
  // Temporary screen for phase 2. The Heute screen replaces it in phase 3.
  signedIn: {
    label: 'Angemeldet',
    note: 'Der Heute-Screen kommt in der nächsten Phase. Bis dahin zeigt diese Seite nur, dass Anmeldung und Nutzerdokument funktionieren.',
    profileCreated: 'Nutzerdokument angelegt.',
    profilePending: 'Nutzerdokument noch nicht gelesen — vermutlich offline.',
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

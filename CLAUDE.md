# CLAUDE.md — Selbstcoaching-PWA

Diese Datei ist verbindlich für die gesamte Projektlaufzeit.
**Zu Beginn jeder Sitzung lesen: diese Datei, danach das Produktkonzept und `DESIGN.md`.**

---

## 0. Sitzungsstart

1. `CLAUDE.md` lesen.
2. Produktkonzept lesen (siehe § 1) und `DESIGN.md` lesen.
3. Den Phasenstatus in § 8 prüfen und dem Nutzer sagen, welche Phasen fertig sind.
4. Auf den Auftrag warten. Nicht ungefragt weiterbauen.

---

## 1. Verbindliche Quellen

| Quelle | Rolle |
|---|---|
| `docs/Produktkonzept.md` | Fachliche Grundlage: Features, Datenmodell, Screens, Rules (V2.0, ohne KI) |
| `DESIGN.md` | Designsprache: Farben, Typografie, Spacing, Komponenten |
| `docs/design/` | Visuelle Referenz der Screens (Richtung 1a „Die Seite") |

Zuständigkeit bei Widerspruch:
- **Was** gebaut wird und **wie es sich verhält** → Produktkonzept.
- **Wie es aussieht** → `DESIGN.md`. Die Spezifikation ist konkreter als Kapitel 7.3 und gewinnt
  bei rein visuellen Fragen (z. B. Tab-Bar ohne Icons statt der Emoji-Skizze in Kapitel 7.1).
- Widersprüche in der **Sache** werden **gefragt, nicht entschieden.**

Aus `DESIGN.md` werden keine Werte abgeleitet, geraten oder gerundet. Farben, Größen,
Abstände, Radien und Zustände werden exakt so übernommen, wie sie dort stehen.

---

## 2. Architektur — harte Regeln

- **Kein Servercode.** Keine Cloud Functions, keine Worker, kein eigenes Backend. Alles im Client.
- **Keine KI-Integration und keine externen APIs außer Firebase.** Erscheint eine Aufgabe nur mit
  einem externen Dienst lösbar: nachfragen, nicht einbauen.
- **Firebase nur mit Spark-Plan-Features:** Auth, Firestore, Hosting.
  **Kein Cloud Storage** — Buchcover ausschließlich als externe URL referenzieren, nie hochladen.
- **Das Projekt darf zu keinem Zeitpunkt Kosten verursachen.**

---

## 3. Code

- React 18 + TypeScript (`strict: true`) + Vite + Tailwind CSS.
- State über **Zustand oder React Context**. Kein Redux.
- **Alle Firestore-Zugriffe** laufen über typisierte Repository-Funktionen in
  `src/lib/firestore/`. Keine direkten Firestore-Aufrufe in Komponenten.
- **Alle Datentypen** liegen in `src/types/` und entsprechen exakt dem Datenmodell aus
  Kapitel 9 des Konzepts.
- **Projektstruktur** nach Kapitel 8.4 des Konzepts.
- **Code und Kommentare auf Englisch, die gesamte Benutzeroberfläche auf Deutsch.**
  UI-Texte zentral in einer Datei sammeln, damit später Englisch ergänzt werden kann.
- **Keine Mock- oder Platzhalterdaten im Produktionscode.** Testdaten nur klar getrennt
  und eindeutig benannt.
- Firebase-Config kommt aus `.env.local` über `import.meta.env`.
  `.env.local` steht in `.gitignore` und wird nie committet.

---

## 4. Arbeitsweise

- **Nach jeder Phase wird gestoppt.** Zusammenfassen: was gebaut wurde, was auf dem iPhone
  zu testen ist, was bewusst offengeblieben ist. Dann auf das Go warten.
- **`npm run build` muss am Ende jeder Phase fehlerfrei durchlaufen.** Sonst ist die Phase
  nicht fertig.
- **Nichts bauen, was für die aktuelle Phase nicht gebraucht wird.** V2- und V3-Features aus
  Kapitel 5 sind tabu, bis sie ausdrücklich beauftragt werden.
- **Technisch problematische Anforderungen werden gemeldet, nicht still umgangen.**
  Keine stille Ersatzlösung, kein stiller Verzicht.

---

## 5. iOS-PWA-Checkliste (Kapitel 11)

Diese Punkte werden **in der Phase mitgebaut, in der sie anfallen** — nie am Ende nachgeschoben.

- Login über `signInWithRedirect` mit `getRedirectResult`, **niemals `signInWithPopup`**
  (Safari blockiert Popups im Standalone-Modus).
- `viewport-fit=cover` und `env(safe-area-inset-*)` für Kopfzeile und Tab-Bar.
- **Eingabefelder mindestens 16 px Schriftgröße** (sonst zoomt Safari beim Fokus).
- Manifest mit `display: "standalone"`, Icons 192/512, separates Apple-Touch-Icon,
  Startup-Images gegen den weißen Blitz beim Start.
- Overscroll/Bounce in der App-Shell unterbinden.
- **Keine Logik, die auf Background Sync angewiesen ist.**

---

## 6. Bekannte Fallstricke

- `enableIndexedDbPersistence` ist abgekündigt → `persistentLocalCache` verwenden.
- Safari kann IndexedDB unter Speicherdruck räumen. Der Firestore-Offline-Cache ist ein
  Cache, keine Sicherung — nichts darauf gründen, was nicht wiederherstellbar ist.
- Safari verwirft Tabs aggressiv. Entwürfe im Eintragsformular gehören in `localStorage`.
- `deleteUser` verlangt einen frischen Login (`reauthenticateWithRedirect`).
- Ohne Servercode kann die PWA zu einer festen Uhrzeit nichts auslösen. Erinnerungen können
  nur passiv beim Öffnen der App erscheinen.
- Der Heute-Screen (Konzept 6.8) hat im Phasenplan keine eigene Phase. Er wächst stückweise:
  Phase 4 aktives Buch und heutige Einträge, Phase 5 To-dos, Phase 7 Reviewkarte, Phase 9 Rückblende.
- Firestore kann nicht joinen. Filter, die Einträge über den Status ihrer To-dos einschränken,
  laufen zwingend clientseitig.
- `bookTitle` liegt denormalisiert im Eintrag. Bei Titeländerung ist ein Batch-Update fällig
  (Konzept 9).
- Firebase App Check (Konzept 10, optional) zieht reCAPTCHA als externen Dienst nach sich —
  daher in V1 nicht einbauen.
- **Service Worker und Auth-Redirect beißen sich.** `authDomain` ist die Auslieferungsdomain
  (nötig gegen Safaris Tracking-Schutz), also liegt `/__/auth/handler` im Scope des Service
  Workers. Ohne `navigateFallbackDenylist: [/^\/__\//]` beantwortet der Fallback den
  Auth-Handler mit der App-Shell und der Login scheitert wortlos. Beim Ändern der
  Workbox-Konfiguration nie entfernen.

---

## 7. Entscheidungen und offene Fragen

**Grundsatz:** Einmal getroffene Entscheidungen gelten. Taucht in einer späteren Nachricht
etwas auf, das einer Zeile aus 7.1 widerspricht, wird es **nicht** übernommen, sondern
nachgefragt. Neue Antworten auf offene Fragen aus 7.3 sind davon nicht betroffen.

### 7.1 Entschieden

| Frage | Antwort | Quelle |
|---|---|---|
| Anzahl Leitfragen im Wochenreview | **fünf** | Nutzer, 11.08.2026 |
| Wochenreview zugänglich | ab **Samstag**, Sonntag wird es beworben | Nutzer, 11.08.2026 |
| Einstellungen-Zugang | schlichtes **Zahnradsymbol** oben in der Kopfzeile | Nutzer, 11.08.2026 |
| Streak | **Wochenstreak**; eine Woche zählt bei **mindestens einem Eintrag** | Nutzer, 11.08.2026 |
| Erinnerungen | **gestrichen**, auch für V2. Kein `reminderTime`, keine Push-Logik | Nutzer, 11.08.2026 |
| Bewertungsskalen | **keine** — weder am Eintrag noch am Buch noch am Vorsatz | Nutzer, 11.08.2026 |
| Wiedervorlage-Auslöser | **jeder Eintrag** bekommt `nextReviewAt` (7 → 30 → 90 Tage) | Nutzer, 11.08.2026 |
| Seitenzählung | nur die **Seite am Eintrag**; kein Buchfortschritt, kein Balken, keine Prozente | Nutzer, 11.08.2026 |
| Sprache | UI Deutsch, für Englisch vorbereitet | Nutzer |
| Heute-Screen | Richtung **1a „Die Seite"** | `DESIGN.md` |
| App-Name | **ReadCoach** | Nutzer, 11.08.2026 |
| Schriften | **`@fontsource`**, selbst gehostet — kein Google-Fonts-CDN | Nutzer, 11.08.2026 |
| Tailwind | **Version 3** (`theme.extend`, JS-Konfiguration) | Nutzer, 11.08.2026 |
| Hosting | **Firebase Hosting**; `authDomain` = Auslieferungsdomain | Nutzer, 11.08.2026 |
| Firestore-Region | **`eur3`** — unumkehrbar, ist gesetzt | Nutzer, 11.08.2026 |
| Account-Löschung | nicht atomar — **akzeptiert** | Nutzer, 11.08.2026 |
| To-do-Screen | Unteransichten Heute / Offen / Vorsätze / Erledigt **innerhalb** des To-do-Tabs | Nutzer, 11.08.2026 |
| `book_summary` | **keine** Pflichtkette. `Entry` ist eine diskriminierte Union über `type` | Nutzer, 11.08.2026 |
| Buchfazit | `books.summary` entfällt, stattdessen `books.summaryEntryId` als Referenz | Nutzer, 11.08.2026 |
| Firestore Rules | validieren die Pflichtfelder **typabhängig** | Nutzer, 11.08.2026 |
| `/styleguide` ohne `.env.local` | **kein Bug.** Entwicklungswerkzeug, wird nicht repariert | Nutzer, 11.08.2026 |

### 7.1a Bewusste Abweichungen vom Konzept

Diese Punkte weichen von Kapitel 9 ab. Sie sind vom Nutzer beauftragt und dürfen in späteren
Sitzungen **nicht** aus dem Konzept „zurückrepariert" werden.

| Konzept | Gilt stattdessen |
|---|---|
| `settings.reminderTime` | entfällt — keine Erinnerungen |
| `books.totalPages`, `books.currentPage` | entfallen — kein Fortschritt am Buch |
| `books.summary` (Text) | `books.summaryEntryId` (Referenz auf den Fazit-Eintrag) |
| `books.rating` (1–5) | entfällt — keine Bewertungsskalen |
| `entries.importance` (1–3) | entfällt — keine Bewertungsskalen |
| `entries.pageFrom` / `pageTo` | ein einzelnes Feld `page?` |
| Einheitliches `entries`-Schema | **diskriminierte Union über `type`** (siehe unten) |
| `todos.principleScores[]`, `reviews.principleRatings[]` | entfallen — keine 0–3-Skala |
| Leitfrage 6 des Wochenreviews | entfällt — es bleiben fünf Fragen |
| Archivfilter „Wichtigkeit" (6.6) | entfällt mit dem Feld |
| Heute-Screen „Fortschrittsbalken" (6.8) | entfällt mit der Seitenzählung |
| V2-Feature S2 „Push-Erinnerungen" | ersatzlos gestrichen |

**Folge:** Die Wiedervorlage (6.7) hatte „Wichtigkeit ≥ 2" als einzigen Auslöser. An seine
Stelle tritt: **jeder Eintrag** bekommt `nextReviewAt`.

**Pflichtfelder je Eintragstyp** — so auch in den Firestore Rules zu validieren:

| `type` | Pflicht | Optional |
|---|---|---|
| `insight` | `learning`, `meaning`, `action` | alles Übrige |
| `book_summary` | `summary` („die drei Dinge, die bleiben") | `meaning`, `action` |

Begründung des Nutzers: Die Handlungen aus einem Buch sind bereits während des Lesens als
eigene Einträge entstanden. Das Fazit ist der Rückblick darauf, keine neue Handlungsableitung.

### 7.2 Blockierend

Nichts. Firebase-Projekt, Region, Anmeldeanbieter und Hosting stehen.

### 7.3 Später zu klären — jeweils vor der genannten Phase

| # | Frage | Phase |
|---|---|---|
| 2 | Archivfilter „nur umgesetzte / nur nicht umgesetzte" braucht einen Join über To-dos — nur clientseitig möglich. Bestätigen. | 6 |
| 3 | Unterbrochenes Review: Zwischenstand in `localStorage` oder als `reviews/{weekKey}` mit `completedAt: null`? | 7 |
| 4 | Bei mehreren fälligen Rückblenden an einem Tag: wie viele zeigt der Heute-Screen (Vorschlag: genau eine, älteste zuerst)? | 9 |

## 8. Phasenplan und Status

| Phase | Inhalt | Status |
|---|---|---|
| 0 | Setup: Vite, React, TS, Tailwind, `vite-plugin-pwa`, Firebase, Struktur, Offline-Persistenz | **fertig** — `.env.local` fehlt noch |
| 1 | Design-System: Tokens, Typografie, Spacing, UI-Primitives, `/styleguide` | **fertig** |
| 2 | Authentifizierung: Google Sign-In per Redirect, `useAuth`, Guard, `users/{uid}` | **fertig** — auf dem iPhone geprüft |
| 3 | Bücher: CRUD, Liste nach Status, Detail, Formular, aktives Buch, Firestore Rules | **fertig** — Rules deployt, auf dem iPhone geprüft |
| 4 | Einträge: Pflichtkette, Zusatzfelder, Tags, `keywords`/`dayKey`/`weekKey`, Autosave | **fertig** — Rules deployen nicht vergessen |
| 5 | To-dos: `daily` und `principle`, Ursprungsverweis, Übertrag, To-do-Screen | **fertig** |
| 6 | Archiv und Suche: fünf Ansichten, Filter, Detail, Fuse.js, Composite-Indizes | offen |
| 7 | Wochenreview: geführter Ablauf, Vorbefüllung, `reviews/{weekKey}`, unterbrechbar | offen |
| 8 | Feinschliff: Offline-Indikator, Leerzustände, Onboarding, Einstellungen, Export, Deploy | offen |
| 9 | Wiedervorlage: `nextReviewAt`, Rückblende, `reviewHistory`, 7 → 30 → 90 Tage | offen |

`/styleguide` aus Phase 1 ist eine **temporäre Route** und wird vor dem Deployment
in Phase 8 zur Entscheidung gestellt.

Seit Phase 2 importiert die App `src/lib/firebase.ts`. Ohne `.env.local` startet sie nicht
mehr — auch der Styleguide nicht.

Deployment: `npm run deploy` (baut und lädt auf Firebase Hosting). `VITE_FIREBASE_AUTH_DOMAIN`
muss **die Domain sein, von der ausgeliefert wird** (`readcoach-29227.web.app`), nicht
`*.firebaseapp.com` — sonst zerlegt Safaris Tracking-Schutz `signInWithRedirect`.

Icons und Startbilder werden aus `scripts/generate-app-icons.mjs` erzeugt (`npm run icons`),
nicht von Hand gepflegt. Nach einer Farbänderung in `DESIGN.md` neu laufen lassen.

**Einmalige Einrichtung in der Google-Cloud-Konsole:** Weil `authDomain` die
Auslieferungsdomain ist, muss der automatisch angelegte OAuth-Client
`https://readcoach-29227.web.app/__/auth/handler` als autorisierte Weiterleitungs-URI und
`https://readcoach-29227.web.app` als JavaScript-Quelle führen. Firebase trägt dort nur die
`*.firebaseapp.com`-Variante ein; ohne den Zusatz antwortet Google mit
`redirect_uri_mismatch`. Die Liste „Autorisierte Domains" in Firebase ist eine **andere**
Liste und reicht dafür nicht. Bei einem Domainwechsel erneut nachtragen.

**Deploys:** `npm run deploy` (Hosting), `npm run deploy:rules` (Firestore Rules). Nach jeder
Änderung an `firestore.rules` muss deployt werden, sonst gilt weiter die alte Fassung.

**Lokal testen gegen die Emulatoren:**
`VITE_USE_EMULATORS=true VITE_FIREBASE_PROJECT_ID=demo-readcoach npm run build`, dazu
`npx firebase-tools emulators:start --only auth,firestore --project demo-readcoach`.
Der Zweig in `src/lib/firebase.ts` samt `window.__devSignIn` wird in einem normalen Build
wegoptimiert — nachgeprüft, er steht nicht im ausgelieferten Bundle. Der Google-Login selbst
lässt sich so nicht testen: `getRedirectResult` braucht `apis.google.com`.

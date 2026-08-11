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
- Firestore kann nicht joinen. Filter, die Einträge über den Status ihrer To-dos einschränken,
  laufen zwingend clientseitig.
- `bookTitle` liegt denormalisiert im Eintrag. Bei Titeländerung ist ein Batch-Update fällig
  (Konzept 9).
- Firebase App Check (Konzept 10, optional) zieht reCAPTCHA als externen Dienst nach sich —
  daher in V1 nicht einbauen.

---

## 7. Entscheidungen und offene Fragen

### 7.1 Entschieden

| Frage | Antwort | Quelle |
|---|---|---|
| Anzahl Leitfragen im Wochenreview | **fünf** (Frage 6 entfällt mit der Bewertungsskala) | Nutzer, 11.08.2026 |
| Wochenreview zugänglich | ab **Samstag**, Erinnerung Sonntagabend | Konzept 6.5 |
| Ort der Einstellungen | Icon in der **Kopfzeile**, nicht in der Tab-Bar | Konzept 7.1 |
| Streak-Art | **Wochenstreak**, kein Tagesstreak | Konzept 6.8 |
| Push-Erinnerungen | **V2.** In V1 nur `reminderTime` speichern + In-App-Hinweis | Konzept 5/11 |
| Wichtigkeit am Eintrag | **gestrichen** — keinerlei Bewertungsskalen in der App | Nutzer, 11.08.2026 |
| Sprache | UI Deutsch, für Englisch vorbereitet | Nutzer |
| Heute-Screen | Richtung **1a „Die Seite"** | `DESIGN.md` |
| App-Name | **ReadCoach** (ersetzt den Platzhalter „ReadFlect") | Nutzer, 11.08.2026 |
| Schriften | **`@fontsource`**, selbst gehostet — kein Google-Fonts-CDN | Nutzer, 11.08.2026 |
| Tailwind | **Version 3** (`theme.extend`, JS-Konfiguration) | Nutzer, 11.08.2026 |
| Firestore-Region | **`eur3`** (Europa, multiregional) — unumkehrbar | Nutzer, 11.08.2026 |
| Erinnerungen | **gestrichen**, auch für V2. Kein `reminderTime`, keine Push-Logik | Nutzer, 11.08.2026 |
| Einstellungen-Zugang | schlichtes **Zahnradsymbol** oben in der Kopfzeile | Nutzer, 11.08.2026 |
| Streak | eine Woche zählt bei **mindestens einem Eintrag** | Nutzer, 11.08.2026 |
| Seitenzählung | nur die **Seite am Eintrag**; kein Buchfortschritt, kein Balken, keine Prozente | Nutzer, 11.08.2026 |
| Account-Löschung | nicht atomar — **akzeptiert** | Nutzer, 11.08.2026 |
| To-do-Screen | Unteransichten Heute / Offen / Vorsätze / Erledigt **innerhalb** des To-do-Tabs | Nutzer, 11.08.2026 |
| Vorsatzbewertung 0–3 | **gestrichen** | Nutzer, 11.08.2026 |
| Wiedervorlage-Auslöser | **jeder Eintrag** bekommt `nextReviewAt` (7 → 30 → 90 Tage) | Nutzer, 11.08.2026 |

### 7.1a Bewusste Abweichungen vom Konzept

Diese Punkte weichen von Kapitel 9 ab. Sie sind vom Nutzer beauftragt und dürfen in späteren
Sitzungen **nicht** aus dem Konzept „zurückrepariert" werden.

| Konzept | Gilt stattdessen |
|---|---|
| `settings.reminderTime` | entfällt — keine Erinnerungen |
| `books.totalPages`, `books.currentPage` | entfallen — kein Fortschritt am Buch |
| `entries.pageFrom` / `pageTo` | ein einzelnes Feld `page?` |
| `todos.principleScores[]`, `reviews.principleRatings[]` | entfallen — keine 0–3-Skala |
| V2-Feature S2 „Push-Erinnerungen" | ersatzlos gestrichen |
| Heute-Screen „Fortschrittsbalken" (6.8) | entfällt mit der Seitenzählung |
| `entries.importance` (1–3) | entfällt — keine Bewertungsskalen |
| Archivfilter „Wichtigkeit" (6.6) | entfällt mit dem Feld |
| Leitfrage 6 des Wochenreviews | entfällt — es bleiben fünf Fragen |

**Folge:** Die Wiedervorlage (6.7) hatte „Wichtigkeit ≥ 2" als einzigen Auslöser. An seine
Stelle tritt: **jeder Eintrag** bekommt `nextReviewAt`.

### 7.2 Blockierend

1. **Firebase-Werte** für `.env.local`: `apiKey`, `authDomain`, `projectId`, `storageBucket`,
   `messagingSenderId`, `appId`. Ohne sie startet die App nicht gegen ein echtes Projekt.
   Das Firebase-Projekt muss mit Firestore in Region **`eur3`** angelegt werden.

### 7.3 Später zu klären — jeweils vor der genannten Phase

| # | Frage | Phase |
|---|---|---|
| 6 | `book_summary` erzeugt einen Eintrag, passt aber nicht in die Pflichtkette `learning`/`meaning`/`action` (Konzept 6.2 vs. 9 vs. 10). Wie abbilden? | 3 |
| 7 | Buch-Feld „persönliche Bewertung 1–5" (Konzept 6.2): fällt das unter „keine Bewertungsskala"? | 3 |
| 8 | Wiedervorlage: bei „jeder Eintrag" können an einem Tag mehrere Rückblenden fällig sein. Wie viele zeigt der Heute-Screen (Vorschlag: genau eine, älteste zuerst)? | 9 |
| 9 | Entwürfe laut Konzept 11 „zusätzlich früh nach Firestore schreiben" — kollidiert mit den Pflichtfeld-Rules. Nur `localStorage`? | 4 |
| 10 | Archivfilter „nur umgesetzte / nur nicht umgesetzte" braucht einen Join über To-dos — nur clientseitig möglich. Bestätigen. | 6 |
| 11 | „Leitfragen bearbeiten" kann nur für die Freitextfragen gelten; Frage 1 (Auswahl aus Wocheneinträgen) hat feste UI. Bestätigen. | 7 |
| 12 | Unterbrochenes Review: Zwischenstand in `localStorage` oder als `reviews/{weekKey}` mit `completedAt: null`? | 7 |

---

## 8. Phasenplan und Status

| Phase | Inhalt | Status |
|---|---|---|
| 0 | Setup: Vite, React, TS, Tailwind, `vite-plugin-pwa`, Firebase, Struktur, Offline-Persistenz | **fertig** — `.env.local` fehlt noch |
| 1 | Design-System: Tokens, Typografie, Spacing, UI-Primitives, `/styleguide` | **fertig** |
| 2 | Authentifizierung: Google Sign-In per Redirect, `useAuth`, Guard, `users/{uid}` | offen |
| 3 | Bücher: CRUD, Liste nach Status, Detail, Formular, aktives Buch, Firestore Rules | offen |
| 4 | Einträge: Pflichtkette, Zusatzfelder, Tags, `keywords`/`dayKey`/`weekKey`, Autosave | offen |
| 5 | To-dos: `daily` und `principle`, Ursprungsverweis, Übertrag, To-do-Screen | offen |
| 6 | Archiv und Suche: fünf Ansichten, Filter, Detail, Fuse.js, Composite-Indizes | offen |
| 7 | Wochenreview: geführter Ablauf, Vorbefüllung, `reviews/{weekKey}`, unterbrechbar | offen |
| 8 | Feinschliff: Offline-Indikator, Leerzustände, Onboarding, Einstellungen, Export, Deploy | offen |
| 9 | Wiedervorlage: `nextReviewAt`, Rückblende, `reviewHistory`, 7 → 30 → 90 Tage | offen |

`/styleguide` aus Phase 1 ist eine **temporäre Route** und wird vor dem Deployment
in Phase 8 zur Entscheidung gestellt.

`src/lib/firebase.ts` ist geschrieben, wird aber noch nirgends importiert — so läuft der
Styleguide ohne Zugangsdaten. Verdrahtet wird Firebase in Phase 2.

Icons und Startbilder werden aus `scripts/generate-app-icons.mjs` erzeugt (`npm run icons`),
nicht von Hand gepflegt. Nach einer Farbänderung in `DESIGN.md` neu laufen lassen.

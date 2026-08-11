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
| Anzahl Leitfragen im Wochenreview | **sechs** (Mockup „Frage 5 von 7" ist überholt) | Nutzer, 11.08.2026 |
| Wochenreview zugänglich | ab **Samstag**, Erinnerung Sonntagabend | Konzept 6.5 |
| Ort der Einstellungen | Icon in der **Kopfzeile**, nicht in der Tab-Bar | Konzept 7.1 |
| Streak-Art | **Wochenstreak**, kein Tagesstreak | Konzept 6.8 |
| Push-Erinnerungen | **V2.** In V1 nur `reminderTime` speichern + In-App-Hinweis | Konzept 5/11 |
| Wichtigkeitsskala | **1–3**, Wiedervorlage ab ≥ 2 | Konzept 6.3/6.7 |
| Sprache | UI Deutsch, für Englisch vorbereitet | Nutzer |
| Heute-Screen | Richtung **1a „Die Seite"** | `DESIGN.md` |

### 7.2 Blockierend — vor Phase 0 zu klären

1. **App-Name.** „ReadFlect" ist laut Konzept 14.3 ein Platzhalter. Bestimmt Manifest,
   `<title>`, `package.json` und Startbildschirm-Label.
2. **Firebase-Werte** für `.env.local`: `apiKey`, `authDomain`, `projectId`, `storageBucket`,
   `messagingSenderId`, `appId`.
3. **Firestore-Region** muss beim Anlegen auf `eur3` oder `europe-west3` stehen.
   **Später nicht mehr änderbar** (Konzept 12).
4. **Schriften.** `DESIGN.md` bindet Google Fonts ein, § 2 dieser Datei verbietet externe
   Dienste. Vorschlag: `@fontsource` (identische Schriften, selbst gehostet, offline).
5. **Tailwind-Version.** `DESIGN.md` schreibt `theme.extend.colors` → Tailwind 3.

### 7.3 Später zu klären — jeweils vor der genannten Phase

| # | Frage | Phase |
|---|---|---|
| 6 | `book_summary` erzeugt einen Eintrag, passt aber nicht in die Pflichtkette `learning`/`meaning`/`action` (Konzept 6.2 vs. 9 vs. 10). Wie abbilden? | 3 |
| 7 | `currentPage` des Buchs: manuell pflegen oder automatisch aus `pageTo` des letzten Eintrags? | 3 |
| 8 | Seitenangabe im Eintragsformular: ein Feld oder `pageFrom`/`pageTo` als Bereich? | 4 |
| 9 | Wiedervorlage schon in V1 statt V2? Konzept 6.7/15.3 empfiehlt es dringend, das Heute-Mockup zeigt sie bereits. | 4 |
| 10 | Entwürfe laut Konzept 11 „zusätzlich früh nach Firestore schreiben" — kollidiert mit den Pflichtfeld-Rules. Nur `localStorage`? | 4 |
| 11 | Streak: was zählt als erfüllte Woche (≥ 1 Eintrag? abgeschlossenes Review?) | 5 |
| 12 | Archivfilter „nur umgesetzte / nur nicht umgesetzte" braucht einen Join über To-dos — nur clientseitig möglich. Bestätigen. | 6 |
| 13 | „Leitfragen bearbeiten" kann nur für die Freitextfragen 2–5 gelten; Frage 1 (Auswahl) und 6 (Skala) haben feste UI. Bestätigen. | 7 |
| 14 | Bedeutung der Stufen 0–3 bei der Vorsatzbewertung. | 7 |
| 15 | Unterbrochenes Review: Zwischenstand in `localStorage` oder als `reviews/{weekKey}` mit `completedAt: null`? | 7 |
| 16 | Fortschritt des aktiven Buchs: Konzept 6.8 sagt „Fortschrittsbalken", Richtung 1a zeigt eine Mono-Zeile. | 8 |

---

## 8. Phasenplan und Status

| Phase | Inhalt | Status |
|---|---|---|
| 0 | Setup: Vite, React, TS, Tailwind, `vite-plugin-pwa`, Firebase, Struktur, Offline-Persistenz | offen |
| 1 | Design-System: Tokens, Typografie, Spacing, UI-Primitives, `/styleguide` | offen |
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

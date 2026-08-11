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

| Quelle | Rolle | Status |
|---|---|---|
| Produktkonzept (Kapitel 5–11) | Fachliche Grundlage: Features, Datenmodell, Screens, Rules | **liegt noch nicht im Repo** |
| `DESIGN.md` | Designsprache: Farben, Typografie, Spacing, Komponenten | vorhanden |
| `docs/design/` | Visuelle Referenz der Screens (Richtung 1a „Die Seite") | vorhanden |

Bei Widerspruch zwischen Konzept und Design gilt: **fragen, nicht entscheiden.**

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

---

## 7. Offene Fragen an den Nutzer

Diese Punkte sind ungeklärt. Sie werden **nicht eigenmächtig entschieden**.

1. Produktkonzept fehlt im Repo (Kapitel 5, 6.2–6.7, 7.2, 8.4, 9, 10, 11).
2. Firebase-Werte für `.env.local`.
3. Wochenreview: sechs oder sieben Leitfragen?
4. Wochenreview: ab Samstag oder ab Sonntag zugänglich?
5. Schriften: Google Fonts widerspricht „keine externen APIs außer Firebase" →
   Vorschlag `@fontsource` (selbst gehostet, offline-fähig).
6. Erinnerungszeit ohne Server nur passiv möglich — behalten oder streichen?
7. Wo leben die Einstellungen? Die Tab-Bar hat nur vier Spalten.
8. Streak-Definition (was zählt als erfüllte Woche?).
9. Buch-Felder: Gesamtseitenzahl und aktuelle Seite — woher kommt der Fortschritt?
10. Heute-Screen: Richtung 1a „Die Seite" bestätigen (statt 1b „Das Pult").
11. Tailwind-Version: 3 (wie in `DESIGN.md` vorausgesetzt) oder 4?
12. Account-Löschung ohne Server ist nicht atomar — akzeptiert?
13. Wichtigkeitsskala: welcher Wertebereich?
14. Bewertungsskala 0–3 für Vorsätze: Bedeutung der Stufen.

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

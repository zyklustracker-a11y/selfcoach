# Produktkonzept: Selbstcoaching-PWA für Buchlernen

**Arbeitstitel:** *ReadFlect* (Platzhalter, Namensfindung siehe Kap. 14)
**Version:** 2.0 – KI-Komponenten vollständig entfernt
**Datum:** 11.08.2026
**Plattform:** Progressive Web App (Primärziel: iPhone/Safari, Home-Screen-Installation)
**Stack:** React + Vite + TypeScript · Firebase (Auth, Firestore, Hosting) · Google Sign-In
**Zweck des Dokuments:** Vollständige fachliche und technische Grundlage, aus der anschließend ein Implementierungs-Prompt für Claude Code abgeleitet wird.

> **Änderung gegenüber V1.0:** Der KI-Coach, der KI-Proxy, die Anbieter-/Kostenanalyse und alle davon abhängigen Features wurden gestrichen. Details siehe Kapitel 15.

---

## Inhaltsverzeichnis

1. Executive Summary
2. Problemanalyse & Idee-Bewertung
3. Zielgruppe, Nutzungskontext & Leitprinzipien
4. Produktvision & Kernmodell
5. Funktionsumfang (Release-Stufen)
6. Detaillierte Feature-Spezifikation
7. Informationsarchitektur & Screens
8. Technische Architektur
9. Datenmodell (Firestore)
10. Sicherheit & Firestore Rules
11. iOS-PWA-Spezifika
12. Datenschutz & DSGVO
13. Kostenübersicht
14. Roadmap, Risiken & offene Entscheidungen
15. Was sich gegenüber Version 1.0 geändert hat

---

## 1. Executive Summary

Die App ist ein **persönliches Selbstcoaching-System für Buchleser**, das den Bruch zwischen *Lesen* und *Umsetzen* schließt. Der Nutzer erfasst täglich in wenigen Minuten, was er gelernt hat, übersetzt es in eine konkrete Handlung und verankert diese als To-do. Am Wochenende folgt eine tiefere Reflexion, die Muster sichtbar macht. Alles landet in einem durchsuchbaren Archiv, das zum persönlichen Wissensspeicher wird.

Technisch ist es eine installierbare PWA – kein App-Store, keine Entwicklergebühr, ein Codebase für iPhone, iPad und Desktop. **Es gibt keinen eigenen Server und keine externen Bezahldienste.** Der laufende Betrieb kostet **0 €**.

**Zentrale Design-Entscheidung:** Die App darf nicht zu einer weiteren Notiz-App verkommen. Der entscheidende Mechanismus ist die erzwungene Kette
**Erkenntnis → persönliche Bedeutung → konkrete Handlung → Überprüfung.**
Ein Eintrag ohne Handlungsschritt gilt als unvollständig.

---

## 2. Problemanalyse & Idee-Bewertung

### 2.1 Das eigentliche Problem

| Phänomen | Beschreibung | Antwort der App |
|---|---|---|
| **Konsum-Illusion** | Lesen fühlt sich nach Fortschritt an, verändert aber nichts. | Pflichtfeld „konkrete Handlung" pro Eintrag |
| **Vergessenskurve** | Ohne Wiederholung sind nach 30 Tagen ~80 % weg. | Wiedervorlage-Mechanismus (Kap. 6.7) |
| **Transferlücke** | Wissen bleibt abstrakt, wird nicht auf den eigenen Alltag übersetzt. | Getrenntes Feld „Bedeutung für mich" |
| **Kein Feedback-Loop** | Niemand prüft, ob der Vorsatz umgesetzt wurde. | Umsetzungs-Check im Wochenreview |
| **Verlorene Notizen** | Notizen liegen verstreut in Büchern, Notes, Kindle. | Zentrales Archiv mit Suche & Tags |

### 2.2 Bewertung der Idee

**Stärken:**
- Der Zweistufen-Rhythmus (täglich kurz / wöchentlich tief) ist psychologisch richtig. Tägliche Reibung muss minimal sein, sonst bricht die Gewohnheit; die Tiefe braucht einen eigenen, selteneren Slot.
- Die Kopplung an konkrete To-dos ist der Punkt, an dem sich die App von Notion, Apple Notes oder einem Journal unterscheidet.

**Risiken / Denkfehler, die es zu vermeiden gilt:**
1. **Feature-Überladung.** Die App gewinnt nicht durch Umfang, sondern durch Reibungsarmut. Ein Tageseintrag muss in unter 90 Sekunden möglich sein.
2. **Das Archiv als Datenfriedhof.** Speichern allein bringt nichts. Da es keine KI-Auswertung gibt, tragen **Wiedervorlage, Volltextsuche und Gruppierung nach Buch/Tag** die volle Last, das Archiv lebendig zu halten. Die Wiedervorlage (6.7) rückt dadurch von „nice to have" auf **hohe Priorität**.
3. **Wochenreview ohne Material.** Ein leeres Reflexionsformular ist demotivierend. Deshalb wird das Review automatisch mit den Einträgen der Woche vorbefüllt.

### 2.3 Verständnisfragen beim Lesen

In V1.0 war dafür ein KI-Chat vorgesehen. Bewusste Entscheidung jetzt: **Das gehört nicht in diese App.** Wer beim Lesen etwas nicht versteht, fragt ChatGPT oder Claude direkt – das ist einen Tab entfernt und muss nicht nachgebaut, bezahlt und abgesichert werden.

Falls der Bedarf bleibt, gibt es eine kostenlose Variante ohne jede Technik: ein optionales Feld **„offene Frage"** am Eintrag. Diese Fragen werden im Wochenreview gesammelt angezeigt („Diese Woche offen geblieben: …") und können dort abgehakt werden. Vorschlag für V2, nicht für das MVP.

### 2.4 Anmerkung zur Referenz „Abendstrategen"

Zur konkreten Abendstrategen-App liegen keine belastbaren Informationen vor. Angenommen wird das Muster, das der Name nahelegt: **strukturierte abendliche Tagesreflexion mit festen Leitfragen und Ableitung von Vorsätzen**. Falls die App Mechaniken hat, die dir besonders wichtig sind (Fragenkataloge, Bewertungsskalen, Streak-Logik), ergänzen wir diese vor dem Claude-Code-Prompt.

---

## 3. Zielgruppe, Nutzungskontext & Leitprinzipien

### 3.1 Primärnutzer

Zunächst **Single-User (du selbst)**. Die Architektur ist aber von Beginn an mandantenfähig (`users/{uid}/…`), sodass eine spätere Öffnung für weitere Nutzer keine Migration erfordert.

### 3.2 Nutzungssituationen

| Situation | Ort / Zeit | Anforderung |
|---|---|---|
| **Quick Capture** | Während des Lesens, Buch in der Hand | Ein Tap zum Eingabefeld, offlinefähig, Diktat möglich |
| **Tagesabschluss** | Abends, Bett/Sofa | Dunkles UI, kurze Leitfragen, Zusammenfassung des Tages |
| **Wochenreview** | Sonntag, 15–30 Min | Übersicht, mehr Platz, Muster erkennen |
| **Nachschlagen** | Unterwegs, spontan | Schnelle Suche im Archiv |

### 3.3 Leitprinzipien

1. **Reibung minimieren, Tiefe optional.** Pflichtfelder klein halten, Zusatzfelder einklappbar.
2. **Offline-first.** Lesen passiert auch in der U-Bahn.
3. **Ein Eintrag = eine Erkenntnis.** Keine Sammelnotizen, sondern atomare Einheiten – das macht Wiedervorlage, Tagging und Suche erst nützlich.
4. **Nichts geht verloren.** Autosave als Entwurf, Export jederzeit.
5. **Die App fragt, der Nutzer denkt.** Coaching heißt Fragen stellen, nicht Antworten liefern. Die App liefert die Struktur und die Fragen – das Denken bleibt beim Nutzer.
6. **Kein Server, keine laufenden Kosten.** Jede Funktion, die einen bezahlten Dienst nötig macht, wird verworfen oder anders gelöst.

---

## 4. Produktvision & Kernmodell

### 4.1 Vision Statement

> Eine App, die aus gelesenen Seiten gelebte Veränderung macht – indem sie jede Erkenntnis konsequent bis zur überprüften Handlung führt.

### 4.2 Das Kernobjekt: der Lerneintrag („Insight")

```
┌──────────────────────────────────────────────────────────┐
│ 1. ERKENNTNIS      Was habe ich gelernt?                 │  ← Pflicht
│    "Willenskraft ist eine begrenzte Ressource."          │
├──────────────────────────────────────────────────────────┤
│ 2. BEDEUTUNG       Was heißt das für MICH konkret?       │  ← Pflicht
│    "Ich treffe wichtige Entscheidungen abends – schlecht"│
├──────────────────────────────────────────────────────────┤
│ 3. HANDLUNG        Was mache ich ab wann anders?         │  ← Pflicht
│    "Entscheidungen nur noch vormittags."                 │
├──────────────────────────────────────────────────────────┤
│ 4. To-do(s)        Daraus abgeleitete Aufgaben           │  ← optional
│    ☐ Kalender-Slot Di 9:00 für Entscheidungen (heute)    │
│    ☐ Abends keine Finanz-Entscheidungen (dauerhaft)      │
├──────────────────────────────────────────────────────────┤
│ 5. Meta           Buch · Seite · Zitat · Tags · Rating   │  ← optional
└──────────────────────────────────────────────────────────┘
```

### 4.3 Der Wirkkreislauf

```
   ┌────────────┐      ┌────────────┐      ┌────────────┐
   │   LESEN    │ ───► │  ERFASSEN  │ ───► │  HANDELN   │
   └────────────┘      │ (täglich)  │      │  (To-dos)  │
         ▲             └────────────┘      └─────┬──────┘
         │                                       │
         │             ┌────────────┐            ▼
         └──────────── │  REFLEK-   │ ◄── ┌────────────┐
           Fokus für   │   TIEREN   │     │ ÜBERPRÜFEN │
           nächste     │(wöchentl.) │     │ (Check-in) │
           Woche       └─────┬──────┘     └────────────┘
                             │
                             ▼
                       ┌────────────┐
                       │   ARCHIV   │ ◄── Wiedervorlage + Suche
                       └────────────┘
```

---

## 5. Funktionsumfang (Release-Stufen)

### V1 – MVP („Must have")

| # | Feature | Begründung |
|---|---|---|
| M1 | Google Sign-In (Firebase Auth) | Einziger Login-Weg, kein Passwort-Handling |
| M2 | Tageseintrag mit 3-Feld-Kette + Buchzuordnung | Kernfunktion |
| M3 | To-dos (tagesbezogen + dauerhaft) mit Abhaken | Umsetzungsebene |
| M4 | Wochenreview mit Vorbefüllung aus der Woche | Zweite Reflexionsstufe |
| M5 | Archiv: Liste, Filter (Buch/Tag/Zeitraum), Volltextsuche | Wiederauffindbarkeit |
| M6 | Bücherverwaltung (Titel, Autor, Status, Fortschritt) | Ordnungsrahmen |
| M7 | PWA-Installation, Offline-Betrieb, Dark Mode | iPhone-Tauglichkeit |
| M8 | Datenexport (JSON + Markdown) | Kein Lock-in, Backup |

### V2 – „Should have"

| # | Feature |
|---|---|
| S1 | **Wiedervorlage alter Einträge (7 / 30 / 90 Tage) – höchste Priorität in V2** |
| S2 | Push-Erinnerungen (Abend-Reminder, Sonntags-Review-Reminder) |
| S3 | Dashboard mit Statistiken (Wochenstreak, Einträge/Woche, Umsetzungsquote) |
| S4 | ISBN-/Barcode-Scan zum Anlegen von Büchern (Open Library API, kostenlos) |
| S5 | Zitat-Sammlung als eigene Ansicht |
| S6 | Optionales Feld „offene Frage" + Sammlung im Wochenreview (siehe 2.3) |

### V3 – „Could have"

| # | Feature |
|---|---|
| C1 | Monats- und Jahresrückblick |
| C2 | Foto einer Buchseite → OCR → Textvorschlag |
| C3 | Sprachnotiz → Transkription → Eintragsvorschlag |
| C4 | Teilen einzelner Insights als Bildkarte |
| C5 | Mehrbenutzerfähigkeit / Freundes-Feed |

### „Won't have" (bewusst ausgeschlossen)

- **KI-Coach, KI-Chat, KI-Wochensynthese, automatische Themen-Cluster**
- **Jeder eigene Backend-/Serverdienst** (keine Cloud Functions, kein Worker)
- Native iOS-App / App Store
- Soziales Netzwerk, Kommentare, Likes
- E-Book-Reader-Funktion
- Kindle-Highlight-Import (rechtlich und technisch fragil)

---

## 6. Detaillierte Feature-Spezifikation

### 6.1 Authentifizierung

- **Ausschließlich Google Sign-In** über Firebase Authentication.
- Auf iOS **`signInWithPopup` vermeiden** – Safari blockiert Popups im Standalone-Modus zuverlässig. Stattdessen `signInWithRedirect` mit `getRedirectResult`-Handling beim App-Start.
- Beim ersten Login wird ein `users/{uid}`-Dokument mit Default-Settings angelegt.
- Session bleibt persistent (`browserLocalPersistence`), damit kein täglicher Re-Login nötig ist.
- Ein „Account löschen"-Flow (Auth-User + alle Subcollections) ist DSGVO-seitig Pflicht.

### 6.2 Bücherverwaltung

**Felder:** Titel, Autor, Status (`geplant` / `lese ich` / `beendet` / `abgebrochen`), Startdatum, Enddatum, Seitenzahl, aktuelle Seite, Cover-URL, Themen-Tags, persönliche Bewertung (1–5), Kurzfazit nach Abschluss.

**Verhalten:**
- Ein Buch ist zu jedem Zeitpunkt „aktiv" (Standardzuordnung neuer Einträge) – spart bei jedem Eintrag einen Klick.
- Buchdetailseite zeigt alle Einträge zu diesem Buch chronologisch plus abgeleitete To-dos und deren Umsetzungsstand.
- Beim Abschluss eines Buchs: Prompt für ein Kurzfazit („Die 3 Dinge, die bleiben") – erzeugt automatisch einen speziellen Eintrag vom Typ `book_summary`.

### 6.3 Tageseintrag

**Ablauf (Ziel: < 90 Sekunden):**

1. Floating-Action-Button „+" → Eintragsformular
2. Buch ist vorausgewählt (aktives Buch), änderbar
3. Feld 1 *Erkenntnis* (Pflicht, mehrzeilig, Diktat via iOS-Tastatur möglich)
4. Feld 2 *Bedeutung für mich* (Pflicht)
5. Feld 3 *Konkrete Handlung* (Pflicht)
6. Ausklappbar: Seitenzahl, wörtliches Zitat, Tags, Wichtigkeit (1–3 Sterne)
7. „To-do daraus erstellen" → Inline-Formular, Feld 3 wird als Titelvorschlag übernommen
8. Speichern

**Wichtige Details:**
- **Autosave als Entwurf** alle 3 Sekunden in `localStorage`; bei App-Neustart wird der Entwurf wiederhergestellt (Safari verwirft Tabs aggressiv).
- Mehrere Einträge pro Tag sind erlaubt und erwünscht (ein Eintrag = eine Erkenntnis).
- Tag-Vorschläge basierend auf bereits verwendeten Tags (Autocomplete, keine feste Taxonomie).

### 6.4 To-dos

**Zwei Typen, bewusst getrennt:**

| Typ | Bedeutung | Darstellung |
|---|---|---|
| `daily` | Konkrete Aufgabe mit Datum („Heute 20 Min. Kapitel 4") | Heute-Ansicht, verfällt / wird verschoben |
| `principle` | Dauerhafter Vorsatz („Keine Entscheidungen nach 20 Uhr") | Eigene Liste, wird im Wochenreview bewertet statt abgehakt |

**Funktionen:**
- Abhaken mit Zeitstempel (Basis für die Umsetzungsquote)
- Nicht erledigte `daily`-To-dos werden am Folgetag angeboten („verschieben oder verwerfen?") – kein stilles Anhäufen
- Jedes To-do behält die Referenz auf seinen Ursprungs-Eintrag → aus der Aufgabe heraus ist immer sichtbar, *warum* man sie sich vorgenommen hat. Das ist der stärkste Motivationshebel des Systems.
- `principle`-To-dos werden im Wochenreview auf einer Skala 0–3 bewertet („wie konsequent umgesetzt?")

### 6.5 Wochenreview

Zugänglich ab Samstag, erinnert am Sonntagabend. **Automatisch vorbefüllt** mit:
- allen Einträgen der Woche (kompakte Liste, antippbar)
- Umsetzungsstatistik der To-dos
- den offenen `principle`-Vorsätzen

**Leitfragen (fest, konfigurierbar in den Settings):**
1. Welche 3 Erkenntnisse dieser Woche waren die stärksten? *(Auswahl aus den Wocheneinträgen)*
2. Was habe ich davon tatsächlich umgesetzt?
3. Wo habe ich es mir vorgenommen und nicht getan – und woran lag es ehrlich?
4. Welches Muster erkenne ich über die Woche hinweg?
5. Was ist mein **einer** Fokus für die kommende Woche?
6. Bewertung der laufenden Vorsätze (0–3)

Das Ergebnis wird als `review`-Dokument gespeichert und erscheint im Archiv als eigener Eintragstyp.

> **Hinweis:** Die frühere „KI-Musteranalyse" entfällt. Frage 4 leistet dasselbe – nur denkt der Nutzer selbst, was im Sinne des Coaching-Prinzips ohnehin die bessere Lösung ist. Unterstützend zeigt die App bei Frage 4 automatisch die **häufigsten Tags der Woche** und die **Bücher, aus denen die Einträge stammen** – eine rein rechnerische Musterhilfe ohne externen Dienst.

### 6.6 Archiv

- **Ansichten:** Chronologische Liste · Nach Buch gruppiert · Nach Tag gruppiert · Nur Zitate · Nur Reviews
- **Filter:** Zeitraum, Buch, Tag, Wichtigkeit, „nur umgesetzte" / „nur nicht umgesetzte"
- **Suche:** Firestore bietet keine native Volltextsuche. Für den Ein-Nutzer-Fall ist die pragmatische Lösung: alle Einträge werden ohnehin lokal gecacht (Offline-Persistenz), die Suche läuft **clientseitig** über den Cache (z. B. mit einer kleinen Fuzzy-Search-Bibliothek wie Fuse.js). Das ist bei realistischen Datenmengen (< 10.000 Einträge) sofort schnell und kostet keine Reads. Zusätzlich wird pro Eintrag ein normalisiertes `keywords`-Array gespeichert, falls später serverseitig gefiltert werden soll.
- **Detailansicht** eines Eintrags: alle Felder, abgeleitete To-dos mit Status, Bearbeiten, Löschen.

### 6.7 Wiedervorlage (V2, höchste Priorität)

Ein Eintrag mit Wichtigkeit ≥ 2 wird nach **7, 30 und 90 Tagen** erneut eingeblendet („Rückblende" auf dem Dashboard) mit der Frage:

> „Vor 30 Tagen hast du dir vorgenommen: *Entscheidungen nur noch vormittags.* Lebst du das noch?"
> → ☑ Ja, läuft · ↻ Erneut vornehmen · ✕ Nicht mehr relevant

Das ist der Mechanismus, der aus dem Archiv ein aktives System macht – und ohne KI der **einzige** Mechanismus, der das tut. Implementierung ohne Server-Cronjob: Beim App-Start wird clientseitig geprüft, welche Einträge fällig sind (`nextReviewAt <= today`). Kein Backend nötig.

> **Empfehlung:** Falls der Umfang es zulässt, dieses Feature schon in V1 aufnehmen – der Aufwand ist gering (ein Feld, eine Query, eine Karte auf dem Dashboard), die Wirkung auf den Kernnutzen groß.

### 6.8 Dashboard / Heute-Ansicht

Startbildschirm nach dem Login:
- Aktives Buch mit Fortschrittsbalken
- Heutige To-dos
- „Heute noch kein Eintrag"-Hinweis (dezent, nicht schuldbildend)
- Streak-Anzeige (Wochenstreak, nicht Tagesstreak – ein Tagesstreak erzeugt Druck und führt zu Alibi-Einträgen)
- Rückblende (siehe 6.7)
- Am Wochenende: Karte „Wochenreview starten"

---

## 7. Informationsarchitektur & Screens

### 7.1 Navigation (Tab-Bar unten, 4 Einträge – daumenfreundlich)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                  Content Area                   │
│                                                 │
│                                    ╭───╮        │
│                                    │ + │  FAB   │
│                                    ╰───╯        │
├─────────────────────────────────────────────────┤
│    🏠         📚         🗂️          ✓          │
│  Heute      Bücher     Archiv     To-dos        │
└─────────────────────────────────────────────────┘
```

*(Einstellungen über ein Icon in der Kopfzeile, nicht in der Tab-Bar.)*

### 7.2 Screen-Liste

| # | Screen | Inhalt |
|---|---|---|
| 1 | Login | Google-Button, kurzer Claim |
| 2 | Onboarding (einmalig) | 3 Slides + erstes Buch anlegen + Erinnerungszeit wählen |
| 3 | Heute (Dashboard) | siehe 6.8 |
| 4 | Eintrag erstellen/bearbeiten | 3-Feld-Kette + Zusatzfelder |
| 5 | Bücher-Liste | Aktive / geplante / beendete Bücher |
| 6 | Buch-Detail | Metadaten, Einträge, Fortschritt, Fazit |
| 7 | Archiv | Liste, Suche, Filter |
| 8 | Eintrags-Detail | Vollansicht + Aktionen |
| 9 | To-dos | Heute / Offen / Vorsätze / Erledigt |
| 10 | Wochenreview | Geführter Ablauf, mehrstufig |
| 11 | Review-Detail | Gespeichertes Review |
| 12 | Statistiken (V2) | Charts: Einträge/Woche, Umsetzungsquote, Top-Tags |
| 13 | Einstellungen | Erinnerungen, Leitfragen, Theme, Export, Account löschen |

### 7.3 Gestaltungsrichtung

- **Ruhig, textzentriert, „abendtauglich"**: Dark Mode als Standard, warme Akzentfarbe, hoher Zeilenabstand, gut lesbare Serifenlose für UI und optional Serifenschrift für Eintragstexte.
- Keine Gamification-Effekte wie Konfetti oder Badges – das Produkt soll sich erwachsen anfühlen.
- Große Touch-Ziele (min. 44 px), Bedienung mit einer Hand.
- Respektierung von `env(safe-area-inset-*)` für Notch und Home-Indikator.
- Da die App inhaltlich schlicht ist, trägt die **Typografie** die Gestaltung. Klare Hierarchie zwischen den drei Feldern eines Eintrags, großzügiger Weißraum, wenige Farben.

---

## 8. Technische Architektur

### 8.1 Überblick

Ohne KI-Proxy ist die Architektur radikal einfacher: **reine Client-App plus Firebase. Kein selbst geschriebener Servercode, keine Secrets, kein Deployment außerhalb von Firebase Hosting.**

```
┌────────────────────────────────────────────────────────────┐
│  iPhone – Safari / Home-Screen-PWA                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React (Vite) + TypeScript                           │  │
│  │  UI · State (Zustand/Context) · Router               │  │
│  │  Firebase SDK (Auth, Firestore mit Offline-Cache)    │  │
│  │  Service Worker (Workbox) · Web App Manifest         │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────┬─────────────────────────────────┘
                           │ Auth + Firestore (direkt, TLS)
                           ▼
              ┌────────────────────────┐
              │  Firebase (Spark-Plan) │
              │  • Authentication      │
              │  • Cloud Firestore     │
              │  • Hosting (CDN)       │
              └────────────────────────┘
```

**Konsequenzen dieser Vereinfachung:**
- Firebase bleibt dauerhaft auf dem **kostenlosen Spark-Plan** – kein Blaze, kein hinterlegtes Zahlungsmittel, kein Kostenrisiko.
- Keine API-Keys, die geschützt werden müssten → Kapitel „Sicherheit" reduziert sich auf Firestore Rules.
- Keine CORS-, Rate-Limit- oder Budget-Logik.
- Die App ist vollständig offline nutzbar; es gibt keine Funktion mehr, die zwingend online sein muss (außer Sync und Login).

### 8.2 Technologieentscheidungen

| Bereich | Wahl | Begründung |
|---|---|---|
| Framework | **React + TypeScript + Vite** | Größter Wissensfundus für Claude Code, schnelle Builds, `vite-plugin-pwa` liefert Manifest + Service Worker |
| Styling | **Tailwind CSS** | Schnell, konsistent, gut promptbar |
| State | **Zustand** oder React Context | Kein Redux-Overhead für ein Ein-Nutzer-Projekt |
| Datenbank | **Cloud Firestore** | Realtime-Sync, Offline-Persistenz out of the box, großzügiges Gratiskontingent |
| Auth | **Firebase Auth / Google** | Wunschanforderung, minimaler Aufwand |
| Hosting | **Firebase Hosting** | Kostenlos, HTTPS, PWA-tauglich, gleiche Konsole |
| Charts (V2) | **Recharts** | Leichtgewichtig |
| Suche | Clientseitig (Fuse.js über den Firestore-Cache) | Firestore kann keine Volltextsuche |
| Backend | **keins** | Alle Funktionen laufen im Client |

### 8.3 Offline-Strategie

- **Firestore-Offline-Persistenz** aktivieren (IndexedDB). Schreibvorgänge werden lokal gepuffert und bei Verbindung synchronisiert.
- **Service Worker** cached die App-Shell (Precaching) → Start ohne Netz.
- Sichtbarer Offline-Indikator in der Kopfzeile.
- Konfliktstrategie: Last-Write-Wins genügt bei einem Nutzer mit wenigen Geräten.

### 8.4 Projektstruktur (Vorschlag)

```
src/
  app/            Router, Layout, Providers, Theme
  features/
    auth/         Login, Guard, useAuth
    books/        Liste, Detail, Formular, Hooks
    entries/      Formular, Detail, Liste, Entwurfs-Logik
    todos/        Listen, Item, Hooks
    reviews/      Wochenreview-Flow
    archive/      Suche, Filter, Gruppierung
    stats/        Dashboard-Widgets (V2)
  lib/
    firebase.ts   Initialisierung
    firestore/    typisierte Repository-Funktionen
    search.ts     clientseitige Suche
    dates.ts      Wochen-IDs, Zeitzonenlogik
    export.ts     JSON-/Markdown-Export
  components/     UI-Primitives (Button, Sheet, Input, Card)
  types/          Gemeinsame TypeScript-Typen
```

---

## 9. Datenmodell (Firestore)

Alle Nutzerdaten liegen unter `users/{uid}/…`. Das macht die Security Rules trivial und die Mandantentrennung wasserdicht.

```
users/{uid}
  ├─ (Dokumentfelder) displayName, email, photoURL, createdAt,
  │   settings: { theme, reminderTime, reviewDay, reviewQuestions[], locale }
  │   stats: { currentStreakWeeks, longestStreakWeeks, totalEntries }
  │
  ├─ books/{bookId}
  │     title, author, isbn?, coverUrl?, status, totalPages?, currentPage?,
  │     startedAt?, finishedAt?, rating?, tags[], summary?, isActive,
  │     createdAt, updatedAt
  │
  ├─ entries/{entryId}
  │     type: "insight" | "book_summary"
  │     bookId?, bookTitle (denormalisiert für Listen ohne Zusatz-Read)
  │     learning        (Pflicht)  Was habe ich gelernt
  │     meaning         (Pflicht)  Was bedeutet das für mich
  │     action          (Pflicht)  Was mache ich konkret anders
  │     quote?, pageFrom?, pageTo?
  │     openQuestion?   (V2, siehe 2.3)
  │     tags[], importance (1–3)
  │     keywords[]      (normalisiert, klein, für Filter/Suche)
  │     todoIds[]
  │     nextReviewAt?, reviewCount, reviewHistory[]
  │     createdAt, updatedAt, dayKey "2026-08-11", weekKey "2026-W33"
  │
  ├─ todos/{todoId}
  │     title, notes?, kind: "daily" | "principle"
  │     sourceEntryId?, bookId?
  │     dueDate?, status: "open" | "done" | "dropped"
  │     doneAt?, postponedCount
  │     principleScores[]   { weekKey, score 0–3 }
  │     createdAt, updatedAt
  │
  └─ reviews/{weekKey}          z. B. "2026-W33"
        weekStart, weekEnd
        topInsightIds[]
        implemented, notImplemented, obstacles, patterns, focusNextWeek
        principleRatings[]
        entryCount, todoDoneCount, todoTotalCount
        completedAt, createdAt
```

*Entfallen gegenüber V1.0: die Collections `chats/{chatId}/messages` und `usage/{yyyy-MM}` sowie die Settings-Felder `aiProvider` und `aiDailyLimit`.*

**Bewusste Denormalisierung:** `bookTitle` liegt redundant im Eintrag, damit Archivlisten ohne zusätzliche Lesevorgänge gerendert werden können. Bei Titeländerung erfolgt ein Batch-Update – seltener Fall, günstiger Kompromiss.

**Indizes:** Composite-Indizes für `entries` nach (`bookId`, `createdAt desc`), (`tags array-contains`, `createdAt desc`), (`nextReviewAt asc`) und für `todos` nach (`status`, `dueDate`).

---

## 10. Sicherheit & Firestore Rules

**Grundregel:** Ein Nutzer darf ausschließlich auf seinen eigenen Teilbaum zugreifen.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

Ergänzend im Feinschliff:
- Validierung, dass Pflichtfelder (`learning`, `meaning`, `action`) vorhanden und Strings längenbegrenzt sind (schützt vor versehentlichem Aufblähen)
- **Firebase App Check** (optional) gegen automatisierten Fremdzugriff

Da es keinen API-Key und keinen eigenen Endpunkt mehr gibt, entfallen Secret-Management, Token-Verifikation im Proxy, CORS-Konfiguration und serverseitige Nutzungslimits vollständig.

---

## 11. iOS-PWA-Spezifika

Das ist der Bereich, in dem PWAs auf dem iPhone scheitern, wenn man ihn ignoriert.

| Thema | Anforderung |
|---|---|
| **Installation** | Safari → Teilen → „Zum Home-Bildschirm". Es gibt keinen Installations-Prompt wie unter Android → in der App eine dezente Anleitung anzeigen (nur wenn nicht im Standalone-Modus) |
| **Manifest** | `display: "standalone"`, `theme_color`, `background_color`, Icons in 192/512 px, Apple-Touch-Icon separat, `apple-mobile-web-app-status-bar-style` |
| **Splashscreen** | iOS erzeugt keinen automatisch – Startup-Images ergänzen, sonst weißer Blitz beim Start |
| **Safe Areas** | `viewport-fit=cover` + `env(safe-area-inset-bottom)` für die Tab-Bar |
| **Login** | `signInWithRedirect` statt Popup (siehe 6.1) |
| **Push-Nachrichten** | Ab iOS 16.4 möglich, **aber nur für zum Home-Bildschirm hinzugefügte PWAs** und nur nach Berechtigung aus einer echten Nutzerinteraktion heraus. Deshalb V2, mit lokalem Fallback (In-App-Hinweis) |
| **Speicher-Eviction** | Safari räumt Website-Daten nach längerer Inaktivität auf. Da Firestore die Cloud als Quelle der Wahrheit nutzt, ist das kein Datenverlust – der lokale Entwurf im `localStorage` könnte jedoch betroffen sein. Deshalb Entwürfe zusätzlich früh nach Firestore schreiben |
| **Hintergrundprozesse** | Background Sync ist auf iOS unzuverlässig → keine Logik darauf aufbauen; Wiedervorlage-Prüfung beim App-Start |
| **Eingabefelder** | Schriftgröße ≥ 16 px, sonst zoomt Safari beim Fokus |
| **Scroll-Verhalten** | Overscroll/Bounce in der App-Shell unterbinden, damit es sich nativ anfühlt |

---

## 12. Datenschutz & DSGVO

Auch bei privater Nutzung sinnvoll, zwingend bei Veröffentlichung:

- **Datensparsamkeit:** nur `uid`, E-Mail, Anzeigename und Profilbild-URL aus Google; keine Kontakte, kein Kalender
- **Serverstandort:** Firestore-Region beim Anlegen bewusst auf `eur3` oder `europe-west3` (Frankfurt) setzen – **später nicht mehr änderbar**, das ist eine der wenigen unumkehrbaren Entscheidungen im Setup
- **Kein Drittlandtransfer von Inhalten:** Ohne KI-Anbieter verlassen die Einträge die Firebase-Umgebung überhaupt nicht mehr. Das war in V1.0 der heikelste Punkt der Datenschutzerklärung und ist jetzt ersatzlos entfallen – bei einem persönlichen Reflexionstagebuch ein spürbarer Gewinn.
- **Betroffenenrechte:** Export (Art. 20) und vollständige Löschung inklusive aller Subcollections (Art. 17) als Funktionen in den Einstellungen
- **Analytics:** in V1 bewusst weglassen – spart Cookie-Banner und Rechtsfragen komplett

---

## 13. Kostenübersicht

**Vorgabe: Es darf beim Bau und Betrieb der App kein Geld ausgegeben werden.** Mit dem Wegfall der KI ist das ohne Einschränkung erfüllt.

| Position | V1 (Eigennutzung) | Bei ~100 Nutzern |
|---|---|---|
| Firebase Hosting | 0 € (Spark) | 0 € |
| Firebase Auth | 0 € (bis 50.000 aktive Nutzer/Monat) | 0 € |
| Firestore | 0 € (weit unter den Tageskontingenten) | 0–5 € |
| Domain (optional) | 0 € (`*.web.app`) bzw. ~12 €/Jahr | dito |
| **Gesamt** | **0 €** | **≈ 0 €** |

**Wichtig:** Es wird **kein Zahlungsmittel hinterlegt** und der **Spark-Plan** nicht verlassen. Damit ist ein unerwarteter Kostenausschlag technisch ausgeschlossen – bei Überschreiten der Kontingente wird gedrosselt, nicht abgerechnet.

*Hinweis: Cloud Storage (Dateiuploads) ist seit Februar 2026 nicht mehr im Spark-Plan enthalten. Deshalb werden Buchcover als externe URL referenziert, nicht hochgeladen. OCR und Foto-Uploads (V3) wären der Punkt, an dem Blaze relevant würde – bewusst nach hinten geschoben. Da sich Firebase-Kontingente ändern können, beim Setup einmal die aktuellen Limits prüfen.*

---

## 14. Roadmap, Risiken & offene Entscheidungen

### 14.1 Umsetzungsreihenfolge (für den späteren Claude-Code-Prompt)

| Phase | Inhalt | Ergebnis |
|---|---|---|
| **0. Setup** | Vite + React + TS + Tailwind, Firebase-Projekt (Region Europa!), PWA-Plugin, Deployment | App startet und ist auf dem iPhone installierbar |
| **1. Design-System** | Farben, Typografie, Spacing, UI-Primitives (Button, Card, Input, Sheet), Dark Mode | Alle folgenden Screens sehen automatisch stimmig aus |
| **2. Auth** | Google-Login per Redirect, Auth-Guard, Nutzerdokument | Login funktioniert im Standalone-Modus |
| **3. Bücher** | CRUD, aktives Buch | Grundgerüst der Datenhaltung steht |
| **4. Einträge** | Formular, Entwurfsspeicherung, Liste, Detail | Kernnutzen erlebbar |
| **5. To-dos** | Erstellung aus Einträgen, Heute-Ansicht, Abhaken | Wirkkreislauf geschlossen |
| **6. Archiv** | Filter, clientseitige Suche, Gruppierungen | Wissensspeicher nutzbar |
| **7. Wochenreview** | Geführter Ablauf mit Vorbefüllung | Zweite Reflexionsstufe |
| **8. Feinschliff** | Offline, Safe Areas, Export, Leerzustände, Onboarding | Alltagstauglich |
| **9. V2** | Wiedervorlage, Push, Statistiken | Langzeitwirkung |

*Gegenüber V1.0 entfallen die früheren Phasen 7 (KI-Proxy) und 8 (Coach-UI). Neu ist Phase 1 (Design-System), die vorher implizit war – da die App ohne KI stärker über Gestaltung und Ruhe wirkt, lohnt sich der eigene Schritt.*

### 14.2 Risiken

| Risiko | Wirkung | Gegenmaßnahme |
|---|---|---|
| Gewohnheit bricht nach 2 Wochen ab | App wird nutzlos | Extrem niedrige Einstiegshürde, Wochen- statt Tagesstreak, milde Erinnerungen |
| Archiv wird nie wieder geöffnet | Kernnutzen verpufft | Wiedervorlage (früh umsetzen!), gute Suche, Gruppierung nach Buch |
| App fühlt sich „zu simpel" an | Wird durch Notes/Notion ersetzt | Qualität liegt in der Struktur und im Design, nicht im Funktionsumfang – Gestaltung ernst nehmen |
| iOS-Eigenheiten (Login, Push, Speicher) | Frust im Alltag | Kapitel 11 als Checkliste vor dem Release abarbeiten |
| Überfrachtung durch Feature-Wünsche | Projekt wird nie fertig | Strikte V1-Grenze, alles andere in V2/V3 |

### 14.3 Offene Entscheidungen vor dem Claude-Code-Prompt

1. **Name der App** (bestimmt Manifest, Titel, Ordnernamen)
2. **Bestätigung der Abendstrategen-Mechanik** – gibt es dort Elemente, die du 1:1 übernehmen willst?
3. **Leitfragen des Wochenreviews** – Vorschläge aus 6.5 übernehmen oder eigene?
4. **Farbwelt / Typografie** – gibt es eine Richtung, die dir gefällt?
5. **Sprache der Oberfläche:** nur Deutsch oder von Anfang an vorbereitet für Englisch?
6. **Wiedervorlage (6.7) schon in V1 oder erst V2?**

---

## 15. Was sich gegenüber Version 1.0 geändert hat

### 15.1 Ersatzlos gestrichen

| Bereich | Was entfällt |
|---|---|
| Features | KI-Coach-Chat (alle drei Einstiegspunkte), KI-Wochensynthese, automatische Themen-Cluster, „Frage dazu an die KI" im Archiv, KI-Button im Eintragsformular |
| Screens | Coach/Chat-Screen, Kontext-Chips, Übernahme von KI-Antworten in Einträge → Tab-Bar von 5 auf 4 Einträge reduziert |
| Architektur | KI-Proxy (Cloud Function bzw. Cloudflare Worker), Provider-Adapter, ID-Token-Verifikation, CORS-Konfiguration, Secret-Management |
| Datenmodell | Collections `chats` und `usage`, Settings-Felder `aiProvider`, `aiDailyLimit` |
| Kapitel | Das komplette Kapitel „KI-Assistent: Anbieter-, Kosten- und Umgehungsanalyse" inkl. Kostenrechnung, Anbietervergleich und Kostenkontroll-Maßnahmen |
| Roadmap | Phasen „KI-Proxy" und „Coach-UI" |
| Datenschutz | Abschnitte zu Drittlandtransfer und Modelltraining |

### 15.2 Was dadurch besser wird

1. **Kosten sind exakt 0 €** – kein Zahlungsmittel, kein Blaze-Plan, kein Budget-Alert, kein Restrisiko.
2. **Kein Backend.** Die App besteht nur noch aus Client-Code und Firebase-Konfiguration. Das verkürzt den Implementierungs-Prompt spürbar und halbiert grob die Fehlerquellen.
3. **Datenschutz vereinfacht sich radikal.** Persönliche Reflexionen verlassen die eigene Firebase-Instanz nicht.
4. **Der Fokus schärft sich.** Die App macht jetzt eine Sache: gelesenes Wissen in überprüfte Handlung überführen.

### 15.3 Was kompensiert werden muss

| Wegfall | Kompensation |
|---|---|
| KI hält das Archiv lebendig | **Wiedervorlage (6.7) früher und prominenter** – idealerweise schon V1 |
| KI-Musteranalyse im Wochenreview | Frage 4 („Welches Muster erkenne ich?") plus automatische Anzeige der Top-Tags und Bücher der Woche (reine Berechnung) |
| KI beantwortet Verständnisfragen | Bewusst außerhalb der App (ChatGPT/Claude direkt). Optional V2: Feld „offene Frage" mit Sammlung im Wochenreview |

---

*Ende des Konzepts. Nächster Schritt: Ableitung eines strukturierten Implementierungs-Prompts für Claude Code auf Basis der Phasen aus Kapitel 14.1.*

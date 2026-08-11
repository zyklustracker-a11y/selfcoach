# Entscheidungen

Ein Eintrag pro Entscheidung. Datum · Phase · Worum es ging · Gewählt · Warum · Dagegen sprach.

Reihenfolge des Maßstabs: `CLAUDE.md` → Produktkonzept → `DESIGN.md` → eigenes Urteil.

---

## Phase 0–4 (rückwirkend protokolliert, 11.08.2026)

### Schriften selbst hosten statt Google Fonts
`DESIGN.md` bindet die Schriften über Google Fonts ein, § 2 von `CLAUDE.md` verbietet externe
Dienste außer Firebase. Gewählt: `@fontsource`, im Bundle. Dagegen sprach die Bundle-Größe;
dafür sprach, dass die App offline laufen muss und sonst bei jedem Start Text flackert.
Zusätzlich nur Latin-Subsets, weil der Service Worker sonst 1,9 MB statt 834 KB vorlädt.

### `authDomain` ist die Auslieferungsdomain
Die Konsole schlägt `*.firebaseapp.com` vor. Gewählt: `readcoach-29227.web.app`, also dieselbe
Domain, von der die App kommt. Grund: `signInWithRedirect` überlebt Safaris Tracking-Schutz nur
same-origin. Dagegen sprach, dass daraus zwei Folgeprobleme entstanden — der Service Worker
verschluckte `/__/auth/handler` (gelöst per `navigateFallbackDenylist`) und der OAuth-Client
brauchte die URI von Hand (steht in `CLAUDE.md`).

### Firestore Rules ohne rekursiven Platzhalter
Konzept 10 schlägt `/users/{userId}/{document=**}` vor. Gewählt: eine Regel je Collection.
Grund: Der Platzhalter greift auch für `/books` und erlaubt dort ungeprüfte Schreibzugriffe,
weil Regelergebnisse verodert werden. Dagegen spricht, dass jede neue Collection eine eigene
Regel braucht — das ist hier ein Vorteil, weil Unbekanntes gesperrt bleibt.

### Kein `books.rating`, keine `importance`
Der Nutzer hat „keine Bewertungsskalen" als Entscheidung gesetzt und spätere Rücknahmen
zurückgezogen. Gewählt: beide Felder entfallen. Dagegen sprach, dass Konzept 6.7 die
Wichtigkeit als Auslöser der Wiedervorlage nutzt — Ersatz ist „jeder Eintrag".

### Start- und Enddatum am Buch folgen dem Status
Konzept 6.2 listet beide als Felder. Gewählt: nicht im Formular, sondern automatisch beim
Statuswechsel gesetzt. Grund: zwei Felder weniger, und sie können dem Status nicht mehr
widersprechen. Dagegen spricht, dass man ein rückwirkendes Startdatum nicht eintragen kann.

### Aktives Buch wird nicht automatisch übernommen
Beim Anlegen eines zweiten Buchs mit Status „Lese ich" behält das erste die Markierung.
Grund: „Ich lese jetzt auch B" ist nicht dasselbe wie „B ist mein Fokus". Dagegen spricht ein
zusätzlicher Tap, wenn man doch wechseln will.

### Entwürfe nur im `localStorage`
Konzept 11 will Entwürfe „zusätzlich früh nach Firestore schreiben". Gewählt: nur lokal.
Grund: Ein halbfertiger Eintrag hat kein `action` und wird von den Pflichtfeld-Rules
abgewiesen; eine eigene `drafts`-Collection steht nicht im Datenmodell. Dagegen spricht, dass
Safari den `localStorage` räumen kann — abgefedert durch Speichern bei `pagehide`.

### `dayKey`/`weekKey` bleiben beim Bearbeiten stehen
Gewählt: beide Schlüssel hängen am Erstelldatum, nicht am letzten Bearbeiten. Grund: Sonst
wandert ein korrigierter Eintrag in ein anderes Wochenreview. Dagegen spricht nichts
Erkennbares.

### `nextReviewAt` schon in Phase 4 setzen
Die Rückblende kommt erst in Phase 9. Gewählt: das Feld trotzdem beim Anlegen füllen.
Grund: spart eine nachträgliche Befüllung aller inzwischen entstandenen Einträge.
Dagegen spricht, dass ein Feld eine Weile ohne Logik dasteht.

### Speichern-Knopf auch in der Kopfzeile
Gewählt: Aktionszeile oben (Abbrechen · Speichern) statt Bildschirmtitel, wie in Mockup 2a.
Grund: Ohne ihn muss man zum Speichern an den Zusatzfeldern vorbeiscrollen, was dem
90-Sekunden-Ziel widerspricht. Dagegen spricht `DESIGN.md`-Prosaregel 5 („eine Handlung pro
Screen") — das Mockup zeigt beide, deshalb gewinnt es hier.

### Zentrierte Spalte auf großen Bildschirmen
`DESIGN.md` beschreibt nur 390 px. Gewählt: Shell auf 440 px begrenzt, mittig. Grund: Konzept 1
nennt iPad und Desktop als Ziele, und volle Fensterbreite zerreißt das Layout. 440 px ist das
breiteste iPhone, also wird nie ein Telefon beschnitten.

---

## Phase 5 — To-dos (11.08.2026)

### Kein `todoIds[]` am Eintrag
Konzept 9 führt `entries.todoIds[]` **und** `todos.sourceEntryId`. Gewählt: nur die Referenz
am To-do. Grund: Zwei Richtungen müssten bei jedem Anlegen und Löschen synchron gehalten
werden, ohne Transaktion über zwei Collections. Die Liste der abgeleiteten To-dos entsteht
clientseitig aus dem Cache. Dagegen spricht ein Filter im Archiv, der ohne Join auskommen
müsste — der läuft ohnehin clientseitig (Konzept 6.6).

### Vorsätze haben kein Fälligkeitsdatum und keine Checkbox
Gewählt: `principle` bekommt `dueDate: null` und wird in der Liste ohne Kästchen gezeigt.
Grund: Konzept 6.4 sagt ausdrücklich „wird bewertet statt abgehakt". Die Rules erzwingen es.
Dagegen spricht, dass man einen Vorsatz nicht „erledigen" kann — genau das ist beabsichtigt.

### Übertrag erscheint nur in der Heute-Ansicht
Offene Tages-To-dos aus der Vergangenheit stehen als eigener Block „Von gestern" über der
Heute-Liste, mit genau zwei Knöpfen. Grund: Konzept 6.4 verlangt eine Entscheidung statt
stiller Anhäufung; ein eigener Screen dafür wäre zu viel. Dagegen spricht, dass der Block bei
vielen Altlasten lang wird.

### Datum kommt aus `dayKey`, nicht aus einem Zeitstempel
`todos.dueDate` ist ein `YYYY-MM-DD`-String wie bei den Einträgen. Grund: Vergleich und
Gruppierung ohne Zeitzonenlogik, und „heute" ist der lokale Tag des Nutzers. Dagegen spricht,
dass sich damit keine Uhrzeit ausdrücken lässt — die braucht das Konzept nicht.

---

## Phase 6 — Archiv und Suche (11.08.2026)

### Review speichert seine Fragen mit
Konzept 9 sieht fünf feste Feldnamen vor (`implemented`, `obstacles`, …). Gewählt:
`questions[]` und `answers[]` gleicher Länge. Grund: Die Leitfragen sind in den Einstellungen
editierbar (Konzept 6.5); mit festen Feldern stünde über einer alten Antwort später eine
andere Frage. Dagegen spricht, dass man nicht mehr gezielt nach „allen Hindernissen" abfragen
kann — bei einem Nutzer ohne Auswertung kein Verlust.

### Unterbrochenes Review liegt in Firestore, nicht im `localStorage`
Gewählt: `reviews/{weekKey}` mit `completedAt: null` als Zwischenstand, bei jedem Schritt
geschrieben. Grund: Die Dokument-ID ist die Woche, also überschreibt jeder Schritt denselben
Datensatz; der Stand übersteht Speicherräumung und einen Gerätewechsel. Dagegen spricht ein
Schreibvorgang pro Schritt — bei fünf Fragen pro Woche irrelevant.

### Suchindex hängt an den Einträgen, nicht am Suchbegriff
Gewählt: Fuse-Index in `useMemo` über `entries`, Suchbegriff zusätzlich über
`useDeferredValue` entkoppelt. Grund: Der Index darf nicht bei jedem Tastendruck neu entstehen.
Dagegen spricht nichts; die Alternative wäre ein manuelles Debounce mit eigenem Timer.

### Umsetzungsfilter zählt Einträge ohne To-do als „offen"
Ein Eintrag ohne abgeleitetes To-do erscheint unter „Nur offene", nicht unter „Nur umgesetzte".
Grund: Er ist nachweislich nicht umgesetzt worden. Dagegen spricht, dass reine Notizen ohne
Handlungsabsicht die Liste füllen — die gibt es hier aber nicht, `action` ist Pflicht.

### Zitatansicht zeigt das Zitat, nicht den Eintrag
Gewählt: In „Zitate" steht das Zitat groß und kursiv mit Buch und Seite darunter, statt der
üblichen Eintragszeile. Grund: Wer Zitate durchsieht, sucht den Wortlaut. Dagegen spricht ein
Bruch mit dem sonst einheitlichen Listenbild.

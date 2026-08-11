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

---

## Phase 7 — Wochenreview (11.08.2026)

### Frage 1 ist eine Auswahl, die übrigen sind Freitext
Gewählt: Schritt 1 zeigt die Wocheneinträge zum Antippen und speichert `topInsightIds[]`;
Schritte 2–5 sind Textfelder. Grund: Konzept 6.5 formuliert Frage 1 ausdrücklich als „Auswahl
aus den Wocheneinträgen". Dagegen spricht, dass „Leitfragen bearbeiten" (Phase 8) damit nur
für die Fragen 2–5 sinnvoll ist — genau so ist es umgesetzt.

### Kein eigener Bewertungsschritt für Vorsätze
Konzept 6.5 hat als Frage 6 die 0–3-Bewertung. Die Skala ist gestrichen (`CLAUDE.md` 7.1).
Gewählt: Die offenen Vorsätze werden im letzten Schritt **angezeigt**, aber nicht bewertet.
Grund: Der Nutzer soll sie beim Formulieren des Wochenfokus vor Augen haben. Dagegen spricht,
dass damit keine Umsetzungsquote für Vorsätze entsteht — gewollt, siehe „kein Score".

### Jeder Schritt schreibt, nicht nur der letzte
Gewählt: `saveReview` bei jedem „Weiter" und bei „Später". Grund: Konzept verlangt
Unterbrechbarkeit; ein Schreibvorgang pro Frage ist bei fünf Fragen pro Woche vernachlässigbar.
Dagegen spricht, dass ein abgebrochenes Review als unvollständiges Dokument liegen bleibt —
es taucht deshalb nicht im Archiv auf, sondern nur als „Weitermachen".

### Reviewkarte ist die eine erlaubte Akzentfläche
`DESIGN.md` erlaubt neben dem FAB genau eine akzentgetönte Fläche, und nennt die
Wochenreview-Karte als diese Ausnahme. Gewählt: `bg-accent-quiet`, ab Samstag, sonntags mit
„Sonntag" statt „Wochenreview" beschriftet. Dagegen spricht nichts.

---

## Phase 8 — Feinschliff (11.08.2026)

### Kein Erinnerungszeit-Schritt im Onboarding
Konzept 7.2 nennt für das Onboarding „3 Slides + erstes Buch + Erinnerungszeit wählen".
Gewählt: drei Slides und das erste Buch, keine Erinnerungszeit. Grund: Erinnerungen sind
gestrichen (`CLAUDE.md` 7.1), und nach einer Uhrzeit zu fragen, an der nichts passiert, ist
eine Lüge im ersten Bildschirm. Dagegen spricht nichts.

### Kontolöschung: erst Daten, dann Konto
Gewählt: Alle Subcollections in Blöcken zu 400 löschen, dann das Nutzerdokument, dann
`user.delete()`. Bei `auth/requires-recent-login` bleibt eine Meldung stehen, die zum
Neuanmelden auffordert. Grund: Ohne Servercode gibt es kein rekursives Löschen; ein
Neuanmelde-Redirect mitten im Löschvorgang wäre fragiler als der zweite Anlauf. Dagegen
spricht, dass zwischen Datenlöschung und Kontolöschung ein Zustand existiert, in dem das Konto
ohne Daten dasteht — vom Nutzer als „nicht atomar" akzeptiert.

### Export über die Teilen-Ansicht, mit Download als Rückfall
Gewählt: `navigator.share` mit Datei, wenn verfügbar, sonst ein Download-Link. Grund: iOS
Safari kann Dateien nicht einfach herunterladen; die Teilen-Ansicht ist dort der native Weg.
Dagegen spricht ein Codepfad mehr.

### Offline-Anzeige stützt sich auf `navigator.onLine`
Gewählt: der Browserzustand, nicht ein Firestore-Verbindungstest. Grund: Firestore hat keinen
öffentlichen Verbindungsstatus, und ein selbstgebauter Ping wäre eine Behauptung mehr, die
falsch sein kann. Dagegen spricht, dass „online" nicht heißt, dass Firestore erreichbar ist —
deshalb ist der Text ein Hinweis, kein Versprechen.

### `/styleguide` bleibt, aber unverlinkt
Gewählt: Route behalten, nirgends in der Oberfläche verlinken. Grund: Sie ist beim
Weiterbauen nützlich und kostet im Bundle fast nichts. Dagegen spricht, dass sie öffentlich
erreichbar ist — sie zeigt keine Daten, nur Bausteine.

### Diagnosezeile am Login wieder entfernt
Sie hat ihren Zweck erfüllt (`auth/api-key-not-valid` sichtbar gemacht) und ist jetzt raus.
Grund: Fehlercodes gehören nicht in eine Oberfläche, die abends im Bett benutzt wird.
Dagegen spricht, dass die nächste Login-Störung wieder schwerer zu diagnostizieren ist.

---

## Phase 9 — Wiedervorlage (11.08.2026)

### Nach 90 Tagen ist Schluss
Konzept 6.7 nennt 7, 30 und 90 Tage, sagt aber nicht, was danach kommt. Gewählt: Nach der
dritten Rückblende wird `nextReviewAt` auf `null` gesetzt, der Eintrag meldet sich nicht mehr
von selbst. Grund: Wer einen Vorsatz über ein Jahr dreimal bestätigt hat, braucht die Frage
nicht mehr; endlose Wiedervorlage würde den Heute-Screen mit alten Karten verstopfen.
Dagegen spricht, dass sehr alte Erkenntnisse irgendwann ganz verschwinden — sie bleiben im
Archiv und in der Suche.

### „Erneut vornehmen" beginnt wieder bei 7 Tagen
Gewählt: `reviewCount` zurück auf 0. Grund: Sich etwas neu vorzunehmen heißt anfangen, nicht
fortsetzen — und dann ist die kurze Schlaufe die richtige. Dagegen spricht, dass ein oft
erneuertes Vorhaben häufig auftaucht; genau das ist der Punkt.

### Genau eine Rückblende pro Tag
Gewählt: Der Heute-Screen zeigt nur die älteste fällige Karte. Grund: Drei Karten
gleichzeitig sind eine Warteschlange zum Abarbeiten, keine Frage zum Nachdenken — und
`DESIGN.md` erlaubt ohnehin nur eine Karte. Dagegen spricht, dass sich bei längerer Abwesenheit
ein Rückstand bildet; er wird Tag für Tag abgebaut, älteste zuerst.

### Einträge von heute lösen keine Rückblende aus
Ein Eintrag mit `dayKey` von heute wird übersprungen, auch wenn `nextReviewAt` fällig wäre
(passiert nur bei manipulierten Daten). Grund: Sich selbst am selben Tag zu fragen, ob man das
noch lebt, ist unsinnig.

---

## Abschlussdurchgang (11.08.2026)

### Wochenstreak nachgebaut
Beim Konzeptabgleich fehlte die Streak-Anzeige aus 6.8. Gewählt: Wochen in Folge mit
mindestens einem Eintrag, in `text-muted` neben dem Datum. Die laufende Woche zählt erst, wenn
sie einen Eintrag hat — sonst sähe Montagfrüh jede Serie gerissen aus. Sieben Fälle geprüft.
Dagegen spricht nichts; ein Tagesstreak wäre der Fehler gewesen, nicht dieser.

### Abgehakte Tagesaufgaben bleiben bis Tagesende stehen
Ursprünglich verschwand ein To-do sofort aus „Heute". Gewählt: Es bleibt durchgestrichen
sichtbar. Grund: Ohne Rückmeldung fühlt sich der Klick wie ein Fehler an, und der von
`DESIGN.md` beschriebene Erledigt-Zustand bekäme man sonst nie zu Gesicht. Dagegen spricht eine
etwas längere Liste gegen Abend.

### Fehler gefunden: Wochenreview verlor Antworten beim Neuladen
Der Formularzustand wurde beim Mounten aus `current` gefüllt — das ist beim Kaltstart aber noch
`null`, weil der Provider lädt. Nach einem Neustart stand das Formular leer da, und der nächste
Schritt hätte die gespeicherten Antworten mit Leerstrings überschrieben. Behoben: Der Zustand
wird übernommen, sobald das Review eintrifft, und vorher wird nicht geschrieben.
**Falsche Annahme meinerseits:** Ich hatte angenommen, der Initialwert eines `useState` sehe
bereits geladene Daten. Bei asynchronen Providern gilt das nie.

# Testplan für das iPhone

Was hier steht, konnte in der Entwicklungsumgebung **nicht** geprüft werden: kein iPhone,
kein Standalone-Modus, kein echter Google-Redirect, kein Safari-Speicherverhalten.
Alles andere ist gegen die Firebase-Emulatoren automatisiert durchgelaufen.

Vorbereitung: `npm run deploy:rules`, dann `npm run deploy`. App vom Home-Bildschirm löschen,
`readcoach-29227.web.app` in Safari öffnen, *Teilen → Zum Home-Bildschirm*, und **von dort**
starten. Der Safari-Tab prüft den Standalone-Modus nicht.

---

## Phase 0+1 — Installation und Design

| # | Schritt | Erwartet |
|---|---|---|
| 1 | App vom Home-Bildschirm starten | Startbild in Dunkelbraun `#16130F`, **kein weißer Blitz** |
| 2 | Oben und unten schauen | Kopfzeile unter der Notch, Tab-Bar über dem Home-Indikator |
| 3 | Über den oberen Rand hinausziehen | Kein Gummiband-Effekt der App-Shell |
| 4 | `/styleguide` aufrufen | Serif für Eigenes, Sans für die App, Mono nur für Datum/Zahlen |
| 5 | In ein Textfeld tippen | Safari zoomt **nicht** hinein |

## Phase 2 — Anmeldung

| # | Schritt | Erwartet |
|---|---|---|
| 1 | „Mit Google anmelden" | Googles Kontoauswahl, danach zurück in der App, angemeldet |
| 2 | Firebase-Konsole → Firestore | `users/<uid>` mit `settings` und `stats` existiert |
| 3 | App aus dem App-Switcher wischen, neu starten | Weiterhin angemeldet, kein Login-Screen |
| 4 | Zahnrad → Abmelden → erneut anmelden | Nutzerdokument wird **nicht** überschrieben (`createdAt` unverändert) |

## Phase 3 — Bücher

| # | Schritt | Erwartet |
|---|---|---|
| 1 | Buch anlegen, Status „Lese ich" | Landet in der Liste unter „Lese ich", trägt „Aktiv" |
| 2 | Zweites Buch, ebenfalls „Lese ich" | Das **erste** behält „Aktiv" |
| 3 | Beim zweiten „Als aktives Buch setzen" | Markierung wandert, nur ein Buch trägt sie |
| 4 | Erstes Buch auf „Beendet" setzen | „Aktiv" wandert zum zweiten, „Beendet am" erscheint |
| 5 | Buch löschen | Verschwindet, kein Buch bleibt doppelt aktiv |
| 6 | Flugmodus an, Buch anlegen | Erscheint sofort; nach Netz wieder an ist es in der Konsole |

## Phase 4 — Einträge

| # | Schritt | Erwartet |
|---|---|---|
| 1 | Heute → „+" | Aktives Buch ist bereits gewählt |
| 2 | Nur Feld 01 ausfüllen, speichern | Zwei Fehlermeldungen an 02 und 03, kein Speichern |
| 3 | Alle drei füllen, speichern | Detailansicht mit 01/02/03, Feld 03 am größten |
| 4 | Zurück auf Heute | Eintrag unter „Heute festgehalten", Feld 03 zuerst |
| 5 | Eintrag anfangen, App wegwischen, neu starten, „+" | Text ist wieder da, Hinweis „Angefangener Eintrag wiederhergestellt" |
| 6 | „Entwurf verwerfen" | Felder leer, nach Neustart bleibt es leer |
| 7 | Buch auf „Beendet", dann „Fazit schreiben" | Nur ein Pflichtfeld; danach steht „Fazit ansehen" am Buch |

## Phase 5 — To-dos

| # | Schritt | Erwartet |
|---|---|---|
| 1 | Eintrag anlegen, „To-do daraus erstellen" | Feld 03 steht als Titelvorschlag drin |
| 2 | To-dos → Heute | Das To-do ist da, darunter der Ursprungseintrag als Verweis |
| 3 | Auf den Verweis tippen | Springt zum Eintrag, aus dem es stammt |
| 4 | Abhaken | Wandert nach „Erledigt", mit Zeitstempel |
| 5 | Vorsatz (`principle`) anlegen | Erscheint unter „Vorsätze", nicht unter „Heute" |
| 6 | Am nächsten Tag öffnen (oder Datum am Gerät vorstellen) | Offenes Tages-To-do von gestern wird zur Entscheidung angeboten |
| 7 | „Auf heute schieben" bzw. „Verwerfen" | Verschoben bzw. still weg, kein Anhäufen |

## Phase 6 — Archiv und Suche

| # | Schritt | Erwartet |
|---|---|---|
| 1 | Archiv öffnen | Chronologische Liste, nach Monat gruppiert |
| 2 | Ansicht auf „Nach Buch" / „Nach Tag" / „Zitate" / „Reviews" | Jeweils passende Gruppierung, leere Ansichten sagen das |
| 3 | Suchfeld, mehrere Zeichen schnell tippen | Ergebnisse kommen ohne Ruckeln, auch mit Tippfehler |
| 4 | Filter Buch / Tag / Zeitraum kombinieren | Wirken zusammen, Zurücksetzen räumt alle ab |
| 5 | Filter „nur umgesetzte" | Nur Einträge, deren To-do erledigt ist |
| 6 | Flugmodus, suchen | Suche funktioniert weiter (läuft lokal) |

## Phase 7 — Wochenreview

| # | Schritt | Erwartet |
|---|---|---|
| 1 | Vor Samstag auf Heute schauen | Keine Reviewkarte |
| 2 | Ab Samstag | Karte „Wochenreview starten" mit Anzahl der Einträge |
| 3 | Ablauf starten | Eine Frage pro Schritt, Fortschritt als Striche, keine Vorschau |
| 4 | Bei Frage 1 | Die Einträge dieser Woche zur Auswahl |
| 5 | Bei Frage 4 | Häufigste Tags und Bücher der Woche werden eingeblendet |
| 6 | Mittendrin App schließen und neu öffnen | Weiter an derselben Stelle, mit den bisherigen Antworten |
| 7 | Abschließen, dann Archiv → „Reviews" | Das Review steht dort als eigener Eintragstyp |

## Phase 8 — Feinschliff

| # | Schritt | Erwartet |
|---|---|---|
| 1 | Flugmodus an | Offline-Hinweis in der Kopfzeile, App bleibt bedienbar |
| 2 | Erste Anmeldung mit frischem Konto | Onboarding: drei Seiten, danach erstes Buch anlegen |
| 3 | Zahnrad → Einstellungen | Theme, Leitfragen, Export, Konto löschen |
| 4 | Theme auf Hell | Wechselt sofort, überlebt einen Neustart |
| 5 | Export JSON und Markdown | Datei landet in der Teilen-Ansicht, Inhalt vollständig |
| 6 | Leitfrage ändern, Wochenreview starten | Geänderte Frage erscheint im Ablauf |
| 7 | App **im Safari-Tab** öffnen (nicht installiert) | Installationshinweis erscheint |
| 8 | Dieselbe App vom Home-Bildschirm | Hinweis erscheint **nicht** |
| 9 | Konto löschen | Frischer Login nötig, danach sind alle Daten weg |

## Phase 9 — Wiedervorlage

| # | Schritt | Erwartet |
|---|---|---|
| 1 | Eintrag anlegen, in Firestore `nextReviewAt` auf gestern setzen | Beim nächsten Start erscheint die Rückblende auf Heute |
| 2 | „Ja, läuft" | Karte weg, `nextReviewAt` steht 30 Tage weiter |
| 3 | Bei einem zweiten fälligen Eintrag „Erneut vornehmen" | Intervall beginnt wieder bei 7 Tagen |
| 4 | „Nicht mehr relevant" | Karte weg, `nextReviewAt` ist `null`, kommt nicht wieder |
| 5 | Mehrere gleichzeitig fällig | Nur **eine** Karte, die älteste zuerst |
| 6 | Nach jeder Antwort in Firestore schauen | `reviewHistory` hat einen neuen Eintrag mit Datum und Antwort |
| 7 | Eintrag mit laufendem Vorsatz dreimal mit „Ja, läuft" beantworten | `nextReviewAt` steht danach **weiter** 90 Tage in der Zukunft |
| 8 | Eintrag ohne Vorsatz dreimal mit „Ja, läuft" beantworten | `nextReviewAt` ist danach `null` — er verstummt |

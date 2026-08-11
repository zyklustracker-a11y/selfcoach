# Design-Spezifikation — Selbstcoaching-PWA („Die Seite“, Richtung 1a)

Ziel: iPhone-first PWA, Standalone, Viewport 390 × 844, React + Tailwind.
Haltung: ruhig, textzentriert, erwachsen. Näher am Notizbuch als an einer Produktivitäts-App.
Dark Mode ist der Standard, Light Mode existiert als Ausnahme.
UI-Sprache Deutsch. Keine Gamification, keine Emoji als Designelement, keine Illustrationen.
Alle Farb- und Textkombinationen unten erfüllen WCAG AA (≥ 4.5:1 für Text, ≥ 3:1 für Zustandsränder).

---

## 1. Farbtokens

Funktional benannt. Tailwind: als CSS-Variablen in `:root` / `.dark` definieren und in
`theme.extend.colors` als `bg-base: 'var(--bg-base)'` usw. referenzieren. Kein Farbname im Token.

### Dark (Standard)

| Token | Hex | Verwendung |
|---|---|---|
| bg-base | #16130F | Screen-Hintergrund, Tab-Bar, Bottom-Sheet-Backdrop-Fläche |
| bg-elevated | #1D1A16 | Input, Textarea, Bottom-Sheet, die seltenen Karten |
| bg-hover | #221D18 | gedrückter/aktiver Zustand auf Flächen |
| text-primary | #F2EDE7 | Eintragstext, Titel, Fließtext (14.6:1) |
| text-secondary | #CFC6BC | zweitrangiger Fließtext, Ghost-Button-Label (9.9:1) |
| text-muted | #9A9189 | Labels, Captions, Metadaten, inaktive Tabs (5.3:1) |
| accent | #C97B4A | primäre Aktion, aktiver Tab, Fortschritt, Feld-03-Marker |
| accent-contrast | #17120E | Text/Icon auf accent-Flächen (7.6:1 auf accent) |
| accent-quiet | #241C15 | akzentgetönte Fläche (nur Wochenreview-Hinweis), sparsam |
| border | #262119 | Haarlinien, Trennlinien, Listen-Divider |
| border-strong | #3A342D | Input-Rand, Secondary-Button-Rand, Checkbox-Rand |
| success | #8FA97A | erledigt, gespeichert (6.1:1) |
| danger | #C4655A | Löschen, Fehlertext und Fehlerrand (5.0:1) |
| overlay | rgba(10,8,6,0.72) | Backdrop hinter Bottom-Sheet |

### Light (zweitrangig)

| Token | Hex |
|---|---|
| bg-base | #F7F3ED |
| bg-elevated | #FFFFFF |
| bg-hover | #EFE9E0 |
| text-primary | #1A1714 |
| text-secondary | #423C35 |
| text-muted | #6B635B |
| accent | #A2542A |
| accent-contrast | #FFF8F1 |
| accent-quiet | #F5E7DA |
| border | #E3DCD1 |
| border-strong | #C6BCAE |
| success | #3F6B33 |
| danger | #A33B32 |

Regeln zur Farbe:
- Genau eine Akzentfarbe. Sie markiert Status und die primäre Aktion — nie Dekoration, nie zwei
  Akzentflächen gleichzeitig auf einem Screen (die Wochenreview-Karte am Wochenende ist die
  eine erlaubte Ausnahme neben dem FAB).
- `success` und `danger` erscheinen nur als Text, Rand oder 6-px-Marke, niemals als Vollfläche.
- Fehlende Einträge werden über `text-muted` und Formulierung kommuniziert, nie über `danger`.

---

## 2. Schriften

Alle aus Google Fonts, frei einbindbar.

- **Source Serif 4** (`'Source Serif 4', Georgia, serif`) — Achsen `opsz 8..60`, Weights 300–700,
  italic vorhanden. Trägt alles Inhaltliche: Screen-Titel, Eintragstext, Fragen, Zitate.
- **IBM Plex Sans** (`'IBM Plex Sans', system-ui, sans-serif`) — Weights 400/500/600.
  Alles Funktionale: Buttons, Listenzeilen der UI, Fließtext-Hilfetexte, Tab-Labels.
- **IBM Plex Mono** (`'IBM Plex Mono', monospace`) — Weights 400/500.
  Ausschließlich Metadaten: Datum, Seitenzahl, Zähler, Section-Labels, Zeichenzähler.

Tailwind: `font-serif` → Source Serif 4, `font-sans` → IBM Plex Sans, `font-mono` → IBM Plex Mono.

### Typo-Skala

| Rolle | Familie | Größe / Zeilenhöhe | Weight | Letter-Spacing | Bemerkung |
|---|---|---|---|---|---|
| Screen-Titel | Serif | 30 / 36 px | 400 | −0.015em | „Archiv“, aktives Buch, Reviewfrage |
| Screen-Titel klein | Sans | 22 / 28 px | 600 | −0.01em | nur wo Sans-Kopfzeile nötig |
| Section-Titel | Mono | 11 / 16 px | 500 | +0.14em, uppercase | „HEUTE VORGENOMMEN“, „RÜCKBLENDE“ |
| Eintragstext | Serif | 18 / 27 px | 400 | 0 | Felder 01/02, Archiv-Detail, To-do-Text |
| Eintragstext betont | Serif | 23 / 32 px | 400 | −0.01em | Feld 03 „Was ich anders mache“ |
| Fließtext | Sans | 15 / 24 px | 400 | 0 | Hilfetexte, Optionslabels |
| Label | Sans | 15 / 20 px | 500 | 0 | Buttonschrift, Einstellungszeilen |
| Caption | Mono | 11 / 16 px | 400 | +0.08em | Datum, „S. 142“, Zähler |
| Tab-Label | Sans | 11 / 14 px | 400 (aktiv 500) | +0.03em | |
| Eingabetext | Serif 18 px bzw. Sans 16 px | 27 / 24 px | 400 | 0 | **niemals unter 16 px** (Safari-Zoom) |

Italic ist reserviert für zitierte oder rückblickende Fremdinhalte (Rückblende-Zitat,
„Letzte Woche“), nie für Betonung.

---

## 3. Spacing-Skala

Tailwind-4-px-Raster, tatsächlich benutzte Stufen:

`1 (4)` · `2 (8)` · `2.5 (10)` · `3 (12)` · `3.5 (14)` · `4 (16)` · `5 (20)` · `5.5 (22)` ·
`6 (24)` · `6.5 (26)` · `7 (28)` · `8 (32)` · `11 (44)`

Feste Maße:
- Screen-Seitenrand: **26 px** (`px-6.5`), links und rechts identisch, auch für Trennlinien
  (Haarlinien laufen nicht bis zum Rand).
- Vertikaler Abstand zwischen Sektionen: **30 px**, mit Haarlinie in der Mitte.
- Abstand Label → Inhalt: **8 px**. Abstand Inhalt → nächstes Label: **26 px**.
- Listenzeile: `py-2`, `min-height 44px`, Divider `border-t border-border`.
- Safe Areas: Kopfzeile `padding-top: max(8px, env(safe-area-inset-top))`,
  Tab-Bar `padding-bottom: env(safe-area-inset-bottom)`, seitlich
  `max(26px, env(safe-area-inset-left/right))`.
- Scrollbereich: `padding-bottom: calc(130px + env(safe-area-inset-bottom))`, damit Inhalt nicht
  unter FAB und Tab-Bar endet.

---

## 4. Radien und Schatten

| Token | Wert | Verwendung |
|---|---|---|
| radius-sm | 5 px | Checkbox, Wichtigkeits-Marken |
| radius-md | 10 px | Optionszeilen, Secondary-Button |
| radius-lg | 12 px | Primary-Button, Input, Suchfeld |
| radius-xl | 14 px | Textarea, Karte, Bottom-Sheet-Innenflächen |
| radius-sheet | 20 px oben | Bottom-Sheet (`rounded-t-[20px]`) |
| radius-full | 999 px | Tag-Chip, Filter-Chip, FAB |

Schatten: **im Dark Mode keine**. Erhöhung entsteht über `bg-elevated` + `border`.
Zwei Ausnahmen:
- FAB: `0 6px 20px -6px rgba(0,0,0,0.65)`
- Bottom-Sheet: `0 -16px 40px -12px rgba(0,0,0,0.7)` plus `overlay`-Backdrop.
Im Light Mode zusätzlich für Sheet und FAB: `0 8px 24px -10px rgba(60,45,30,0.28)`.
Statt Schatten wird zum Übergang von Scrollinhalt zur fixen Bodenleiste ein Gradient benutzt:
`linear-gradient(to top, bg-base 68%, transparent)`.

---

## 5. Komponenten

Alle interaktiven Elemente: **min. 44 px Höhe**, Fokus immer sichtbar
(`outline: none` nur zusammen mit einem eigenen Fokusring).
Fokusring global: `box-shadow: 0 0 0 2px #16130F, 0 0 0 4px rgba(201,123,74,0.55)`
(Light: `0 0 0 2px #F7F3ED, 0 0 0 4px rgba(162,84,42,0.45)`).
Disabled global: `opacity: 0.45; pointer-events: none;` — keine Farbänderung.

### Button — primary
- Fläche `accent`, Text `accent-contrast`, Sans 15/500 (auf ganzbreiten Bodenbuttons 17 px).
- Höhe 52 px bei ganzer Breite, sonst 44 px; `radius-lg`; horizontale Polsterung 20 px.
- default: `bg-accent`
- active/pressed: `bg-[#B76C3E]`, `scale-[0.99]`
- focus: Fokusring wie oben
- disabled: `opacity 0.45`
- error: kein eigener Zustand (Fehler steht am Feld, nicht am Button)

### Button — secondary
- Transparent, `border 1px border-strong`, Text `text-primary`, Sans 15/500, `radius-md`, 44 px.
- active: `bg-hover`; focus: Fokusring; disabled: `opacity 0.45`, Rand bleibt `border-strong`.
- Beispiel: „To-do daraus erstellen“, „Zurück“.

### Button — ghost
- Kein Rand, keine Fläche. Text `text-muted` (destruktiv: `danger`), Sans 16/400, 44 px,
  horizontale Polsterung 4 px, Trefferfläche über `min-height`.
- active: Text `text-primary`; focus: Fokusring um den Textkasten; disabled: `opacity 0.45`.
- Beispiel: „Abbrechen“, „Später“.

### Input (einzeilig, inkl. Suchfeld)
- Höhe 46 px, `bg-elevated`, `border 1px border`, `radius-lg`, Polsterung 14 px,
  Text Sans **16 px**/`text-primary`, Placeholder `text-muted`.
- focus: `border-color: accent` + Fokusring, `bg-elevated` unverändert.
- disabled: `opacity 0.45`.
- error: `border-color: danger`, darunter Fehlertext Sans 13/`danger`, Abstand 6 px.
- Suchfeld hat links eine 13-px-Kreiskontur in `text-muted` als Lupenersatz, Abstand 10 px.

### Textarea (Eintragsfelder, Reviewantwort)
- `bg-elevated`, `border 1px border`, `radius-xl`, Polsterung 16 px,
  Text **Serif 18/27** (Reviewantwort 19/28), `min-height 120px`, autogrow, kein Resize-Griff.
- Optionaler Zeichenzähler unten rechts, Mono 11/`text-muted`.
- focus: `border-color: accent` (1 px, nicht 2 px, damit nichts springt) + Fokusring;
  Caret in `accent`.
- disabled: `opacity 0.45`; error: `border-color: danger` + Fehlertext wie beim Input.
- Im Eintragsformular können die drei Felder auch randlos auf `bg-base` stehen
  (Variante der Kette, siehe Prosaregel 2) — dann markiert nur der Fokus einen Rahmen.

### Card
- `bg-elevated`, `border 1px border`, `radius-xl`, Polsterung 14 px, kein Schatten.
- Zustände nur wenn antippbar: active `bg-hover`; focus Fokusring; disabled `opacity 0.45`.
- Variante „leer/ausstehend“: `border 1px dashed border-strong`, gleiche Fläche.
- In dieser Richtung selten — siehe Prosaregel 1.

### Tab-Bar
- Fix am unteren Rand, `bg-base`, `border-top 1px border`,
  Höhe 56 px + `env(safe-area-inset-bottom)`, 4 gleich breite Spalten
  (Heute · Bücher · Archiv · To-dos), je `min-height 44px`.
- Kein Icon. Jeder Tab: 16 × 2 px Strich, 6 px Abstand, darunter Tab-Label.
- aktiv: Strich `accent`, Label `accent`, Weight 500.
- inaktiv: Strich transparent, Label `text-muted`.
- focus: Fokusring um die Spalte; disabled: nicht vorgesehen.

### FAB
- 56 × 56 px, Kreis (`radius-full`), Fläche `accent`, Glyphe „+“ 30 px in `accent-contrast`.
- Position: `right: 26px`, `bottom: calc(56px + env(safe-area-inset-bottom) + 8px)`, also direkt
  über der Tab-Bar, rechtsbündig zum Screenrand.
- active: `bg-[#B76C3E]`, `scale-[0.97]`; focus: Fokusring; disabled: `opacity 0.45`.
- Auf Eintrag-, Review- und Sheet-Screens ausgeblendet.

### Tag-Chip
- `radius-full`, `border 1px border-strong`, transparent, Text Sans 13/`text-secondary`,
  Polsterung 4 px / 10 px. Filter-Chip identisch, aber `min-height 34px` und Text 14 px.
- ausgewählt: `bg-hover`, Rand `border-strong`, Text `text-primary`.
- entfernbar: „×“ 12 px in `text-muted` rechts, 6 px Abstand, Trefferfläche 44 px unsichtbar.
- focus: Fokusring; disabled: `opacity 0.45`; error: nicht vorgesehen.

### Checkbox
- 21 × 21 px, `radius-sm`, `border 1.5px border-strong`, transparent.
  Zeile insgesamt `min-height 44px`, Abstand zum Text 14 px, Text Serif 18/27.
- checked: Fläche und Rand `accent`, Häkchen als 9 × 5 px Winkel in `accent-contrast`
  (2 Ränder, −45° gedreht); Text wird `#948B83` mit `line-through`.
- focus: Fokusring um das Kästchen; disabled: `opacity 0.45`;
  error (Pflichtfeld nicht bestätigt): Rand `danger`.

### Bottom-Sheet
- `bg-elevated`, `rounded-t-[20px]`, `border-top 1px border`, Backdrop `overlay`.
- Griff: 40 × 4 px Balken in `border-strong`, zentriert, 10 px oben.
- Kopfzeile: Titel Serif 22/400 links, Ghost-Button „Fertig“ rechts, darunter Haarlinie.
- Inhalt: Polsterung 26 px seitlich, unten `calc(20px + env(safe-area-inset-bottom))`.
- Höhe: inhaltsbestimmt, max. 88 % der Höhe, dann innen scrollbar.
- Einblenden: `transform: translateY(100%) → 0`, 240 ms `cubic-bezier(.32,.72,0,1)`;
  Backdrop 160 ms Opazität. Schließen 180 ms. Kein Bounce.
- focus: erster fokussierbarer Inhalt beim Öffnen, Fokus im Sheet gefangen.
- disabled/error: an den enthaltenen Feldern, nicht am Sheet.

---

## 6. Haltung — Regeln in Prosa

1. **Trennlinien statt Container.** Der Standardfall ist Text direkt auf `bg-base`, gegliedert
   durch 1-px-Haarlinien in `border` und großzügigen Weißraum. Eine Karte wird nur eingesetzt,
   wenn ein Inhalt aus dem Lesefluss herausfällt, weil er von außen kommt oder eine Entscheidung
   verlangt: die Rückblende, das Antwortfeld im Review, das Bottom-Sheet. Zwei Karten
   untereinander sind ein Zeichen dafür, dass eine von beiden keine sein sollte.

2. **Typografie stellt die Hierarchie her, nicht Farbe und nicht Rahmen.** Wichtigkeit wird über
   Schriftgröße, Serif-gegen-Sans und Abstand ausgedrückt. Innerhalb eines Eintrags steigt das
   Gewicht von Feld 01 zu Feld 03: Feld 03 ist die größte Schrift auf dem Screen, weil es das
   ist, was der Nutzer morgen tun soll. Nur Feld 03 trägt eine Aktion.

3. **Mono ist nur für Maschinendaten.** Datum, Seitenzahl, Zähler, Sektionsmarken. Alles, was der
   Nutzer selbst geschrieben hat, steht in der Serif; alles, was die App sagt oder anbietet, in
   der Sans. Diese Zuordnung wird nirgends gebrochen — sie ist das eigentliche Ordnungssystem.

4. **Kein Lob, kein Tadel.** Streak und fehlende Einträge sind Zustandsangaben in `text-muted`,
   in derselben Größe wie ein Datum. Keine Prozentzahlen, keine Trophäen, keine Farbwechsel bei
   Erfolg, kein rotes Warnen bei Lücken. Ein ausgelassener Tag ist eine leere Zeile, kein Fehler.

5. **Ein Screen, eine Handlung.** Jeder Screen hat genau eine primäre Aktion in `accent`
   (Bodenbutton oder FAB); alles andere ist secondary oder ghost. Im Review bedeutet das eine
   Frage pro Schritt, ohne Vorschau auf die nächste; im Eintrag ein Speichern-Button, unter dem
   die optionalen Details eingeklappt und in Sans warten, bis sie gebraucht werden.

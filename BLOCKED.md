# Blockiert — braucht den Nutzer

Alles hier ist außerhalb dessen, was autonom erledigt werden darf oder kann.
Die betroffene Stelle im Code ist jeweils so weit vorgebaut, dass nur der Handgriff fehlt.

---

## 1. Firestore Rules und Hosting deployen

**Warum blockiert:** Kein Firebase-Login in dieser Umgebung.

```
git pull origin claude/pwa-concept-review-setup-fr2hy2
npm run deploy:rules
npm run deploy
```

Die Rules **zuerst**. Sie geben `entries`, `todos` und `reviews` überhaupt erst frei — ohne
sie weist Firestore jeden Schreibzugriff auf diese Collections ab.

---

## 2. Composite-Indizes anlegen

**Warum blockiert:** Indizes werden über die Konsole oder den Deploy angelegt, beides braucht
Zugang. `firestore.indexes.json` liegt im Repo und wird mitdeployt:

```
npx firebase-tools deploy --only firestore:indexes
```

Alternativ meldet Firestore beim ersten Fehlschlag einen Direktlink in der Browserkonsole.
Solange ein Index fehlt, fällt nur die betroffene sortierte Abfrage aus, nicht die App.

---

## 3. Auf dem Gerät prüfbare Dinge

**Warum blockiert:** Kein iPhone, und der Browser hier erreicht keine externen Seiten.
Nicht verifizierbar: der echte Google-Redirect, der Standalone-Modus, Safaris
Speicherverhalten, die Installation vom Home-Bildschirm, das Startbild.

Siehe `TESTPLAN.md` — dort steht Schritt für Schritt, was zu prüfen ist.

---

## 4. Nicht gebaut, weil es Geld oder Server kostet

Keins davon ist ein Mangel, alle sind bewusst ausgeschlossen (Konzept 5, `CLAUDE.md` § 2):

- **Push-Erinnerungen.** Bräuchten einen Absender, also Servercode. Erinnerungen sind
  ohnehin gestrichen (`CLAUDE.md` 7.1).
- **Cloud Storage für Buchcover.** Nicht mehr im Spark-Plan. Cover werden verlinkt.
- **Volltextsuche serverseitig.** Läuft clientseitig über den Offline-Cache.
- **Automatische Wiedervorlage zu fester Uhrzeit.** Ohne Server unmöglich; die Prüfung
  läuft beim App-Start.

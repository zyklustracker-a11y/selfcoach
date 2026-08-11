/**
 * Checks .env.local before a build wastes a deploy cycle.
 *
 * Values are never printed — a config value copied out of a masked display keeps
 * its bullet characters and looks fine at a glance, so this reports shape only:
 * present, printable ASCII, and plausible length.
 *
 * Run with `npm run check:env`.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ENV_PATH = join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local')

/** name -> extra expectation beyond "present and printable ASCII". */
const EXPECTED = {
  VITE_FIREBASE_API_KEY: (v) =>
    v.startsWith('AIza') && v.length === 39 ? null : 'sollte mit AIza beginnen und 39 Zeichen lang sein',
  // Must be the domain the app is served from. The console suggests
  // *.firebaseapp.com, which puts /__/auth/handler on a different origin than the
  // app — Safari's tracking prevention then breaks signInWithRedirect.
  VITE_FIREBASE_AUTH_DOMAIN: (v) =>
    v.endsWith('.firebaseapp.com')
      ? 'muss die Auslieferungsdomain sein (readcoach-29227.web.app), nicht der Konsolen-Vorschlag *.firebaseapp.com — sonst scheitert der Login in Safari'
      : null,
  VITE_FIREBASE_PROJECT_ID: () => null,
  VITE_FIREBASE_MESSAGING_SENDER_ID: (v) => (/^\d+$/.test(v) ? null : 'sollte nur Ziffern enthalten'),
  VITE_FIREBASE_APP_ID: (v) => (v.includes(':web:') ? null : 'sollte ":web:" enthalten'),
}

let source
try {
  source = readFileSync(ENV_PATH, 'utf8')
} catch {
  console.error('.env.local fehlt. Kopiere .env.local.example und trage die Werte ein.')
  process.exit(1)
}

const values = new Map()
for (const line of source.split('\n')) {
  const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim())
  if (match) values.set(match[1], match[2])
}

let failed = 0
for (const [name, extraCheck] of Object.entries(EXPECTED)) {
  const value = values.get(name)
  let problem = null

  if (!value) problem = 'fehlt oder ist leer'
  else if (!/^[\x21-\x7e]+$/.test(value)) {
    problem = 'enthält Zeichen, die dort nicht vorkommen können — vermutlich aus einer maskierten Anzeige kopiert'
  } else problem = extraCheck(value)

  if (problem) {
    failed++
    console.error(`FEHLER  ${name}: ${problem}`)
  } else {
    console.log(`ok      ${name}`)
  }
}

if (failed > 0) {
  console.error(`\n${failed} Wert(e) fehlerhaft. Hol sie aus der Firebase-Konsole:`)
  console.error('Projekteinstellungen -> Allgemein -> Meine Apps -> SDK-Einrichtung und Konfiguration')
  process.exit(1)
}

console.log('\nAlle Werte sehen gut aus.')

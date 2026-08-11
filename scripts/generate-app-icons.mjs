/**
 * Generates the PWA icon set and the iOS startup images into public/.
 *
 * Run with `npm run icons` after changing any colour in DESIGN.md.
 * Everything is drawn from the design tokens below — no binary source assets.
 *
 * The mark repeats the visual language of the tab bar indicator: plain strokes,
 * no icon, no illustration. Three bars stand for the three fields of an entry;
 * the third one is heavier and carries the accent, because field 03 is the one
 * that matters (DESIGN.md, prose rule 2).
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = join(ROOT, 'public')

const BG = [0x16, 0x13, 0x0f] // --bg-base
const MUTED = [0x9a, 0x91, 0x89] // --text-muted
const ACCENT = [0xc9, 0x7b, 0x4a] // --accent

// --- minimal PNG encoder (8-bit RGB, no alpha) -----------------------------

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const out = Buffer.alloc(data.length + 12)
  out.writeUInt32BE(data.length, 0)
  out.write(type, 4, 'ascii')
  data.copy(out, 8)
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length)
  return out
}

function encodePng(width, height, rgb) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // colour type: truecolour
  // 10..12 stay 0: deflate, adaptive filtering, no interlace

  // One filter byte (0 = none) in front of every scanline.
  const raw = Buffer.alloc(height * (1 + width * 3))
  for (let y = 0; y < height; y++) {
    const src = y * width * 3
    const dst = y * (1 + width * 3)
    raw[dst] = 0
    rgb.copy(raw, dst + 1, src, src + width * 3)
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// --- drawing ---------------------------------------------------------------

function canvas(width, height, colour) {
  const buf = Buffer.alloc(width * height * 3)
  for (let i = 0; i < width * height; i++) {
    buf[i * 3] = colour[0]
    buf[i * 3 + 1] = colour[1]
    buf[i * 3 + 2] = colour[2]
  }
  return buf
}

function fillRect(buf, width, x, y, w, h, colour) {
  for (let row = y; row < y + h; row++) {
    for (let col = x; col < x + w; col++) {
      const i = (row * width + col) * 3
      buf[i] = colour[0]
      buf[i + 1] = colour[1]
      buf[i + 2] = colour[2]
    }
  }
}

function drawIcon(size) {
  const buf = canvas(size, size, BG)
  const barX = Math.round(size * 0.22)
  const barW = size - barX * 2
  const thin = Math.max(2, Math.round(size * 0.045))
  const thick = Math.max(3, Math.round(size * 0.075))
  const gap = Math.round(size * 0.1)

  const total = thin * 2 + thick + gap * 2
  let y = Math.round((size - total) / 2)

  fillRect(buf, size, barX, y, barW, thin, MUTED)
  y += thin + gap
  fillRect(buf, size, barX, y, barW, thin, MUTED)
  y += thin + gap
  fillRect(buf, size, barX, y, barW, thick, ACCENT)

  return encodePng(size, size, buf)
}

function drawSplash(width, height) {
  return encodePng(width, height, canvas(width, height, BG))
}

// --- output ----------------------------------------------------------------

/** Portrait iPhone viewports: [cssWidth, cssHeight, devicePixelRatio]. */
export const IOS_SPLASH_SIZES = [
  [320, 568, 2],
  [375, 667, 2],
  [414, 736, 3],
  [375, 812, 3],
  [414, 896, 2],
  [414, 896, 3],
  [360, 780, 3],
  [390, 844, 3],
  [428, 926, 3],
  [393, 852, 3],
  [430, 932, 3],
  [402, 874, 3],
  [440, 956, 3],
]

mkdirSync(join(PUBLIC, 'icons'), { recursive: true })
mkdirSync(join(PUBLIC, 'startup'), { recursive: true })

for (const size of [192, 512]) {
  writeFileSync(join(PUBLIC, 'icons', `icon-${size}.png`), drawIcon(size))
}
// iOS ignores the manifest and reads this one. It must be opaque and unrounded.
writeFileSync(join(PUBLIC, 'icons', 'apple-touch-icon.png'), drawIcon(180))
writeFileSync(join(PUBLIC, 'favicon.png'), drawIcon(64))

for (const [cssW, cssH, dpr] of IOS_SPLASH_SIZES) {
  const w = cssW * dpr
  const h = cssH * dpr
  writeFileSync(join(PUBLIC, 'startup', `splash-${w}x${h}.png`), drawSplash(w, h))
}

console.log(`Wrote 4 icons and ${IOS_SPLASH_SIZES.length} startup images to public/.`)

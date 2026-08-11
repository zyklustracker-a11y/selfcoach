/**
 * Builds the normalised `keywords` array stored on every entry (concept 6.6).
 *
 * The everyday search runs client-side over the offline cache; this array is the
 * fallback that lets Firestore filter server-side if it is ever needed. It is
 * therefore kept small and blunt rather than clever.
 */

/** Firestore counts every array element against the document size. */
const MAX_KEYWORDS = 120
const MIN_LENGTH = 3

export function buildKeywords(parts: readonly (string | null | undefined)[]): string[] {
  const seen = new Set<string>()

  for (const part of parts) {
    if (!part) continue
    for (const token of part.toLowerCase().split(/[^\p{L}\p{N}]+/u)) {
      if (token.length < MIN_LENGTH) continue
      seen.add(token)
      if (seen.size >= MAX_KEYWORDS) return [...seen]
    }
  }

  return [...seen]
}

import { de, type Strings } from './de'

/**
 * Single access point for UI copy. Deliberately not a full i18n library: there is
 * one locale today, and swapping this constant is all a second one would need.
 */
export const t: Strings = de

export type { Strings }

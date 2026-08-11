import type { Theme } from '@/types'

/**
 * Dark is the product default, light is the exception (DESIGN.md).
 * The palette lives in CSS custom properties; switching themes only toggles the
 * `light` class on <html>, so no component ever needs a `dark:` variant.
 *
 * The user-facing setting arrives with the settings screen in a later phase.
 */
export const DEFAULT_THEME: Theme = 'dark'

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('light', theme === 'light')
}

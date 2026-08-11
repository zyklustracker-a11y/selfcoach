/**
 * Design tokens are defined once as CSS custom properties in src/styles/theme.css
 * and only referenced here. Never hard-code a colour value in a component.
 * Source of truth for every value below: DESIGN.md.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': 'var(--bg-base)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-hover': 'var(--bg-hover)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        accent: 'var(--accent)',
        'accent-contrast': 'var(--accent-contrast)',
        'accent-quiet': 'var(--accent-quiet)',
        'accent-pressed': 'var(--accent-pressed)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        success: 'var(--success)',
        danger: 'var(--danger)',
        overlay: 'var(--overlay)',
      },
      fontFamily: {
        serif: ['"Source Serif 4 Variable"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      // Named after the role in the DESIGN.md type scale, not after the size.
      fontSize: {
        'screen-title': ['30px', { lineHeight: '36px', letterSpacing: '-0.015em', fontWeight: '400' }],
        'screen-title-sm': ['22px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '600' }],
        section: ['11px', { lineHeight: '16px', letterSpacing: '0.14em', fontWeight: '500' }],
        entry: ['18px', { lineHeight: '27px', fontWeight: '400' }],
        'entry-lead': ['23px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '400' }],
        body: ['15px', { lineHeight: '24px', fontWeight: '400' }],
        label: ['15px', { lineHeight: '20px', fontWeight: '500' }],
        'label-lg': ['17px', { lineHeight: '22px', fontWeight: '500' }],
        caption: ['11px', { lineHeight: '16px', letterSpacing: '0.08em', fontWeight: '400' }],
        tab: ['11px', { lineHeight: '14px', letterSpacing: '0.03em', fontWeight: '400' }],
        // Inputs never drop below 16px — Safari zooms the viewport otherwise.
        'input-sans': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'input-serif': ['18px', { lineHeight: '27px', fontWeight: '400' }],
        'review-answer': ['19px', { lineHeight: '28px', fontWeight: '400' }],
        chip: ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'chip-filter': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'field-error': ['13px', { lineHeight: '18px', fontWeight: '400' }],
      },
      spacing: {
        5.5: '22px',
        6.5: '26px',
      },
      borderRadius: {
        sm: '5px',
        md: '10px',
        lg: '12px',
        xl: '14px',
        sheet: '20px',
      },
      boxShadow: {
        fab: '0 6px 20px -6px rgba(0,0,0,0.65)',
        sheet: '0 -16px 40px -12px rgba(0,0,0,0.7)',
        'fab-light': '0 8px 24px -10px rgba(60,45,30,0.28)',
        'sheet-light': '0 8px 24px -10px rgba(60,45,30,0.28)',
      },
      minHeight: {
        touch: '44px',
      },
      maxWidth: {
        // The whole design is written for a 390px phone. 440px is the widest
        // iPhone, so this never constrains a phone — it only stops the layout from
        // stretching across a desktop window.
        app: '440px',
      },
      transitionTimingFunction: {
        sheet: 'cubic-bezier(.32,.72,0,1)',
      },
    },
  },
  plugins: [],
}

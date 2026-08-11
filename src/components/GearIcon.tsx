/**
 * The one icon in the app. Settings live behind it in the header, not in the tab
 * bar (concept 7.1). Drawn as a thin outline to match the hairline vocabulary —
 * no fill, no emoji, no illustration.
 */
export function GearIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M10.06 4.24L10.25 2.05A10.1 10.1 0 0 1 13.75 2.05L13.94 4.24A8 8 0 0 1 16.12 5.14L17.79 3.73A10.1 10.1 0 0 1 20.27 6.21L18.86 7.88A8 8 0 0 1 19.76 10.06L21.95 10.25A10.1 10.1 0 0 1 21.95 13.75L19.76 13.94A8 8 0 0 1 18.86 16.12L20.27 17.79A10.1 10.1 0 0 1 17.79 20.27L16.12 18.86A8 8 0 0 1 13.94 19.76L13.75 21.95A10.1 10.1 0 0 1 10.25 21.95L10.06 19.76A8 8 0 0 1 7.88 18.86L6.21 20.27A10.1 10.1 0 0 1 3.73 17.79L5.14 16.12A8 8 0 0 1 4.24 13.94L2.05 13.75A10.1 10.1 0 0 1 2.05 10.25L4.24 10.06A8 8 0 0 1 5.14 7.88L3.73 6.21A10.1 10.1 0 0 1 6.21 3.73L7.88 5.14A8 8 0 0 1 10.06 4.24Z" />
      <circle cx="12" cy="12" r="3.4" />
    </svg>
  )
}

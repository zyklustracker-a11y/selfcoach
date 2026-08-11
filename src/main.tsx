import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import { applyTheme, DEFAULT_THEME } from './app/theme'
import { t } from './lib/strings'
import './styles/index.css'

applyTheme(DEFAULT_THEME)

const container = document.getElementById('root')
if (!container) throw new Error('Root element missing from index.html')

const root: Root = createRoot(container)

/**
 * The app is imported dynamically so a configuration error — which throws while
 * the Firebase module is evaluated — can be caught and shown. A static import
 * would fail before any of this runs and leave a blank screen, which is useless
 * on a phone with no console.
 */
// Promise chaining rather than top-level await: the build targets Safari 14,
// which has no top-level await.
void import('./app/App')
  .then(({ App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
  .catch((cause: unknown) => {
    root.render(
      <div className="mx-auto max-w-app px-6.5 pt-16">
        <h1 className="font-serif text-screen-title text-text-primary">{t.configError.title}</h1>
        <p className="mt-3.5 text-body text-text-secondary">{t.configError.body}</p>
        <p className="mt-6.5 font-mono text-caption text-danger">
          {cause instanceof Error ? cause.message : String(cause)}
        </p>
      </div>,
    )
  })

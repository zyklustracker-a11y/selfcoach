import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app/App'
import { applyTheme, DEFAULT_THEME } from './app/theme'
import './styles/index.css'

applyTheme(DEFAULT_THEME)

const container = document.getElementById('root')
if (!container) throw new Error('Root element missing from index.html')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

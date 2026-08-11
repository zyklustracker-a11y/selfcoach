import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { StyleguideScreen } from './StyleguideScreen'

/**
 * Phase 1 ships the design system only. The router exists so /styleguide can be
 * opened on the phone; the real screens replace this from phase 2 on.
 */
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/styleguide" element={<StyleguideScreen />} />
        <Route path="*" element={<Navigate to="/styleguide" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

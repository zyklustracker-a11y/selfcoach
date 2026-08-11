import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthGuard, AuthProvider, LoginScreen } from '@/features/auth'

import { SignedInScreen } from './SignedInScreen'
import { StyleguideScreen } from './StyleguideScreen'

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          {/* Temporary route from phase 1, deliberately reachable without a session. */}
          <Route path="/styleguide" element={<StyleguideScreen />} />
          <Route
            path="/"
            element={
              <AuthGuard>
                <SignedInScreen />
              </AuthGuard>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

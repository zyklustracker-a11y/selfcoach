import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthGuard, AuthProvider, LoginScreen } from '@/features/auth'
import { BookDetailScreen, BookFormScreen, BooksListScreen } from '@/features/books'
import { t } from '@/lib/strings'

import { AppShell } from './AppShell'
import { ComingSoonScreen } from './ComingSoonScreen'
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
            element={
              <AuthGuard>
                <AppShell />
              </AuthGuard>
            }
          >
            <Route path="/" element={<ComingSoonScreen note={t.comingSoon.today} />} />
            <Route path="/books" element={<BooksListScreen />} />
            <Route path="/books/new" element={<BookFormScreen />} />
            <Route path="/books/:bookId" element={<BookDetailScreen />} />
            <Route path="/books/:bookId/edit" element={<BookFormScreen />} />
            <Route path="/archive" element={<ComingSoonScreen note={t.comingSoon.archive} />} />
            <Route path="/todos" element={<ComingSoonScreen note={t.comingSoon.todos} />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

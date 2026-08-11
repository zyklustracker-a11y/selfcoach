import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthGuard, AuthProvider, LoginScreen } from '@/features/auth'
import { BookDetailScreen, BookFormScreen, BooksListScreen } from '@/features/books'
import { EntryDetailScreen, EntryFormScreen } from '@/features/entries'
import { TodosScreen } from '@/features/todos'
import { t } from '@/lib/strings'

import { AppShell } from './AppShell'
import { ComingSoonScreen } from './ComingSoonScreen'
import { TodayScreen } from './TodayScreen'
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
            <Route path="/" element={<TodayScreen />} />
            <Route path="/entries/new" element={<EntryFormScreen />} />
            <Route path="/entries/:entryId" element={<EntryDetailScreen />} />
            <Route path="/entries/:entryId/edit" element={<EntryFormScreen />} />
            <Route path="/books" element={<BooksListScreen />} />
            <Route path="/books/new" element={<BookFormScreen />} />
            <Route path="/books/:bookId" element={<BookDetailScreen />} />
            <Route path="/books/:bookId/edit" element={<BookFormScreen />} />
            <Route path="/archive" element={<ComingSoonScreen note={t.comingSoon.archive} />} />
            <Route path="/todos" element={<TodosScreen />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DemoProvider } from './contexts/DemoContext'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Cost from './pages/Cost'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import About from './pages/About'
import Admin from './pages/Admin'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <DemoProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/cost" element={<Cost />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Routes>
        </DemoProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

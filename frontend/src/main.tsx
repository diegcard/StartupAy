import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './pages/login/LoginPage'
import { TicketListPage } from './pages/tickets/list/TicketListPage'
import { TicketDetailPage } from './pages/tickets/detail/TicketDetailPage'
import { NewTicketPage } from './pages/tickets/new/NewTicketPage'
import { MetricsPage } from './pages/metrics/MetricsPage'
import { EscalationsPage } from './pages/escalations/EscalationsPage'
import { useAuthStore } from './store/auth'
import './index.css'

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } })

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/tickets" replace />} />
            <Route path="tickets" element={<TicketListPage />} />
            <Route path="tickets/new" element={<NewTicketPage />} />
            <Route path="tickets/:id" element={<TicketDetailPage />} />
            <Route path="escalations" element={<EscalationsPage />} />
            <Route path="metrics" element={<MetricsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/tickets" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)

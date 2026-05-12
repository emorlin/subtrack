import { createContext, useContext, useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import TopBar from './TopBar'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { useAuth } from '../../hooks/useAuth'
import { useDemoContext } from '../../contexts/DemoContext'
import AddSubscriptionModal from '../subscriptions/AddSubscriptionModal'

interface LayoutContextValue {
  openAdd: () => void
}

export const LayoutContext = createContext<LayoutContextValue>({ openAdd: () => {} })

export function useLayout() {
  return useContext(LayoutContext)
}

export default function AppLayout() {
  const { user, loading } = useAuth()
  const { isDemoMode } = useDemoContext()
  const [showAdd, setShowAdd] = useState(false)

  if (loading && !isDemoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--c-bg-app)]">
        <span role="status" className="text-[13px] text-[var(--c-text-subtle)]">Laddar…</span>
      </div>
    )
  }

  if (!user && !isDemoMode) {
    return <Navigate to="/login" replace />
  }

  const openAdd = () => setShowAdd(true)

  return (
    <LayoutContext.Provider value={{ openAdd }}>
      <div className="h-dvh bg-[var(--c-bg-app)] flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-[var(--c-accent)] focus:text-white focus:rounded-[6px] focus:text-[13px] focus:font-medium"
        >
          Hoppa till innehåll
        </a>
        <TopBar action={
          <button
            type="button"
            onClick={openAdd}
            className="bg-[var(--c-accent)] text-white rounded-[6px] px-4 py-2 text-[13px] font-medium transition-all duration-150 ease-out hover:bg-[var(--c-accent-hover)]"
          >
            + Lägg till
          </button>
        } />

        {isDemoMode && (
          <div className="bg-[var(--c-warning-bg)] border-b border-[var(--c-warning-border)] px-4 py-2 text-center shrink-0">
            <p className="text-[12px] text-[var(--c-warning-text)]">
              Demo-läge — du tittar på exempeldata. Ändringar sparas inte.
            </p>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          <aside className="hidden md:block w-[188px] shrink-0 border-r border-[var(--c-border)] bg-[var(--c-bg-card)]">
            <Sidebar />
          </aside>
          <main id="main-content" className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>

        <div className="md:hidden">
          <div className="px-4 pb-2 pt-1 bg-[var(--c-bg-card)] border-t border-[var(--c-border)]">
            <button
              type="button"
              onClick={openAdd}
              className="w-full bg-[var(--c-accent)] text-white rounded-[6px] py-3 text-[14px] font-medium transition-all duration-150 ease-out"
            >
              + Lägg till abonnemang
            </button>
          </div>
          <BottomNav />
        </div>
      </div>

      {showAdd && <AddSubscriptionModal onClose={() => setShowAdd(false)} />}
    </LayoutContext.Provider>
  )
}

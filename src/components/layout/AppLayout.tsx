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
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <span className="text-[13px] text-[#9CA3AF]">Laddar…</span>
      </div>
    )
  }

  if (!user && !isDemoMode) {
    return <Navigate to="/login" replace />
  }

  const openAdd = () => setShowAdd(true)

  return (
    <LayoutContext.Provider value={{ openAdd }}>
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
        <TopBar action={
          <button
            type="button"
            onClick={openAdd}
            className="bg-[#1B4FD8] text-white rounded-[6px] px-4 py-2 text-[13px] font-medium transition-all duration-150 ease-out hover:bg-[#1a46c2]"
          >
            + Lägg till
          </button>
        } />

        {isDemoMode && (
          <div className="bg-[#FFFBEB] border-b border-[#FDE68A] px-4 py-2 text-center shrink-0">
            <p className="text-[12px] text-[#92400E]">
              Demo-läge — du tittar på exempeldata. Ändringar sparas inte.
            </p>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          <aside className="hidden md:block w-[188px] shrink-0 border-r border-[#E5E7EB] bg-white">
            <Sidebar />
          </aside>
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>

        <div className="md:hidden">
          <div className="px-4 pb-2 pt-1 bg-white border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={openAdd}
              className="w-full bg-[#1B4FD8] text-white rounded-[6px] py-3 text-[14px] font-medium transition-all duration-150 ease-out"
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

import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

interface LayoutContextValue {
  setAction: (node: ReactNode) => void
  setMobileAddButton: (node: ReactNode) => void
}

export const LayoutContext = createContext<LayoutContextValue>({
  setAction: () => {},
  setMobileAddButton: () => {},
})

export function useLayout() {
  return useContext(LayoutContext)
}

export default function AppLayout() {
  const [action, setAction] = useState<ReactNode>(null)
  const [mobileAddButton, setMobileAddButton] = useState<ReactNode>(null)

  return (
    <LayoutContext.Provider value={{ setAction, setMobileAddButton }}>
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
        <TopBar action={action} />

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-[188px] shrink-0 border-r border-[#E5E7EB] bg-white">
            <Sidebar />
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>

        {/* Mobile: add button + bottom nav */}
        <div className="md:hidden">
          {mobileAddButton && (
            <div className="px-4 pb-2 pt-1 bg-white border-t border-[#E5E7EB]">
              {mobileAddButton}
            </div>
          )}
          <BottomNav />
        </div>
      </div>
    </LayoutContext.Provider>
  )
}

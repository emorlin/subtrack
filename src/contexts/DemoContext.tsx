import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { DEMO_SUBSCRIPTIONS, DEMO_CATEGORIES } from '../lib/demoData'

interface DemoContextValue {
  isDemoMode: boolean
  enterDemo: () => void
  exitDemo: () => void
}

const DemoContext = createContext<DemoContextValue>({
  isDemoMode: false,
  enterDemo: () => {},
  exitDemo: () => {},
})

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const queryClient = useQueryClient()

  const enterDemo = useCallback(() => {
    queryClient.setQueryData(['subscriptions'], DEMO_SUBSCRIPTIONS)
    queryClient.setQueryData(['categories'], DEMO_CATEGORIES)
    setIsDemoMode(true)
  }, [queryClient])

  const exitDemo = useCallback(() => {
    setIsDemoMode(false)
    queryClient.clear()
  }, [queryClient])

  return (
    <DemoContext.Provider value={{ isDemoMode, enterDemo, exitDemo }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemoContext() {
  return useContext(DemoContext)
}

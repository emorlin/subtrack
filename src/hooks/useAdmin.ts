import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export const ADMIN_ID = 'c53253c5-9ba0-48a6-a2d2-2c4ac455708f'

export function useIsAdmin() {
  const { user } = useAuth()
  return user?.id === ADMIN_ID
}

export interface AdminUser {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  subscriptions: Array<{ id: string; status: string; updated_at: string }>
}

export function useAdminUsers() {
  const isAdmin = useIsAdmin()
  return useQuery({
    queryKey: ['admin', 'users'],
    enabled: isAdmin,
    staleTime: 1000 * 60 * 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, created_at, subscriptions(id, status, updated_at)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as AdminUser[]
    },
  })
}

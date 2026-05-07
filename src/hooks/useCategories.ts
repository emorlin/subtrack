import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Category } from '../types'
import { supabase } from '../lib/supabase'
import { useDemoContext } from '../contexts/DemoContext'

const QUERY_KEY = ['categories']
const DEMO_USER_ID = 'd0000000-0000-0000-0000-000000000001'

export function useCategories() {
  const { isDemoMode } = useDemoContext()
  return useQuery<Category[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      return data as Category[]
    },
    enabled: !isDemoMode,
  })
}

export function useAddCategory() {
  const { isDemoMode } = useDemoContext()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { name: string; color_hex: string }) => {
      if (isDemoMode) {
        const newCat: Category = {
          id: crypto.randomUUID(),
          user_id: DEMO_USER_ID,
          name: input.name,
          color_hex: input.color_hex,
          sort_order: 0,
          created_at: new Date().toISOString(),
        }
        queryClient.setQueryData<Category[]>(QUERY_KEY, (old = []) => [...old, newCat])
        return newCat
      }
      const user = (await supabase.auth.getUser()).data.user
      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...input, user_id: user?.id, sort_order: 0 }])
        .select()
        .single()
      if (error) throw error
      return data as Category
    },
    onSuccess: (newCat) => {
      if (!isDemoMode) queryClient.setQueryData<Category[]>(QUERY_KEY, (old = []) => [...old, newCat])
    },
  })
}

export function useUpdateCategory() {
  const { isDemoMode } = useDemoContext()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Pick<Category, 'name' | 'color_hex'>>) => {
      if (isDemoMode) {
        const updated = { id, ...updates } as Category
        queryClient.setQueryData<Category[]>(QUERY_KEY, (old = []) =>
          old.map(c => c.id === id ? { ...c, ...updates } : c)
        )
        return updated
      }
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Category
    },
    onSuccess: (updated) => {
      if (!isDemoMode) queryClient.setQueryData<Category[]>(QUERY_KEY, (old = []) =>
        old.map(c => c.id === updated.id ? { ...c, ...updated } : c)
      )
    },
  })
}

export function useDeleteCategory() {
  const { isDemoMode } = useDemoContext()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMode) {
        queryClient.setQueryData<Category[]>(QUERY_KEY, (old = []) => old.filter(c => c.id !== id))
        return id
      }
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: (id) => {
      if (!isDemoMode) queryClient.setQueryData<Category[]>(QUERY_KEY, (old = []) =>
        old.filter(c => c.id !== id)
      )
    },
  })
}

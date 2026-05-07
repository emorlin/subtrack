import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Category } from '../types'
import { mockCategories } from '../lib/mockData'
import { supabase } from '../lib/supabase'

const QUERY_KEY = ['categories']

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) return mockCategories
      return data as Category[]
    },
    placeholderData: mockCategories,
  })
}

export function useAddCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { name: string; color_hex: string }) => {
      const user = (await supabase.auth.getUser()).data.user
      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...input, user_id: user?.id ?? 'mock', sort_order: 0 }])
        .select()
        .single()
      if (error) {
        return {
          id: crypto.randomUUID(),
          user_id: 'mock',
          sort_order: 0,
          created_at: new Date().toISOString(),
          ...input,
        } as Category
      }
      return data as Category
    },
    onSuccess: (newCat) => {
      queryClient.setQueryData<Category[]>(QUERY_KEY, (old = []) => [...old, newCat])
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Partial<Pick<Category, 'name' | 'color_hex'>>) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) return { id, ...updates } as Category
      return data as Category
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Category[]>(QUERY_KEY, (old = []) =>
        old.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
      )
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) return id
      return id
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Category[]>(QUERY_KEY, (old = []) =>
        old.filter((c) => c.id !== id)
      )
    },
  })
}

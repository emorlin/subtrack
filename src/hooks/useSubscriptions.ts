import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Subscription, SubscriptionFormData, Category, PriceHistory, SubscriptionInterval } from '../types'
import { supabase } from '../lib/supabase'
import { useDemoContext } from '../contexts/DemoContext'

const QUERY_KEY = ['subscriptions']
const DEMO_USER_ID = 'd0000000-0000-0000-0000-000000000001'

export function useSubscriptions() {
  const { isDemoMode } = useDemoContext()
  return useQuery<Subscription[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, category:categories(*), price_history(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Subscription[]
    },
    enabled: !isDemoMode,
  })
}

export function useAddSubscription() {
  const { isDemoMode } = useDemoContext()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (form: SubscriptionFormData) => {
      if (isDemoMode) {
        const categories = queryClient.getQueryData<Category[]>(['categories']) ?? []
        const category = form.category_id ? categories.find(c => c.id === form.category_id) : undefined
        const newSub: Subscription = {
          id: crypto.randomUUID(),
          user_id: DEMO_USER_ID,
          ...form,
          status: form.status ?? 'active',
          category,
          price_history: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        queryClient.setQueryData<Subscription[]>(QUERY_KEY, (old = []) => [...old, newSub])
        return newSub
      }
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{ ...form, user_id: (await supabase.auth.getUser()).data.user?.id }])
        .select('*, category:categories(*)')
        .single()
      if (error) throw error
      return data as Subscription
    },
    onSuccess: () => { if (!isDemoMode) queryClient.invalidateQueries({ queryKey: QUERY_KEY }) },
  })
}

export function useUpdateSubscription() {
  const { isDemoMode } = useDemoContext()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...form }: Partial<SubscriptionFormData> & { id: string }) => {
      if (isDemoMode) {
        const categories = queryClient.getQueryData<Category[]>(['categories']) ?? []
        const category = form.category_id ? categories.find(c => c.id === form.category_id) : undefined
        queryClient.setQueryData<Subscription[]>(QUERY_KEY, (old = []) =>
          old.map(s => s.id === id ? { ...s, ...form, category: category ?? s.category, updated_at: new Date().toISOString() } : s)
        )
        return { id, ...form } as Subscription
      }
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('subscriptions')
        .update(form)
        .eq('id', id)
        .eq('user_id', user!.id)
        .select('*, category:categories(*)')
        .single()
      if (error) throw error
      return data as Subscription
    },
    onSuccess: () => { if (!isDemoMode) queryClient.invalidateQueries({ queryKey: QUERY_KEY }) },
  })
}

export function useDeleteSubscription() {
  const { isDemoMode } = useDemoContext()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMode) {
        queryClient.setQueryData<Subscription[]>(QUERY_KEY, (old = []) => old.filter(s => s.id !== id))
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('subscriptions').delete().eq('id', id).eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => { if (!isDemoMode) queryClient.invalidateQueries({ queryKey: QUERY_KEY }) },
  })
}

export function useCancelSubscription() {
  const { isDemoMode } = useDemoContext()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, end_date }: { id: string; end_date: string }) => {
      if (isDemoMode) {
        queryClient.setQueryData<Subscription[]>(QUERY_KEY, (old = []) =>
          old.map(s => s.id === id ? { ...s, status: 'cancelled', end_date, updated_at: new Date().toISOString() } : s)
        )
        return {} as Subscription
      }
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled', end_date })
        .eq('id', id)
        .eq('user_id', user!.id)
        .select('*, category:categories(*)')
        .single()
      if (error) throw error
      return data as Subscription
    },
    onSuccess: () => { if (!isDemoMode) queryClient.invalidateQueries({ queryKey: QUERY_KEY }) },
  })
}

export function useReactivateSubscription() {
  const { isDemoMode } = useDemoContext()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMode) {
        queryClient.setQueryData<Subscription[]>(QUERY_KEY, (old = []) =>
          old.map(s => s.id === id ? { ...s, status: 'active', end_date: null, updated_at: new Date().toISOString() } : s)
        )
        return {} as Subscription
      }
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ status: 'active', end_date: null })
        .eq('id', id)
        .eq('user_id', user!.id)
        .select('*, category:categories(*)')
        .single()
      if (error) throw error
      return data as Subscription
    },
    onSuccess: () => { if (!isDemoMode) queryClient.invalidateQueries({ queryKey: QUERY_KEY }) },
  })
}

export function useAddPriceHistory() {
  const { isDemoMode } = useDemoContext()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (entry: { subscription_id: string; amount: number; interval: string; effective_from: string }) => {
      if (isDemoMode) {
        const newEntry: PriceHistory = {
          id: crypto.randomUUID(),
          subscription_id: entry.subscription_id,
          amount: entry.amount,
          interval: entry.interval as SubscriptionInterval,
          effective_from: entry.effective_from,
          created_at: new Date().toISOString(),
        }
        queryClient.setQueryData<Subscription[]>(QUERY_KEY, (old = []) =>
          old.map(s => s.id === entry.subscription_id
            ? { ...s, price_history: [...(s.price_history ?? []), newEntry] }
            : s
          )
        )
        return newEntry
      }
      const { data, error } = await supabase.from('price_history').insert([entry]).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => { if (!isDemoMode) queryClient.invalidateQueries({ queryKey: QUERY_KEY }) },
  })
}

export function useDeletePriceHistory() {
  const { isDemoMode } = useDemoContext()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMode) {
        queryClient.setQueryData<Subscription[]>(QUERY_KEY, (old = []) =>
          old.map(s => ({ ...s, price_history: (s.price_history ?? []).filter(ph => ph.id !== id) }))
        )
        return
      }
      const { error } = await supabase.from('price_history').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { if (!isDemoMode) queryClient.invalidateQueries({ queryKey: QUERY_KEY }) },
  })
}

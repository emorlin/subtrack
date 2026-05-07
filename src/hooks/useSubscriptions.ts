import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Subscription, SubscriptionFormData } from '../types'
import { mockSubscriptions } from '../lib/mockData'
import { supabase } from '../lib/supabase'

const QUERY_KEY = ['subscriptions']

export function useSubscriptions() {
  return useQuery<Subscription[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, category:categories(*), price_history(*)')
        .order('created_at', { ascending: true })

      if (error) {
        // No live connection yet — return mock data
        return mockSubscriptions
      }
      return data as Subscription[]
    },
    placeholderData: mockSubscriptions,
  })
}

export function useAddSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (form: SubscriptionFormData) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{ ...form, user_id: (await supabase.auth.getUser()).data.user?.id }])
        .select('*, category:categories(*)')
        .single()
      if (error) throw error
      return data as Subscription
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...form }: Partial<SubscriptionFormData> & { id: string }) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(form)
        .eq('id', id)
        .select('*, category:categories(*)')
        .single()
      if (error) throw error
      return data as Subscription
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export type SubscriptionInterval = 'month' | 'quarter' | 'year'
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled'
export type NotificationType = 'renewal_reminder' | 'price_change' | 'cancelled'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  color_hex: string
  sort_order: number
  created_at: string
}

export interface PriceHistory {
  id: string
  subscription_id: string
  amount: number
  interval: SubscriptionInterval
  effective_from: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  category_id: string | null
  name: string
  amount: number
  currency: string
  interval: SubscriptionInterval
  interval_count: number
  start_date: string
  end_date: string | null
  legacy_amount_paid: number | null
  status: SubscriptionStatus
  notes: string | null
  reminder_days_before: number
  created_at: string
  updated_at: string
  // Joined relations
  category?: Category
  price_history?: PriceHistory[]
}

export interface Notification {
  id: string
  user_id: string
  subscription_id: string | null
  type: NotificationType
  scheduled_at: string
  sent_at: string | null
  is_read: boolean
  created_at: string
  // Joined relations
  subscription?: Pick<Subscription, 'id' | 'name'>
}

// Form types
export interface SubscriptionFormData {
  name: string
  category_id: string | null
  amount: number
  currency: string
  interval: SubscriptionInterval
  interval_count: number
  start_date: string
  end_date: string | null
  legacy_amount_paid: number | null
  notes: string | null
  reminder_days_before: number
}

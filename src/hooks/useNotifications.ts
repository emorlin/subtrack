import { useSubscriptions } from './useSubscriptions'
import { getNextRenewalDate } from '../lib/calculations'
import type { Subscription, SubscriptionInterval } from '../types'

export interface UpcomingRenewal {
  subscription: Subscription
  nextDate: Date
  daysUntil: number
  urgency: 'red' | 'amber' | 'blue'
}

export interface PastRenewal {
  subscription: Subscription
  prevDate: Date
  daysAgo: number
}

function getPrevRenewalDate(
  startDate: string,
  interval: SubscriptionInterval,
  intervalCount: number
): Date {
  const next = getNextRenewalDate(startDate, interval, intervalCount)
  const prev = new Date(next)
  if (interval === 'month') {
    prev.setMonth(prev.getMonth() - intervalCount)
  } else if (interval === 'quarter') {
    prev.setMonth(prev.getMonth() - 3 * intervalCount)
  } else {
    prev.setFullYear(prev.getFullYear() - intervalCount)
  }
  return prev
}

export function useNotifications() {
  const { data: subscriptions = [] } = useSubscriptions()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const active = subscriptions.filter((s) => s.status === 'active')

  // Trial endings within 2 days injected as high-urgency renewals
  const trialUpcoming: UpcomingRenewal[] = active
    .filter((s) => s.trial_ends_at)
    .map((s) => {
      const trialDate = new Date(s.trial_ends_at!)
      const ms = trialDate.getTime() - today.getTime()
      const days = Math.ceil(ms / (1000 * 60 * 60 * 24))
      return { subscription: s, nextDate: trialDate, daysUntil: days }
    })
    .filter((r) => r.daysUntil >= 0 && r.daysUntil <= 2)
    .map((r) => ({ ...r, urgency: 'red' as UpcomingRenewal['urgency'] }))

  const upcoming: UpcomingRenewal[] = [
    ...trialUpcoming,
    ...active
      .map((s) => {
        const nextDate = getNextRenewalDate(s.start_date, s.interval, s.interval_count)
        const ms = nextDate.getTime() - today.getTime()
        const daysUntil = Math.ceil(ms / (1000 * 60 * 60 * 24))
        return { subscription: s, nextDate, daysUntil }
      })
      .filter((r) => r.daysUntil <= 30)
      .map((r) => ({
        ...r,
        urgency: (r.daysUntil <= 3 ? 'red' : r.daysUntil <= 7 ? 'amber' : 'blue') as UpcomingRenewal['urgency'],
      })),
  ].sort((a, b) => a.daysUntil - b.daysUntil)

  const history: PastRenewal[] = active
    .map((s) => {
      const prevDate = getPrevRenewalDate(s.start_date, s.interval, s.interval_count)
      const ms = today.getTime() - prevDate.getTime()
      const daysAgo = Math.floor(ms / (1000 * 60 * 60 * 24))
      return { subscription: s, prevDate, daysAgo }
    })
    .filter((r) => r.daysAgo >= 0 && r.daysAgo <= 60)
    .sort((a, b) => a.daysAgo - b.daysAgo)

  return { upcoming, history }
}

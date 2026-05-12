import type { Subscription, Category } from '../types'
import { getEffectiveCurrentAmount, toMonthlyAmount, calculateTotalPaid, getNextRenewalDate } from './calculations'

export interface Insight {
  id: string
  label: string
  value: string
  detail: string
  type: 'positive' | 'warning' | 'neutral'
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString('sv-SE')
}

function getEffectiveAmountAt(sub: Subscription, date: Date): number {
  if (!sub.price_history || sub.price_history.length === 0) return sub.amount
  const sorted = [...sub.price_history].sort(
    (a, b) => new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime()
  )
  const applicable = sorted.find((ph) => new Date(ph.effective_from) <= date)
  return applicable ? applicable.amount : sub.amount
}

// 1. Total price increases last 12 months
function priceIncreasesInsight(active: Subscription[]): Insight | null {
  const yearAgo = new Date()
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)

  let totalDelta = 0
  let count = 0

  for (const sub of active) {
    const now = toMonthlyAmount(getEffectiveCurrentAmount(sub), sub.interval, sub.interval_count)
    const then = toMonthlyAmount(getEffectiveAmountAt(sub, yearAgo), sub.interval, sub.interval_count)
    const delta = now - then
    if (delta > 0.5) {
      totalDelta += delta
      count++
    }
  }

  if (totalDelta < 5) return null

  return {
    id: 'price-increases',
    label: `${count} ${count === 1 ? 'tjänst har' : 'tjänster har'} höjt priset senaste 12 mån`,
    value: `+${fmt(totalDelta)} kr/mån`,
    detail: 'jämfört med för ett år sedan',
    type: 'warning',
  }
}

// 2. Paused subscriptions
function pausedInsight(subs: Subscription[]): Insight | null {
  const paused = subs.filter((s) => s.status === 'paused')
  if (paused.length === 0) return null

  const total = paused.reduce(
    (sum, s) => sum + toMonthlyAmount(getEffectiveCurrentAmount(s), s.interval, s.interval_count),
    0
  )

  return {
    id: 'paused',
    label: `${paused.length} pausade ${paused.length === 1 ? 'abonnemang' : 'abonnemang'}`,
    value: `${fmt(total)} kr/mån`,
    detail: 'som inte används just nu',
    type: 'warning',
  }
}

// 3. Most price-hiked subscription (since original price)
function mostHikedInsight(active: Subscription[]): Insight | null {
  const candidates = active
    .filter((s) => (s.price_history?.length ?? 0) >= 1)
    .map((s) => {
      const origMonthly = toMonthlyAmount(s.amount, s.interval, s.interval_count)
      const currMonthly = toMonthlyAmount(getEffectiveCurrentAmount(s), s.interval, s.interval_count)
      const delta = currMonthly - origMonthly
      const pct = origMonthly > 0 ? Math.round((delta / origMonthly) * 100) : 0
      return { sub: s, delta, pct, hikes: s.price_history!.length }
    })
    .filter((x) => x.delta > 0)
    .sort((a, b) => b.delta - a.delta)

  if (candidates.length === 0) return null
  const top = candidates[0]

  return {
    id: 'most-hiked',
    label: `${top.sub.name} har höjts ${top.hikes} ${top.hikes === 1 ? 'gång' : 'gånger'} sedan start`,
    value: `+${fmt(top.delta)} kr/mån`,
    detail: `+${top.pct}% totalt`,
    type: 'warning',
  }
}

// 4. Dominant category (only if >35%)
function dominantCategoryInsight(active: Subscription[], categories: Category[]): Insight | null {
  const total = active.reduce(
    (sum, s) => sum + toMonthlyAmount(getEffectiveCurrentAmount(s), s.interval, s.interval_count),
    0
  )
  if (total === 0) return null

  const ranked = categories
    .map((cat) => ({
      name: cat.name,
      amount: active
        .filter((s) => s.category_id === cat.id)
        .reduce(
          (sum, s) => sum + toMonthlyAmount(getEffectiveCurrentAmount(s), s.interval, s.interval_count),
          0
        ),
    }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  const top = ranked[0]
  if (!top) return null

  const pct = Math.round((top.amount / total) * 100)
  if (pct < 35) return null

  return {
    id: 'dominant-category',
    label: `${top.name} är din största kostnadspost`,
    value: `${pct}% av totalen`,
    detail: `${fmt(top.amount)} kr/mån`,
    type: 'neutral',
  }
}

// 5. Cashflow next 30 days
function cashflowInsight(active: Subscription[]): Insight | null {
  const in30 = new Date()
  in30.setDate(in30.getDate() + 30)

  const upcoming = active.filter((s) => {
    const renewal = getNextRenewalDate(s.start_date, s.interval, s.interval_count)
    return renewal <= in30
  })

  if (upcoming.length === 0) return null

  const total = upcoming.reduce((sum, s) => sum + getEffectiveCurrentAmount(s), 0)

  return {
    id: 'cashflow-30d',
    label: `${upcoming.length} ${upcoming.length === 1 ? 'förnyelse' : 'förnyelser'} de nästa 30 dagarna`,
    value: `${fmt(total)} kr`,
    detail: 'faktiska betalningar att vänta',
    type: 'neutral',
  }
}

// 6. Cost per day
function costPerDayInsight(active: Subscription[]): Insight | null {
  const monthly = active.reduce(
    (sum, s) => sum + toMonthlyAmount(getEffectiveCurrentAmount(s), s.interval, s.interval_count),
    0
  )
  if (monthly === 0) return null

  return {
    id: 'cost-per-day',
    label: 'Daglig abonnemangskostnad',
    value: `${fmt(monthly / 30.44)} kr/dag`,
    detail: `${fmt(monthly)} kr/mån`,
    type: 'neutral',
  }
}

// 7. Total paid all time
function totalPaidInsight(subs: Subscription[]): Insight | null {
  const total = subs.reduce((sum, s) => sum + calculateTotalPaid(s), 0)
  if (total < 100) return null

  return {
    id: 'total-paid',
    label: 'Totalt betalt på abonnemang',
    value: `${fmt(total)} kr`,
    detail: 'sedan första abonnemanget',
    type: 'neutral',
  }
}

// 8. Longest running subscription
function longestSubInsight(active: Subscription[]): Insight | null {
  if (active.length === 0) return null

  const oldest = active.reduce(
    (top, s) => (new Date(s.start_date) < new Date(top.start_date) ? s : top),
    active[0]
  )

  const years = (Date.now() - new Date(oldest.start_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  if (years < 1) return null

  const duration = years >= 2 ? `${Math.floor(years)} år` : `${Math.round(years * 12)} månader`
  const since = new Date(oldest.start_date).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'short',
  })

  return {
    id: 'longest-sub',
    label: `${oldest.name} — ditt äldsta abonnemang`,
    value: duration,
    detail: `sedan ${since}`,
    type: 'positive',
  }
}

export function getTopInsights(
  subs: Subscription[],
  categories: Category[],
  max = 3
): Insight[] {
  const active = subs.filter((s) => s.status === 'active')

  const all = [
    priceIncreasesInsight(active),
    pausedInsight(subs),
    mostHikedInsight(active),
    dominantCategoryInsight(active, categories),
    cashflowInsight(active),
    costPerDayInsight(active),
    totalPaidInsight(subs),
    longestSubInsight(active),
  ].filter((i): i is Insight => i !== null)

  return all.slice(0, max)
}

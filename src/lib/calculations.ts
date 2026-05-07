import type { Subscription, PriceHistory, SubscriptionInterval } from '../types'

export function toMonthlyAmount(
  amount: number,
  interval: SubscriptionInterval,
  intervalCount: number
): number {
  const periodsPerYear: Record<SubscriptionInterval, number> = {
    month: 12,
    quarter: 4,
    year: 1,
  }
  const periods = periodsPerYear[interval] / intervalCount
  return (amount * periods) / 12
}

function calculatePeriodsBetween(
  from: Date,
  to: Date,
  interval: SubscriptionInterval,
  intervalCount: number
): number {
  const msPerDay = 1000 * 60 * 60 * 24
  const days = (to.getTime() - from.getTime()) / msPerDay

  const daysPerPeriod: Record<SubscriptionInterval, number> = {
    month: 30.4375,
    quarter: 91.3125,
    year: 365.25,
  }

  return Math.floor(days / (daysPerPeriod[interval] * intervalCount))
}

function calculateFromPriceHistory(
  start: Date,
  today: Date,
  priceHistory: PriceHistory[],
  currentAmount: number,
  interval: SubscriptionInterval,
  intervalCount: number
): number {
  if (!priceHistory || priceHistory.length === 0) {
    const periods = calculatePeriodsBetween(start, today, interval, intervalCount)
    return periods * currentAmount
  }

  // Only consider entries that have already taken effect
  const sorted = [...priceHistory]
    .filter((ph) => new Date(ph.effective_from) <= today)
    .sort((a, b) => new Date(a.effective_from).getTime() - new Date(b.effective_from).getTime())

  if (sorted.length === 0) {
    const periods = calculatePeriodsBetween(start, today, interval, intervalCount)
    return periods * currentAmount
  }

  let total = 0

  // Period before the first price change: use currentAmount (the baseline/original price)
  const firstChangeDate = new Date(sorted[0].effective_from)
  if (firstChangeDate > start) {
    const periods = calculatePeriodsBetween(start, firstChangeDate, interval, intervalCount)
    total += periods * currentAmount
  }

  // Each price history period: from effective_from until the next entry (or today)
  for (let i = 0; i < sorted.length; i++) {
    const periodStart = new Date(sorted[i].effective_from) < start
      ? start
      : new Date(sorted[i].effective_from)
    const periodEnd = i + 1 < sorted.length
      ? new Date(sorted[i + 1].effective_from)
      : today
    const clampedEnd = periodEnd > today ? today : periodEnd

    if (periodStart >= clampedEnd) continue

    const periods = calculatePeriodsBetween(periodStart, clampedEnd, interval, intervalCount)
    total += periods * sorted[i].amount
  }

  return total
}

export function calculateTotalPaid(subscription: Subscription): number {
  const {
    amount,
    interval,
    interval_count,
    start_date,
    legacy_amount_paid,
    price_history,
    created_at,
  } = subscription

  const today = new Date()
  const start = new Date(start_date)

  if (legacy_amount_paid !== null) {
    const sinceAdded = calculatePeriodsBetween(
      new Date(created_at),
      today,
      interval,
      interval_count
    )
    return legacy_amount_paid + sinceAdded * amount
  }

  return calculateFromPriceHistory(
    start,
    today,
    price_history ?? [],
    amount,
    interval,
    interval_count
  )
}

export function getEffectiveCurrentAmount(subscription: Subscription): number {
  if (!subscription.price_history || subscription.price_history.length === 0) {
    return subscription.amount
  }
  const today = new Date()
  const sorted = [...subscription.price_history].sort(
    (a, b) => new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime()
  )
  const latest = sorted.find((ph) => new Date(ph.effective_from) <= today)
  return latest ? latest.amount : subscription.amount
}

export function toYearlyAmount(
  amount: number,
  interval: SubscriptionInterval,
  intervalCount: number
): number {
  return toMonthlyAmount(amount, interval, intervalCount) * 12
}

export function formatCurrency(amount: number, currency = 'SEK'): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getNextRenewalDate(
  startDate: string,
  interval: SubscriptionInterval,
  intervalCount: number
): Date {
  const start = new Date(startDate)
  const today = new Date()

  const next = new Date(start)

  while (next <= today) {
    if (interval === 'month') {
      next.setMonth(next.getMonth() + intervalCount)
    } else if (interval === 'quarter') {
      next.setMonth(next.getMonth() + 3 * intervalCount)
    } else {
      next.setFullYear(next.getFullYear() + intervalCount)
    }
  }

  return next
}

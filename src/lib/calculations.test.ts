import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  toMonthlyAmount,
  calculateTotalPaid,
  getEffectiveCurrentAmount,
  getNextRenewalDate,
  getLastRenewalDate,
} from './calculations'
import type { Subscription } from '../types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSub(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: 'sub-1',
    user_id: 'user-1',
    name: 'Test',
    amount: 100,
    currency: 'SEK',
    interval: 'month',
    interval_count: 1,
    start_date: '2024-01-01',
    end_date: null,
    status: 'active',
    notes: null,
    reminder_days_before: 3,
    legacy_amount_paid: null,
    price_history: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    category_id: null,
    trial_ends_at: null,
    ...overrides,
  } as Subscription
}

// ---------------------------------------------------------------------------
// toMonthlyAmount
// ---------------------------------------------------------------------------

describe('toMonthlyAmount', () => {
  it('monthly interval count 1 → same amount', () => {
    expect(toMonthlyAmount(100, 'month', 1)).toBe(100)
  })

  it('yearly → divides by 12', () => {
    expect(toMonthlyAmount(1200, 'year', 1)).toBe(100)
  })

  it('quarterly → divides by 3', () => {
    expect(toMonthlyAmount(300, 'quarter', 1)).toBe(100)
  })

  it('every 2 months → halves the monthly rate', () => {
    expect(toMonthlyAmount(200, 'month', 2)).toBe(100)
  })

  it('every 2 years → divides by 24', () => {
    expect(toMonthlyAmount(2400, 'year', 2)).toBe(100)
  })
})

// ---------------------------------------------------------------------------
// calculateTotalPaid
// ---------------------------------------------------------------------------

describe('calculateTotalPaid', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('active monthly sub — counts full periods from start_date', () => {
    vi.setSystemTime(new Date(2024, 4, 1)) // May 1 local — 121 days from Jan 1 → floor(121/30.4375)=3
    const sub = makeSub({ start_date: '2024-01-01', amount: 100, interval: 'month', interval_count: 1 })
    expect(calculateTotalPaid(sub)).toBe(300)
  })

  it('active yearly sub — zero periods if less than one year elapsed', () => {
    vi.setSystemTime(new Date('2024-06-01'))
    const sub = makeSub({ start_date: '2024-01-01', amount: 1200, interval: 'year', interval_count: 1 })
    expect(calculateTotalPaid(sub)).toBe(0)
  })

  it('active yearly sub — one period after one year', () => {
    vi.setSystemTime(new Date('2025-01-15'))
    const sub = makeSub({ start_date: '2024-01-01', amount: 1200, interval: 'year', interval_count: 1 })
    expect(calculateTotalPaid(sub)).toBe(1200)
  })

  it('cancelled sub — stops counting at end_date', () => {
    vi.setSystemTime(new Date(2024, 11, 1)) // Dec 1 local
    const sub = makeSub({
      start_date: '2024-01-01',
      amount: 100,
      interval: 'month',
      interval_count: 1,
      status: 'cancelled',
      end_date: '2024-05-01', // 121 days from Jan 1 → 3 periods
    })
    expect(calculateTotalPaid(sub)).toBe(300)
  })

  it('paused sub — stops counting at updated_at', () => {
    vi.setSystemTime(new Date(2024, 11, 1)) // Dec 1 local
    const sub = makeSub({
      start_date: '2024-01-01',
      amount: 100,
      interval: 'month',
      interval_count: 1,
      status: 'paused',
      updated_at: new Date(2024, 4, 1).toISOString(), // May 1 local → 3 periods
    })
    expect(calculateTotalPaid(sub)).toBe(300)
  })

  it('legacy_amount_paid adds periods since created_at', () => {
    vi.setSystemTime(new Date(2024, 4, 1)) // May 1 local
    const sub = makeSub({
      start_date: '2023-01-01',
      created_at: new Date(2024, 0, 1).toISOString(), // Jan 1 local
      amount: 100,
      interval: 'month',
      interval_count: 1,
      legacy_amount_paid: 500,
    })
    // 500 (legacy) + 3 months since created_at (Jan→May = 3 periods)
    expect(calculateTotalPaid(sub)).toBe(800)
  })

  it('price history — uses correct price per period', () => {
    vi.setSystemTime(new Date(2024, 6, 1)) // Jul 1 local
    const sub = makeSub({
      start_date: '2024-01-01',
      amount: 100,
      interval: 'month',
      interval_count: 1,
      price_history: [
        { id: 'ph-1', subscription_id: 'sub-1', amount: 150, interval: 'month', effective_from: '2024-04-01', created_at: '' },
      ],
    })
    // Jan–Apr (91 days → 2 periods) × 100 = 200, Apr–Jul (91 days → 2 periods) × 150 = 300 → 500
    expect(calculateTotalPaid(sub)).toBe(500)
  })

  it('future price history entry is ignored', () => {
    vi.setSystemTime(new Date(2024, 4, 1)) // May 1 local → 3 periods from Jan 1
    const sub = makeSub({
      start_date: '2024-01-01',
      amount: 100,
      interval: 'month',
      interval_count: 1,
      price_history: [
        { id: 'ph-1', subscription_id: 'sub-1', amount: 999, interval: 'month', effective_from: '2025-01-01', created_at: '' },
      ],
    })
    expect(calculateTotalPaid(sub)).toBe(300)
  })
})

// ---------------------------------------------------------------------------
// getEffectiveCurrentAmount
// ---------------------------------------------------------------------------

describe('getEffectiveCurrentAmount', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('no price history → returns amount', () => {
    const sub = makeSub({ amount: 99, price_history: [] })
    expect(getEffectiveCurrentAmount(sub)).toBe(99)
  })

  it('past price history entry → returns that amount', () => {
    vi.setSystemTime(new Date('2024-06-01'))
    const sub = makeSub({
      amount: 100,
      price_history: [
        { id: 'ph-1', subscription_id: 'sub-1', amount: 149, interval: 'month', effective_from: '2024-03-01', created_at: '' },
      ],
    })
    expect(getEffectiveCurrentAmount(sub)).toBe(149)
  })

  it('multiple entries → returns most recent past entry', () => {
    vi.setSystemTime(new Date('2024-06-01'))
    const sub = makeSub({
      amount: 100,
      price_history: [
        { id: 'ph-1', subscription_id: 'sub-1', amount: 120, interval: 'month', effective_from: '2024-02-01', created_at: '' },
        { id: 'ph-2', subscription_id: 'sub-1', amount: 149, interval: 'month', effective_from: '2024-05-01', created_at: '' },
      ],
    })
    expect(getEffectiveCurrentAmount(sub)).toBe(149)
  })

  it('future-only entry → falls back to amount', () => {
    vi.setSystemTime(new Date('2024-06-01'))
    const sub = makeSub({
      amount: 100,
      price_history: [
        { id: 'ph-1', subscription_id: 'sub-1', amount: 199, interval: 'month', effective_from: '2025-01-01', created_at: '' },
      ],
    })
    expect(getEffectiveCurrentAmount(sub)).toBe(100)
  })
})

// ---------------------------------------------------------------------------
// getNextRenewalDate / getLastRenewalDate
//
// These functions parse start_date with new Date(string) → UTC midnight, then
// mutate with setMonth() which works in local time. Comparing full Date objects
// breaks across DST boundaries. We compare calendar date parts instead.
// ---------------------------------------------------------------------------

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

describe('getNextRenewalDate', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('monthly — next renewal is one month after last', () => {
    vi.setSystemTime(new Date('2024-03-15'))
    expect(ymd(getNextRenewalDate('2024-01-01', 'month', 1))).toBe('2024-04-01')
  })

  it('yearly — next renewal is next year', () => {
    vi.setSystemTime(new Date('2024-06-01'))
    expect(ymd(getNextRenewalDate('2024-01-01', 'year', 1))).toBe('2025-01-01')
  })

  it('start date in the future — returns start date', () => {
    vi.setSystemTime(new Date('2024-01-01'))
    expect(ymd(getNextRenewalDate('2025-06-01', 'month', 1))).toBe('2025-06-01')
  })

  it('quarterly — steps by 3 months', () => {
    vi.setSystemTime(new Date('2024-05-01'))
    expect(ymd(getNextRenewalDate('2024-02-01', 'quarter', 1))).toBe('2024-08-01')
  })
})

describe('getLastRenewalDate', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('monthly — last renewal is the most recent past occurrence', () => {
    vi.setSystemTime(new Date('2024-03-15'))
    expect(ymd(getLastRenewalDate('2024-01-01', 'month', 1))).toBe('2024-03-01')
  })

  it('start date in the future — returns start date', () => {
    vi.setSystemTime(new Date('2024-01-01'))
    expect(ymd(getLastRenewalDate('2025-06-01', 'month', 1))).toBe('2025-06-01')
  })

  it('exactly on renewal date — that date is the last', () => {
    vi.setSystemTime(new Date('2024-04-01'))
    expect(ymd(getLastRenewalDate('2024-01-01', 'month', 1))).toBe('2024-04-01')
  })
})

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { isActiveInMonth, getAmountForMonth, buildMonthBars } from './BarChart'
import type { Subscription } from '../../types'

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
// isActiveInMonth
// ---------------------------------------------------------------------------

describe('isActiveInMonth', () => {
  it('active sub started before month → true', () => {
    const sub = makeSub({ start_date: '2024-01-01', status: 'active' })
    expect(isActiveInMonth(sub, 2024, 3)).toBe(true)
  })

  it('active sub starting after month → false', () => {
    const sub = makeSub({ start_date: '2024-05-01', status: 'active' })
    expect(isActiveInMonth(sub, 2024, 3)).toBe(false)
  })

  it('active sub starting within the month → true', () => {
    const sub = makeSub({ start_date: '2024-03-15', status: 'active' })
    expect(isActiveInMonth(sub, 2024, 3)).toBe(true)
  })

  it('cancelled with end_date before month → false', () => {
    const sub = makeSub({
      start_date: '2024-01-01',
      status: 'cancelled',
      end_date: '2024-02-28',
    })
    expect(isActiveInMonth(sub, 2024, 3)).toBe(false)
  })

  it('cancelled with end_date within month → true', () => {
    const sub = makeSub({
      start_date: '2024-01-01',
      status: 'cancelled',
      end_date: '2024-03-15',
    })
    expect(isActiveInMonth(sub, 2024, 3)).toBe(true)
  })

  it('cancelled with no end_date falls back to updated_at', () => {
    const sub = makeSub({
      start_date: '2024-01-01',
      status: 'cancelled',
      end_date: null,
      updated_at: '2024-02-15T00:00:00Z',
    })
    expect(isActiveInMonth(sub, 2024, 3)).toBe(false)
  })

  it('paused with updated_at before month → false', () => {
    const sub = makeSub({
      start_date: '2024-01-01',
      status: 'paused',
      updated_at: '2024-02-01T00:00:00Z',
    })
    expect(isActiveInMonth(sub, 2024, 3)).toBe(false)
  })

  it('paused with updated_at within month → true', () => {
    const sub = makeSub({
      start_date: '2024-01-01',
      status: 'paused',
      updated_at: '2024-03-15T00:00:00Z',
    })
    expect(isActiveInMonth(sub, 2024, 3)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// getAmountForMonth
// ---------------------------------------------------------------------------

describe('getAmountForMonth', () => {
  it('no price history → returns base amount', () => {
    const sub = makeSub({ amount: 99, price_history: [] })
    expect(getAmountForMonth(sub, 2024, 3)).toBe(99)
  })

  it('price history entry before month → returns that amount', () => {
    const sub = makeSub({
      amount: 100,
      price_history: [
        { id: 'ph-1', subscription_id: 'sub-1', amount: 149, interval: 'month', effective_from: '2024-02-01', created_at: '' },
      ],
    })
    expect(getAmountForMonth(sub, 2024, 3)).toBe(149)
  })

  it('price history entry after month → falls back to base amount', () => {
    const sub = makeSub({
      amount: 100,
      price_history: [
        { id: 'ph-1', subscription_id: 'sub-1', amount: 149, interval: 'month', effective_from: '2024-05-01', created_at: '' },
      ],
    })
    expect(getAmountForMonth(sub, 2024, 3)).toBe(100)
  })

  it('multiple entries — picks most recent before month end', () => {
    const sub = makeSub({
      amount: 100,
      price_history: [
        { id: 'ph-1', subscription_id: 'sub-1', amount: 120, interval: 'month', effective_from: '2024-01-01', created_at: '' },
        { id: 'ph-2', subscription_id: 'sub-1', amount: 149, interval: 'month', effective_from: '2024-03-01', created_at: '' },
        { id: 'ph-3', subscription_id: 'sub-1', amount: 199, interval: 'month', effective_from: '2024-06-01', created_at: '' },
      ],
    })
    expect(getAmountForMonth(sub, 2024, 3)).toBe(149)
  })
})

// ---------------------------------------------------------------------------
// buildMonthBars
// ---------------------------------------------------------------------------

describe('buildMonthBars', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('returns 12 bars', () => {
    vi.setSystemTime(new Date('2024-06-15'))
    const bars = buildMonthBars([], 2024)
    expect(bars).toHaveLength(12)
  })

  it('months before current are past', () => {
    vi.setSystemTime(new Date('2024-06-15'))
    const bars = buildMonthBars([], 2024)
    expect(bars[0].state).toBe('past')   // jan
    expect(bars[4].state).toBe('past')   // maj
  })

  it('current month is current', () => {
    vi.setSystemTime(new Date('2024-06-15'))
    const bars = buildMonthBars([], 2024)
    expect(bars[5].state).toBe('current') // jun
  })

  it('months after current are future', () => {
    vi.setSystemTime(new Date('2024-06-15'))
    const bars = buildMonthBars([], 2024)
    expect(bars[6].state).toBe('future')  // jul
    expect(bars[11].state).toBe('future') // dec
  })

  it('active sub contributes monthly amount to each active month', () => {
    vi.setSystemTime(new Date('2024-06-15'))
    const sub = makeSub({ start_date: '2024-01-01', amount: 100, interval: 'month', interval_count: 1 })
    const bars = buildMonthBars([sub], 2024)
    expect(bars[0].amount).toBe(100)
    expect(bars[5].amount).toBe(100)
  })

  it('cancelled sub contributes zero after end_date month', () => {
    vi.setSystemTime(new Date('2024-06-15'))
    const sub = makeSub({
      start_date: '2024-01-01',
      amount: 100,
      interval: 'month',
      interval_count: 1,
      status: 'cancelled',
      end_date: '2024-03-15',
    })
    const bars = buildMonthBars([sub], 2024)
    expect(bars[2].amount).toBe(100) // mars — aktiv
    expect(bars[3].amount).toBe(0)   // april — avslutad
  })

  it('yearly sub contributes correct monthly equivalent', () => {
    vi.setSystemTime(new Date('2024-06-15'))
    const sub = makeSub({ start_date: '2024-01-01', amount: 1200, interval: 'year', interval_count: 1 })
    const bars = buildMonthBars([sub], 2024)
    expect(bars[0].amount).toBe(100) // 1200/12 = 100
  })

  it('previous year — all bars are past', () => {
    vi.setSystemTime(new Date('2024-06-15'))
    const bars = buildMonthBars([], 2023)
    expect(bars.every(b => b.state === 'past')).toBe(true)
  })
})

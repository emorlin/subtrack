import { useState } from 'react'
import type { Subscription } from '../../types'
import { toMonthlyAmount } from '../../lib/calculations'

const MONTH_LABELS = ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec']

export interface MonthBar {
  month: number
  label: string
  amount: number
  state: 'past' | 'current' | 'future'
}

interface BarChartProps {
  bars: MonthBar[]
  onHover?: (bar: MonthBar | null) => void
  onClick?: (bar: MonthBar) => void
  chartHeight?: number
}

export function isActiveInMonth(sub: Subscription, year: number, month: number): boolean {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 0)

  const start = new Date(sub.start_date)
  if (start > monthEnd) return false

  if (sub.status === 'cancelled') {
    // end_date is authoritative when set; otherwise fall back to updated_at
    const cutoff = sub.end_date
      ? new Date(sub.end_date)
      : new Date(sub.updated_at)
    if (cutoff < monthStart) return false
  }

  return true
}

export function getAmountForMonth(sub: Subscription, year: number, month: number): number {
  const monthEnd = new Date(year, month, 0) // last day of month

  if (!sub.price_history || sub.price_history.length === 0) {
    return sub.amount
  }

  // Find the most recent price_history entry that took effect on or before monthEnd
  const sorted = [...sub.price_history].sort(
    (a, b) => new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime()
  )
  const applicable = sorted.find((ph) => new Date(ph.effective_from) <= monthEnd)
  return applicable ? applicable.amount : sub.amount
}

export function buildMonthBars(subscriptions: Subscription[], year: number): MonthBar[] {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  return MONTH_LABELS.map((label, i) => {
    const month = i + 1

    const amount = subscriptions
      .filter((s) => isActiveInMonth(s, year, month))
      .reduce((sum, s) => sum + toMonthlyAmount(
        getAmountForMonth(s, year, month),
        s.interval,
        s.interval_count
      ), 0)

    let state: MonthBar['state']
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      state = 'past'
    } else if (year === currentYear && month === currentMonth) {
      state = 'current'
    } else {
      state = 'future'
    }

    return { month, label, amount, state }
  })
}

export default function BarChart({ bars, onHover, onClick, chartHeight = 80 }: BarChartProps) {
  const [activeMonth, setActiveMonth] = useState<number | null>(null)
  const max = Math.max(...bars.map((b) => b.amount), 1)

  function handleActivate(bar: MonthBar) {
    setActiveMonth(bar.month)
    onHover?.(bar)
  }

  function handleDeactivate() {
    setActiveMonth(null)
    onHover?.(null)
  }

  return (
    <div role="img" aria-label="Stapeldiagram: månadsvis kostnad" className="flex items-end gap-1">
      {bars.map((bar) => {
        const isActive = activeMonth === bar.month
        const barH = Math.max(Math.round((bar.amount / max) * chartHeight), bar.amount > 0 ? 4 : 2)
        const color =
          bar.state === 'current' ? 'bg-[var(--c-accent)]'
          : bar.state === 'past'  ? 'bg-[var(--c-accent-muted)]'
          :                         'bg-[var(--c-border)]'
        const cap = bar.label.charAt(0).toUpperCase() + bar.label.slice(1)
        const stateLabel = bar.state === 'future' ? ' (prognos)' : ''
        const ariaLabel = `${cap}: ${Math.round(bar.amount).toLocaleString('sv-SE')} kr${stateLabel}`

        return (
          <button
            key={bar.month}
            type="button"
            aria-label={ariaLabel}
            onMouseEnter={() => handleActivate(bar)}
            onMouseLeave={handleDeactivate}
            onFocus={() => handleActivate(bar)}
            onBlur={handleDeactivate}
            onClick={() => onClick?.(bar)}
            className="flex-1 flex flex-col items-center gap-1 relative bg-transparent border-0 p-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--c-accent)] focus-visible:outline-offset-2 focus-visible:rounded-[2px]"
          >
            {/* Tooltip — visas vid hover och tangentbordsfokus */}
            {isActive && (
              <div aria-hidden="true" className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-[var(--c-text-primary)] text-[var(--c-bg-card)] text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] whitespace-nowrap z-10 pointer-events-none">
                {Math.round(bar.amount).toLocaleString('sv-SE')} kr
              </div>
            )}

            {/* Bar */}
            <div
              aria-hidden="true"
              className={`w-full rounded-[2px] transition-all duration-150 ${color} ${isActive ? 'opacity-70' : ''}`}
              style={{ height: barH }}
            />

            {/* Month label */}
            <span
              aria-hidden="true"
              className={`text-[9px] font-medium ${
                bar.state === 'current' ? 'text-[var(--c-accent)]' : 'text-[var(--c-text-subtle)]'
              }`}
            >
              {bar.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

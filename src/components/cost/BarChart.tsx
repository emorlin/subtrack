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

  if (sub.end_date) {
    const end = new Date(sub.end_date)
    if (end < monthStart) return false
  } else if (sub.status === 'cancelled') {
    // Use updated_at as proxy for when it was cancelled
    const cancelledAt = new Date(sub.updated_at)
    if (cancelledAt < monthStart) return false
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
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null)
  const max = Math.max(...bars.map((b) => b.amount), 1)

  function handleEnter(bar: MonthBar) {
    setHoveredMonth(bar.month)
    onHover?.(bar)
  }

  function handleLeave() {
    setHoveredMonth(null)
    onHover?.(null)
  }

  return (
    <div className="flex items-end gap-1">
      {bars.map((bar) => {
        const isHovered = hoveredMonth === bar.month
        const barH = Math.max(Math.round((bar.amount / max) * chartHeight), bar.amount > 0 ? 4 : 2)
        const color =
          bar.state === 'current' ? 'bg-[#1B4FD8]'
          : bar.state === 'past'  ? 'bg-[#BFDBFE]'
          :                         'bg-[#E5E7EB]'

        return (
          <div
            key={bar.month}
            className="flex-1 flex flex-col items-center gap-1 relative cursor-pointer"
            onMouseEnter={() => handleEnter(bar)}
            onMouseLeave={handleLeave}
            onClick={() => onClick?.(bar)}
          >
            {/* Tooltip */}
            {isHovered && (
              <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-[#111827] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] whitespace-nowrap z-10 pointer-events-none">
                {Math.round(bar.amount).toLocaleString('sv-SE')} kr
              </div>
            )}

            {/* Bar */}
            <div
              className={`w-full rounded-[2px] transition-all duration-150 ${color} ${isHovered ? 'opacity-70' : ''}`}
              style={{ height: barH }}
            />

            {/* Month label */}
            <span
              className={`text-[9px] font-medium ${
                bar.state === 'current' ? 'text-[#1B4FD8]' : 'text-[#9CA3AF]'
              }`}
            >
              {bar.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

import { useState } from 'react'
import BarChart, { buildMonthBars, isActiveInMonth } from './BarChart'
import type { MonthBar } from './BarChart'
import CategoryBreakdown from './CategoryBreakdown'
import { useSubscriptions } from '../../hooks/useSubscriptions'
import { useCategories } from '../../hooks/useCategories'
import { toMonthlyAmount } from '../../lib/calculations'

const MONTH_LABELS = ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec']

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function CostView() {
  const { data: subscriptions = [] } = useSubscriptions()
  const { data: categories = [] } = useCategories()
  const [hoveredBar, setHoveredBar] = useState<MonthBar | null>(null)

  const now = new Date()
  const currentMonth = now.getMonth()     // 0-indexed
  const currentYear = now.getFullYear()

  const [selectedYear, setSelectedYear] = useState(currentYear)

  // Earliest year any subscription started
  const minYear = subscriptions.length > 0
    ? Math.min(...subscriptions.map((s) => new Date(s.start_date).getFullYear()))
    : currentYear

  const bars = buildMonthBars(subscriptions, selectedYear)

  // Metrics derived from bars
  const nonFutureBars = bars.filter((b) => b.state !== 'future')
  const ytd = nonFutureBars.reduce((sum, b) => sum + b.amount, 0)
  const yearTotal = bars.reduce((sum, b) => sum + b.amount, 0)
  const monthlyAvg = yearTotal / 12

  const isCurrentYear = selectedYear === currentYear
  const isPastYear = selectedYear < currentYear

  const ytdLabel = isCurrentYear
    ? `${cap(MONTH_LABELS[0])}-${MONTH_LABELS[currentMonth]} ${selectedYear}`
    : `${selectedYear} totalt`

  const forecastLabel = isPastYear ? 'Helår totalt' : 'Prognos helår'

  // Most expensive active subscription (always current)
  const activeNow = subscriptions.filter((s) => s.status === 'active')
  const mostExpensive = activeNow.reduce<typeof activeNow[0] | null>(
    (top, s) =>
      !top ||
      toMonthlyAmount(s.amount, s.interval, s.interval_count) >
        toMonthlyAmount(top.amount, top.interval, top.interval_count)
        ? s
        : top,
    null
  )

  // Right column: use hovered bar, fall back to current month bar
  const displayBar = hoveredBar ?? bars.find((b) => b.state === 'current') ?? bars[nonFutureBars.length - 1] ?? bars[0]
  const displayMonthLabel = cap(displayBar.label)
  const displayAmount = Math.round(displayBar.amount).toLocaleString('sv-SE')

  // Category breakdown for the displayed month
  const subsInDisplayMonth = subscriptions.filter((s) =>
    isActiveInMonth(s, selectedYear, displayBar.month)
  )
  const categoryRows = categories
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      color_hex: cat.color_hex,
      amount: subsInDisplayMonth
        .filter((s) => s.category_id === cat.id)
        .reduce((sum, s) => sum + toMonthlyAmount(s.amount, s.interval, s.interval_count), 0),
    }))
    .filter((r) => r.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label={ytdLabel} value={`${Math.round(ytd).toLocaleString('sv-SE')} kr`} accent />
        <MetricCard label={forecastLabel} value={`${Math.round(yearTotal).toLocaleString('sv-SE')} kr`} />
        <MetricCard label="Snitt / mån" value={`${Math.round(monthlyAvg).toLocaleString('sv-SE')} kr`} />
        <MetricCard label="Dyraste tjänst" value={mostExpensive?.name ?? '—'} />
      </div>

      {/* Chart + breakdown */}
      <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:gap-8">

          {/* Bar chart */}
          <div className="flex-1 min-w-0">
            {/* Chart header with year nav */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-medium text-[#9CA3AF] tracking-wider uppercase">
                Månadsvis
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedYear((y) => y - 1)}
                  disabled={selectedYear <= minYear}
                  className="w-6 h-6 flex items-center justify-center text-[#6B7280] hover:text-[#111827] disabled:opacity-25 transition-colors text-[16px] leading-none"
                >
                  ‹
                </button>
                <span className="text-[13px] font-semibold text-[#111827] w-10 text-center tabular-nums">
                  {selectedYear}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedYear((y) => y + 1)}
                  disabled={selectedYear >= currentYear}
                  className="w-6 h-6 flex items-center justify-center text-[#6B7280] hover:text-[#111827] disabled:opacity-25 transition-colors text-[16px] leading-none"
                >
                  ›
                </button>
              </div>
            </div>
            <BarChart bars={bars} onHover={setHoveredBar} />
          </div>

          {/* Divider (desktop) */}
          <div className="hidden md:block w-px bg-[#E5E7EB] shrink-0" />

          {/* Category breakdown */}
          <div className="md:w-[220px] shrink-0 mt-5 md:mt-0">
            <p className="text-[11px] font-medium text-[#9CA3AF] tracking-wider uppercase mb-1">
              Per kategori ({displayMonthLabel})
            </p>
            <p className="text-[22px] font-semibold text-[#111827] tracking-[-0.3px] mb-3">
              {displayAmount} kr
            </p>
            <CategoryBreakdown rows={categoryRows} />
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-[#F9FAFB] rounded-lg p-3">
      <p className="text-[11px] text-[#6B7280] mb-1">{label}</p>
      <p
        className={`text-[20px] font-semibold tracking-[-0.3px] leading-tight ${
          accent ? 'text-[#1B4FD8]' : 'text-[#111827]'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

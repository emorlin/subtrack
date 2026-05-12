import { useState, useEffect, useRef, useId } from 'react'
import { X } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import BarChart, { buildMonthBars, isActiveInMonth, getAmountForMonth } from './BarChart'
import type { MonthBar } from './BarChart'
import CategoryBreakdown from './CategoryBreakdown'
import { useSubscriptions } from '../../hooks/useSubscriptions'
import { useCategories } from '../../hooks/useCategories'
import { toMonthlyAmount, getEffectiveCurrentAmount } from '../../lib/calculations'
import type { Subscription, Category } from '../../types'

const MONTH_LABELS = ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec']

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function CostView() {
  const { data: subscriptions = [] } = useSubscriptions()
  const { data: categories = [] } = useCategories()
  const [hoveredBar, setHoveredBar] = useState<MonthBar | null>(null)
  const [selectedBar, setSelectedBar] = useState<MonthBar | null>(null)
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

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
      toMonthlyAmount(getEffectiveCurrentAmount(s), s.interval, s.interval_count) >
        toMonthlyAmount(getEffectiveCurrentAmount(top), top.interval, top.interval_count)
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
        .reduce((sum, s) => sum + toMonthlyAmount(getAmountForMonth(s, selectedYear, displayBar.month), s.interval, s.interval_count), 0),
    }))
    .filter((r) => r.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  return (
    <div className="p-4 md:p-6 space-y-4">
      {selectedBar && (
        <MonthDetailModal
          bar={selectedBar}
          subscriptions={subscriptions}
          categories={categories}
          year={selectedYear}
          onClose={() => setSelectedBar(null)}
        />
      )}
      <h1 className="sr-only">Kostnad</h1>
      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label={ytdLabel} value={`${Math.round(ytd).toLocaleString('sv-SE')} kr`} accent />
        <MetricCard label={forecastLabel} value={`${Math.round(yearTotal).toLocaleString('sv-SE')} kr`} />
        <MetricCard label="Snitt / mån" value={`${Math.round(monthlyAvg).toLocaleString('sv-SE')} kr`} />
        <MetricCard label="Dyraste tjänst" value={mostExpensive?.name ?? '—'} />
      </div>

      {/* Chart + breakdown */}
      <div className="bg-[var(--c-bg-card)] rounded-[12px] border border-[var(--c-border)] p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:gap-8">

          {/* Bar chart */}
          <div className="flex-1 min-w-0">
            {/* Chart header with year nav */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-medium text-[var(--c-text-subtle)] tracking-wider uppercase">
                Månadsvis
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedYear((y) => y - 1)}
                  disabled={selectedYear <= minYear}
                  className="w-6 h-6 flex items-center justify-center text-[var(--c-text-muted)] hover:text-[var(--c-text-primary)] disabled:opacity-25 transition-colors text-[16px] leading-none"
                >
                  ‹
                </button>
                <span className="text-[13px] font-semibold text-[var(--c-text-primary)] w-10 text-center tabular-nums">
                  {selectedYear}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedYear((y) => y + 1)}
                  disabled={selectedYear >= currentYear}
                  className="w-6 h-6 flex items-center justify-center text-[var(--c-text-muted)] hover:text-[var(--c-text-primary)] disabled:opacity-25 transition-colors text-[16px] leading-none"
                >
                  ›
                </button>
              </div>
            </div>
            <BarChart bars={bars} onHover={setHoveredBar} onClick={setSelectedBar} chartHeight={isDesktop ? 240 : 80} />
          </div>

          {/* Divider (desktop) */}
          <div className="hidden md:block w-px bg-[var(--c-border)] shrink-0" />

          {/* Category breakdown */}
          <div className="md:w-[220px] shrink-0 mt-5 md:mt-0">
            <p className="text-[11px] font-medium text-[var(--c-text-subtle)] tracking-wider uppercase mb-1">
              Per kategori ({displayMonthLabel})
            </p>
            <p className="text-[22px] font-semibold text-[var(--c-text-primary)] tracking-[-0.3px] mb-3">
              {displayAmount} kr
            </p>
            <CategoryBreakdown rows={categoryRows} />
          </div>
        </div>
      </div>
    </div>
  )
}

function MonthDetailModal({
  bar,
  subscriptions,
  categories,
  year,
  onClose,
}: {
  bar: MonthBar
  subscriptions: Subscription[]
  categories: Category[]
  year: number
  onClose: () => void
}) {
  const [viewMonth, setViewMonth] = useState(bar.month)
  const [viewYear, setViewYear] = useState(year)
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function prevMonth() {
    if (viewMonth === 1) { setViewMonth(12); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 12) { setViewMonth(1); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const monthLabel = `${cap(MONTH_LABELS[viewMonth - 1])} ${viewYear}`

  const rows = subscriptions
    .filter((s) => isActiveInMonth(s, viewYear, viewMonth))
    .map((s) => {
      const amount = toMonthlyAmount(getAmountForMonth(s, viewYear, viewMonth), s.interval, s.interval_count)
      const category = categories.find((c) => c.id === s.category_id)
      return { sub: s, amount, category }
    })
    .sort((a, b) => b.amount - a.amount)

  const total = rows.reduce((sum, r) => sum + r.amount, 0)

  const navBtn = 'w-8 h-8 flex items-center justify-center text-[var(--c-text-muted)] hover:text-[var(--c-text-primary)] transition-colors text-[20px] leading-none shrink-0'

  const inner = (
    <>
      <div className="relative flex items-center justify-center px-4 h-[60px] border-b border-[var(--c-border)] shrink-0">
        <div className="flex items-center gap-1">
          <button type="button" onClick={prevMonth} className={navBtn} aria-label="Föregående månad">‹</button>
          <div className="text-center">
            <p id={titleId} className="text-[14px] font-semibold text-[var(--c-text-primary)]">{monthLabel}</p>
            <p className="text-[12px] text-[var(--c-text-muted)]">{Math.round(total).toLocaleString('sv-SE')} kr / mån</p>
          </div>
          <button type="button" onClick={nextMonth} className={navBtn} aria-label="Nästa månad">›</button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 text-[var(--c-text-subtle)] hover:text-[var(--c-text-secondary)] transition-colors"
          aria-label="Stäng"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rows.length === 0 ? (
          <p className="text-[13px] text-[var(--c-text-muted)] p-6 text-center">Inga aktiva tjänster denna månad</p>
        ) : (
          <div>
            {rows.map((row, i) => (
              <div key={row.sub.id}>
                {i > 0 && <div className="h-px bg-[var(--c-bg-subtle)] mx-4" />}
                <div className="px-4 py-3 flex items-center gap-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: row.category?.color_hex ?? 'var(--c-border)' }}
                  />
                  <span className="flex-1 text-[13px] text-[var(--c-text-primary)] truncate">{row.sub.name}</span>
                  <span className="text-[13px] font-medium text-[var(--c-text-primary)] tabular-nums shrink-0">
                    {Math.round(row.amount).toLocaleString('sv-SE')} kr
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col md:bg-[var(--c-overlay)] md:items-center md:justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="flex flex-col flex-1 md:flex-none bg-[var(--c-bg-card)] md:w-[480px] md:max-h-[85vh] md:rounded-[16px] md:shadow-xl focus:outline-none"
      >
        {inner}
      </div>
    </div>
  )
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-[var(--c-bg-app)] rounded-lg p-3">
      <p className="text-[11px] text-[var(--c-text-muted)] mb-1">{label}</p>
      <p
        className={`text-[20px] font-semibold tracking-[-0.3px] leading-tight ${
          accent ? 'text-[var(--c-accent)]' : 'text-[var(--c-text-primary)]'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

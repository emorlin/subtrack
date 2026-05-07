import { useState } from 'react'

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
}

export function buildMonthBars(monthlyAmount: number): MonthBar[] {
  const now = new Date()
  const currentMonth = now.getMonth() + 1

  return MONTH_LABELS.map((label, i) => {
    const month = i + 1
    return {
      month,
      label,
      amount: monthlyAmount,
      state: month < currentMonth ? 'past' : month === currentMonth ? 'current' : 'future',
    }
  })
}

export default function BarChart({ bars, onHover }: BarChartProps) {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null)
  const max = Math.max(...bars.map((b) => b.amount), 1)
  const chartHeight = 80

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
        const barH = Math.max(Math.round((bar.amount / max) * chartHeight), 4)
        const color =
          bar.state === 'current' ? 'bg-[#1B4FD8]'
          : bar.state === 'past'  ? 'bg-[#BFDBFE]'
          :                         'bg-[#E5E7EB]'

        return (
          <div
            key={bar.month}
            className="flex-1 flex flex-col items-center gap-1 relative cursor-default"
            onMouseEnter={() => handleEnter(bar)}
            onMouseLeave={handleLeave}
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

import { useNotifications } from '../../hooks/useNotifications'
import type { UpcomingRenewal, PastRenewal } from '../../hooks/useNotifications'
import type { SubscriptionInterval } from '../../types'
import { getEffectiveCurrentAmount } from '../../lib/calculations'

const MONTH_LABELS = ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec']

function formatDaysUntil(days: number): string {
  if (days === 0) return 'Idag'
  if (days === 1) return 'Imorgon'
  return `om ${days} dagar`
}

function formatPastDate(date: Date): string {
  return `${date.getDate()} ${MONTH_LABELS[date.getMonth()]}`
}

function formatInterval(interval: SubscriptionInterval, intervalCount: number): string {
  if (interval === 'month' && intervalCount === 1) return '/mån'
  if (interval === 'month') return `/${intervalCount} mån`
  if (interval === 'quarter' && intervalCount === 1) return '/kvartal'
  return '/år'
}

const urgencyDot: Record<UpcomingRenewal['urgency'], string> = {
  red:   'bg-[#DC2626]',
  amber: 'bg-[#D97706]',
  blue:  'bg-[#1B4FD8]',
}

const urgencyText: Record<UpcomingRenewal['urgency'], string> = {
  red:   'text-[#DC2626]',
  amber: 'text-[#D97706]',
  blue:  'text-[#1B4FD8]',
}

function UpcomingItem({ item }: { item: UpcomingRenewal }) {
  const { subscription: s, daysUntil, urgency } = item
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className={`w-2 h-2 rounded-full shrink-0 ${urgencyDot[urgency]}`} />
      <span className="flex-1 text-[13px] font-medium text-[#111827] truncate">
        {s.name}
      </span>
      <span className={`text-[12px] font-medium ${urgencyText[urgency]} shrink-0`}>
        {formatDaysUntil(daysUntil)}
      </span>
      <span className="text-[12px] font-medium text-[#374151] tabular-nums shrink-0 w-24 text-right">
        {getEffectiveCurrentAmount(s).toLocaleString('sv-SE')} kr{formatInterval(s.interval, s.interval_count)}
      </span>
    </div>
  )
}

function HistoryItem({ item }: { item: PastRenewal }) {
  const { subscription: s, prevDate } = item
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="w-2 h-2 rounded-full shrink-0 bg-[#D1D5DB]" />
      <span className="flex-1 text-[13px] text-[#6B7280] truncate">{s.name}</span>
      <span className="text-[12px] text-[#9CA3AF] shrink-0">
        {formatPastDate(prevDate)}
      </span>
      <span className="text-[12px] text-[#9CA3AF] tabular-nums shrink-0 w-24 text-right">
        {getEffectiveCurrentAmount(s).toLocaleString('sv-SE')} kr{formatInterval(s.interval, s.interval_count)}
      </span>
    </div>
  )
}

export default function NotificationList() {
  const { upcoming, history } = useNotifications()

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Upcoming renewals */}
      <section>
        <p className="text-[11px] font-medium text-[#9CA3AF] tracking-wider uppercase mb-3">
          Kommande förnyelser
        </p>
        <div className="bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden">
          {upcoming.length === 0 ? (
            <p className="px-4 py-5 text-[13px] text-[#9CA3AF]">
              Inga förnyelser inom 30 dagar.
            </p>
          ) : (
            upcoming.map((item, i) => (
              <div key={item.subscription.id}>
                {i > 0 && <div className="h-px bg-[#F3F4F6] mx-4" />}
                <UpcomingItem item={item} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* History */}
      <section>
        <p className="text-[11px] font-medium text-[#9CA3AF] tracking-wider uppercase mb-3">
          Historik
        </p>
        <div className="bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden">
          {history.length === 0 ? (
            <p className="px-4 py-5 text-[13px] text-[#9CA3AF]">
              Inga förnyelser de senaste 60 dagarna.
            </p>
          ) : (
            history.map((item, i) => (
              <div key={item.subscription.id}>
                {i > 0 && <div className="h-px bg-[#F3F4F6] mx-4" />}
                <HistoryItem item={item} />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

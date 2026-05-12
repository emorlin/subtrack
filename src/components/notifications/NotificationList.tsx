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
  red:   'bg-[var(--c-danger-strong)]',
  amber: 'bg-[var(--c-amber-strong)]',
  blue:  'bg-[var(--c-accent)]',
}

const urgencyText: Record<UpcomingRenewal['urgency'], string> = {
  red:   'text-[var(--c-danger-strong)]',
  amber: 'text-[var(--c-amber-strong)]',
  blue:  'text-[var(--c-accent)]',
}

function UpcomingItem({ item }: { item: UpcomingRenewal }) {
  const { subscription: s, daysUntil, urgency } = item
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className={`w-2 h-2 rounded-full shrink-0 ${urgencyDot[urgency]}`} />
      <span className="flex-1 text-[13px] font-medium text-[var(--c-text-primary)] truncate">
        {s.name}
      </span>
      <span className={`text-[12px] font-medium ${urgencyText[urgency]} shrink-0`}>
        {formatDaysUntil(daysUntil)}
      </span>
      <span className="text-[12px] font-medium text-[var(--c-text-secondary)] tabular-nums shrink-0 w-24 text-right">
        {getEffectiveCurrentAmount(s).toLocaleString('sv-SE')} kr{formatInterval(s.interval, s.interval_count)}
      </span>
    </div>
  )
}

function HistoryItem({ item }: { item: PastRenewal }) {
  const { subscription: s, prevDate } = item
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="w-2 h-2 rounded-full shrink-0 bg-[var(--c-border-strong)]" />
      <span className="flex-1 text-[13px] text-[var(--c-text-muted)] truncate">{s.name}</span>
      <span className="text-[12px] text-[var(--c-text-subtle)] shrink-0">
        {formatPastDate(prevDate)}
      </span>
      <span className="text-[12px] text-[var(--c-text-subtle)] tabular-nums shrink-0 w-24 text-right">
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
        <p className="text-[11px] font-medium text-[var(--c-text-subtle)] tracking-wider uppercase mb-3">
          Kommande förnyelser
        </p>
        <div className="bg-[var(--c-bg-card)] rounded-[12px] border border-[var(--c-border)] overflow-hidden">
          {upcoming.length === 0 ? (
            <p className="px-4 py-5 text-[13px] text-[var(--c-text-subtle)]">
              Inga förnyelser inom 30 dagar.
            </p>
          ) : (
            upcoming.map((item, i) => (
              <div key={item.subscription.id}>
                {i > 0 && <div className="h-px bg-[var(--c-bg-subtle)] mx-4" />}
                <UpcomingItem item={item} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* History */}
      <section>
        <p className="text-[11px] font-medium text-[var(--c-text-subtle)] tracking-wider uppercase mb-3">
          Historik
        </p>
        <div className="bg-[var(--c-bg-card)] rounded-[12px] border border-[var(--c-border)] overflow-hidden">
          {history.length === 0 ? (
            <p className="px-4 py-5 text-[13px] text-[var(--c-text-subtle)]">
              Inga förnyelser de senaste 60 dagarna.
            </p>
          ) : (
            history.map((item, i) => (
              <div key={item.subscription.id}>
                {i > 0 && <div className="h-px bg-[var(--c-bg-subtle)] mx-4" />}
                <HistoryItem item={item} />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

import { useState } from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { getDomainForService } from '../../lib/serviceIcons'
import type { Subscription } from '../../types'
import { useSubscriptions } from '../../hooks/useSubscriptions'
import { useCategories } from '../../hooks/useCategories'
import { getNextRenewalDate, getLastRenewalDate, getEffectiveCurrentAmount, toMonthlyAmount } from '../../lib/calculations'
import { daysUntil } from '../../lib/dates'

type SortKey = 'name' | 'category' | 'amount' | 'renewal'
type SortDir = 'asc' | 'desc'

interface SubscriptionListProps {
  onSelect: (sub: Subscription) => void
  selectedId: string | null
  onAdd: () => void
}

export default function SubscriptionList({ onSelect, selectedId, onAdd }: SubscriptionListProps) {
  const { data: subscriptions = [] } = useSubscriptions()
  const { data: categories = [] } = useCategories()
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [showCancelled, setShowCancelled] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = activeCategoryId
    ? subscriptions.filter((s) => s.category_id === activeCategoryId)
    : subscriptions

  const active = sortSubscriptions(
    filtered.filter((s) => s.status !== 'cancelled'),
    sortKey,
    sortDir,
  )
  const cancelled = sortSubscriptions(
    filtered.filter((s) => s.status === 'cancelled'),
    sortKey,
    sortDir,
  )

  return (
    <div className="bg-[var(--c-bg-card)] rounded-[12px] border border-[var(--c-border)] overflow-hidden">
      {/* Category filter row */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--c-border)] overflow-x-auto">
        <FilterPill
          label="Alla"
          active={activeCategoryId === null}
          onClick={() => setActiveCategoryId(null)}
        />
        {categories.map((cat) => (
          <FilterPill
            key={cat.id}
            label={cat.name}
            active={activeCategoryId === cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
          />
        ))}
        <button
          type="button"
          onClick={onAdd}
          className="ml-auto shrink-0 bg-[var(--c-accent)] text-white rounded-[6px] px-3 py-1.5 text-[12px] font-medium transition-all duration-150 ease-out hover:bg-[var(--c-accent-hover)] hidden md:block"
        >
          + Lägg till
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        {active.length === 0 ? (
          <EmptyState onAdd={onAdd} />
        ) : (
          <table className="w-full table-fixed min-w-[600px]">
            <ColGroup />
            <thead>
              <tr className="border-b border-[var(--c-border)]">
                <Th sortKey="name" currentSortKey={sortKey} currentSortDir={sortDir} onSort={handleSort}>Tjänst</Th>
                <Th sortKey="category" currentSortKey={sortKey} currentSortDir={sortDir} onSort={handleSort}>Kategori</Th>
                <Th align="right" sortKey="amount" currentSortKey={sortKey} currentSortDir={sortDir} onSort={handleSort}>Kr/mån</Th>
                <Th>Intervall</Th>
                <Th sortKey="renewal" currentSortKey={sortKey} currentSortDir={sortDir} onSort={handleSort}>Förnyelse</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {active.map((sub) => (
                <DesktopRow
                  key={sub.id}
                  sub={sub}
                  selected={selectedId === sub.id}
                  onClick={() => onSelect(sub)}
                />
              ))}
            </tbody>
          </table>
        )}

        {/* Cancelled section — desktop */}
        {cancelled.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setShowCancelled((v) => !v)}
              aria-expanded={showCancelled}
              aria-controls="cancelled-list-desktop"
              className="w-full flex items-center justify-between px-4 py-3 border-t border-[var(--c-border)] text-[12px] text-[var(--c-text-muted)] hover:bg-[var(--c-bg-app)] transition-colors"
            >
              <span>Avslutade ({cancelled.length})</span>
              <span aria-hidden="true">{showCancelled ? '▲' : '▼'}</span>
            </button>
            {showCancelled && (
              <table id="cancelled-list-desktop" className="w-full table-fixed min-w-[600px] opacity-50">
                <ColGroup />
                <tbody>
                  {cancelled.map((sub) => (
                    <DesktopRow
                      key={sub.id}
                      sub={sub}
                      selected={selectedId === sub.id}
                      onClick={() => onSelect(sub)}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* Mobile list */}
      <div className="md:hidden">
        {active.length === 0 ? (
          <EmptyState onAdd={onAdd} />
        ) : (
          <>
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--c-border)]">
              <span className="text-[11px] font-medium text-[var(--c-text-subtle)] tracking-wider uppercase">
                Tjänster
              </span>
            </div>
            {active.map((sub) => (
              <MobileRow
                key={sub.id}
                sub={sub}
                selected={selectedId === sub.id}
                onClick={() => onSelect(sub)}
              />
            ))}
          </>
        )}

        {/* Cancelled section — mobile */}
        {cancelled.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setShowCancelled((v) => !v)}
              aria-expanded={showCancelled}
              aria-controls="cancelled-list-mobile"
              className="w-full flex items-center justify-between px-4 py-3 border-t border-[var(--c-border)] text-[12px] text-[var(--c-text-muted)]"
            >
              <span>Avslutade ({cancelled.length})</span>
              <span aria-hidden="true">{showCancelled ? '▲' : '▼'}</span>
            </button>
            {showCancelled && (
              <div id="cancelled-list-mobile" className="opacity-50">
                {cancelled.map((sub) => (
                  <MobileRow
                    key={sub.id}
                    sub={sub}
                    selected={selectedId === sub.id}
                    onClick={() => onSelect(sub)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Desktop row ────────────────────────────────────────────

function DesktopRow({
  sub,
  selected,
  onClick,
}: {
  sub: Subscription
  selected: boolean
  onClick: () => void
}) {
  const isCancelled = sub.status === 'cancelled'
  const date = isCancelled
    ? getLastRenewalDate(sub.start_date, sub.interval, sub.interval_count)
    : getNextRenewalDate(sub.start_date, sub.interval, sub.interval_count)
  const days = isCancelled ? null : daysUntil(date)
  const isUrgent = !isCancelled && days !== null && days <= 7
  const amount = getEffectiveCurrentAmount(sub)
  const monthly = Math.round(toMonthlyAmount(amount, sub.interval, sub.interval_count))
  const isMonthly = sub.interval === 'month' && sub.interval_count === 1

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() }
  }

  return (
    <tr
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`border-b border-[var(--c-border)] cursor-pointer transition-all duration-150 ease-out focus-visible:outline-2 focus-visible:outline-[var(--c-accent)] focus-visible:outline-offset-[-2px] ${
        selected ? 'bg-[var(--c-accent-subtle)]' : 'hover:bg-[var(--c-bg-app)]'
      }`}
    >
      {/* Tjänst */}
      <td className="px-4 py-3 overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <ServiceIcon name={sub.name} />
          <span className="text-[13px] font-medium text-[var(--c-text-primary)] truncate underline decoration-[var(--c-text-secondary)] underline-offset-4">{sub.name}</span>
        </div>
      </td>

      {/* Kategori */}
      <td className="px-4 py-3 text-[13px] text-[var(--c-text-muted)] truncate overflow-hidden">
        {sub.category?.name ?? '—'}
      </td>

      {/* Kostnad */}
      <td className="px-4 py-3 text-right overflow-hidden">
        <p className="text-[13px] font-semibold text-[var(--c-text-primary)] whitespace-nowrap">
          {monthly.toLocaleString('sv-SE')} kr
        </p>
        {!isMonthly && (
          <p className="text-[11px] text-[var(--c-text-subtle)] whitespace-nowrap">
            {amount.toLocaleString('sv-SE')} kr/{intervalShort(sub.interval, sub.interval_count)}
          </p>
        )}
      </td>

      {/* Intervall */}
      <td className="px-4 py-3 text-[13px] text-[var(--c-text-muted)] overflow-hidden">
        {intervalLabel(sub.interval, sub.interval_count)}
      </td>

      {/* Förnyelse / Senaste betalning */}
      <td className={`px-4 py-3 text-[13px] overflow-hidden ${isUrgent ? 'text-[var(--c-warning-text)] font-medium' : 'text-[var(--c-text-muted)]'}`}>
        {formatRenewalDate(date)}
      </td>

      {/* Status */}
      <td className="px-4 py-3 overflow-hidden">
        {isCancelled ? (
          <span className="bg-[var(--c-bg-subtle)] text-[var(--c-text-muted)] text-[10px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap">
            Avslutad
          </span>
        ) : isUrgent ? (
          <span className="bg-[var(--c-warning-bg)] text-[var(--c-warning-text)] text-[10px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap">
            {days} dagar
          </span>
        ) : (
          <span className="bg-[var(--c-success-bg)] text-[var(--c-success-text)] text-[10px] font-medium px-1.5 py-0.5 rounded">
            Aktiv
          </span>
        )}
      </td>
    </tr>
  )
}

// ── Mobile row ─────────────────────────────────────────────

function MobileRow({
  sub,
  selected,
  onClick,
}: {
  sub: Subscription
  selected: boolean
  onClick: () => void
}) {
  const isCancelled = sub.status === 'cancelled'
  const date = isCancelled
    ? getLastRenewalDate(sub.start_date, sub.interval, sub.interval_count)
    : getNextRenewalDate(sub.start_date, sub.interval, sub.interval_count)
  const days = isCancelled ? null : daysUntil(date)
  const isUrgent = !isCancelled && days !== null && days <= 7
  const amount = getEffectiveCurrentAmount(sub)
  const monthly = Math.round(toMonthlyAmount(amount, sub.interval, sub.interval_count))
  const isMonthly = sub.interval === 'month' && sub.interval_count === 1

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() }
  }

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      className={`flex items-center gap-3 px-4 py-3 border-b border-[var(--c-border)] cursor-pointer transition-all duration-150 ease-out focus-visible:outline-2 focus-visible:outline-[var(--c-accent)] focus-visible:outline-offset-[-2px] ${
        selected ? 'bg-[var(--c-accent-subtle)]' : 'active:bg-[var(--c-bg-app)]'
      }`}
    >
      <ServiceIcon name={sub.name} size="lg" />

      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-[var(--c-text-primary)] truncate underline decoration-[var(--c-text-secondary)] underline-offset-4">{sub.name}</p>
        <p className="text-[11px] text-[var(--c-text-muted)]">{sub.category?.name ?? '—'}</p>
        {isCancelled ? (
          <span className="bg-[var(--c-bg-subtle)] text-[var(--c-text-muted)] text-[10px] font-medium px-1.5 py-0.5 rounded inline-block mt-0.5">
            Avslutad
          </span>
        ) : isUrgent ? (
          <span className="text-[11px] text-[var(--c-warning-text)] font-medium">{days} dagar kvar</span>
        ) : (
          <span className="bg-[var(--c-success-bg)] text-[var(--c-success-text)] text-[10px] font-medium px-1.5 py-0.5 rounded inline-block mt-0.5">
            Aktiv
          </span>
        )}
      </div>

      <div className="text-right shrink-0">
        <p className="text-[14px] font-semibold text-[var(--c-text-primary)]">
          {monthly.toLocaleString('sv-SE')} kr
        </p>
        {isMonthly ? (
          <p className="text-[11px] text-[var(--c-text-muted)]">{formatRenewalShort(date)}</p>
        ) : (
          <p className="text-[11px] text-[var(--c-text-subtle)]">{amount.toLocaleString('sv-SE')} kr/{intervalShort(sub.interval, sub.interval_count)}</p>
        )}
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────

function sortSubscriptions(subs: Subscription[], key: SortKey | null, dir: SortDir): Subscription[] {
  if (!key) return subs
  return [...subs].sort((a, b) => {
    let cmp = 0
    if (key === 'name') {
      cmp = a.name.localeCompare(b.name, 'sv')
    } else if (key === 'category') {
      const ca = a.category?.name ?? ''
      const cb = b.category?.name ?? ''
      cmp = ca.localeCompare(cb, 'sv')
    } else if (key === 'amount') {
      const ma = toMonthlyAmount(getEffectiveCurrentAmount(a), a.interval, a.interval_count)
      const mb = toMonthlyAmount(getEffectiveCurrentAmount(b), b.interval, b.interval_count)
      cmp = ma - mb
    } else if (key === 'renewal') {
      const da = a.status === 'cancelled'
        ? getLastRenewalDate(a.start_date, a.interval, a.interval_count)
        : getNextRenewalDate(a.start_date, a.interval, a.interval_count)
      const db = b.status === 'cancelled'
        ? getLastRenewalDate(b.start_date, b.interval, b.interval_count)
        : getNextRenewalDate(b.start_date, b.interval, b.interval_count)
      cmp = da.getTime() - db.getTime()
    }
    return dir === 'asc' ? cmp : -cmp
  })
}

function ServiceIcon({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const [failed, setFailed] = useState(false)
  const domain = getDomainForService(name)
  const dim = size === 'lg' ? 'w-11 h-11' : 'w-9 h-9'
  const textDim = size === 'lg' ? 'text-[14px]' : 'text-[12px]'

  if (domain && !failed) {
    return (
      <img
        src={`https://favicon.im/${domain}?larger=true`}
        alt=""
        aria-hidden="true"
        onError={() => setFailed(true)}
        className={`${dim} rounded-[10px] object-contain bg-white shrink-0`}
      />
    )
  }

  return (
    <div
      className={`${dim} rounded-[10px] bg-[var(--c-bg-subtle)] flex items-center justify-center font-medium ${textDim} text-[var(--c-text-secondary)] shrink-0`}
    >
      {getInitials(name)}
    </div>
  )
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 px-3 py-1 rounded-full text-[12px] font-medium transition-all duration-150 ease-out ${
        active
          ? 'bg-[var(--c-accent)] text-white'
          : 'bg-[var(--c-bg-card)] border border-[var(--c-border)] text-[var(--c-text-secondary)] hover:border-[var(--c-border-strong)]'
      }`}
    >
      {label}
    </button>
  )
}

function ColGroup() {
  return (
    <colgroup>
      <col style={{ width: '38%' }} />
      <col style={{ width: '18%' }} />
      <col style={{ width: '11%' }} />
      <col style={{ width: '12%' }} />
      <col style={{ width: '14%' }} />
      <col style={{ width: '7%' }}  />
    </colgroup>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <p className="text-[14px] font-medium text-[var(--c-text-primary)] mb-1">Inga abonnemang ännu</p>
      <p className="text-[13px] text-[var(--c-text-muted)] mb-4">Lägg till ditt första för att komma igång</p>
      <button
        type="button"
        onClick={onAdd}
        className="bg-[var(--c-accent)] text-white rounded-[6px] px-4 py-2 text-[13px] font-medium transition-all duration-150 ease-out hover:bg-[var(--c-accent-hover)]"
      >
        + Lägg till abonnemang
      </button>
    </div>
  )
}

interface ThProps {
  children: string
  align?: 'right'
  sortKey?: SortKey
  currentSortKey?: SortKey | null
  currentSortDir?: SortDir
  onSort?: (key: SortKey) => void
}

function Th({ children, align, sortKey, currentSortKey, currentSortDir, onSort }: ThProps) {
  const isActive = sortKey !== undefined && currentSortKey === sortKey
  const ariaSort: React.AriaAttributes['aria-sort'] = sortKey !== undefined
    ? isActive
      ? currentSortDir === 'asc' ? 'ascending' : 'descending'
      : 'none'
    : undefined

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={`px-4 py-2.5 text-[11px] font-medium tracking-wider uppercase text-left ${
        align === 'right' ? 'text-right' : ''
      } ${isActive ? 'text-[var(--c-accent)]' : 'text-[var(--c-text-subtle)]'}`}
    >
      {sortKey && onSort ? (
        <button
          type="button"
          onClick={() => onSort(sortKey)}
          className={`inline-flex items-center gap-1 transition-colors duration-150 hover:text-[var(--c-text-primary)] ${
            align === 'right' ? 'flex-row-reverse' : ''
          }`}
        >
          {children}
          <SortIndicator active={isActive} dir={isActive ? currentSortDir : undefined} />
        </button>
      ) : (
        children
      )}
    </th>
  )
}

function SortIndicator({ active, dir }: { active: boolean; dir?: SortDir }) {
  const Icon = active ? (dir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
  return <Icon size={14} aria-hidden="true" className="opacity-60 shrink-0" />
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  const s = name.trim()
  return (s[0].toUpperCase() + (s[1] ?? '')).slice(0, 2)
}

function intervalLabel(interval: string, count: number): string {
  if (interval === 'month' && count === 1) return 'Månadsvis'
  if (interval === 'month' && count === 3) return 'Kvartalsvis'
  if (interval === 'year' && count === 1) return 'Årsvis'
  return `Var ${count} ${interval === 'month' ? 'mån' : 'år'}`
}

function intervalShort(interval: string, count: number): string {
  if (interval === 'month') return count === 1 ? 'mån' : `${count} mån`
  if (interval === 'quarter') return 'kvartal'
  return count === 1 ? 'år' : `${count} år`
}

function formatRenewalDate(date: Date): string {
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatRenewalShort(date: Date): string {
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

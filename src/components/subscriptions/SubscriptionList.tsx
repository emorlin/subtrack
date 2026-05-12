import { useState } from 'react'
import type { Subscription } from '../../types'
import { useSubscriptions } from '../../hooks/useSubscriptions'
import { useCategories } from '../../hooks/useCategories'
import { getNextRenewalDate, getLastRenewalDate, getEffectiveCurrentAmount } from '../../lib/calculations'
import { daysUntil } from '../../lib/dates'

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

  const filtered = activeCategoryId
    ? subscriptions.filter((s) => s.category_id === activeCategoryId)
    : subscriptions

  const active = filtered.filter((s) => s.status !== 'cancelled')
  const cancelled = filtered.filter((s) => s.status === 'cancelled')

  return (
    <div className="bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden">
      {/* Category filter row */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E5E7EB] overflow-x-auto">
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
          className="ml-auto shrink-0 bg-[#1B4FD8] text-white rounded-[6px] px-3 py-1.5 text-[12px] font-medium transition-all duration-150 ease-out hover:bg-[#1a46c2] hidden md:block"
        >
          + Lägg till
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        {active.length === 0 ? (
          <EmptyState onAdd={onAdd} />
        ) : (
          <table className="w-full table-fixed">
            <ColGroup />
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <Th>Tjänst</Th>
                <Th>Kategori</Th>
                <Th align="right">Kostnad</Th>
                <Th>Intervall</Th>
                <Th>Förnyelse</Th>
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
              className="w-full flex items-center justify-between px-4 py-3 border-t border-[#E5E7EB] text-[12px] text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
            >
              <span>Avslutade ({cancelled.length})</span>
              <span>{showCancelled ? '▲' : '▼'}</span>
            </button>
            {showCancelled && (
              <table className="w-full table-fixed opacity-50">
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
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#E5E7EB]">
              <span className="text-[11px] font-medium text-[#9CA3AF] tracking-wider uppercase">
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
              className="w-full flex items-center justify-between px-4 py-3 border-t border-[#E5E7EB] text-[12px] text-[#6B7280]"
            >
              <span>Avslutade ({cancelled.length})</span>
              <span>{showCancelled ? '▲' : '▼'}</span>
            </button>
            {showCancelled && (
              <div className="opacity-50">
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

  return (
    <tr
      onClick={onClick}
      className={`border-b border-[#E5E7EB] cursor-pointer transition-all duration-150 ease-out ${
        selected ? 'bg-[#EFF6FF]' : 'hover:bg-[#F9FAFB]'
      }`}
    >
      {/* Tjänst */}
      <td className="px-4 py-3 overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <ServiceIcon name={sub.name} />
          <span className="text-[13px] font-medium text-[#111827] truncate underline decoration-[#374151] underline-offset-4">{sub.name}</span>
        </div>
      </td>

      {/* Kategori */}
      <td className="px-4 py-3 text-[13px] text-[#6B7280] truncate overflow-hidden">
        {sub.category?.name ?? '—'}
      </td>

      {/* Kostnad */}
      <td className="px-4 py-3 text-right text-[13px] font-semibold text-[#111827] whitespace-nowrap overflow-hidden">
        {getEffectiveCurrentAmount(sub)} kr
      </td>

      {/* Intervall */}
      <td className="px-4 py-3 text-[13px] text-[#6B7280] overflow-hidden">
        {intervalLabel(sub.interval, sub.interval_count)}
      </td>

      {/* Förnyelse / Senaste betalning */}
      <td className={`px-4 py-3 text-[13px] overflow-hidden ${isUrgent ? 'text-[#92400E] font-medium' : 'text-[#6B7280]'}`}>
        {formatRenewalDate(date)}
      </td>

      {/* Status */}
      <td className="px-4 py-3 overflow-hidden">
        {isCancelled ? (
          <span className="bg-[#F3F4F6] text-[#6B7280] text-[10px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap">
            Avslutad
          </span>
        ) : isUrgent ? (
          <span className="bg-[#FFFBEB] text-[#92400E] text-[10px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap">
            {days} dagar
          </span>
        ) : (
          <span className="bg-[#F0FDF4] text-[#166534] text-[10px] font-medium px-1.5 py-0.5 rounded">
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

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB] cursor-pointer transition-all duration-150 ease-out ${
        selected ? 'bg-[#EFF6FF]' : 'active:bg-[#F9FAFB]'
      }`}
    >
      <ServiceIcon name={sub.name} size="lg" />

      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-[#111827] truncate underline decoration-[#374151] underline-offset-4">{sub.name}</p>
        <p className="text-[11px] text-[#6B7280]">{sub.category?.name ?? '—'}</p>
        {isCancelled ? (
          <span className="bg-[#F3F4F6] text-[#6B7280] text-[10px] font-medium px-1.5 py-0.5 rounded inline-block mt-0.5">
            Avslutad
          </span>
        ) : isUrgent ? (
          <span className="text-[11px] text-[#92400E] font-medium">{days} dagar kvar</span>
        ) : (
          <span className="bg-[#F0FDF4] text-[#166534] text-[10px] font-medium px-1.5 py-0.5 rounded inline-block mt-0.5">
            Aktiv
          </span>
        )}
      </div>

      <div className="text-right shrink-0">
        <p className="text-[14px] font-semibold text-[#111827]">{getEffectiveCurrentAmount(sub)} kr</p>
        <p className="text-[11px] text-[#6B7280]">{formatRenewalShort(date)}</p>
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────

function ServiceIcon({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const initials = getInitials(name)
  const dim = size === 'lg' ? 'w-10 h-10 text-[13px]' : 'w-8 h-8 text-[11px]'
  return (
    <div
      className={`${dim} rounded-[10px] bg-[#F3F4F6] flex items-center justify-center font-medium text-[#374151] shrink-0`}
    >
      {initials}
    </div>
  )
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 px-3 py-1 rounded-full text-[12px] font-medium transition-all duration-150 ease-out ${
        active
          ? 'bg-[#1B4FD8] text-white'
          : 'bg-white border border-[#E5E7EB] text-[#374151] hover:border-[#D1D5DB]'
      }`}
    >
      {label}
    </button>
  )
}

function ColGroup() {
  return (
    <colgroup>
      <col style={{ width: '38%' }} />  {/* Tjänst */}
      <col style={{ width: '18%' }} />  {/* Kategori */}
      <col style={{ width: '11%' }} />  {/* Kostnad */}
      <col style={{ width: '12%' }} />  {/* Intervall */}
      <col style={{ width: '14%' }} />  {/* Förnyelse */}
      <col style={{ width: '7%' }}  />  {/* Status */}
    </colgroup>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <p className="text-[14px] font-medium text-[#111827] mb-1">Inga abonnemang ännu</p>
      <p className="text-[13px] text-[#6B7280] mb-4">Lägg till ditt första för att komma igång</p>
      <button
        type="button"
        onClick={onAdd}
        className="bg-[#1B4FD8] text-white rounded-[6px] px-4 py-2 text-[13px] font-medium transition-all duration-150 ease-out hover:bg-[#1a46c2]"
      >
        + Lägg till abonnemang
      </button>
    </div>
  )
}

function Th({ children, align }: { children: string; align?: 'right' }) {
  return (
    <th
      className={`px-4 py-2.5 text-[11px] font-medium text-[#9CA3AF] tracking-wider uppercase text-left ${
        align === 'right' ? 'text-right' : ''
      }`}
    >
      {children}
    </th>
  )
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

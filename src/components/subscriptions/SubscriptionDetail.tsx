import { useState, useEffect } from 'react'
import type { Subscription } from '../../types'
import { calculateTotalPaid, getNextRenewalDate } from '../../lib/calculations'
import { formatDate, daysUntil } from '../../lib/dates'
import { useDeleteSubscription } from '../../hooks/useSubscriptions'

interface Props {
  subscription: Subscription
  onClose: () => void
  onEdit: () => void
  onDeleted: () => void
}

export default function SubscriptionDetail({ subscription, onClose, onEdit, onDeleted }: Props) {
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])
  const { mutateAsync: deleteSub, isPending } = useDeleteSubscription()

  const renewal = getNextRenewalDate(subscription.start_date, subscription.interval, subscription.interval_count)
  const days = daysUntil(renewal)
  const isUrgent = days <= subscription.reminder_days_before
  const totalPaid = calculateTotalPaid(subscription)

  async function handleDelete() {
    try { await deleteSub(subscription.id) } catch (_) { /* mock mode */ }
    onDeleted()
  }

  return (
    <>
      {/* ── Mobile: full-screen ── */}
      <div className="md:hidden fixed inset-0 bg-white z-40 flex flex-col">
        <div className="h-14 px-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
          <button type="button" onClick={onClose} className="text-[13px] text-[#1B4FD8]">
            ← Tillbaka
          </button>
          {!deleteConfirm && (
            <button
              type="button"
              onClick={() => setDeleteConfirm(true)}
              className="text-[13px] text-[#B91C1C]"
            >
              Ta bort
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center gap-3">
            <ServiceIcon name={subscription.name} size="xl" />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[18px] font-semibold text-[#111827]">{subscription.name}</p>
                <span className="bg-[#F0FDF4] text-[#166534] text-[10px] font-medium px-1.5 py-0.5 rounded">
                  Aktiv
                </span>
              </div>
              <p className="text-[13px] text-[#6B7280]">{subscription.category?.name ?? '—'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="w-full bg-white border border-[#E5E7EB] text-[#374151] rounded-[6px] py-2 text-[13px] font-medium hover:bg-[#F9FAFB] transition-all duration-150 ease-out"
          >
            Redigera
          </button>

          {isUrgent && <RenewalWarning days={days} amount={subscription.amount} date={renewal} />}
          <DetailRows subscription={subscription} totalPaid={totalPaid} renewal={renewal} />
          {subscription.notes && <Notes text={subscription.notes} />}
          {deleteConfirm && (
            <DeleteConfirm
              name={subscription.name}
              loading={isPending}
              onConfirm={handleDelete}
              onCancel={() => setDeleteConfirm(false)}
            />
          )}
        </div>
      </div>

      {/* ── Desktop: centered modal overlay ── */}
      <div
        className="hidden md:flex fixed inset-0 bg-black/50 z-40 items-center justify-center"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div className="bg-white rounded-[16px] w-[480px] max-h-[85vh] overflow-y-auto shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <ServiceIcon name={subscription.name} size="xl" />
              <div>
                <p className="text-[16px] font-semibold text-[#111827]">{subscription.name}</p>
                <p className="text-[12px] text-[#6B7280]">{subscription.category?.name ?? '—'}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={onEdit}
                className="bg-white border border-[#E5E7EB] text-[#374151] rounded-[6px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#F9FAFB] transition-all duration-150 ease-out"
              >
                Redigera
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                className="bg-[#FEF2F2] text-[#B91C1C] rounded-[6px] px-3 py-1.5 text-[12px] font-medium hover:opacity-80 transition-all duration-150 ease-out"
              >
                Ta bort
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {isUrgent && <RenewalWarning days={days} amount={subscription.amount} date={renewal} />}
            <DetailRows subscription={subscription} totalPaid={totalPaid} renewal={renewal} />
            {subscription.notes && <Notes text={subscription.notes} />}
            {deleteConfirm && (
              <DeleteConfirm
                name={subscription.name}
                loading={isPending}
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirm(false)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ── Shared sub-components ────────────────────────────────────

function ServiceIcon({ name, size }: { name: string; size: 'lg' | 'xl' }) {
  const initials = getInitials(name)
  const dim = size === 'xl' ? 'w-12 h-12 text-[14px]' : 'w-10 h-10 text-[13px]'
  return (
    <div className={`${dim} rounded-[10px] bg-[#F3F4F6] flex items-center justify-center font-medium text-[#374151] shrink-0`}>
      {initials}
    </div>
  )
}

function RenewalWarning({ days, amount, date }: { days: number; amount: number; date: Date }) {
  return (
    <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[8px] p-3">
      <p className="text-[13px] text-[#92400E] font-medium">
        Förnyas automatiskt om {days} dagar — {amount} kr dras{' '}
        {date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })}
      </p>
    </div>
  )
}

function DetailRows({ subscription, totalPaid, renewal }: {
  subscription: Subscription
  totalPaid: number
  renewal: Date
}) {
  const intervalShort: Record<string, string> = { month: 'mån', quarter: 'kv', year: 'år' }
  const rows = [
    { label: 'Kostnad', value: `${subscription.amount} kr / ${intervalShort[subscription.interval] ?? subscription.interval}` },
    { label: 'Startdatum', value: formatDate(subscription.start_date) },
    { label: 'Nästa förnyelse', value: formatDate(renewal) },
    { label: 'Bindningstid', value: subscription.end_date ? formatDate(subscription.end_date) : 'Ingen' },
    { label: 'Totalt betalt', value: `${Math.round(totalPaid).toLocaleString('sv-SE')} kr` },
    { label: 'Påminnelse', value: `${subscription.reminder_days_before} dagar` },
  ]
  return (
    <div className="divide-y divide-[#E5E7EB]">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex justify-between py-2.5">
          <span className="text-[12px] text-[#6B7280]">{label}</span>
          <span className="text-[13px] font-medium text-[#111827] text-right">{value}</span>
        </div>
      ))}
    </div>
  )
}

function Notes({ text }: { text: string }) {
  return (
    <div className="border-l-2 border-[#1B4FD8] pl-3">
      <p className="text-[13px] text-[#374151] leading-relaxed">{text}</p>
    </div>
  )
}

function DeleteConfirm({ name, loading, onConfirm, onCancel }: {
  name: string
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="bg-[#FEF2F2] rounded-[8px] p-4 space-y-3">
      <p className="text-[13px] text-[#B91C1C] font-medium">Ta bort {name}?</p>
      <p className="text-[12px] text-[#6B7280]">Abonnemanget och all prishistorik raderas permanent.</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-[#B91C1C] text-white rounded-[6px] py-2 text-[13px] font-medium disabled:opacity-50 transition-all duration-150"
        >
          {loading ? 'Raderar…' : 'Ja, ta bort'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white border border-[#E5E7EB] text-[#374151] rounded-[6px] py-2 text-[13px] font-medium transition-all duration-150"
        >
          Avbryt
        </button>
      </div>
    </div>
  )
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  const s = name.trim()
  return (s[0].toUpperCase() + (s[1] ?? '')).slice(0, 2)
}

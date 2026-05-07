import { useState, useEffect } from 'react'
import type { Subscription } from '../../types'
import { calculateTotalPaid, getNextRenewalDate, getEffectiveCurrentAmount } from '../../lib/calculations'
import { formatDate, daysUntil } from '../../lib/dates'
import {
  useDeleteSubscription,
  useCancelSubscription,
  useReactivateSubscription,
  useAddPriceHistory,
  useDeletePriceHistory,
} from '../../hooks/useSubscriptions'

interface Props {
  subscription: Subscription
  onClose: () => void
  onEdit: () => void
  onDeleted: () => void
}

type ActionState = 'none' | 'cancel' | 'delete'

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  active:    { label: 'Aktiv',     className: 'bg-[#F0FDF4] text-[#166534]' },
  paused:    { label: 'Pausad',    className: 'bg-[#FFFBEB] text-[#92400E]' },
  cancelled: { label: 'Avslutad', className: 'bg-[#F3F4F6] text-[#6B7280]' },
}

function todayString() {
  return new Date().toISOString().split('T')[0]
}

export default function SubscriptionDetail({ subscription, onClose, onEdit, onDeleted }: Props) {
  const [actionState, setActionState] = useState<ActionState>('none')
  const [cancelDate, setCancelDate] = useState(todayString)

  const { mutateAsync: deleteSub, isPending: isDeleting } = useDeleteSubscription()
  const { mutateAsync: cancelSub, isPending: isCancelling } = useCancelSubscription()
  const { mutateAsync: reactivateSub, isPending: isReactivating } = useReactivateSubscription()

  const isCancelled = subscription.status === 'cancelled'
  const badge = STATUS_BADGE[subscription.status] ?? STATUS_BADGE.active

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (actionState !== 'none') setActionState('none')
        else onClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, actionState])

  const renewal = getNextRenewalDate(subscription.start_date, subscription.interval, subscription.interval_count)
  const days = daysUntil(renewal)
  const isUrgent = !isCancelled && days <= subscription.reminder_days_before
  const totalPaid = calculateTotalPaid(subscription)
  const effectiveAmount = getEffectiveCurrentAmount(subscription)

  async function handleDelete() {
    try {
      await deleteSub(subscription.id)
      onDeleted()
    } catch (_) {}
  }

  async function handleCancel() {
    try {
      await cancelSub({ id: subscription.id, end_date: cancelDate })
      onClose()
    } catch (_) {}
  }

  async function handleReactivate() {
    try {
      await reactivateSub(subscription.id)
      onClose()
    } catch (_) {}
  }

  const actionPanel = (
    <>
      {actionState === 'cancel' && (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[8px] p-4 space-y-3">
          <p className="text-[13px] font-medium text-[#92400E]">Avsluta {subscription.name}?</p>
          <p className="text-[12px] text-[#6B7280]">Abonnemanget sparas kvar i historiken.</p>
          <div className="space-y-1">
            <label className="block text-[12px] font-medium text-[#374151]">Sista betalningsdag</label>
            <input
              type="date"
              value={cancelDate}
              onChange={(e) => setCancelDate(e.target.value)}
              className="w-full border border-[#D1D5DB] focus:border-[#1B4FD8] rounded-[6px] px-3 py-2 text-[13px] outline-none bg-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isCancelling}
              className="flex-1 bg-[#92400E] text-white rounded-[6px] py-2 text-[13px] font-medium disabled:opacity-50 transition-all duration-150"
            >
              {isCancelling ? 'Avslutar…' : 'Avsluta'}
            </button>
            <button
              type="button"
              onClick={() => setActionState('none')}
              className="flex-1 bg-white border border-[#E5E7EB] text-[#374151] rounded-[6px] py-2 text-[13px] font-medium"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}

      {actionState === 'delete' && (
        <div className="bg-[#FEF2F2] rounded-[8px] p-4 space-y-3">
          <p className="text-[13px] text-[#B91C1C] font-medium">Radera {subscription.name} permanent?</p>
          <p className="text-[12px] text-[#6B7280]">All data och prishistorik tas bort för alltid.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-[#B91C1C] text-white rounded-[6px] py-2 text-[13px] font-medium disabled:opacity-50 transition-all duration-150"
            >
              {isDeleting ? 'Raderar…' : 'Ja, radera'}
            </button>
            <button
              type="button"
              onClick={() => setActionState('none')}
              className="flex-1 bg-white border border-[#E5E7EB] text-[#374151] rounded-[6px] py-2 text-[13px] font-medium"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}
    </>
  )

  return (
    <>
      {/* ── Mobile: full-screen ── */}
      <div className="md:hidden fixed inset-0 bg-white z-40 flex flex-col">
        <div className="h-14 px-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
          <button type="button" onClick={onClose} className="text-[13px] text-[#1B4FD8]">
            ← Tillbaka
          </button>
          {!isCancelled && actionState === 'none' && (
            <button
              type="button"
              onClick={() => setActionState('cancel')}
              className="text-[13px] text-[#92400E]"
            >
              Avsluta
            </button>
          )}
          {isCancelled && actionState === 'none' && (
            <button
              type="button"
              onClick={() => setActionState('delete')}
              className="text-[13px] text-[#B91C1C]"
            >
              Radera
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center gap-3">
            <ServiceIcon name={subscription.name} size="xl" />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[18px] font-semibold text-[#111827]">{subscription.name}</p>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-[13px] text-[#6B7280]">{subscription.category?.name ?? '—'}</p>
            </div>
          </div>

          {!isCancelled && (
            <button
              type="button"
              onClick={onEdit}
              className="w-full bg-white border border-[#E5E7EB] text-[#374151] rounded-[6px] py-2 text-[13px] font-medium hover:bg-[#F9FAFB] transition-all duration-150 ease-out"
            >
              Redigera
            </button>
          )}
          {isCancelled && (
            <button
              type="button"
              onClick={handleReactivate}
              disabled={isReactivating}
              className="w-full bg-[#EFF6FF] text-[#1B4FD8] border border-[#BFDBFE] rounded-[6px] py-2 text-[13px] font-medium disabled:opacity-50 transition-all duration-150 ease-out"
            >
              {isReactivating ? 'Återaktiverar…' : 'Återaktivera'}
            </button>
          )}

          {isUrgent && <RenewalWarning days={days} amount={subscription.amount} date={renewal} />}
          <DetailRows subscription={subscription} totalPaid={totalPaid} renewal={renewal} />
          <PriceHistorySection subscription={subscription} />
          {subscription.notes && <Notes text={subscription.notes} />}
          {actionPanel}
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
                <div className="flex items-center gap-2">
                  <p className="text-[16px] font-semibold text-[#111827]">{subscription.name}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-[12px] text-[#6B7280]">{subscription.category?.name ?? '—'}</p>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              {!isCancelled && (
                <>
                  <button
                    type="button"
                    onClick={onEdit}
                    className="bg-white border border-[#E5E7EB] text-[#374151] rounded-[6px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#F9FAFB] transition-all duration-150 ease-out"
                  >
                    Redigera
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionState(actionState === 'cancel' ? 'none' : 'cancel')}
                    className="bg-[#FFFBEB] text-[#92400E] rounded-[6px] px-3 py-1.5 text-[12px] font-medium hover:opacity-80 transition-all duration-150 ease-out"
                  >
                    Avsluta
                  </button>
                </>
              )}
              {isCancelled && (
                <>
                  <button
                    type="button"
                    onClick={handleReactivate}
                    disabled={isReactivating}
                    className="bg-[#EFF6FF] text-[#1B4FD8] border border-[#BFDBFE] rounded-[6px] px-3 py-1.5 text-[12px] font-medium disabled:opacity-50 transition-all duration-150 ease-out"
                  >
                    {isReactivating ? 'Återaktiverar…' : 'Återaktivera'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionState(actionState === 'delete' ? 'none' : 'delete')}
                    className="bg-[#FEF2F2] text-[#B91C1C] rounded-[6px] px-3 py-1.5 text-[12px] font-medium hover:opacity-80 transition-all duration-150 ease-out"
                  >
                    Radera
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {isUrgent && <RenewalWarning days={days} amount={effectiveAmount} date={renewal} />}
            <DetailRows subscription={subscription} totalPaid={totalPaid} renewal={renewal} effectiveAmount={effectiveAmount} />
            <PriceHistorySection subscription={subscription} />
            {subscription.notes && <Notes text={subscription.notes} />}
            {actionPanel}
          </div>
        </div>
      </div>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────

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

function DetailRows({ subscription, totalPaid, renewal, effectiveAmount }: {
  subscription: Subscription
  totalPaid: number
  renewal: Date
  effectiveAmount: number
}) {
  const intervalShort: Record<string, string> = { month: 'mån', quarter: 'kv', year: 'år' }
  const isCancelled = subscription.status === 'cancelled'
  const rows = [
    { label: 'Kostnad', value: `${effectiveAmount} kr / ${intervalShort[subscription.interval] ?? subscription.interval}` },
    { label: 'Startdatum', value: formatDate(subscription.start_date) },
    ...(!isCancelled ? [{ label: 'Nästa förnyelse', value: formatDate(renewal) }] : []),
    ...(subscription.end_date ? [{ label: isCancelled ? 'Avslutades' : 'Bindningstid t.o.m.', value: formatDate(subscription.end_date) }] : []),
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

function PriceHistorySection({ subscription }: { subscription: Subscription }) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const addEntry = useAddPriceHistory()
  const deleteEntry = useDeletePriceHistory()

  const history = [...(subscription.price_history ?? [])].sort(
    (a, b) => new Date(a.effective_from).getTime() - new Date(b.effective_from).getTime()
  )

  // Show the subscription's starting price as an implicit baseline entry
  // when no price_history entry covers the start date or earlier
  const showBaseline =
    history.length === 0 ||
    new Date(history[0].effective_from) > new Date(subscription.start_date)

  function handleAdd() {
    setFormError(null)
    if (!amount || !date) return
    const duplicate = history.some((h) => h.effective_from === date)
    if (duplicate || (showBaseline && date === subscription.start_date)) {
      setFormError('Det finns redan en post för det datumet')
      return
    }
    addEntry.mutate(
      { subscription_id: subscription.id, amount: Number(amount), interval: subscription.interval, effective_from: date },
      {
        onSuccess: () => { setAmount(''); setDate('') },
        onError: (err) => setFormError(err instanceof Error ? err.message : 'Något gick fel'),
      }
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-[#9CA3AF] tracking-wider uppercase">Prishistorik</p>

      {(showBaseline || history.length > 0) && (
        <div className="border border-[#E5E7EB] rounded-[8px] overflow-hidden divide-y divide-[#E5E7EB]">
          {showBaseline && (
            <div className="flex items-center justify-between px-3 py-2 bg-[#F9FAFB]">
              <span className="text-[12px] text-[#9CA3AF]">
                {new Date(subscription.start_date).toLocaleDateString('sv-SE', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
                {' '}(start)
              </span>
              <span className="text-[13px] font-medium text-[#9CA3AF]">
                {subscription.amount} kr
              </span>
            </div>
          )}
          {history.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between px-3 py-2">
              <span className="text-[12px] text-[#6B7280]">
                {new Date(entry.effective_from).toLocaleDateString('sv-SE', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-[#111827]">
                  {entry.amount} kr
                </span>
                <button
                  type="button"
                  onClick={() => deleteEntry.mutate(entry.id)}
                  disabled={deleteEntry.isPending}
                  className="text-[#D1D5DB] hover:text-[#B91C1C] transition-colors text-[12px] leading-none"
                  aria-label="Ta bort"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setFormError(null) }}
          className="flex-1 border border-[#D1D5DB] focus:border-[#1B4FD8] rounded-[6px] px-3 py-1.5 text-[12px] text-[#111827] outline-none bg-white transition-all duration-150"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setFormError(null) }}
          placeholder="kr"
          min="0"
          className="w-20 border border-[#D1D5DB] focus:border-[#1B4FD8] rounded-[6px] px-3 py-1.5 text-[12px] text-[#111827] outline-none bg-white transition-all duration-150"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!amount || !date || addEntry.isPending}
          className="bg-[#1B4FD8] text-white rounded-[6px] px-3 py-1.5 text-[12px] font-medium disabled:opacity-40 transition-all duration-150 ease-out whitespace-nowrap"
        >
          {addEntry.isPending ? '…' : '+ Lägg till'}
        </button>
      </div>
      {formError && <p className="text-[11px] text-[#B91C1C]">{formError}</p>}
    </div>
  )
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  const s = name.trim()
  return (s[0].toUpperCase() + (s[1] ?? '')).slice(0, 2)
}

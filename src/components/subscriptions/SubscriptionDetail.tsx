import { useState, useEffect, useRef, useId } from 'react'
import { X, Trash2, Pencil, Check } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import type { Subscription } from '../../types'
import { calculateTotalPaid, getNextRenewalDate, getEffectiveCurrentAmount } from '../../lib/calculations'
import { getDomainForService } from '../../lib/serviceIcons'
import { formatDate, daysUntil } from '../../lib/dates'
import {
  useDeleteSubscription,
  useCancelSubscription,
  useReactivateSubscription,
  useAddPriceHistory,
  useDeletePriceHistory,
  useUpdatePriceHistory,
} from '../../hooks/useSubscriptions'

interface Props {
  subscription: Subscription
  onClose: () => void
  onEdit: () => void
  onDeleted: () => void
}

type ActionState = 'none' | 'cancel' | 'delete'

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  active:    { label: 'Aktiv',     className: 'bg-[var(--c-success-bg)] text-[var(--c-success-text)]' },
  paused:    { label: 'Pausad',    className: 'bg-[var(--c-warning-bg)] text-[var(--c-warning-text)]' },
  cancelled: { label: 'Avslutad', className: 'bg-[var(--c-bg-subtle)] text-[var(--c-text-muted)]' },
}

function todayString() {
  return new Date().toISOString().split('T')[0]
}

export default function SubscriptionDetail({ subscription, onClose, onEdit, onDeleted }: Props) {
  const [actionState, setActionState] = useState<ActionState>('none')
  const [cancelDate, setCancelDate] = useState(todayString)
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef)

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
        <div className="bg-[var(--c-warning-bg)] border border-[var(--c-warning-border)] rounded-[8px] p-4 space-y-3">
          <p className="text-[13px] font-medium text-[var(--c-warning-text)]">Avsluta {subscription.name}?</p>
          <p className="text-[12px] text-[var(--c-text-muted)]">Abonnemanget sparas kvar i historiken.</p>
          <div className="space-y-1">
            <label className="block text-[12px] font-medium text-[var(--c-text-secondary)]">Sista betalningsdag</label>
            <input
              type="date"
              value={cancelDate}
              onChange={(e) => setCancelDate(e.target.value)}
              className="w-full border border-[var(--c-border-strong)] focus:border-[var(--c-accent)] focus-visible:outline-2 focus-visible:outline-[var(--c-accent)] focus-visible:outline-offset-0 rounded-[6px] px-3 py-2 text-[16px] md:text-[13px] outline-none bg-[var(--c-bg-card)] text-[var(--c-text-primary)]"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isCancelling}
              className="flex-1 bg-[var(--c-warning-text)] text-white rounded-[6px] py-2 text-[13px] font-medium disabled:opacity-50 transition-all duration-150"
            >
              {isCancelling ? 'Avslutar…' : 'Avsluta'}
            </button>
            <button
              type="button"
              onClick={() => setActionState('none')}
              className="flex-1 bg-[var(--c-bg-card)] border border-[var(--c-border)] text-[var(--c-text-secondary)] rounded-[6px] py-2 text-[13px] font-medium"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}

      {actionState === 'delete' && (
        <div className="bg-[var(--c-danger-bg)] rounded-[8px] p-4 space-y-3">
          <p className="text-[13px] text-[var(--c-danger-text)] font-medium">Radera {subscription.name} permanent?</p>
          <p className="text-[12px] text-[var(--c-text-muted)]">All data och prishistorik tas bort för alltid.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-[var(--c-danger-text)] text-white rounded-[6px] py-2 text-[13px] font-medium disabled:opacity-50 transition-all duration-150"
            >
              {isDeleting ? 'Raderar…' : 'Ja, radera'}
            </button>
            <button
              type="button"
              onClick={() => setActionState('none')}
              className="flex-1 bg-[var(--c-bg-card)] border border-[var(--c-border)] text-[var(--c-text-secondary)] rounded-[6px] py-2 text-[13px] font-medium"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}
    </>
  )

  const inner = (
    <>
      <div className="h-14 px-4 border-b border-[var(--c-border)] flex items-center justify-end shrink-0">
        <button type="button" onClick={onClose} className="text-[var(--c-text-subtle)] hover:text-[var(--c-text-secondary)] transition-colors" aria-label="Stäng">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center gap-3">
          <ServiceIcon name={subscription.name} size="xl" />
          <div>
            <div className="flex items-center gap-2">
              <p id={titleId} className="text-[18px] font-semibold text-[var(--c-text-primary)]">{subscription.name}</p>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${badge.className}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-[13px] text-[var(--c-text-muted)]">{subscription.category?.name ?? '—'}</p>
          </div>
        </div>
        {!isCancelled && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 bg-[var(--c-bg-card)] border border-[var(--c-border)] text-[var(--c-text-secondary)] rounded-[6px] py-2 text-[13px] font-medium hover:bg-[var(--c-bg-app)] transition-all duration-150 ease-out"
            >
              Redigera
            </button>
            <button
              type="button"
              onClick={() => setActionState(actionState === 'cancel' ? 'none' : 'cancel')}
              className="flex-1 bg-[var(--c-warning-bg)] text-[var(--c-warning-text)] rounded-[6px] py-2 text-[13px] font-medium hover:opacity-80 transition-all duration-150 ease-out"
            >
              Avsluta
            </button>
          </div>
        )}
        {isCancelled && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReactivate}
              disabled={isReactivating}
              className="flex-1 bg-[var(--c-accent-subtle)] text-[var(--c-accent)] border border-[var(--c-accent-muted)] rounded-[6px] py-2 text-[13px] font-medium disabled:opacity-50 transition-all duration-150 ease-out"
            >
              {isReactivating ? 'Återaktiverar…' : 'Återaktivera'}
            </button>
            <button
              type="button"
              onClick={() => setActionState(actionState === 'delete' ? 'none' : 'delete')}
              className="flex-1 bg-[var(--c-danger-bg)] text-[var(--c-danger-text)] rounded-[6px] py-2 text-[13px] font-medium hover:opacity-80 transition-all duration-150 ease-out"
            >
              Radera
            </button>
          </div>
        )}
        {isUrgent && <RenewalWarning days={days} amount={effectiveAmount} date={renewal} />}
        <DetailRows subscription={subscription} totalPaid={totalPaid} renewal={renewal} effectiveAmount={effectiveAmount} />
        <PriceHistorySection subscription={subscription} />
        {subscription.notes && <Notes text={subscription.notes} />}
        {actionPanel}
      </div>
    </>
  )

  return (
    <div
      className="fixed inset-0 z-40 md:flex md:items-center md:justify-center md:bg-[var(--c-overlay)]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="absolute inset-0 flex flex-col bg-[var(--c-bg-card)] md:relative md:inset-auto md:w-[480px] md:max-h-[85vh] md:rounded-[16px] md:shadow-xl focus:outline-none"
      >
        {inner}
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function ServiceIcon({ name, size }: { name: string; size: 'lg' | 'xl' }) {
  const [failed, setFailed] = useState(false)
  const domain = getDomainForService(name)
  const dim = size === 'xl' ? 'w-12 h-12 text-[14px]' : 'w-10 h-10 text-[13px]'

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
    <div className={`${dim} rounded-[10px] bg-[var(--c-bg-subtle)] flex items-center justify-center font-medium text-[var(--c-text-secondary)] shrink-0`}>
      {getInitials(name)}
    </div>
  )
}

function RenewalWarning({ days, amount, date }: { days: number; amount: number; date: Date }) {
  return (
    <div className="bg-[var(--c-warning-bg)] border border-[var(--c-warning-border)] rounded-[8px] p-3">
      <p className="text-[13px] text-[var(--c-warning-text)] font-medium">
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
    ...(subscription.trial_ends_at ? [{ label: 'Provperiod slutar', value: formatDate(subscription.trial_ends_at) }] : []),
    ...(!isCancelled ? [{ label: 'Nästa förnyelse', value: formatDate(renewal) }] : []),
    ...(subscription.end_date ? [{ label: isCancelled ? 'Avslutades' : 'Bindningstid t.o.m.', value: formatDate(subscription.end_date) }] : []),
    { label: 'Totalt betalt', value: `${Math.round(totalPaid).toLocaleString('sv-SE')} kr` },
    { label: 'Påminnelse', value: `${subscription.reminder_days_before} dagar` },
  ]
  return (
    <div className="divide-y divide-[var(--c-border)]">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex justify-between py-2.5">
          <span className="text-[12px] text-[var(--c-text-muted)]">{label}</span>
          <span className="text-[13px] font-medium text-[var(--c-text-primary)] text-right">{value}</span>
        </div>
      ))}
    </div>
  )
}

function Notes({ text }: { text: string }) {
  return (
    <div className="border-l-2 border-[var(--c-accent)] pl-3">
      <p className="text-[13px] text-[var(--c-text-secondary)] leading-relaxed">{text}</p>
    </div>
  )
}

function PriceHistorySection({ subscription }: { subscription: Subscription }) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDate, setEditDate] = useState('')

  const addEntry = useAddPriceHistory()
  const deleteEntry = useDeletePriceHistory()
  const updateEntry = useUpdatePriceHistory()

  const history = [...(subscription.price_history ?? [])].sort(
    (a, b) => new Date(a.effective_from).getTime() - new Date(b.effective_from).getTime()
  )

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

  function startEdit(entry: { id: string; amount: number; effective_from: string }) {
    setEditingId(entry.id)
    setEditAmount(String(entry.amount))
    setEditDate(entry.effective_from)
  }

  function handleSaveEdit() {
    if (!editingId || !editAmount || !editDate) return
    updateEntry.mutate(
      { id: editingId, amount: Number(editAmount), effective_from: editDate },
      {
        onSuccess: () => setEditingId(null),
        onError: (err) => setFormError(err instanceof Error ? err.message : 'Något gick fel'),
      }
    )
  }

  const inputClass = 'border border-[var(--c-border-strong)] focus:border-[var(--c-accent)] focus-visible:outline-2 focus-visible:outline-[var(--c-accent)] focus-visible:outline-offset-0 rounded-[6px] px-2 py-1 text-[16px] md:text-[12px] text-[var(--c-text-primary)] outline-none bg-[var(--c-bg-card)] transition-all duration-150'

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-[var(--c-text-subtle)] tracking-wider uppercase">Prishistorik</p>

      {(showBaseline || history.length > 0) && (
        <div className="border border-[var(--c-border)] rounded-[8px] overflow-hidden divide-y divide-[var(--c-border)]">
          {showBaseline && (
            <div className="flex items-center justify-between px-3 py-2 bg-[var(--c-bg-app)]">
              <span className="text-[12px] text-[var(--c-text-subtle)]">
                {new Date(subscription.start_date).toLocaleDateString('sv-SE', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
                {' '}(start)
              </span>
              <span className="text-[13px] font-medium text-[var(--c-text-subtle)]">
                {subscription.amount} kr
              </span>
            </div>
          )}
          {history.map((entry) => (
            <div key={entry.id} className="px-3 py-2">
              {editingId === entry.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    aria-label="Gäller från datum"
                    className={`flex-1 ${inputClass}`}
                  />
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    min="0"
                    placeholder="kr"
                    aria-label="Belopp i kronor"
                    className={`w-20 ${inputClass}`}
                  />
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={updateEntry.isPending}
                    className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[var(--c-success-text)] hover:bg-[var(--c-success-bg)] transition-all duration-150 ease-out disabled:opacity-40"
                    aria-label="Spara"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[var(--c-text-subtle)] hover:bg-[var(--c-bg-subtle)] transition-all duration-150 ease-out"
                    aria-label="Avbryt"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[var(--c-text-muted)]">
                    {new Date(entry.effective_from).toLocaleDateString('sv-SE', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] font-medium text-[var(--c-text-primary)] mr-2">
                      {entry.amount} kr
                    </span>
                    <button
                      type="button"
                      onClick={() => startEdit(entry)}
                      className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[var(--c-text-subtle)] hover:bg-[var(--c-accent-subtle)] hover:text-[var(--c-accent)] transition-all duration-150 ease-out"
                      aria-label="Redigera prispost"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteEntry.mutate(entry.id)}
                      disabled={deleteEntry.isPending}
                      className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[var(--c-text-subtle)] hover:bg-[var(--c-danger-bg)] hover:text-[var(--c-danger-text)] transition-all duration-150 ease-out disabled:opacity-40"
                      aria-label="Ta bort prispost"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setFormError(null) }}
          aria-label="Gäller från datum"
          className="flex-1 border border-[var(--c-border-strong)] focus:border-[var(--c-accent)] focus-visible:outline-2 focus-visible:outline-[var(--c-accent)] focus-visible:outline-offset-0 rounded-[6px] px-3 py-1.5 text-[16px] md:text-[12px] text-[var(--c-text-primary)] outline-none bg-[var(--c-bg-card)] transition-all duration-150"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setFormError(null) }}
          placeholder="kr"
          min="0"
          aria-label="Belopp i kronor"
          className="w-20 border border-[var(--c-border-strong)] focus:border-[var(--c-accent)] focus-visible:outline-2 focus-visible:outline-[var(--c-accent)] focus-visible:outline-offset-0 rounded-[6px] px-3 py-1.5 text-[16px] md:text-[12px] text-[var(--c-text-primary)] outline-none bg-[var(--c-bg-card)] transition-all duration-150"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!amount || !date || addEntry.isPending}
          className="bg-[var(--c-accent)] text-white rounded-[6px] px-3 py-1.5 text-[12px] font-medium disabled:opacity-40 transition-all duration-150 ease-out whitespace-nowrap"
        >
          {addEntry.isPending ? '…' : '+ Lägg till'}
        </button>
      </div>
      {formError && <p role="alert" className="text-[11px] text-[var(--c-danger-text)]">{formError}</p>}
    </div>
  )
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  const s = name.trim()
  return (s[0].toUpperCase() + (s[1] ?? '')).slice(0, 2)
}

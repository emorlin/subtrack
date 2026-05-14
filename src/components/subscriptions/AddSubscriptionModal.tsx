import { useState, useEffect, useRef, useId, Fragment } from 'react'
import { X } from 'lucide-react'
import ServiceNameCombobox from '../ui/ServiceNameCombobox'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useCategories } from '../../hooks/useCategories'
import { useAddSubscription, useUpdateSubscription } from '../../hooks/useSubscriptions'
import type { Subscription, SubscriptionInterval, SubscriptionFormData } from '../../types'

interface FormState {
  name: string
  category_id: string
  amount: string
  currency: string
  interval: SubscriptionInterval
  interval_count: number
  start_date: string
  reminder_days_before: string
  notes: string
  is_cancelled: boolean
  cancelled_date: string
}

const INITIAL: FormState = {
  name: '',
  category_id: '',
  amount: '',
  currency: 'SEK',
  interval: 'month',
  interval_count: 1,
  start_date: '',
  reminder_days_before: '3',
  notes: '',
  is_cancelled: false,
  cancelled_date: '',
}

interface Props {
  onClose: () => void
  subscription?: Subscription
}

function subscriptionToFormState(sub: Subscription): FormState {
  return {
    name: sub.name,
    category_id: sub.category_id ?? '',
    amount: String(sub.amount),
    currency: sub.currency,
    interval: sub.interval,
    interval_count: sub.interval_count,
    start_date: sub.start_date,
    reminder_days_before: String(sub.reminder_days_before),
    notes: sub.notes ?? '',
    is_cancelled: sub.status === 'cancelled',
    cancelled_date: sub.end_date ?? '',
  }
}

export default function AddSubscriptionModal({ onClose, subscription }: Props) {
  const isEdit = !!subscription
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(
    subscription ? subscriptionToFormState(subscription) : INITIAL
  )
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const addSubscription = useAddSubscription()
  const updateSubscription = useUpdateSubscription()
  const isSaving = addSubscription.isPending || updateSubscription.isPending
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validateStep1(): boolean {
    const errs: typeof errors = {}
    if (!form.name.trim()) errs.name = 'Namn krävs'
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      errs.amount = 'Ange ett giltigt belopp'
    if (!form.start_date) errs.start_date = 'Startdatum krävs'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleNext() {
    if (step === 1 && !validateStep1()) return
    setStep((s) => s + 1)
  }

  function buildFormData(): SubscriptionFormData {
    const end_date = (form.is_cancelled && form.cancelled_date) ? form.cancelled_date : null
    return {
      name: form.name.trim(),
      category_id: form.category_id || null,
      amount: Number(form.amount),
      currency: form.currency,
      interval: form.interval,
      interval_count: form.interval_count,
      start_date: form.start_date,
      end_date,
      legacy_amount_paid: null,
      notes: form.notes.trim() || null,
      reminder_days_before: Number(form.reminder_days_before),
      ...(form.is_cancelled ? { status: 'cancelled' } : {}),
    }
  }

  function handleSave() {
    const data = buildFormData()
    if (isEdit && subscription) {
      updateSubscription.mutate({ id: subscription.id, ...data }, { onSuccess: onClose })
    } else {
      addSubscription.mutate(data, { onSuccess: onClose })
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 md:flex md:items-center md:justify-center md:bg-[var(--c-overlay)]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="absolute inset-0 flex flex-col bg-[var(--c-bg-card)] md:relative md:inset-auto md:w-[560px] md:max-h-[90vh] md:rounded-[16px] md:shadow-xl focus:outline-none"
      >
        <div className="relative flex items-center justify-center px-4 h-14 border-b border-[var(--c-border)] shrink-0">
          <span id={titleId} className="text-[14px] font-semibold text-[var(--c-text-primary)]">
            {isEdit ? 'Redigera abonnemang' : 'Nytt abonnemang'}
          </span>
          <button type="button" onClick={onClose} className="absolute right-4 text-[var(--c-text-subtle)] hover:text-[var(--c-text-secondary)] transition-colors" aria-label="Stäng">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-4 shrink-0">
          <StepIndicator step={step} />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-4 space-y-4">
          {step === 1 && <BasicInfoStep form={form} update={update} errors={errors} />}
          {step === 2 && <ConfirmStep form={form} update={update} />}
        </div>
        <div className="px-4 py-4 border-t border-[var(--c-border)] shrink-0">
          {step < 2 ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-full bg-[var(--c-accent)] text-white rounded-[6px] py-3 text-[14px] font-medium transition-all duration-150 ease-out"
            >
              Nästa →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-[var(--c-accent)] text-white rounded-[6px] py-3 text-[14px] font-medium transition-all duration-150 ease-out disabled:opacity-50"
            >
              {isSaving ? 'Sparar…' : isEdit ? 'Uppdatera' : 'Spara abonnemang'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Step indicator ──────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  const steps = [
    { num: 1, label: 'Info' },
    { num: 2, label: 'Bekräfta' },
  ]

  return (
    <div className="flex items-start">
      {steps.map((s, i) => (
        <Fragment key={s.num}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium transition-all duration-150 ${
                step >= s.num
                  ? 'bg-[var(--c-accent)] text-white'
                  : 'bg-[var(--c-bg-subtle)] text-[var(--c-text-subtle)]'
              }`}
            >
              {step > s.num ? '✓' : s.num}
            </div>
            <span
              className={`text-[10px] mt-1 font-medium ${
                step === s.num ? 'text-[var(--c-accent)]' : 'text-[var(--c-text-subtle)]'
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-px mt-4 mx-2 transition-all duration-150 ${
                step > s.num ? 'bg-[var(--c-accent)]' : 'bg-[var(--c-border)]'
              }`}
            />
          )}
        </Fragment>
      ))}
    </div>
  )
}

// ── Step 1: Grundinfo ────────────────────────────────────────

function BasicInfoStep({
  form,
  update,
  errors,
}: {
  form: FormState
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void
  errors: Partial<Record<keyof FormState, string>>
}) {
  const { data: categories = [] } = useCategories()

  return (
    <>
      <Field label="Tjänstens namn" required error={errors.name}>
        <ServiceNameCombobox
          value={form.name}
          onChange={(v) => update('name', v)}
          hasError={!!errors.name}
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Kategori" required>
          <select
            value={form.category_id}
            onChange={(e) => update('category_id', e.target.value)}
            className={inputClass(false)}
          >
            <option value="">Välj kategori…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Kostnad" required error={errors.amount}>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => update('amount', e.target.value)}
            placeholder="149"
            min="0"
            className={inputClass(!!errors.amount)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Intervall" required>
          <select
            value={`${form.interval}:${form.interval_count}`}
            onChange={(e) => {
              const [interval, count] = e.target.value.split(':')
              update('interval', interval as SubscriptionInterval)
              update('interval_count', Number(count))
            }}
            className={inputClass(false)}
          >
            <option value="month:1">per månad</option>
            <option value="quarter:1">per kvartal</option>
            <option value="year:1">per år</option>
          </select>
        </Field>

        <Field label="Startdatum" required error={errors.start_date}>
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => update('start_date', e.target.value)}
            className={inputClass(!!errors.start_date)}
          />
          {!errors.start_date && (
            <p className="text-[11px] text-[var(--c-text-subtle)] mt-1">Datumet du började betala</p>
          )}
        </Field>
      </div>

      {!form.is_cancelled && (
        <Field label="Påminnelse">
          <select
            value={form.reminder_days_before}
            onChange={(e) => update('reminder_days_before', e.target.value)}
            className={inputClass(false)}
          >
            <option value="1">1 dag innan förnyelse</option>
            <option value="3">3 dagar innan förnyelse</option>
            <option value="7">7 dagar innan förnyelse</option>
            <option value="14">14 dagar innan förnyelse</option>
          </select>
        </Field>
      )}

      <div className="border-t border-[var(--c-border)] pt-4">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.is_cancelled}
            onChange={(e) => {
              update('is_cancelled', e.target.checked)
              if (!e.target.checked) update('cancelled_date', '')
            }}
            className="w-4 h-4 rounded accent-[var(--c-accent)]"
          />
          <span className="text-[13px] text-[var(--c-text-muted)]">Abonnemanget är avslutat</span>
        </label>

        {form.is_cancelled && (
          <div className="mt-3">
            <Field label="Avslutades (sista betalning)">
              <input
                type="date"
                value={form.cancelled_date}
                onChange={(e) => update('cancelled_date', e.target.value)}
                className={inputClass(false)}
              />
            </Field>
          </div>
        )}
      </div>
    </>
  )
}

// ── Step 2: Bekräfta ─────────────────────────────────────────

function ConfirmStep({
  form,
  update,
}: {
  form: FormState
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}) {
  const { data: categories = [] } = useCategories()
  const category = categories.find((c) => c.id === form.category_id)

  const intervalMap: Record<string, string> = {
    'month:1': 'Månadsvis',
    'quarter:1': 'Kvartalsvis',
    'year:1': 'Årsvis',
  }
  const intervalKey = `${form.interval}:${form.interval_count}`
  return (
    <div className="space-y-4">
      <div className="bg-[var(--c-bg-app)] rounded-[8px] divide-y divide-[var(--c-border)]">
        <SummaryRow label="Tjänst" value={form.name} />
        <SummaryRow label="Kategori" value={category?.name ?? '—'} />
        <SummaryRow label="Kostnad" value={`${form.amount} kr / ${intervalMap[intervalKey] ?? form.interval}`} />
        <SummaryRow label="Startdatum" value={form.start_date} />
        <SummaryRow label="Påminnelse" value={`${form.reminder_days_before} dagar innan`} />
      </div>

      <Field label="Kommentar (valfri)">
        <textarea
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="Ev. anteckningar om abonnemanget…"
          rows={3}
          className={`${inputClass(false)} resize-none`}
        />
      </Field>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-3 py-2">
      <span className="text-[12px] text-[var(--c-text-muted)]">{label}</span>
      <span className="text-[13px] font-medium text-[var(--c-text-primary)]">{value}</span>
    </div>
  )
}

// ── Shared UI ───────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1 min-w-0">
      <label className="block text-[12px] font-medium text-[var(--c-text-secondary)]">
        {label}
        {required && <span className="text-[var(--c-danger-text)] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p role="alert" className="text-[11px] text-[var(--c-danger-text)]">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return `w-full min-w-0 border ${
    hasError ? 'border-[var(--c-danger-text)]' : 'border-[var(--c-border-strong)]'
  } focus:border-[var(--c-accent)] focus-visible:outline-2 focus-visible:outline-[var(--c-accent)] focus-visible:outline-offset-0 rounded-[6px] px-3 py-2 text-[16px] md:text-[13px] text-[var(--c-text-primary)] outline-none bg-[var(--c-bg-card)] transition-all duration-150 ease-out`
}

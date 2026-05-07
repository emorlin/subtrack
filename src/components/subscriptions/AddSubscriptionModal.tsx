import { useState, useEffect } from 'react'
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
  binding_months: string
  reminder_days_before: string
  has_legacy: boolean
  legacy_amount: string
  notes: string
}

const INITIAL: FormState = {
  name: '',
  category_id: '',
  amount: '',
  currency: 'SEK',
  interval: 'month',
  interval_count: 1,
  start_date: '',
  binding_months: '0',
  reminder_days_before: '3',
  has_legacy: false,
  legacy_amount: '',
  notes: '',
}

interface Props {
  onClose: () => void
  subscription?: Subscription // pre-populate for edit mode
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
    binding_months: '0',
    reminder_days_before: String(sub.reminder_days_before),
    has_legacy: sub.legacy_amount_paid !== null,
    legacy_amount: sub.legacy_amount_paid !== null ? String(sub.legacy_amount_paid) : '',
    notes: sub.notes ?? '',
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

  function handleBack() {
    setStep((s) => s - 1)
  }

  function buildFormData(): SubscriptionFormData {
    const bindingMonths = Number(form.binding_months)
    let end_date: string | null = null
    if (bindingMonths > 0 && form.start_date) {
      const end = new Date(form.start_date)
      end.setMonth(end.getMonth() + bindingMonths)
      end_date = end.toISOString().split('T')[0]
    }
    return {
      name: form.name.trim(),
      category_id: form.category_id || null,
      amount: Number(form.amount),
      currency: form.currency,
      interval: form.interval,
      interval_count: form.interval_count,
      start_date: form.start_date,
      end_date,
      legacy_amount_paid: form.has_legacy && form.legacy_amount ? Number(form.legacy_amount) : null,
      notes: form.notes.trim() || null,
      reminder_days_before: Number(form.reminder_days_before),
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

  const autoCalculated = computeAutoPaid(form)
  const totalPaid = form.has_legacy && form.legacy_amount
    ? Number(form.legacy_amount)
    : autoCalculated.total

  const stepContent = (
    <>
      {step === 1 && <BasicInfoStep form={form} update={update} errors={errors} />}
      {step === 2 && <HistoryStep form={form} update={update} autoCalculated={autoCalculated} totalPaid={totalPaid} />}
      {step === 3 && <ConfirmStep form={form} update={update} totalPaid={totalPaid} />}
    </>
  )

  return (
    <>
      {/* ── Mobile (full screen) ────────────────────────────── */}
      <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-[#E5E7EB] shrink-0">
          {step === 1 ? (
            <button type="button" onClick={onClose} className="text-[13px] text-[#1B4FD8]">
              Avbryt
            </button>
          ) : (
            <button type="button" onClick={handleBack} className="text-[13px] text-[#1B4FD8]">
              ← Tillbaka
            </button>
          )}
          <span className="text-[14px] font-semibold text-[#111827]">
            {isEdit ? 'Redigera abonnemang' : 'Nytt abonnemang'}
          </span>
          <span className="text-[13px] text-[#9CA3AF]">{step}/3</span>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-4 shrink-0">
          <StepIndicator step={step} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {stepContent}
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-[#E5E7EB] shrink-0">
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-full bg-[#1B4FD8] text-white rounded-[6px] py-3 text-[14px] font-medium transition-all duration-150 ease-out"
            >
              Nästa →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-[#1B4FD8] text-white rounded-[6px] py-3 text-[14px] font-medium transition-all duration-150 ease-out disabled:opacity-50"
            >
              {isSaving ? 'Sparar…' : isEdit ? 'Uppdatera' : 'Spara abonnemang'}
            </button>
          )}
        </div>
      </div>

      {/* ── Desktop (modal overlay) ─────────────────────────── */}
      <div
        className="hidden md:flex fixed inset-0 bg-black/50 z-50 items-center justify-center"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div className="bg-white rounded-[16px] w-[560px] max-h-[90vh] overflow-y-auto shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h2 className="text-[18px] font-semibold text-[#111827] tracking-[-0.3px]">
              {isEdit ? 'Redigera abonnemang' : 'Nytt abonnemang'}
            </h2>
            <span className="text-[13px] text-[#9CA3AF]">Steg {step} av 3</span>
          </div>

          {/* Content */}
          <div className="px-6 pb-4 space-y-4">
            {stepContent}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB]">
            {step === 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="bg-white border border-[#E5E7EB] text-[#374151] rounded-[6px] px-4 py-2 text-[13px] font-medium transition-all duration-150 ease-out hover:bg-[#F9FAFB]"
              >
                Avbryt
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBack}
                className="bg-white border border-[#E5E7EB] text-[#374151] rounded-[6px] px-4 py-2 text-[13px] font-medium transition-all duration-150 ease-out hover:bg-[#F9FAFB]"
              >
                ← Tillbaka
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#1B4FD8] text-white rounded-[6px] px-4 py-2 text-[13px] font-medium transition-all duration-150 ease-out hover:bg-[#1a46c2]"
              >
                Nästa →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#1B4FD8] text-white rounded-[6px] px-4 py-2 text-[13px] font-medium transition-all duration-150 ease-out hover:bg-[#1a46c2] disabled:opacity-50"
              >
                {isSaving ? 'Sparar…' : isEdit ? 'Uppdatera' : 'Spara abonnemang'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ── Step indicator ──────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  const steps = [
    { num: 1, label: 'Info' },
    { num: 2, label: 'Historik' },
    { num: 3, label: 'Bekräfta' },
  ]

  return (
    <div className="flex items-start">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-start flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium transition-all duration-150 ${
                step > s.num
                  ? 'bg-[#1B4FD8] text-white'
                  : step === s.num
                  ? 'bg-[#1B4FD8] text-white'
                  : 'bg-[#F3F4F6] text-[#9CA3AF]'
              }`}
            >
              {step > s.num ? '✓' : s.num}
            </div>
            <span
              className={`text-[10px] mt-1 font-medium ${
                step === s.num ? 'text-[#1B4FD8]' : 'text-[#9CA3AF]'
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-px mt-4 mx-1 transition-all duration-150 ${
                step > s.num ? 'bg-[#1B4FD8]' : 'bg-[#E5E7EB]'
              }`}
            />
          )}
        </div>
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
      {/* Tjänstens namn */}
      <Field label="Tjänstens namn" required error={errors.name}>
        <input
          type="text"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="t.ex. Netflix"
          className={inputClass(!!errors.name)}
        />
      </Field>

      {/* Kategori + Kostnad (desktop: side by side) */}
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

      {/* Intervall + Startdatum */}
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
            <p className="text-[11px] text-[#9CA3AF] mt-1">Datumet du började betala</p>
          )}
        </Field>
      </div>

      {/* Bindningstid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Bindningstid">
          <select
            value={form.binding_months}
            onChange={(e) => update('binding_months', e.target.value)}
            className={inputClass(false)}
          >
            <option value="0">Ingen / löpande</option>
            <option value="3">3 månader</option>
            <option value="6">6 månader</option>
            <option value="12">12 månader</option>
            <option value="24">24 månader</option>
          </select>
        </Field>
      </div>

      {/* Påminnelse */}
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
    </>
  )
}

// ── Step 2: Historik ─────────────────────────────────────────

function HistoryStep({
  form,
  update,
  autoCalculated,
  totalPaid,
}: {
  form: FormState
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void
  autoCalculated: { total: number; periods: number; startLabel: string }
  totalPaid: number
}) {
  return (
    <>
      <div className="space-y-4">
        <div>
          <p className="text-[14px] font-medium text-[#111827]">
            Har du betalat för {form.name || 'tjänsten'} innan du lägger till den här?
          </p>
          <p className="text-[12px] text-[#6B7280] mt-1">
            Ange manuellt belopp om du vill ha korrekt historik, annars räknar vi från startdatum.
          </p>
        </div>

        {/* Choice buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => update('has_legacy', true)}
            className={`flex-1 rounded-[6px] py-2 text-[13px] font-medium transition-all duration-150 ease-out ${
              form.has_legacy
                ? 'bg-[#1B4FD8] text-white'
                : 'bg-white border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]'
            }`}
          >
            Ja, ange belopp
          </button>
          <button
            type="button"
            onClick={() => { update('has_legacy', false); update('legacy_amount', '') }}
            className={`flex-1 rounded-[6px] py-2 text-[13px] font-medium transition-all duration-150 ease-out ${
              !form.has_legacy
                ? 'bg-[#1B4FD8] text-white'
                : 'bg-white border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]'
            }`}
          >
            Nej, hoppa över
          </button>
        </div>

        {/* Manual amount input */}
        {form.has_legacy && (
          <Field label="Manuellt totalt betalt (kr)">
            <input
              type="number"
              value={form.legacy_amount}
              onChange={(e) => update('legacy_amount', e.target.value)}
              placeholder="t.ex. 5811"
              min="0"
              className={inputClass(false)}
            />
          </Field>
        )}

        {/* Preview */}
        <div className="bg-[#F9FAFB] rounded-[8px] p-4 space-y-2">
          <div className="flex justify-between text-[13px] text-[#6B7280]">
            <span>Autoberäknat ({autoCalculated.startLabel} → idag)</span>
            <span>{Math.round(autoCalculated.total).toLocaleString('sv-SE')} kr</span>
          </div>
          <div className="flex justify-between text-[13px] text-[#6B7280]">
            <span>Manuellt belopp</span>
            <span>
              {form.has_legacy && form.legacy_amount
                ? `${Number(form.legacy_amount).toLocaleString('sv-SE')} kr`
                : '—'}
            </span>
          </div>
          <div className="border-t border-[#E5E7EB] pt-2 flex justify-between text-[14px] font-semibold text-[#111827]">
            <span>Totalt betalt</span>
            <span>{Math.round(totalPaid).toLocaleString('sv-SE')} kr</span>
          </div>
          {!form.has_legacy && autoCalculated.periods > 0 && (
            <p className="text-[11px] text-[#9CA3AF]">
              Beräknat: {form.amount} kr × {autoCalculated.periods} månader
            </p>
          )}
        </div>
      </div>
    </>
  )
}

// ── Step 3: Bekräfta ─────────────────────────────────────────

function ConfirmStep({
  form,
  update,
  totalPaid,
}: {
  form: FormState
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void
  totalPaid: number
}) {
  const { data: categories = [] } = useCategories()
  const category = categories.find((c) => c.id === form.category_id)

  const intervalMap: Record<string, string> = {
    'month:1': 'Månadsvis',
    'quarter:1': 'Kvartalsvis',
    'year:1': 'Årsvis',
  }
  const intervalKey = `${form.interval}:${form.interval_count}`
  const bindingMap: Record<string, string> = {
    '0': 'Ingen / löpande',
    '3': '3 månader',
    '6': '6 månader',
    '12': '12 månader',
    '24': '24 månader',
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-[#F9FAFB] rounded-[8px] divide-y divide-[#E5E7EB]">
        <SummaryRow label="Tjänst" value={form.name} />
        <SummaryRow label="Kategori" value={category?.name ?? '—'} />
        <SummaryRow label="Kostnad" value={`${form.amount} kr / ${intervalMap[intervalKey] ?? form.interval}`} />
        <SummaryRow label="Startdatum" value={form.start_date} />
        <SummaryRow label="Bindningstid" value={bindingMap[form.binding_months] ?? '—'} />
        <SummaryRow label="Totalt betalt" value={`${Math.round(totalPaid).toLocaleString('sv-SE')} kr`} />
        <SummaryRow label="Påminnelse" value={`${form.reminder_days_before} dagar innan`} />
      </div>

      {/* Notes */}
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
      <span className="text-[12px] text-[#6B7280]">{label}</span>
      <span className="text-[13px] font-medium text-[#111827]">{value}</span>
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
    <div className="space-y-1">
      <label className="block text-[12px] font-medium text-[#374151]">
        {label}
        {required && <span className="text-[#B91C1C] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-[#B91C1C]">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return `w-full border ${
    hasError ? 'border-[#B91C1C]' : 'border-[#D1D5DB]'
  } focus:border-[#1B4FD8] rounded-[6px] px-3 py-2 text-[13px] text-[#111827] outline-none bg-white transition-all duration-150 ease-out`
}

// ── Calculation helper ───────────────────────────────────────

function computeAutoPaid(form: FormState): { total: number; periods: number; startLabel: string } {
  if (!form.start_date || !form.amount || isNaN(Number(form.amount))) {
    return { total: 0, periods: 0, startLabel: '—' }
  }

  const start = new Date(form.start_date)
  const today = new Date()
  const amount = Number(form.amount)

  const msPerDay = 1000 * 60 * 60 * 24
  const days = (today.getTime() - start.getTime()) / msPerDay
  const daysPerPeriod = form.interval === 'year' ? 365.25 : form.interval === 'quarter' ? 91.3125 : 30.4375
  const periods = Math.max(0, Math.floor(days / (daysPerPeriod * form.interval_count)))

  // For the label, show month + year of start
  const startLabel = start.toLocaleDateString('sv-SE', { month: 'short', year: 'numeric' })

  return {
    total: periods * amount,
    periods,
    startLabel,
  }
}

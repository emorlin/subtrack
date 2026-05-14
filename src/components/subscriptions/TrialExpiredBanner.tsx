import { useUpdateSubscription } from '../../hooks/useSubscriptions'
import { formatDate } from '../../lib/dates'
import type { Subscription } from '../../types'

interface Props {
  subscriptions: Subscription[]
}

export default function TrialExpiredBanner({ subscriptions }: Props) {
  const updateSubscription = useUpdateSubscription()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expired = subscriptions.filter(
    (s) => s.trial_ends_at && new Date(s.trial_ends_at) < today && s.status === 'active'
  )

  if (expired.length === 0) return null

  // Show one at a time — first in list
  const sub = expired[0]

  function handleKeep() {
    updateSubscription.mutate({ id: sub.id, trial_ends_at: null })
  }

  function handleCancel() {
    const today = new Date().toISOString().slice(0, 10)
    updateSubscription.mutate({ id: sub.id, trial_ends_at: null, status: 'cancelled', end_date: today })
  }

  const isSaving = updateSubscription.isPending

  return (
    <div
      role="alert"
      className="bg-[var(--c-warning-bg)] border border-[var(--c-warning-text)] border-opacity-30 rounded-[12px] p-4 flex flex-col gap-3"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 w-2 h-2 rounded-full bg-[var(--c-warning-text)] shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[var(--c-warning-text)]">
            Provperioden för {sub.name} har gått ut
          </p>
          <p className="text-[12px] text-[var(--c-warning-text)] opacity-80 mt-0.5">
            Gratisperioden slutade {formatDate(sub.trial_ends_at!)}. Är du fortfarande prenumerant?
          </p>
          {expired.length > 1 && (
            <p className="text-[11px] text-[var(--c-warning-text)] opacity-60 mt-1">
              +{expired.length - 1} till att hantera
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 pl-5">
        <button
          type="button"
          onClick={handleKeep}
          disabled={isSaving}
          aria-label={`Ja, jag betalar nu för ${sub.name}`}
          className="flex-1 bg-[var(--c-warning-text)] text-white rounded-[6px] py-2 text-[12px] font-medium disabled:opacity-50 transition-all duration-150 ease-out"
        >
          Ja, jag betalar nu
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
          aria-label={`Nej, jag avslutade ${sub.name}`}
          className="flex-1 bg-white border border-[var(--c-warning-text)] border-opacity-40 text-[var(--c-warning-text)] rounded-[6px] py-2 text-[12px] font-medium disabled:opacity-50 transition-all duration-150 ease-out"
        >
          Nej, jag avslutade
        </button>
      </div>
    </div>
  )
}

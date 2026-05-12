import { useState } from 'react'
import { useLayout } from '../components/layout/AppLayout'
import { usePageTitle } from '../hooks/usePageTitle'
import SubscriptionList from '../components/subscriptions/SubscriptionList'
import AddSubscriptionModal from '../components/subscriptions/AddSubscriptionModal'
import SubscriptionDetail from '../components/subscriptions/SubscriptionDetail'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { toMonthlyAmount, getEffectiveCurrentAmount } from '../lib/calculations'

type ModalState =
  | { type: 'none' }
  | { type: 'detail'; subscriptionId: string }
  | { type: 'edit'; subscriptionId: string }

export default function Dashboard() {
  usePageTitle('Översikt')
  const { openAdd } = useLayout()
  const { data: subscriptions = [] } = useSubscriptions()
  const [modal, setModal] = useState<ModalState>({ type: 'none' })

  const close = () => setModal({ type: 'none' })

  const selectedId = modal.type === 'detail' ? modal.subscriptionId : null

  const detailSub = modal.type === 'detail' || modal.type === 'edit'
    ? subscriptions.find((s) => s.id === modal.subscriptionId) ?? null
    : null

  const active = subscriptions.filter((s) => s.status === 'active')
  const cancelled = subscriptions.filter((s) => s.status === 'cancelled')
  const monthlyTotal = active.reduce(
    (sum, s) => sum + toMonthlyAmount(getEffectiveCurrentAmount(s), s.interval, s.interval_count),
    0
  )

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-[20px] font-semibold text-[var(--c-text-primary)] tracking-[-0.3px]">Abonnemang</h1>
        <p className="text-[13px] text-[var(--c-text-muted)] mt-1 leading-relaxed">
          Alla dina tjänster samlade på ett ställe, normaliserade till månadskostnad för enkel jämförelse. Klicka på en tjänst för att se detaljer, ändra pris eller lägga till historik.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Per månad" value={`${Math.round(monthlyTotal)} kr`} accent />
        <MetricCard label="Per år" value={`${Math.round(monthlyTotal * 12).toLocaleString('sv-SE')} kr`} />
        <MetricCard label="Aktiva" value={String(active.length)} />
        <MetricCard label="Avslutade" value={String(cancelled.length)} />
      </div>

      <SubscriptionList
        selectedId={selectedId}
        onSelect={(sub) => setModal({ type: 'detail', subscriptionId: sub.id })}
        onAdd={openAdd}
      />

      {modal.type === 'detail' && detailSub && (
        <SubscriptionDetail
          subscription={detailSub}
          onClose={close}
          onEdit={() => setModal({ type: 'edit', subscriptionId: detailSub.id })}
          onDeleted={close}
        />
      )}

      {modal.type === 'edit' && detailSub && (
        <AddSubscriptionModal subscription={detailSub} onClose={close} />
      )}
    </div>
  )
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-[var(--c-bg-app)] rounded-lg p-3">
      <p className="text-[11px] text-[var(--c-text-muted)] mb-1">{label}</p>
      <p className={`text-[20px] font-semibold tracking-[-0.3px] ${accent ? 'text-[var(--c-accent)]' : 'text-[var(--c-text-primary)]'}`}>
        {value}
      </p>
    </div>
  )
}

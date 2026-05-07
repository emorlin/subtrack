import { useEffect } from 'react'
import { useLayout } from '../components/layout/AppLayout'
import SubscriptionList from '../components/subscriptions/SubscriptionList'
import AddSubscriptionModal from '../components/subscriptions/AddSubscriptionModal'
import SubscriptionDetail from '../components/subscriptions/SubscriptionDetail'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { toMonthlyAmount } from '../lib/calculations'
import type { Subscription } from '../types'
import { useState } from 'react'

type ModalState =
  | { type: 'none' }
  | { type: 'detail'; subscription: Subscription }
  | { type: 'add' }
  | { type: 'edit'; subscription: Subscription }

export default function Dashboard() {
  const { setAction, setMobileAddButton } = useLayout()
  const { data: subscriptions = [] } = useSubscriptions()
  const [modal, setModal] = useState<ModalState>({ type: 'none' })

  const close = () => setModal({ type: 'none' })

  const selectedId =
    modal.type === 'detail' ? modal.subscription.id : null

  useEffect(() => {
    setAction(<AddButton onClick={() => setModal({ type: 'add' })} />)
    setMobileAddButton(<MobileAddButton onClick={() => setModal({ type: 'add' })} />)
    return () => { setAction(null); setMobileAddButton(null) }
  }, [])

  const active = subscriptions.filter((s) => s.status === 'active')
  const cancelled = subscriptions.filter((s) => s.status === 'cancelled')
  const monthlyTotal = active.reduce(
    (sum, s) => sum + toMonthlyAmount(s.amount, s.interval, s.interval_count),
    0
  )

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Per månad" value={`${Math.round(monthlyTotal)} kr`} accent />
        <MetricCard label="Per år" value={`${Math.round(monthlyTotal * 12).toLocaleString('sv-SE')} kr`} />
        <MetricCard label="Aktiva" value={String(active.length)} />
        <MetricCard label="Avslutade" value={String(cancelled.length)} />
      </div>

      <SubscriptionList
        selectedId={selectedId}
        onSelect={(sub) => setModal({ type: 'detail', subscription: sub })}
        onAdd={() => setModal({ type: 'add' })}
      />

      {modal.type === 'detail' && (
        <SubscriptionDetail
          subscription={modal.subscription}
          onClose={close}
          onEdit={() => setModal({ type: 'edit', subscription: modal.subscription })}
          onDeleted={close}
        />
      )}

      {modal.type === 'add' && (
        <AddSubscriptionModal onClose={close} />
      )}

      {modal.type === 'edit' && (
        <AddSubscriptionModal subscription={modal.subscription} onClose={close} />
      )}
    </div>
  )
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-[#F9FAFB] rounded-lg p-3">
      <p className="text-[11px] text-[#6B7280] mb-1">{label}</p>
      <p className={`text-[20px] font-semibold tracking-[-0.3px] ${accent ? 'text-[#1B4FD8]' : 'text-[#111827]'}`}>
        {value}
      </p>
    </div>
  )
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-[#1B4FD8] text-white rounded-[6px] px-4 py-2 text-[13px] font-medium transition-all duration-150 ease-out hover:bg-[#1a46c2]"
    >
      + Lägg till
    </button>
  )
}

function MobileAddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-[#1B4FD8] text-white rounded-[6px] py-3 text-[14px] font-medium transition-all duration-150 ease-out"
    >
      + Lägg till abonnemang
    </button>
  )
}

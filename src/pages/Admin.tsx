import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAdminUsers, ADMIN_ID } from '../hooks/useAdmin'
import { usePageTitle } from '../hooks/usePageTitle'
import type { AdminUser } from '../hooks/useAdmin'

export default function Admin() {
  const { user, loading } = useAuth()
  usePageTitle('Admin')

  if (loading) return null
  if (user?.id !== ADMIN_ID) return <Navigate to="/" replace />

  return <AdminContent />
}

function AdminContent() {
  const { data: users = [], isLoading } = useAdminUsers()

  const totalSubs = users.reduce((sum, u) => sum + u.subscriptions.length, 0)
  const activeSubs = users.reduce((sum, u) => sum + u.subscriptions.filter((s) => s.status === 'active').length, 0)
  const pausedSubs = users.reduce((sum, u) => sum + u.subscriptions.filter((s) => s.status === 'paused').length, 0)
  const cancelledSubs = users.reduce((sum, u) => sum + u.subscriptions.filter((s) => s.status === 'cancelled').length, 0)

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      <div>
        <p className="text-[11px] font-medium text-[var(--c-text-subtle)] tracking-wider uppercase mb-1">
          Admin
        </p>
        <h1 className="text-[20px] font-semibold text-[var(--c-text-primary)] tracking-[-0.3px]">
          Användaröversikt
        </h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Användare" value={String(users.length)} />
        <MetricCard label="Abonnemang" value={String(totalSubs)} />
        <MetricCard label="Aktiva" value={String(activeSubs)} accent />
        <MetricCard label="Avslutade" value={String(cancelledSubs + pausedSubs)} />
      </div>

      {/* Users table */}
      <div className="bg-[var(--c-bg-card)] rounded-[12px] border border-[var(--c-border)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--c-border)]">
          <p className="text-[11px] font-medium text-[var(--c-text-subtle)] tracking-wider uppercase">
            Användare ({users.length})
          </p>
        </div>

        {isLoading ? (
          <p role="status" className="px-4 py-6 text-[13px] text-[var(--c-text-muted)]">Laddar…</p>
        ) : users.length === 0 ? (
          <p className="px-4 py-6 text-[13px] text-[var(--c-text-muted)]">
            Inga användare hittades — kontrollera att RLS-policies är tillagda i Supabase.
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--c-border)]">
                    <Th>Användare</Th>
                    <Th>Registrerad</Th>
                    <Th align="right">Aktiva</Th>
                    <Th align="right">Avslutade</Th>
                    <Th>Senast aktiv</Th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <DesktopRow key={u.id} user={u} isMe={u.id === ADMIN_ID} isLast={i === users.length - 1} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="md:hidden">
              {users.map((u, i) => (
                <MobileRow key={u.id} user={u} isMe={u.id === ADMIN_ID} isLast={i === users.length - 1} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function DesktopRow({ user: u, isMe, isLast }: { user: AdminUser; isMe: boolean; isLast: boolean }) {
  const active = u.subscriptions.filter((s) => s.status === 'active').length
  const cancelled = u.subscriptions.filter((s) => s.status !== 'active').length
  const lastActive = getLastActive(u)

  return (
    <tr className={`${!isLast ? 'border-b border-[var(--c-border)]' : ''}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar name={u.full_name ?? u.email} avatarUrl={u.avatar_url} />
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[var(--c-text-primary)] truncate">
              {u.full_name ?? '—'}
              {isMe && <span className="ml-1.5 text-[10px] bg-[var(--c-accent-subtle)] text-[var(--c-accent)] px-1.5 py-0.5 rounded font-medium">du</span>}
            </p>
            <p className="text-[11px] text-[var(--c-text-muted)] truncate">{u.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-[12px] text-[var(--c-text-muted)] whitespace-nowrap">
        {formatDate(u.created_at)}
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-[13px] font-semibold text-[var(--c-success-text)]">{active}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-[13px] text-[var(--c-text-muted)]">{cancelled}</span>
      </td>
      <td className="px-4 py-3 text-[12px] text-[var(--c-text-muted)] whitespace-nowrap">
        {lastActive}
      </td>
    </tr>
  )
}

function MobileRow({ user: u, isMe, isLast }: { user: AdminUser; isMe: boolean; isLast: boolean }) {
  const active = u.subscriptions.filter((s) => s.status === 'active').length
  const total = u.subscriptions.length

  return (
    <div className={`px-4 py-3 flex items-center gap-3 ${!isLast ? 'border-b border-[var(--c-border)]' : ''}`}>
      <UserAvatar name={u.full_name ?? u.email} avatarUrl={u.avatar_url} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[var(--c-text-primary)] truncate">
          {u.full_name ?? u.email}
          {isMe && <span className="ml-1.5 text-[10px] bg-[var(--c-accent-subtle)] text-[var(--c-accent)] px-1.5 py-0.5 rounded font-medium">du</span>}
        </p>
        <p className="text-[11px] text-[var(--c-text-muted)]">{formatDate(u.created_at)}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[13px] font-semibold text-[var(--c-text-primary)]">{active} aktiva</p>
        <p className="text-[11px] text-[var(--c-text-muted)]">{total} totalt</p>
      </div>
    </div>
  )
}

// ── Small components ──────────────────────────────────────────

function UserAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const initials = name.trim().slice(0, 2).toUpperCase()
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full object-cover shrink-0" />
  }
  return (
    <div className="w-8 h-8 rounded-full bg-[var(--c-accent-subtle)] flex items-center justify-center shrink-0">
      <span className="text-[11px] font-semibold text-[var(--c-accent)]">{initials}</span>
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

function Th({ children, align }: { children: string; align?: 'right' }) {
  return (
    <th scope="col" className={`px-4 py-2.5 text-[11px] font-medium text-[var(--c-text-subtle)] tracking-wider uppercase text-left ${align === 'right' ? 'text-right' : ''}`}>
      {children}
    </th>
  )
}

// ── Helpers ───────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

function getLastActive(u: AdminUser): string {
  if (u.subscriptions.length === 0) return '—'
  const latest = u.subscriptions.reduce((max, s) =>
    new Date(s.updated_at) > new Date(max.updated_at) ? s : max
  )
  return formatDate(latest.updated_at)
}

import type { ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'

interface TopBarProps {
  action?: ReactNode
}

export default function TopBar({ action }: TopBarProps) {
  const { user } = useAuth()
  return (
    <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center px-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <SubtrackIcon />
        <span className="text-[15px] font-semibold text-[#111827] tracking-[-0.3px]">
          Subtrack
        </span>
      </div>

      {/* Right side: desktop shows user + action, mobile shows notification dot */}
      <div className="ml-auto flex items-center gap-3">
        {/* Notification dot (mobile only) */}
        <div className="md:hidden w-2 h-2 rounded-full bg-[#1B4FD8]" />

        {/* Desktop: avatar + name */}
        <div className="hidden md:flex items-center gap-2">
          <Avatar user={user} size={28} />
          <span className="text-[13px] text-[#6B7280]">
            {user?.user_metadata?.full_name ?? user?.email ?? ''}
          </span>
        </div>

        {/* Page action (e.g. "+ Lägg till" on dashboard) */}
        {action && <div className="hidden md:block">{action}</div>}
      </div>
    </header>
  )
}

function Avatar({ user, size }: { user: ReturnType<typeof useAuth>['user']; size: number }) {
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const name = user?.user_metadata?.full_name ?? user?.email ?? '?'
  const initial = name.charAt(0).toUpperCase()

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: size * 0.45 }} className="font-semibold text-[#1B4FD8] leading-none">
        {initial}
      </span>
    </div>
  )
}

function SubtrackIcon() {
  return (
    <div className="w-8 h-8 bg-[#1B4FD8] rounded-[8px] flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        {/* Dollar S-curve */}
        <path
          d="M11.5 3.5C11.5 1.5 4.5 1.5 4.5 5C4.5 8 11.5 7.5 11.5 10.5C11.5 13.5 4.5 13.5 4.5 11.5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        {/* Vertical bar — extends below into pencil tip */}
        <line x1="8" y1="0.5" x2="8" y2="11.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        {/* Pencil nib at bottom */}
        <path d="M6.2 11.5 L8 14.8 L9.8 11.5Z" fill="white" />
      </svg>
    </div>
  )
}

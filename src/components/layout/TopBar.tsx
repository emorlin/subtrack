import type { ReactNode } from 'react'

interface TopBarProps {
  action?: ReactNode
}

export default function TopBar({ action }: TopBarProps) {
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

        {/* Desktop: user name */}
        <span className="hidden md:block text-[13px] text-[#6B7280]">
          Erik Morlin
        </span>

        {/* Page action (e.g. "+ Lägg till" on dashboard) */}
        {action && <div className="hidden md:block">{action}</div>}
      </div>
    </header>
  )
}

function SubtrackIcon() {
  return (
    <div className="w-8 h-8 bg-[#1B4FD8] rounded-[8px] flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="10" height="2" rx="1" fill="white" />
        <rect x="3" y="7" width="7" height="2" rx="1" fill="white" />
        <rect x="3" y="10" width="5" height="2" rx="1" fill="white" />
      </svg>
    </div>
  )
}

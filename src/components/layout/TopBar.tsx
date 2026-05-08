import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useDemoContext } from '../../contexts/DemoContext'
import { Wallet } from 'lucide-react'

interface TopBarProps {
  action?: ReactNode
}

export default function TopBar({ action }: TopBarProps) {
  const { user } = useAuth()
  const { isDemoMode, exitDemo } = useDemoContext()

  return (
    <header
      className="bg-white border-b border-[#E5E7EB] shrink-0"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="h-14 flex items-center px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <SubtrackIcon />
          <span className="text-[15px] font-semibold text-[#111827] tracking-[-0.3px]">
            Subtrack
          </span>
        </Link>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {isDemoMode ? (
            <>
              <div className="hidden md:flex items-center gap-2">
                <DemoAvatar size={28} />
                <span className="text-[13px] text-[#6B7280]">Alex Svensson</span>
              </div>
              <span className="hidden md:inline text-[11px] font-medium text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 rounded-[4px]">
                Demo
              </span>
              <button
                type="button"
                onClick={exitDemo}
                className="bg-[#1B4FD8] text-white rounded-[6px] px-3 py-1.5 text-[12px] font-medium transition-all duration-150 ease-out hover:bg-[#1a46c2]"
              >
                Logga in
              </button>
            </>
          ) : (
            <>
              {/* Avatar + name */}
              <div className="flex items-center gap-2">
                <Avatar user={user} size={28} />
                <span className="text-[13px] text-[#6B7280]">
                  {user?.user_metadata?.full_name ?? user?.email ?? ''}
                </span>
              </div>

              {/* Page action (e.g. "+ Lägg till") */}
              {action && <div className="hidden md:block">{action}</div>}
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function Avatar({ user, size }: { user: ReturnType<typeof useAuth>['user']; size: number }) {
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const name = user?.user_metadata?.full_name ?? user?.email ?? '?'
  const initial = name.charAt(0).toUpperCase()
  const [imgFailed, setImgFailed] = useState(false)

  if (avatarUrl && !imgFailed) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
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

function DemoAvatar({ size }: { size: number }) {
  return (
    <div
      className="rounded-full bg-[#E0E7FF] flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: size * 0.45 }} className="font-semibold text-[#4338CA] leading-none">
        A
      </span>
    </div>
  )
}

function SubtrackIcon() {
  return (
    <div className="w-8 h-8 bg-[#1B4FD8] rounded-[8px] flex items-center justify-center shrink-0">
      <Wallet size={18} color="white" strokeWidth={2} aria-hidden="true" />
    </div>
  )
}

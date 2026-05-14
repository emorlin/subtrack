import { NavLink } from 'react-router-dom'
import { IconHome, IconCost, IconBell, IconSettings, IconAbout } from './NavIcons'
import { useNotificationCount } from '../../hooks/useNotifications'

const navItems = [
  { label: 'Översikt', to: '/', icon: IconHome },
  { label: 'Kostnad', to: '/cost', icon: IconCost },
  { label: 'Notiser', to: '/notifications', icon: IconBell },
  { label: 'Inställn.', to: '/settings', icon: IconSettings },
  { label: 'Om appen', to: '/about', icon: IconAbout },
]

export default function BottomNav() {
  const notifCount = useNotificationCount()

  return (
    <nav aria-label="Huvudnavigation" className="bg-[var(--c-bg-card)] border-t border-[var(--c-border)] flex" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {navItems.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all duration-150 ease-out"
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Icon active={isActive} />
                {label === 'Notiser' && notifCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-[#B91C1C] text-white text-[9px] font-semibold rounded-full min-w-[14px] h-3.5 px-0.5 flex items-center justify-center leading-none">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? 'text-[var(--c-accent)]' : 'text-[var(--c-text-subtle)]'
                }`}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

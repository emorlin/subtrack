import { NavLink } from 'react-router-dom'
import { IconHome, IconCost, IconBell, IconSettings } from './NavIcons'

const navItems = [
  { label: 'Översikt', to: '/', icon: IconHome },
  { label: 'Kostnad', to: '/cost', icon: IconCost },
  { label: 'Notiser', to: '/notifications', icon: IconBell },
  { label: 'Inställn.', to: '/settings', icon: IconSettings },
]

export default function BottomNav() {
  return (
    <nav className="bg-white border-t border-[#E5E7EB] flex" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {navItems.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all duration-150 ease-out"
        >
          {({ isActive }) => (
            <>
              <Icon active={isActive} />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? 'text-[#1B4FD8]' : 'text-[#9CA3AF]'
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

import { NavLink } from 'react-router-dom'
import { IconHome, IconCost, IconBell, IconSettings, IconAbout } from './NavIcons'

const navItems = [
  { label: 'Översikt', to: '/', icon: IconHome },
  { label: 'Kostnad', to: '/cost', icon: IconCost },
  { label: 'Notiser', to: '/notifications', icon: IconBell },
  { label: 'Inställningar', to: '/settings', icon: IconSettings },
  { label: 'Om appen', to: '/about', icon: IconAbout },
]

export default function Sidebar() {
  return (
    <nav className="pt-2">
      {navItems.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            isActive
              ? 'flex items-center gap-2.5 px-4 py-2 text-[12px] font-medium text-[var(--c-accent)] bg-[var(--c-accent-subtle)] border-r-2 border-[var(--c-accent)] transition-all duration-150 ease-out'
              : 'flex items-center gap-2.5 px-4 py-2 text-[12px] text-[var(--c-text-muted)] hover:bg-[var(--c-bg-app)] transition-all duration-150 ease-out'
          }
        >
          {({ isActive }) => (
            <>
              <Icon active={isActive} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

import { NavLink } from 'react-router-dom'
import { IconHome, IconCost, IconBell, IconSettings, IconAbout, IconAdmin } from './NavIcons'
import { useIsAdmin } from '../../hooks/useAdmin'

const navItems = [
  { label: 'Översikt', to: '/', icon: IconHome },
  { label: 'Kostnad', to: '/cost', icon: IconCost },
  { label: 'Notiser', to: '/notifications', icon: IconBell },
  { label: 'Inställningar', to: '/settings', icon: IconSettings },
  { label: 'Om appen', to: '/about', icon: IconAbout },
]

const linkClass = (isActive: boolean) =>
  isActive
    ? 'flex items-center gap-2.5 px-4 py-2 text-[12px] font-medium text-[var(--c-accent)] bg-[var(--c-accent-subtle)] border-r-2 border-[var(--c-accent)] transition-all duration-150 ease-out'
    : 'flex items-center gap-2.5 px-4 py-2 text-[12px] text-[var(--c-text-muted)] hover:bg-[var(--c-bg-app)] transition-all duration-150 ease-out'

export default function Sidebar() {
  const isAdmin = useIsAdmin()

  return (
    <nav aria-label="Huvudnavigation" className="pt-2 flex flex-col h-full">
      <div className="flex-1">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => linkClass(isActive)}>
            {({ isActive }) => (
              <>
                <Icon active={isActive} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {isAdmin && (
        <div className="pb-2 border-t border-[var(--c-border)] pt-2">
          <NavLink to="/admin" className={({ isActive }) => linkClass(isActive)}>
            {({ isActive }) => (
              <>
                <IconAdmin active={isActive} />
                Admin
              </>
            )}
          </NavLink>
        </div>
      )}
    </nav>
  )
}

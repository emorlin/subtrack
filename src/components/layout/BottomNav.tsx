import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Hem', to: '/', icon: IconHome },
  { label: 'Kostnad', to: '/cost', icon: IconCost },
  { label: 'Notiser', to: '/notifications', icon: IconBell },
  { label: 'Inställn.', to: '/settings', icon: IconSettings },
]

export default function BottomNav() {
  return (
    <nav className="bg-white border-t border-[#E5E7EB] flex">
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

function IconHome({ active }: { active: boolean }) {
  const color = active ? '#1B4FD8' : '#D1D5DB'
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3 9.5L10 3l7 6.5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"
        fill={color}
      />
      <rect x="7.5" y="11" width="5" height="7" rx="0.5" fill="white" />
    </svg>
  )
}

function IconCost({ active }: { active: boolean }) {
  const color = active ? '#1B4FD8' : '#D1D5DB'
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="12" width="3" height="5" rx="1" fill={color} />
      <rect x="8.5" y="8" width="3" height="9" rx="1" fill={color} />
      <rect x="14" y="5" width="3" height="12" rx="1" fill={color} />
    </svg>
  )
}

function IconBell({ active }: { active: boolean }) {
  const color = active ? '#1B4FD8' : '#D1D5DB'
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2a6 6 0 0 0-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 0 0-6-6z"
        fill={color}
      />
      <path d="M8 16a2 2 0 0 0 4 0" fill={color} />
    </svg>
  )
}

function IconSettings({ active }: { active: boolean }) {
  const color = active ? '#1B4FD8' : '#D1D5DB'
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="3" fill={color} />
      <path
        d="M10 1v2M10 17v2M1 10h2M17 10h2M3.22 3.22l1.42 1.42M15.36 15.36l1.42 1.42M3.22 16.78l1.42-1.42M15.36 4.64l1.42-1.42"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

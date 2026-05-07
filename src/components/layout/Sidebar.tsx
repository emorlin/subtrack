import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Översikt', to: '/' },
  { label: 'Kostnad', to: '/cost' },
  { label: 'Notiser', to: '/notifications' },
  { label: 'Inställningar', to: '/settings' },
]

export default function Sidebar() {
  return (
    <nav className="pt-2">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            isActive
              ? 'flex items-center gap-2.5 px-4 py-2 text-[12px] font-medium text-[#1B4FD8] bg-[#EFF6FF] border-r-2 border-[#1B4FD8] transition-all duration-150 ease-out'
              : 'flex items-center gap-2.5 px-4 py-2 text-[12px] text-[#6B7280] hover:bg-[#F9FAFB] transition-all duration-150 ease-out'
          }
        >
          {({ isActive }) => (
            <>
              <NavSquare active={isActive} />
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function NavSquare({ active }: { active: boolean }) {
  return (
    <span
      className="inline-block shrink-0"
      style={{
        width: 8,
        height: 8,
        backgroundColor: active ? '#1B4FD8' : '#D1D5DB',
      }}
    />
  )
}

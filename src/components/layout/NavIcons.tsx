import { LayoutDashboard, TrendingUp, Bell, Settings } from 'lucide-react'

type IconProps = { active: boolean }

export function IconHome({ active }: IconProps) {
  return <LayoutDashboard size={20} color={active ? '#1B4FD8' : '#6B7280'} strokeWidth={2} />
}

export function IconCost({ active }: IconProps) {
  return <TrendingUp size={20} color={active ? '#1B4FD8' : '#6B7280'} strokeWidth={2} />
}

export function IconBell({ active }: IconProps) {
  return <Bell size={20} color={active ? '#1B4FD8' : '#6B7280'} strokeWidth={2} />
}

export function IconSettings({ active }: IconProps) {
  return <Settings size={20} color={active ? '#1B4FD8' : '#6B7280'} strokeWidth={2} />
}

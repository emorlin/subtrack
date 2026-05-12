import { LayoutDashboard, TrendingUp, Bell, Settings, Info } from 'lucide-react'

type IconProps = { active: boolean }

export function IconHome({ active }: IconProps) {
  return <LayoutDashboard size={20} color={active ? 'var(--c-accent)' : 'var(--c-text-muted)'} strokeWidth={2} />
}

export function IconCost({ active }: IconProps) {
  return <TrendingUp size={20} color={active ? 'var(--c-accent)' : 'var(--c-text-muted)'} strokeWidth={2} />
}

export function IconBell({ active }: IconProps) {
  return <Bell size={20} color={active ? 'var(--c-accent)' : 'var(--c-text-muted)'} strokeWidth={2} />
}

export function IconSettings({ active }: IconProps) {
  return <Settings size={20} color={active ? 'var(--c-accent)' : 'var(--c-text-muted)'} strokeWidth={2} />
}

export function IconAbout({ active }: IconProps) {
  return <Info size={20} color={active ? 'var(--c-accent)' : 'var(--c-text-muted)'} strokeWidth={2} />
}

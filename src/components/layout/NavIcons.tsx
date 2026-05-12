import { LayoutDashboard, TrendingUp, Bell, Settings, Info, ShieldCheck } from 'lucide-react'

type IconProps = { active: boolean }

export function IconHome({ active }: IconProps) {
  return <LayoutDashboard aria-hidden="true" size={20} color={active ? 'var(--c-accent)' : 'var(--c-text-muted)'} strokeWidth={2} />
}

export function IconCost({ active }: IconProps) {
  return <TrendingUp aria-hidden="true" size={20} color={active ? 'var(--c-accent)' : 'var(--c-text-muted)'} strokeWidth={2} />
}

export function IconBell({ active }: IconProps) {
  return <Bell aria-hidden="true" size={20} color={active ? 'var(--c-accent)' : 'var(--c-text-muted)'} strokeWidth={2} />
}

export function IconSettings({ active }: IconProps) {
  return <Settings aria-hidden="true" size={20} color={active ? 'var(--c-accent)' : 'var(--c-text-muted)'} strokeWidth={2} />
}

export function IconAbout({ active }: IconProps) {
  return <Info aria-hidden="true" size={20} color={active ? 'var(--c-accent)' : 'var(--c-text-muted)'} strokeWidth={2} />
}

export function IconAdmin({ active }: IconProps) {
  return <ShieldCheck aria-hidden="true" size={20} color={active ? 'var(--c-accent)' : 'var(--c-text-muted)'} strokeWidth={2} />
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function daysUntil(date: string | Date): number {
  const target = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}

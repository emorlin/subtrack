import type { Subscription } from '../types'
import { getEffectiveCurrentAmount, toMonthlyAmount, getNextRenewalDate, getLastRenewalDate } from './calculations'

function esc(value: string): string {
  if (value.includes(';') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function intervalLabel(interval: string, count: number): string {
  if (interval === 'month' && count === 1) return 'Månadsvis'
  if (interval === 'month' && count === 3) return 'Kvartalsvis'
  if (interval === 'year' && count === 1) return 'Årsvis'
  return `Var ${count} ${interval === 'month' ? 'mån' : 'år'}`
}

function statusLabel(status: string): string {
  if (status === 'active') return 'Aktiv'
  if (status === 'paused') return 'Pausad'
  return 'Avslutad'
}

export function exportSubscriptionsToCSV(subscriptions: Subscription[]): void {
  const SEP = ';'
  const headers = ['Tjänst', 'Kategori', 'Belopp', 'Valuta', 'Intervall', 'Kr/mån', 'Status', 'Startdatum', 'Nästa förnyelse', 'Anteckningar']

  const rows = subscriptions.map((sub) => {
    const amount = getEffectiveCurrentAmount(sub)
    const monthly = Math.round(toMonthlyAmount(amount, sub.interval, sub.interval_count))
    const isCancelled = sub.status === 'cancelled'
    const renewal = isCancelled
      ? getLastRenewalDate(sub.start_date, sub.interval, sub.interval_count)
      : getNextRenewalDate(sub.start_date, sub.interval, sub.interval_count)

    return [
      esc(sub.name),
      esc(sub.category?.name ?? ''),
      amount.toString(),
      sub.currency,
      esc(intervalLabel(sub.interval, sub.interval_count)),
      monthly.toString(),
      statusLabel(sub.status),
      sub.start_date,
      renewal.toISOString().split('T')[0],
      esc(sub.notes ?? ''),
    ].join(SEP)
  })

  // BOM ensures Swedish characters (å ä ö) render correctly when opening in Excel
  const csv = '﻿' + [headers.join(SEP), ...rows].join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `subtrack-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

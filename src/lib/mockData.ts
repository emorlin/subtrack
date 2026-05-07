import type { Category, Subscription } from '../types'

export const mockCategories: Category[] = [
  { id: 'cat-1', user_id: 'mock', name: 'Underhållning', color_hex: '#7C3AED', sort_order: 0, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-2', user_id: 'mock', name: 'Verktyg',       color_hex: '#1B4FD8', sort_order: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-3', user_id: 'mock', name: 'Lagring',       color_hex: '#059669', sort_order: 2, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-4', user_id: 'mock', name: 'Nyheter',       color_hex: '#D97706', sort_order: 3, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-5', user_id: 'mock', name: 'Hälsa',         color_hex: '#059669', sort_order: 4, created_at: '2026-01-01T00:00:00Z' },
]

export const mockSubscriptions: Subscription[] = [
  {
    id: 'sub-1', user_id: 'mock', category_id: 'cat-1',
    name: 'Spotify', amount: 119, currency: 'SEK',
    interval: 'month', interval_count: 1,
    start_date: '2022-05-12', end_date: null, legacy_amount_paid: null,
    status: 'active', notes: null, reminder_days_before: 3,
    created_at: '2022-05-12T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    category: mockCategories[0],
  },
  {
    id: 'sub-2', user_id: 'mock', category_id: 'cat-1',
    name: 'Netflix', amount: 149, currency: 'SEK',
    interval: 'month', interval_count: 1,
    start_date: '2022-09-12', end_date: null, legacy_amount_paid: null,
    status: 'active', notes: 'Family-plan. Delas med 4 personer. Kan sägas upp löpande.', reminder_days_before: 3,
    created_at: '2022-09-12T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    category: mockCategories[0],
  },
  {
    id: 'sub-3', user_id: 'mock', category_id: 'cat-3',
    name: 'iCloud', amount: 129, currency: 'SEK',
    interval: 'month', interval_count: 1,
    start_date: '2023-04-20', end_date: null, legacy_amount_paid: null,
    status: 'active', notes: null, reminder_days_before: 3,
    created_at: '2023-04-20T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    category: mockCategories[2],
  },
  {
    id: 'sub-4', user_id: 'mock', category_id: 'cat-2',
    name: 'Todoist', amount: 39, currency: 'SEK',
    interval: 'month', interval_count: 1,
    start_date: '2024-04-15', end_date: null, legacy_amount_paid: null,
    status: 'active', notes: null, reminder_days_before: 3,
    created_at: '2024-04-15T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    category: mockCategories[1],
  },
  {
    id: 'sub-5', user_id: 'mock', category_id: 'cat-2',
    name: 'Claude Code', amount: 249, currency: 'SEK',
    interval: 'month', interval_count: 1,
    start_date: '2025-06-03', end_date: null, legacy_amount_paid: null,
    status: 'active', notes: null, reminder_days_before: 3,
    created_at: '2025-06-03T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    category: mockCategories[1],
  },
  {
    id: 'sub-6', user_id: 'mock', category_id: 'cat-4',
    name: 'DN', amount: 99, currency: 'SEK',
    interval: 'month', interval_count: 1,
    start_date: '2024-06-01', end_date: null, legacy_amount_paid: null,
    status: 'active', notes: null, reminder_days_before: 3,
    created_at: '2024-06-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    category: mockCategories[3],
  },
]

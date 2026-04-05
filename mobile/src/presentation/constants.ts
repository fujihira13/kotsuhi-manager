import { CategoryValue } from '@/src/domain/shared/value-objects/category.vo'

export type TripTypeValue = 'one-way' | 'round-trip'
export const TRIP_TYPE_LABELS: Record<TripTypeValue, string> = {
  'one-way': '片道',
  'round-trip': '往復',
}
import {
  SubcategoryValue,
  TransportationSubcategoryValue,
  EntertainmentSubcategoryValue,
} from '@/src/domain/shared/value-objects/subcategory.vo'

export const CATEGORY_LABELS: Record<CategoryValue, string> = {
  transportation: '交通費',
  entertainment: '交際費',
}

export const SUBCATEGORY_LABELS: Record<SubcategoryValue, string> = {
  train: '電車',
  bus: 'バス',
  taxi: 'タクシー',
  parking: '駐車場',
  meal: '食事',
  cafe: 'カフェ',
  drink: '飲み',
  gift: 'ギフト',
  entertainment: '娯楽',
  other: 'その他',
}

export const TRANSPORTATION_SUBCATEGORIES: TransportationSubcategoryValue[] = [
  'train',
  'bus',
  'taxi',
  'parking',
  'other',
]

export const ENTERTAINMENT_SUBCATEGORIES: EntertainmentSubcategoryValue[] = [
  'meal',
  'cafe',
  'drink',
  'gift',
  'entertainment',
  'other',
]

export function formatMonth(month: string): string {
  const [year, m] = month.split('-')
  return `${year}年${parseInt(m)}月`
}

export function formatAmount(amount: number): string {
  return `¥${amount.toLocaleString()}`
}

export function toLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayString(): string {
  return toLocalDateString(new Date())
}

export function currentMonthString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function prevMonth(month: string): string {
  const [year, m] = month.split('-').map(Number)
  const d = new Date(year, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function nextMonth(month: string): string {
  const [year, m] = month.split('-').map(Number)
  const d = new Date(year, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function formatDateShort(date: string): string {
  const [, m, d] = date.split('-')
  return `${parseInt(m)}/${parseInt(d)}`
}

export function formatDateLong(date: string): string {
  const [y, m, d] = date.split('-')
  return `${y}年${parseInt(m)}月${parseInt(d)}日`
}

export function formatDateMD(date: string): string {
  const [, m, d] = date.split('-')
  return `${parseInt(m)}月${parseInt(d)}日`
}

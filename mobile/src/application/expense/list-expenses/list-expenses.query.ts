import { CategoryValue } from '@/src/domain/shared/value-objects/category.vo'

export interface ListExpensesQuery {
  /** YYYY-MM 形式。未指定の場合は全件取得 */
  month?: string
  category?: CategoryValue
}

export interface ExpenseListItem {
  id: string
  date: string
  amount: number
  category: CategoryValue
  subcategory: string
  memo: string | null
  satisfaction: number | null
}

export type ListExpensesResult = ExpenseListItem[]

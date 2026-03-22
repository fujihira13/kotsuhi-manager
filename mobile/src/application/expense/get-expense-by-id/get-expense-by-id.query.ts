import { CategoryValue } from '@/src/domain/shared/value-objects/category.vo'

export interface GetExpenseByIdQuery {
  id: string
}

export interface ExpenseDetail {
  id: string
  date: string
  amount: number
  category: CategoryValue
  subcategory: string
  memo: string | null
  satisfaction: number | null
  createdAt: string
  updatedAt: string
}

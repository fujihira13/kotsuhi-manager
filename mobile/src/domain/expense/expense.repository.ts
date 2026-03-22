import { CategoryValue } from '../shared/value-objects/category.vo'
import { ExpenseEntity } from './expense.entity'
import { ExpenseId } from './value-objects/expense-id.vo'

export interface ListExpensesFilter {
  /** YYYY-MM 形式。指定した月の支出のみ取得する */
  month?: string
  category?: CategoryValue
}

export interface ExpenseRepository {
  save(expense: ExpenseEntity): Promise<void>
  findById(id: ExpenseId): Promise<ExpenseEntity | null>
  /** 日付降順・同日内は createdAt 降順で返す */
  findAll(filter?: ListExpensesFilter): Promise<ExpenseEntity[]>
  /** 集計・頻出金額算出用：期間指定で取得する */
  findByDateRange(from: string, to: string): Promise<ExpenseEntity[]>
  update(expense: ExpenseEntity): Promise<void>
  delete(id: ExpenseId): Promise<void>
  deleteAll(): Promise<void>
}

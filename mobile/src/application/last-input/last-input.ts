import { CategoryValue } from '@/src/domain/shared/value-objects/category.vo'
import { SubcategoryValue } from '@/src/domain/shared/value-objects/subcategory.vo'

/**
 * 前回入力値（ドメインではなくアプリケーション層の関心事）
 * ExpenseCreated ドメインイベントを受けてアプリケーション層が更新する
 */
export interface LastInput {
  category: CategoryValue | null
  subcategory: SubcategoryValue | null
  memo: string | null
  amount: number | null
}

export interface LastInputRepository {
  get(): Promise<LastInput>
  save(lastInput: LastInput): Promise<void>
  clear(): Promise<void>
}

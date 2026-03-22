import { CategoryValue } from '@/src/domain/shared/value-objects/category.vo'
import { SubcategoryValue } from '@/src/domain/shared/value-objects/subcategory.vo'

/** プリセット期間 */
export type SummaryPeriod = 'this_month' | 'last_month' | 'last_3_months'

export interface GetSummaryQuery {
  period: SummaryPeriod
}

export interface SubcategoryBreakdown {
  subcategory: SubcategoryValue
  total: number
  /** 構成比 0.0〜1.0 */
  share: number
}

export interface CategoryBreakdown {
  category: CategoryValue
  total: number
  /** 構成比 0.0〜1.0 */
  share: number
  subcategories: SubcategoryBreakdown[]
}

export interface SatisfactionStats {
  /** 満足度の平均。データなしの場合 null */
  average: number | null
  distribution: { value: number; count: number }[]
}

export interface SummaryResult {
  period: { from: string; to: string } // YYYY-MM-DD
  totalAmount: number
  breakdown: CategoryBreakdown[]
  satisfactionStats: SatisfactionStats
}

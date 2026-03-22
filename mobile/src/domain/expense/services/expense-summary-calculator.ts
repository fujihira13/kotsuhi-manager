import { CategoryValue } from '../../shared/value-objects/category.vo'
import { SubcategoryValue } from '../../shared/value-objects/subcategory.vo'
import { ExpenseEntity } from '../expense.entity'

export interface SubcategoryBreakdown {
  subcategory: SubcategoryValue
  total: number
  /** 区分内での構成比 0.0〜1.0 */
  share: number
}

export interface CategoryBreakdown {
  category: CategoryValue
  total: number
  /** 全体での構成比 0.0〜1.0 */
  share: number
  subcategories: SubcategoryBreakdown[]
}

export interface SatisfactionStats {
  /** 満足度の平均。満足度入力データがない場合は null */
  average: number | null
  distribution: { value: number; count: number }[]
}

export interface ExpenseSummaryResult {
  period: { from: string; to: string }
  totalAmount: number
  breakdown: CategoryBreakdown[]
  satisfactionStats: SatisfactionStats
}

/**
 * ドメインサービス: 支出集計計算
 * 複数の Expense を横断する集計ロジックのため単一 Entity に属さない
 */
export class ExpenseSummaryCalculator {
  /**
   * 支出一覧を集計する
   * @param expenses 集計対象（期間フィルタは呼び出し元で適用済みであること）
   * @param from 集計期間の開始日（YYYY-MM-DD）
   * @param to 集計期間の終了日（YYYY-MM-DD）
   */
  calculate(expenses: ExpenseEntity[], from: string, to: string): ExpenseSummaryResult {
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount.value, 0)

    // 区分別・サブ区分別集計
    const categoryMap = new Map<
      CategoryValue,
      { total: number; subcategories: Map<SubcategoryValue, number> }
    >()

    for (const expense of expenses) {
      const cat = expense.category.value
      const sub = expense.subcategory.value as SubcategoryValue

      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, { total: 0, subcategories: new Map() })
      }
      const catData = categoryMap.get(cat)!
      catData.total += expense.amount.value
      catData.subcategories.set(sub, (catData.subcategories.get(sub) ?? 0) + expense.amount.value)
    }

    const breakdown: CategoryBreakdown[] = Array.from(categoryMap.entries()).map(
      ([category, data]) => ({
        category,
        total: data.total,
        share: totalAmount > 0 ? data.total / totalAmount : 0,
        subcategories: Array.from(data.subcategories.entries()).map(([subcategory, total]) => ({
          subcategory,
          total,
          share: data.total > 0 ? total / data.total : 0,
        })),
      }),
    )

    // 満足度統計
    const satisfiedExpenses = expenses.filter((e) => e.satisfaction !== null)
    const average =
      satisfiedExpenses.length > 0
        ? satisfiedExpenses.reduce((sum, e) => sum + e.satisfaction!.value, 0) /
          satisfiedExpenses.length
        : null

    const distributionMap = new Map<number, number>()
    for (const expense of satisfiedExpenses) {
      const val = expense.satisfaction!.value
      distributionMap.set(val, (distributionMap.get(val) ?? 0) + 1)
    }
    const distribution = Array.from(distributionMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([value, count]) => ({ value, count }))

    return {
      period: { from, to },
      totalAmount,
      breakdown,
      satisfactionStats: { average, distribution },
    }
  }
}

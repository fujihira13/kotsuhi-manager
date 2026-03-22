import { ExpenseEntity } from '../expense.entity'

export interface FrequentAmountResult {
  amount: number
  count: number
}

/**
 * ドメインサービス: 頻出金額計算
 * 複数の Expense を横断するロジックのため単一 Entity に属さない
 */
export class FrequentAmountCalculator {
  /**
   * 支出一覧から頻出金額を算出する
   * @param expenses 集計対象の支出一覧（期間フィルタは呼び出し元で適用済みであること）
   * @param limit 取得件数上限
   * @returns 金額の出現頻度降順・同頻度の場合は金額昇順
   */
  calculate(expenses: ExpenseEntity[], limit: number): FrequentAmountResult[] {
    const countMap = new Map<number, number>()
    for (const expense of expenses) {
      const amount = expense.amount.value
      countMap.set(amount, (countMap.get(amount) ?? 0) + 1)
    }
    return Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1] || a[0] - b[0]) // 頻度降順、同頻度は金額昇順
      .slice(0, limit)
      .map(([amount, count]) => ({ amount, count }))
  }
}

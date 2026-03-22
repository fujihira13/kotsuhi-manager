/** 直近 windowDays 日の支出から頻出金額上位 limit 件を返す */
export interface GetFrequentAmountsQuery {
  /** 対象期間（日数）。要件定義デフォルト: 90 */
  windowDays: number
  /** 取得件数上限。要件定義デフォルト: 5 */
  limit: number
}

export interface FrequentAmountItem {
  amount: number
  count: number
}

export type GetFrequentAmountsResult = FrequentAmountItem[]

export interface ExportExpensesQuery {
  /** YYYY-MM 形式。指定した月のみエクスポート。未指定で全期間 */
  month?: string
}

export interface ExportExpensesResult {
  /** 生成された一時ファイルの URI */
  fileUri: string
  /** ファイル名（例: expenses-2026-03.csv または expenses-all.csv） */
  fileName: string
}

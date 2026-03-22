export interface CreateExpenseCommand {
  date: string // YYYY-MM-DD
  amount: number
  category: string
  subcategory: string
  memo?: string | null
  satisfaction?: number | null
}

export interface CreateExpenseResult {
  id: string
}

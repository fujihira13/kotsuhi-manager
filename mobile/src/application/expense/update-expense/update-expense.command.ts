export interface UpdateExpenseCommand {
  id: string
  date?: string
  amount?: number
  category?: string
  subcategory?: string
  memo?: string | null
  satisfaction?: number | null
}

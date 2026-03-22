export interface UpdateTemplateCommand {
  id: string
  name?: string
  category?: string
  subcategory?: string
  amount?: number | null
  memoTemplate?: string | null
}

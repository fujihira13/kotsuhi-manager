export interface CreateTemplateCommand {
  name: string
  category: string
  subcategory: string
  amount?: number | null
  memoTemplate?: string | null
}

export interface CreateTemplateResult {
  id: string
}

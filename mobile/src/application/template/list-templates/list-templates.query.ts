import { CategoryValue } from '@/src/domain/shared/value-objects/category.vo'

export interface TemplateListItem {
  id: string
  name: string
  category: CategoryValue
  subcategory: string
  amount: number | null
  memoTemplate: string | null
  sortOrder: number
}

export type ListTemplatesResult = TemplateListItem[]

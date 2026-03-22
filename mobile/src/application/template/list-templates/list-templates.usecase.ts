import { TemplateRepository } from '@/src/domain/template/template.repository'
import { ListTemplatesResult, TemplateListItem } from './list-templates.query'

export class ListTemplatesUseCase {
  constructor(private readonly templateRepository: TemplateRepository) {}

  async execute(): Promise<ListTemplatesResult> {
    const templates = await this.templateRepository.findAll()

    return templates.map(
      (template): TemplateListItem => ({
        id: template.id.toString(),
        name: template.name,
        category: template.category.value,
        subcategory: template.subcategory.value,
        amount: template.amount?.value ?? null,
        memoTemplate: template.memoTemplate,
        sortOrder: template.sortOrder.value,
      }),
    )
  }
}

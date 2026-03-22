import { TemplateRepository } from '@/src/domain/template/template.repository'
import { TemplateId } from '@/src/domain/template/value-objects/template-id.vo'
import { ReorderTemplatesCommand } from './reorder-templates.command'

export class ReorderTemplatesUseCase {
  constructor(private readonly templateRepository: TemplateRepository) {}

  async execute(command: ReorderTemplatesCommand): Promise<void> {
    const orders = command.orderedIds.map((id, index) => ({
      id: TemplateId.create(id),
      sortOrder: index,
    }))

    await this.templateRepository.updateSortOrders(orders)
  }
}

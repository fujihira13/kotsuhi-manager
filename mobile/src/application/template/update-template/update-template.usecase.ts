import { TemplateNotFoundError } from '@/src/domain/template/errors/template-not-found.error'
import { TemplateRepository } from '@/src/domain/template/template.repository'
import { TemplateId } from '@/src/domain/template/value-objects/template-id.vo'
import { UpdateTemplateCommand } from './update-template.command'

export class UpdateTemplateUseCase {
  constructor(private readonly templateRepository: TemplateRepository) {}

  async execute(command: UpdateTemplateCommand): Promise<void> {
    const id = TemplateId.create(command.id)
    const existing = await this.templateRepository.findById(id)
    if (!existing) {
      throw new TemplateNotFoundError(command.id)
    }

    const updated = existing.update({
      name: command.name,
      category: command.category,
      subcategory: command.subcategory,
      amount: command.amount,
      memoTemplate: command.memoTemplate,
    })

    await this.templateRepository.update(updated)
  }
}

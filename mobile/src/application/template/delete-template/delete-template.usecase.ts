import { TemplateNotFoundError } from '@/src/domain/template/errors/template-not-found.error'
import { TemplateRepository } from '@/src/domain/template/template.repository'
import { TemplateId } from '@/src/domain/template/value-objects/template-id.vo'
import { DeleteTemplateCommand } from './delete-template.command'

export class DeleteTemplateUseCase {
  constructor(private readonly templateRepository: TemplateRepository) {}

  async execute(command: DeleteTemplateCommand): Promise<void> {
    const id = TemplateId.create(command.id)
    const existing = await this.templateRepository.findById(id)
    if (!existing) {
      throw new TemplateNotFoundError(command.id)
    }

    await this.templateRepository.delete(id)
  }
}

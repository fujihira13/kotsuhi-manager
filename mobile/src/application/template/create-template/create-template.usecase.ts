import { TemplateEntity } from '@/src/domain/template/template.entity'
import { TemplateRepository } from '@/src/domain/template/template.repository'
import { CreateTemplateCommand, CreateTemplateResult } from './create-template.command'

export class CreateTemplateUseCase {
  constructor(private readonly templateRepository: TemplateRepository) {}

  async execute(command: CreateTemplateCommand): Promise<CreateTemplateResult> {
    // 末尾に追加するため、既存テンプレート数を sortOrder として使用する
    const existing = await this.templateRepository.findAll()
    const sortOrder = existing.length

    const template = TemplateEntity.create({
      name: command.name,
      category: command.category,
      subcategory: command.subcategory,
      amount: command.amount ?? null,
      memoTemplate: command.memoTemplate ?? null,
      sortOrder,
    })

    await this.templateRepository.save(template)

    return { id: template.id.toString() }
  }
}

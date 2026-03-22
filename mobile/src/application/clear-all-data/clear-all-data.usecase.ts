import { ExpenseRepository } from '@/src/domain/expense/expense.repository'
import { TemplateRepository } from '@/src/domain/template/template.repository'
import { LastInputRepository } from '../last-input/last-input'
import { ClearAllDataCommand } from './clear-all-data.command'

export class ClearAllDataUseCase {
  constructor(
    private readonly expenseRepository: ExpenseRepository,
    private readonly templateRepository: TemplateRepository,
    private readonly lastInputRepository: LastInputRepository,
  ) {}

  async execute(_command: ClearAllDataCommand): Promise<void> {
    await Promise.all([
      this.expenseRepository.deleteAll(),
      this.templateRepository.deleteAll(),
      this.lastInputRepository.clear(),
    ])
  }
}

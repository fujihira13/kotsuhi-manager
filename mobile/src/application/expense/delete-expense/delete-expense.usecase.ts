import { ExpenseNotFoundError } from '@/src/domain/expense/errors/expense-not-found.error'
import { ExpenseRepository } from '@/src/domain/expense/expense.repository'
import { ExpenseId } from '@/src/domain/expense/value-objects/expense-id.vo'
import { DeleteExpenseCommand } from './delete-expense.command'

export class DeleteExpenseUseCase {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(command: DeleteExpenseCommand): Promise<void> {
    const id = ExpenseId.create(command.id)
    const existing = await this.expenseRepository.findById(id)
    if (!existing) {
      throw new ExpenseNotFoundError(command.id)
    }

    await this.expenseRepository.delete(id)
  }
}

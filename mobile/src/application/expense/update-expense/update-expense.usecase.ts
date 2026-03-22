import { ExpenseNotFoundError } from '@/src/domain/expense/errors/expense-not-found.error'
import { ExpenseRepository } from '@/src/domain/expense/expense.repository'
import { ExpenseId } from '@/src/domain/expense/value-objects/expense-id.vo'
import { UpdateExpenseCommand } from './update-expense.command'

export class UpdateExpenseUseCase {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(command: UpdateExpenseCommand): Promise<void> {
    const id = ExpenseId.create(command.id)
    const existing = await this.expenseRepository.findById(id)
    if (!existing) {
      throw new ExpenseNotFoundError(command.id)
    }

    const updated = existing.update({
      date: command.date,
      amount: command.amount,
      category: command.category,
      subcategory: command.subcategory,
      memo: command.memo,
      satisfaction: command.satisfaction,
    })

    await this.expenseRepository.update(updated)
  }
}

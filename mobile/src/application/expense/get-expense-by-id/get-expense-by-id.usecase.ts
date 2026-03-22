import { ExpenseNotFoundError } from '@/src/domain/expense/errors/expense-not-found.error'
import { ExpenseRepository } from '@/src/domain/expense/expense.repository'
import { ExpenseId } from '@/src/domain/expense/value-objects/expense-id.vo'
import { ExpenseDetail, GetExpenseByIdQuery } from './get-expense-by-id.query'

export class GetExpenseByIdUseCase {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(query: GetExpenseByIdQuery): Promise<ExpenseDetail> {
    const id = ExpenseId.create(query.id)
    const expense = await this.expenseRepository.findById(id)
    if (!expense) {
      throw new ExpenseNotFoundError(query.id)
    }

    return {
      id: expense.id.toString(),
      date: expense.date.value,
      amount: expense.amount.value,
      category: expense.category.value,
      subcategory: expense.subcategory.value,
      memo: expense.memo,
      satisfaction: expense.satisfaction?.value ?? null,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    }
  }
}

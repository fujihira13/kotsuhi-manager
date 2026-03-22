import { ExpenseRepository } from '@/src/domain/expense/expense.repository'
import { ExpenseListItem, ListExpensesQuery, ListExpensesResult } from './list-expenses.query'

export class ListExpensesUseCase {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(query: ListExpensesQuery): Promise<ListExpensesResult> {
    const expenses = await this.expenseRepository.findAll({
      month: query.month,
      category: query.category,
    })

    return expenses.map(
      (expense): ExpenseListItem => ({
        id: expense.id.toString(),
        date: expense.date.value,
        amount: expense.amount.value,
        category: expense.category.value,
        subcategory: expense.subcategory.value,
        memo: expense.memo,
        satisfaction: expense.satisfaction?.value ?? null,
      }),
    )
  }
}

import { ExpenseEntity } from '@/src/domain/expense/expense.entity'
import { ExpenseRepository } from '@/src/domain/expense/expense.repository'
import { LastInputRepository } from '../../last-input/last-input'
import { CreateExpenseCommand, CreateExpenseResult } from './create-expense.command'

export class CreateExpenseUseCase {
  constructor(
    private readonly expenseRepository: ExpenseRepository,
    private readonly lastInputRepository: LastInputRepository,
  ) {}

  async execute(command: CreateExpenseCommand): Promise<CreateExpenseResult> {
    const expense = ExpenseEntity.create({
      date: command.date,
      amount: command.amount,
      category: command.category,
      subcategory: command.subcategory,
      memo: command.memo ?? null,
      satisfaction: command.satisfaction ?? null,
    })

    await this.expenseRepository.save(expense)

    // ExpenseCreated イベント相当: 前回入力値を更新する
    await this.lastInputRepository.save({
      category: expense.category.value,
      subcategory: expense.subcategory.value,
      memo: expense.memo,
    })

    return { id: expense.id.toString() }
  }
}

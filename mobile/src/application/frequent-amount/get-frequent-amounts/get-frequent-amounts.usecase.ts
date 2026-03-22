import { ExpenseRepository } from '@/src/domain/expense/expense.repository'
import { FrequentAmountCalculator } from '@/src/domain/expense/services/frequent-amount-calculator'
import {
  GetFrequentAmountsQuery,
  GetFrequentAmountsResult,
} from './get-frequent-amounts.query'

export class GetFrequentAmountsUseCase {
  private readonly calculator = new FrequentAmountCalculator()

  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(query: GetFrequentAmountsQuery): Promise<GetFrequentAmountsResult> {
    const today = new Date()
    const toDate = today.toISOString().slice(0, 10)
    const fromDate = new Date(today.getTime() - query.windowDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)

    const expenses = await this.expenseRepository.findByDateRange(fromDate, toDate)
    return this.calculator.calculate(expenses, query.limit)
  }
}

import { ExpenseRepository } from '@/src/domain/expense/expense.repository'
import { ExpenseSummaryCalculator } from '@/src/domain/expense/services/expense-summary-calculator'
import { GetSummaryQuery, SummaryPeriod, SummaryResult } from './get-summary.query'

function resolvePeriod(period: SummaryPeriod): { from: string; to: string } {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = today.getMonth() // 0-indexed

  if (period === 'this_month') {
    const from = `${yyyy}-${String(mm + 1).padStart(2, '0')}-01`
    const lastDay = new Date(yyyy, mm + 1, 0).getDate()
    const to = `${yyyy}-${String(mm + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    return { from, to }
  }

  if (period === 'last_month') {
    const prevDate = new Date(yyyy, mm - 1, 1)
    const py = prevDate.getFullYear()
    const pm = prevDate.getMonth()
    const from = `${py}-${String(pm + 1).padStart(2, '0')}-01`
    const lastDay = new Date(py, pm + 1, 0).getDate()
    const to = `${py}-${String(pm + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    return { from, to }
  }

  // last_3_months: 3ヶ月前の月初から今日まで
  const startDate = new Date(yyyy, mm - 2, 1)
  const sy = startDate.getFullYear()
  const sm = startDate.getMonth()
  const from = `${sy}-${String(sm + 1).padStart(2, '0')}-01`
  const to = `${yyyy}-${String(mm + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return { from, to }
}

export class GetSummaryUseCase {
  private readonly calculator = new ExpenseSummaryCalculator()

  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(query: GetSummaryQuery): Promise<SummaryResult> {
    const { from, to } = resolvePeriod(query.period)
    const expenses = await this.expenseRepository.findByDateRange(from, to)
    return this.calculator.calculate(expenses, from, to)
  }
}

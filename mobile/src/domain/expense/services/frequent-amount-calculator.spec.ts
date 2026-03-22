import { ExpenseEntity } from '../expense.entity'
import { FrequentAmountCalculator } from './frequent-amount-calculator'

function makeExpense(amount: number, date = '2026-03-01') {
  return ExpenseEntity.create({ date, amount, category: 'transportation', subcategory: 'train' })
}

describe('FrequentAmountCalculator', () => {
  const calculator = new FrequentAmountCalculator()

  it('頻度降順で返す', () => {
    const expenses = [
      makeExpense(500),
      makeExpense(500),
      makeExpense(500),
      makeExpense(230),
      makeExpense(230),
      makeExpense(1000),
    ]
    const result = calculator.calculate(expenses, 5)
    expect(result[0]).toEqual({ amount: 500, count: 3 })
    expect(result[1]).toEqual({ amount: 230, count: 2 })
    expect(result[2]).toEqual({ amount: 1000, count: 1 })
  })

  it('同じ頻度の場合は金額昇順', () => {
    const expenses = [makeExpense(1000), makeExpense(500), makeExpense(300)]
    const result = calculator.calculate(expenses, 5)
    expect(result[0].amount).toBe(300)
    expect(result[1].amount).toBe(500)
    expect(result[2].amount).toBe(1000)
  })

  it('limit で件数を絞れる', () => {
    const expenses = [
      makeExpense(100),
      makeExpense(200),
      makeExpense(300),
      makeExpense(400),
      makeExpense(500),
      makeExpense(600),
    ]
    expect(calculator.calculate(expenses, 3)).toHaveLength(3)
  })

  it('空の配列は空を返す', () => {
    expect(calculator.calculate([], 5)).toHaveLength(0)
  })

  it('件数が limit 未満の場合はそのまま返す', () => {
    const expenses = [makeExpense(100), makeExpense(200)]
    expect(calculator.calculate(expenses, 5)).toHaveLength(2)
  })
})

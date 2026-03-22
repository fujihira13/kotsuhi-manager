import { ExpenseEntity } from '../expense.entity'
import { ExpenseSummaryCalculator } from './expense-summary-calculator'

function makeExpense(params: {
  amount: number
  category: 'transportation' | 'entertainment'
  subcategory: string
  satisfaction?: number
  date?: string
}) {
  return ExpenseEntity.create({
    date: params.date ?? '2026-03-15',
    amount: params.amount,
    category: params.category,
    subcategory: params.subcategory,
    satisfaction: params.satisfaction,
  })
}

describe('ExpenseSummaryCalculator', () => {
  const calculator = new ExpenseSummaryCalculator()
  const PERIOD = { from: '2026-03-01', to: '2026-03-31' }

  describe('totalAmount', () => {
    it('全支出の合計を返す', () => {
      const expenses = [
        makeExpense({ amount: 500, category: 'transportation', subcategory: 'train' }),
        makeExpense({ amount: 3000, category: 'entertainment', subcategory: 'meal' }),
      ]
      const result = calculator.calculate(expenses, PERIOD.from, PERIOD.to)
      expect(result.totalAmount).toBe(3500)
    })

    it('支出なしの場合は 0', () => {
      const result = calculator.calculate([], PERIOD.from, PERIOD.to)
      expect(result.totalAmount).toBe(0)
    })
  })

  describe('breakdown', () => {
    it('区分別の合計と構成比を計算する', () => {
      const expenses = [
        makeExpense({ amount: 1000, category: 'transportation', subcategory: 'train' }),
        makeExpense({ amount: 1000, category: 'transportation', subcategory: 'bus' }),
        makeExpense({ amount: 2000, category: 'entertainment', subcategory: 'meal' }),
      ]
      const result = calculator.calculate(expenses, PERIOD.from, PERIOD.to)
      const transport = result.breakdown.find((b) => b.category === 'transportation')!
      const entertainment = result.breakdown.find((b) => b.category === 'entertainment')!

      expect(transport.total).toBe(2000)
      expect(transport.share).toBeCloseTo(0.5)
      expect(entertainment.total).toBe(2000)
      expect(entertainment.share).toBeCloseTo(0.5)
    })

    it('サブ区分別の集計を計算する', () => {
      const expenses = [
        makeExpense({ amount: 300, category: 'transportation', subcategory: 'train' }),
        makeExpense({ amount: 200, category: 'transportation', subcategory: 'train' }),
        makeExpense({ amount: 500, category: 'transportation', subcategory: 'taxi' }),
      ]
      const result = calculator.calculate(expenses, PERIOD.from, PERIOD.to)
      const transport = result.breakdown.find((b) => b.category === 'transportation')!
      const trainSub = transport.subcategories.find((s) => s.subcategory === 'train')!
      const taxiSub = transport.subcategories.find((s) => s.subcategory === 'taxi')!

      expect(trainSub.total).toBe(500)
      expect(trainSub.share).toBeCloseTo(0.5)
      expect(taxiSub.total).toBe(500)
      expect(taxiSub.share).toBeCloseTo(0.5)
    })

    it('支出なしの場合 breakdown は空', () => {
      const result = calculator.calculate([], PERIOD.from, PERIOD.to)
      expect(result.breakdown).toHaveLength(0)
    })
  })

  describe('satisfactionStats', () => {
    it('満足度の平均を計算する', () => {
      const expenses = [
        makeExpense({ amount: 500, category: 'transportation', subcategory: 'train', satisfaction: 3 }),
        makeExpense({ amount: 500, category: 'transportation', subcategory: 'train', satisfaction: 5 }),
      ]
      const result = calculator.calculate(expenses, PERIOD.from, PERIOD.to)
      expect(result.satisfactionStats.average).toBe(4)
    })

    it('満足度なしの場合 average は null', () => {
      const expenses = [
        makeExpense({ amount: 500, category: 'transportation', subcategory: 'train' }),
      ]
      const result = calculator.calculate(expenses, PERIOD.from, PERIOD.to)
      expect(result.satisfactionStats.average).toBeNull()
    })

    it('満足度の分布を計算する', () => {
      const expenses = [
        makeExpense({ amount: 100, category: 'transportation', subcategory: 'train', satisfaction: 3 }),
        makeExpense({ amount: 100, category: 'transportation', subcategory: 'train', satisfaction: 5 }),
        makeExpense({ amount: 100, category: 'transportation', subcategory: 'train', satisfaction: 5 }),
      ]
      const result = calculator.calculate(expenses, PERIOD.from, PERIOD.to)
      expect(result.satisfactionStats.distribution).toEqual([
        { value: 3, count: 1 },
        { value: 5, count: 2 },
      ])
    })

    it('満足度なしと有りが混在する場合、有りのみで平均を計算する', () => {
      const expenses = [
        makeExpense({ amount: 500, category: 'transportation', subcategory: 'train', satisfaction: 4 }),
        makeExpense({ amount: 500, category: 'transportation', subcategory: 'train' }), // satisfaction なし
      ]
      const result = calculator.calculate(expenses, PERIOD.from, PERIOD.to)
      expect(result.satisfactionStats.average).toBe(4)
    })
  })

  describe('period', () => {
    it('指定した期間が結果に含まれる', () => {
      const result = calculator.calculate([], '2026-02-01', '2026-02-28')
      expect(result.period).toEqual({ from: '2026-02-01', to: '2026-02-28' })
    })
  })
})

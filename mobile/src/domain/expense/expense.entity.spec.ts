import { Category } from '../shared/value-objects/category.vo'
import { Subcategory } from '../shared/value-objects/subcategory.vo'
import { ExpenseEntity } from './expense.entity'
import { ExpenseDate } from './value-objects/expense-date.vo'
import { ExpenseId } from './value-objects/expense-id.vo'
import { Money } from './value-objects/money.vo'
import { Satisfaction } from './value-objects/satisfaction.vo'

const BASE_PARAMS = {
  date: '2026-03-22',
  amount: 500,
  category: 'transportation',
  subcategory: 'train',
}

describe('ExpenseEntity', () => {
  describe('create()', () => {
    describe('正常系', () => {
      it('必須項目のみで生成できる', () => {
        const expense = ExpenseEntity.create(BASE_PARAMS)
        expect(expense.id.toString()).toMatch(/^[0-9a-f-]{36}$/)
        expect(expense.date.value).toBe('2026-03-22')
        expect(expense.amount.value).toBe(500)
        expect(expense.category.value).toBe('transportation')
        expect(expense.subcategory.value).toBe('train')
        expect(expense.memo).toBeNull()
        expect(expense.satisfaction).toBeNull()
      })

      it('任意項目（memo, satisfaction）を含めて生成できる', () => {
        const expense = ExpenseEntity.create({ ...BASE_PARAMS, memo: '電車代', satisfaction: 4 })
        expect(expense.memo).toBe('電車代')
        expect(expense.satisfaction?.value).toBe(4)
      })

      it('交際費で生成できる', () => {
        const expense = ExpenseEntity.create({
          date: '2026-03-22',
          amount: 3000,
          category: 'entertainment',
          subcategory: 'meal',
        })
        expect(expense.category.value).toBe('entertainment')
        expect(expense.subcategory.value).toBe('meal')
      })

      it('createdAt と updatedAt が同じ日時で設定される', () => {
        const before = new Date()
        const expense = ExpenseEntity.create(BASE_PARAMS)
        const after = new Date()
        expect(expense.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
        expect(expense.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
        expect(expense.createdAt.getTime()).toBe(expense.updatedAt.getTime())
      })
    })

    describe('異常系', () => {
      it('無効な category はエラー', () => {
        expect(() => ExpenseEntity.create({ ...BASE_PARAMS, category: 'food' })).toThrow()
      })

      it('category と subcategory の組み合わせ不正はエラー', () => {
        expect(() =>
          ExpenseEntity.create({ ...BASE_PARAMS, category: 'transportation', subcategory: 'meal' }),
        ).toThrow(/Invalid subcategory/)
      })

      it('金額 0 はエラー', () => {
        expect(() => ExpenseEntity.create({ ...BASE_PARAMS, amount: 0 })).toThrow()
      })

      it('無効な日付はエラー', () => {
        expect(() => ExpenseEntity.create({ ...BASE_PARAMS, date: '2026/03/22' })).toThrow()
      })

      it('satisfaction が範囲外はエラー', () => {
        expect(() => ExpenseEntity.create({ ...BASE_PARAMS, satisfaction: 6 })).toThrow()
      })
    })
  })

  describe('reconstruct()', () => {
    it('DB から復元できる', () => {
      const props = {
        id: ExpenseId.create('550e8400-e29b-41d4-a716-446655440000'),
        date: ExpenseDate.create('2026-03-22'),
        amount: Money.create(1000),
        category: Category.create('transportation'),
        subcategory: Subcategory.create('taxi', Category.create('transportation')),
        memo: 'タクシー',
        satisfaction: Satisfaction.create(3),
        createdAt: new Date('2026-03-22T10:00:00Z'),
        updatedAt: new Date('2026-03-22T10:00:00Z'),
      }
      const expense = ExpenseEntity.reconstruct(props)
      expect(expense.id.toString()).toBe('550e8400-e29b-41d4-a716-446655440000')
      expect(expense.amount.value).toBe(1000)
      expect(expense.memo).toBe('タクシー')
    })
  })

  describe('update()', () => {
    it('金額を更新できる', () => {
      const original = ExpenseEntity.create(BASE_PARAMS)
      const updated = original.update({ amount: 800 })
      expect(updated.amount.value).toBe(800)
      expect(updated.date.value).toBe(original.date.value) // 他フィールドは変わらない
    })

    it('memo を null にクリアできる', () => {
      const expense = ExpenseEntity.create({ ...BASE_PARAMS, memo: '備考' })
      const updated = expense.update({ memo: null })
      expect(updated.memo).toBeNull()
    })

    it('satisfaction を null にクリアできる', () => {
      const expense = ExpenseEntity.create({ ...BASE_PARAMS, satisfaction: 5 })
      const updated = expense.update({ satisfaction: null })
      expect(updated.satisfaction).toBeNull()
    })

    it('区分変更時に subcategory も変更できる', () => {
      const expense = ExpenseEntity.create(BASE_PARAMS)
      const updated = expense.update({ category: 'entertainment', subcategory: 'cafe' })
      expect(updated.category.value).toBe('entertainment')
      expect(updated.subcategory.value).toBe('cafe')
    })

    it('update() は元の Entity を変更しない（イミュータブル）', () => {
      const original = ExpenseEntity.create(BASE_PARAMS)
      original.update({ amount: 9999 })
      expect(original.amount.value).toBe(500)
    })

    it('updatedAt が更新される', () => {
      const original = ExpenseEntity.create(BASE_PARAMS)
      const updated = original.update({ amount: 800 })
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(original.updatedAt.getTime())
    })
  })

  describe('isInDateRange()', () => {
    it('期間内の支出は true', () => {
      const expense = ExpenseEntity.create({ ...BASE_PARAMS, date: '2026-03-15' })
      expect(expense.isInDateRange('2026-03-01', '2026-03-31')).toBe(true)
    })

    it('期間の開始日と一致する場合は true（境界値）', () => {
      const expense = ExpenseEntity.create({ ...BASE_PARAMS, date: '2026-03-01' })
      expect(expense.isInDateRange('2026-03-01', '2026-03-31')).toBe(true)
    })

    it('期間の終了日と一致する場合は true（境界値）', () => {
      const expense = ExpenseEntity.create({ ...BASE_PARAMS, date: '2026-03-31' })
      expect(expense.isInDateRange('2026-03-01', '2026-03-31')).toBe(true)
    })

    it('期間外の支出は false', () => {
      const expense = ExpenseEntity.create({ ...BASE_PARAMS, date: '2026-04-01' })
      expect(expense.isInDateRange('2026-03-01', '2026-03-31')).toBe(false)
    })
  })
})

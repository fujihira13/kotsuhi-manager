import { ExpenseEntity } from '@/src/domain/expense/expense.entity'
import { ExpenseId } from '@/src/domain/expense/value-objects/expense-id.vo'
import { ExpenseDate } from '@/src/domain/expense/value-objects/expense-date.vo'
import { Money } from '@/src/domain/expense/value-objects/money.vo'
import { Satisfaction } from '@/src/domain/expense/value-objects/satisfaction.vo'
import { Category } from '@/src/domain/shared/value-objects/category.vo'
import { Subcategory } from '@/src/domain/shared/value-objects/subcategory.vo'
import { toExpenseEntity, toExpenseRecord, type ExpenseRecord } from './expense.repository.impl'

const FIXED_ID = '550e8400-e29b-41d4-a716-446655440000'
const FIXED_DATE = '2026-03-22'
const FIXED_CREATED_AT = '2026-03-22T10:00:00.000Z'
const FIXED_UPDATED_AT = '2026-03-22T10:30:00.000Z'

const BASE_RECORD: ExpenseRecord = {
  id: FIXED_ID,
  date: FIXED_DATE,
  amount: 500,
  category: 'transportation',
  subcategory: 'train',
  memo: null,
  satisfaction: null,
  createdAt: FIXED_CREATED_AT,
  updatedAt: FIXED_UPDATED_AT,
}

function makeEntity(overrides?: Partial<Parameters<typeof ExpenseEntity.reconstruct>[0]>): ExpenseEntity {
  const category = Category.create('transportation')
  return ExpenseEntity.reconstruct({
    id: ExpenseId.create(FIXED_ID),
    date: ExpenseDate.create(FIXED_DATE),
    amount: Money.create(500),
    category,
    subcategory: Subcategory.create('train', category),
    memo: null,
    satisfaction: null,
    createdAt: new Date(FIXED_CREATED_AT),
    updatedAt: new Date(FIXED_UPDATED_AT),
    ...overrides,
  })
}

describe('toExpenseEntity', () => {
  describe('正常系', () => {
    it('交通費レコードをエンティティに変換できる', () => {
      const entity = toExpenseEntity(BASE_RECORD)
      expect(entity.id.toString()).toBe(FIXED_ID)
      expect(entity.date.value).toBe(FIXED_DATE)
      expect(entity.amount.value).toBe(500)
      expect(entity.category.value).toBe('transportation')
      expect(entity.subcategory.value).toBe('train')
      expect(entity.memo).toBeNull()
      expect(entity.satisfaction).toBeNull()
      expect(entity.createdAt).toEqual(new Date(FIXED_CREATED_AT))
      expect(entity.updatedAt).toEqual(new Date(FIXED_UPDATED_AT))
    })

    it('交際費レコードをエンティティに変換できる', () => {
      const record: ExpenseRecord = {
        ...BASE_RECORD,
        category: 'entertainment',
        subcategory: 'meal',
      }
      const entity = toExpenseEntity(record)
      expect(entity.category.value).toBe('entertainment')
      expect(entity.subcategory.value).toBe('meal')
    })

    it('memo が設定されている場合、文字列として変換できる', () => {
      const entity = toExpenseEntity({ ...BASE_RECORD, memo: '電車代' })
      expect(entity.memo).toBe('電車代')
    })

    it('satisfaction が設定されている場合、Satisfaction VO に変換できる', () => {
      const entity = toExpenseEntity({ ...BASE_RECORD, satisfaction: 4 })
      expect(entity.satisfaction?.value).toBe(4)
    })

    it('satisfaction が 1（最小値）の場合、正常に変換できる', () => {
      const entity = toExpenseEntity({ ...BASE_RECORD, satisfaction: 1 })
      expect(entity.satisfaction?.value).toBe(1)
    })

    it('satisfaction が 5（最大値）の場合、正常に変換できる', () => {
      const entity = toExpenseEntity({ ...BASE_RECORD, satisfaction: 5 })
      expect(entity.satisfaction?.value).toBe(5)
    })
  })

  describe('nullable フィールドのフォールバック処理', () => {
    it('memo が null の場合、null を返す', () => {
      const entity = toExpenseEntity({ ...BASE_RECORD, memo: null })
      expect(entity.memo).toBeNull()
    })

    it('satisfaction が null の場合、null を返す', () => {
      const entity = toExpenseEntity({ ...BASE_RECORD, satisfaction: null })
      expect(entity.satisfaction).toBeNull()
    })
  })
})

describe('toExpenseRecord', () => {
  describe('正常系', () => {
    it('エンティティをDBレコードに変換できる', () => {
      const entity = makeEntity()
      const record = toExpenseRecord(entity)
      expect(record.id).toBe(FIXED_ID)
      expect(record.date).toBe(FIXED_DATE)
      expect(record.amount).toBe(500)
      expect(record.category).toBe('transportation')
      expect(record.subcategory).toBe('train')
      expect(record.memo).toBeNull()
      expect(record.satisfaction).toBeNull()
      expect(record.createdAt).toBe(FIXED_CREATED_AT)
      expect(record.updatedAt).toBe(FIXED_UPDATED_AT)
    })

    it('memo が設定されている場合、文字列として変換できる', () => {
      const category = Category.create('transportation')
      const entity = makeEntity({ memo: '電車代' })
      const record = toExpenseRecord(entity)
      expect(record.memo).toBe('電車代')
    })

    it('satisfaction が設定されている場合、数値として変換できる', () => {
      const entity = makeEntity({ satisfaction: Satisfaction.create(3) })
      const record = toExpenseRecord(entity)
      expect(record.satisfaction).toBe(3)
    })

    it('satisfaction が null の場合、null として変換できる', () => {
      const entity = makeEntity({ satisfaction: null })
      const record = toExpenseRecord(entity)
      expect(record.satisfaction).toBeNull()
    })

    it('交際費エンティティを正しく変換できる', () => {
      const category = Category.create('entertainment')
      const entity = makeEntity({
        category,
        subcategory: Subcategory.create('meal', category),
      })
      const record = toExpenseRecord(entity)
      expect(record.category).toBe('entertainment')
      expect(record.subcategory).toBe('meal')
    })

    it('createdAt と updatedAt が ISO 文字列として変換される', () => {
      const entity = makeEntity()
      const record = toExpenseRecord(entity)
      expect(record.createdAt).toBe(FIXED_CREATED_AT)
      expect(record.updatedAt).toBe(FIXED_UPDATED_AT)
    })
  })

  describe('往復変換の整合性', () => {
    it('toExpenseRecord → toExpenseEntity で元のデータが復元できる', () => {
      const original = makeEntity({ memo: 'テスト', satisfaction: Satisfaction.create(4) })
      const record = toExpenseRecord(original)
      const restored = toExpenseEntity(record as ExpenseRecord)
      expect(restored.id.toString()).toBe(original.id.toString())
      expect(restored.date.value).toBe(original.date.value)
      expect(restored.amount.value).toBe(original.amount.value)
      expect(restored.category.value).toBe(original.category.value)
      expect(restored.subcategory.value).toBe(original.subcategory.value)
      expect(restored.memo).toBe(original.memo)
      expect(restored.satisfaction?.value).toBe(original.satisfaction?.value)
    })
  })
})

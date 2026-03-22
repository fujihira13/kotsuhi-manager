import { TemplateEntity } from '@/src/domain/template/template.entity'
import { TemplateId } from '@/src/domain/template/value-objects/template-id.vo'
import { SortOrder } from '@/src/domain/template/value-objects/sort-order.vo'
import { Money } from '@/src/domain/expense/value-objects/money.vo'
import { Category } from '@/src/domain/shared/value-objects/category.vo'
import { Subcategory } from '@/src/domain/shared/value-objects/subcategory.vo'
import { toTemplateEntity, toTemplateRecord, type TemplateRecord } from './template.repository.impl'

const FIXED_ID = '550e8400-e29b-41d4-a716-446655440001'
const FIXED_CREATED_AT = '2026-03-22T10:00:00.000Z'
const FIXED_UPDATED_AT = '2026-03-22T10:30:00.000Z'

const BASE_RECORD: TemplateRecord = {
  id: FIXED_ID,
  name: '電車（新橋→渋谷）',
  category: 'transportation',
  subcategory: 'train',
  amount: null,
  memoTemplate: null,
  sortOrder: 0,
  createdAt: FIXED_CREATED_AT,
  updatedAt: FIXED_UPDATED_AT,
}

function makeEntity(overrides?: Partial<Parameters<typeof TemplateEntity.reconstruct>[0]>): TemplateEntity {
  const category = Category.create('transportation')
  return TemplateEntity.reconstruct({
    id: TemplateId.create(FIXED_ID),
    name: '電車（新橋→渋谷）',
    category,
    subcategory: Subcategory.create('train', category),
    amount: null,
    memoTemplate: null,
    sortOrder: SortOrder.create(0),
    createdAt: new Date(FIXED_CREATED_AT),
    updatedAt: new Date(FIXED_UPDATED_AT),
    ...overrides,
  })
}

describe('toTemplateEntity', () => {
  describe('正常系', () => {
    it('交通費テンプレートレコードをエンティティに変換できる', () => {
      const entity = toTemplateEntity(BASE_RECORD)
      expect(entity.id.toString()).toBe(FIXED_ID)
      expect(entity.name).toBe('電車（新橋→渋谷）')
      expect(entity.category.value).toBe('transportation')
      expect(entity.subcategory.value).toBe('train')
      expect(entity.amount).toBeNull()
      expect(entity.memoTemplate).toBeNull()
      expect(entity.sortOrder.value).toBe(0)
      expect(entity.createdAt).toEqual(new Date(FIXED_CREATED_AT))
      expect(entity.updatedAt).toEqual(new Date(FIXED_UPDATED_AT))
    })

    it('交際費テンプレートレコードをエンティティに変換できる', () => {
      const record: TemplateRecord = {
        ...BASE_RECORD,
        category: 'entertainment',
        subcategory: 'meal',
      }
      const entity = toTemplateEntity(record)
      expect(entity.category.value).toBe('entertainment')
      expect(entity.subcategory.value).toBe('meal')
    })

    it('amount が設定されている場合、Money VO に変換できる', () => {
      const entity = toTemplateEntity({ ...BASE_RECORD, amount: 1500 })
      expect(entity.amount?.value).toBe(1500)
    })

    it('memoTemplate が設定されている場合、文字列として変換できる', () => {
      const entity = toTemplateEntity({ ...BASE_RECORD, memoTemplate: '打ち合わせ費用' })
      expect(entity.memoTemplate).toBe('打ち合わせ費用')
    })

    it('sortOrder が設定されている場合、SortOrder VO に変換できる', () => {
      const entity = toTemplateEntity({ ...BASE_RECORD, sortOrder: 3 })
      expect(entity.sortOrder.value).toBe(3)
    })
  })

  describe('nullable フィールドのフォールバック処理', () => {
    it('amount が null の場合、null を返す', () => {
      const entity = toTemplateEntity({ ...BASE_RECORD, amount: null })
      expect(entity.amount).toBeNull()
    })

    it('memoTemplate が null の場合、null を返す', () => {
      const entity = toTemplateEntity({ ...BASE_RECORD, memoTemplate: null })
      expect(entity.memoTemplate).toBeNull()
    })
  })
})

describe('toTemplateRecord', () => {
  describe('正常系', () => {
    it('エンティティをDBレコードに変換できる', () => {
      const entity = makeEntity()
      const record = toTemplateRecord(entity)
      expect(record.id).toBe(FIXED_ID)
      expect(record.name).toBe('電車（新橋→渋谷）')
      expect(record.category).toBe('transportation')
      expect(record.subcategory).toBe('train')
      expect(record.amount).toBeNull()
      expect(record.memoTemplate).toBeNull()
      expect(record.sortOrder).toBe(0)
      expect(record.createdAt).toBe(FIXED_CREATED_AT)
      expect(record.updatedAt).toBe(FIXED_UPDATED_AT)
    })

    it('amount が設定されている場合、数値として変換できる', () => {
      const entity = makeEntity({ amount: Money.create(1500) })
      const record = toTemplateRecord(entity)
      expect(record.amount).toBe(1500)
    })

    it('amount が null の場合、null として変換できる', () => {
      const entity = makeEntity({ amount: null })
      const record = toTemplateRecord(entity)
      expect(record.amount).toBeNull()
    })

    it('memoTemplate が設定されている場合、文字列として変換できる', () => {
      const entity = makeEntity({ memoTemplate: '打ち合わせ費用' })
      const record = toTemplateRecord(entity)
      expect(record.memoTemplate).toBe('打ち合わせ費用')
    })

    it('交際費エンティティを正しく変換できる', () => {
      const category = Category.create('entertainment')
      const entity = makeEntity({
        category,
        subcategory: Subcategory.create('cafe', category),
      })
      const record = toTemplateRecord(entity)
      expect(record.category).toBe('entertainment')
      expect(record.subcategory).toBe('cafe')
    })

    it('sortOrder が設定されている場合、数値として変換できる', () => {
      const entity = makeEntity({ sortOrder: SortOrder.create(5) })
      const record = toTemplateRecord(entity)
      expect(record.sortOrder).toBe(5)
    })

    it('createdAt と updatedAt が ISO 文字列として変換される', () => {
      const entity = makeEntity()
      const record = toTemplateRecord(entity)
      expect(record.createdAt).toBe(FIXED_CREATED_AT)
      expect(record.updatedAt).toBe(FIXED_UPDATED_AT)
    })
  })

  describe('往復変換の整合性', () => {
    it('toTemplateRecord → toTemplateEntity で元のデータが復元できる', () => {
      const category = Category.create('entertainment')
      const original = makeEntity({
        category,
        subcategory: Subcategory.create('drink', category),
        amount: Money.create(3000),
        memoTemplate: '歓迎会',
        sortOrder: SortOrder.create(2),
      })
      const record = toTemplateRecord(original)
      const restored = toTemplateEntity(record as TemplateRecord)
      expect(restored.id.toString()).toBe(original.id.toString())
      expect(restored.name).toBe(original.name)
      expect(restored.category.value).toBe(original.category.value)
      expect(restored.subcategory.value).toBe(original.subcategory.value)
      expect(restored.amount?.value).toBe(original.amount?.value)
      expect(restored.memoTemplate).toBe(original.memoTemplate)
      expect(restored.sortOrder.value).toBe(original.sortOrder.value)
    })
  })
})

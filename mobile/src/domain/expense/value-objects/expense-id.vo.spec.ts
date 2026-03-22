import { ExpenseId } from './expense-id.vo'

describe('ExpenseId', () => {
  const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

  describe('正常系', () => {
    it('有効な UUID v4 で生成できる', () => {
      const id = ExpenseId.create(VALID_UUID)
      expect(id.toString()).toBe(VALID_UUID)
    })

    it('generate() でユニークな ID を生成できる', () => {
      const id1 = ExpenseId.generate()
      const id2 = ExpenseId.generate()
      expect(id1.toString()).not.toBe(id2.toString())
    })

    it('generate() が UUID 形式で生成される', () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(uuidRegex.test(ExpenseId.generate().toString())).toBe(true)
    })
  })

  describe('異常系', () => {
    it('空文字はエラー', () => {
      expect(() => ExpenseId.create('')).toThrow(/empty/)
    })

    it('UUID でない文字列はエラー', () => {
      expect(() => ExpenseId.create('not-a-uuid')).toThrow(/Invalid ExpenseId/)
    })
  })

  describe('等値性', () => {
    it('同じ UUID は等しい', () => {
      expect(ExpenseId.create(VALID_UUID).equals(ExpenseId.create(VALID_UUID))).toBe(true)
    })

    it('異なる UUID は等しくない', () => {
      expect(ExpenseId.create(VALID_UUID).equals(ExpenseId.generate())).toBe(false)
    })
  })
})

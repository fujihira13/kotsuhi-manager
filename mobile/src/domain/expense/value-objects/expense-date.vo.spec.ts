import { ExpenseDate } from './expense-date.vo'

describe('ExpenseDate', () => {
  describe('正常系', () => {
    it('有効な日付 (YYYY-MM-DD) で生成できる', () => {
      expect(ExpenseDate.create('2026-03-22').value).toBe('2026-03-22')
    })

    it('将来日付も許可される', () => {
      expect(ExpenseDate.create('2099-12-31').value).toBe('2099-12-31')
    })

    it('toString() が値を返す', () => {
      expect(ExpenseDate.create('2026-01-01').toString()).toBe('2026-01-01')
    })
  })

  describe('異常系', () => {
    it('フォーマット違反 (YYYY/MM/DD) はエラー', () => {
      expect(() => ExpenseDate.create('2026/03/22')).toThrow(/YYYY-MM-DD/)
    })

    it('不完全な日付はエラー', () => {
      expect(() => ExpenseDate.create('2026-03')).toThrow()
    })

    it('空文字はエラー', () => {
      expect(() => ExpenseDate.create('')).toThrow()
    })

    it('無効な日付値はエラー', () => {
      expect(() => ExpenseDate.create('2026-13-01')).toThrow()
    })
  })

  describe('等値性', () => {
    it('同じ日付は等しい', () => {
      expect(ExpenseDate.create('2026-03-22').equals(ExpenseDate.create('2026-03-22'))).toBe(true)
    })

    it('異なる日付は等しくない', () => {
      expect(ExpenseDate.create('2026-03-22').equals(ExpenseDate.create('2026-03-23'))).toBe(false)
    })
  })
})

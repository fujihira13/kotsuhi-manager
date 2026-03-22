import { SortOrder } from './sort-order.vo'

describe('SortOrder', () => {
  describe('正常系', () => {
    it('0 で生成できる（最小値）', () => {
      expect(SortOrder.create(0).value).toBe(0)
    })

    it('正の整数で生成できる', () => {
      expect(SortOrder.create(5).value).toBe(5)
    })
  })

  describe('異常系', () => {
    it('負の数はエラー', () => {
      expect(() => SortOrder.create(-1)).toThrow(/non-negative/)
    })

    it('小数はエラー', () => {
      expect(() => SortOrder.create(1.5)).toThrow()
    })
  })

  describe('等値性', () => {
    it('同じ順序は等しい', () => {
      expect(SortOrder.create(3).equals(SortOrder.create(3))).toBe(true)
    })

    it('異なる順序は等しくない', () => {
      expect(SortOrder.create(1).equals(SortOrder.create(2))).toBe(false)
    })
  })
})

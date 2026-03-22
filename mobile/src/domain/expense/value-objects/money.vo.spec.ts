import { Money } from './money.vo'

describe('Money', () => {
  describe('正常系', () => {
    it('最小値 (1) で生成できる', () => {
      expect(Money.create(1).value).toBe(1)
    })

    it('通常の金額で生成できる', () => {
      expect(Money.create(1000).value).toBe(1000)
    })

    it('大きな値でも生成できる', () => {
      expect(Money.create(1_000_000).value).toBe(1_000_000)
    })

    it('toString() が文字列を返す', () => {
      expect(Money.create(500).toString()).toBe('500')
    })
  })

  describe('異常系', () => {
    it('0 は不可', () => {
      expect(() => Money.create(0)).toThrow(/positive integer/)
    })

    it('負の数は不可', () => {
      expect(() => Money.create(-1)).toThrow()
    })

    it('小数は不可', () => {
      expect(() => Money.create(1.5)).toThrow()
    })

    it('NaN は不可', () => {
      expect(() => Money.create(NaN)).toThrow()
    })
  })

  describe('等値性', () => {
    it('同じ金額は等しい', () => {
      expect(Money.create(100).equals(Money.create(100))).toBe(true)
    })

    it('異なる金額は等しくない', () => {
      expect(Money.create(100).equals(Money.create(200))).toBe(false)
    })
  })
})

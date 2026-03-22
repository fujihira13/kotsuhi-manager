import { Satisfaction } from './satisfaction.vo'

describe('Satisfaction', () => {
  describe('正常系', () => {
    it.each([1, 2, 3, 4, 5])('%i で生成できる', (val) => {
      expect(Satisfaction.create(val).value).toBe(val)
    })
  })

  describe('異常系', () => {
    it('0 は不可', () => {
      expect(() => Satisfaction.create(0)).toThrow(/1 and 5/)
    })

    it('6 は不可', () => {
      expect(() => Satisfaction.create(6)).toThrow(/1 and 5/)
    })

    it('小数は不可', () => {
      expect(() => Satisfaction.create(2.5)).toThrow()
    })

    it('負の数は不可', () => {
      expect(() => Satisfaction.create(-1)).toThrow()
    })
  })

  describe('等値性', () => {
    it('同じ値は等しい', () => {
      expect(Satisfaction.create(3).equals(Satisfaction.create(3))).toBe(true)
    })

    it('異なる値は等しくない', () => {
      expect(Satisfaction.create(3).equals(Satisfaction.create(5))).toBe(false)
    })
  })
})

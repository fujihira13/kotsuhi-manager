import { Category } from './category.vo'

describe('Category', () => {
  describe('正常系', () => {
    it('"transportation" で生成できる', () => {
      const category = Category.create('transportation')
      expect(category.value).toBe('transportation')
    })

    it('"entertainment" で生成できる', () => {
      const category = Category.create('entertainment')
      expect(category.value).toBe('entertainment')
    })

    it('toString() が値を返す', () => {
      expect(Category.create('transportation').toString()).toBe('transportation')
    })
  })

  describe('異常系', () => {
    it('無効な値はエラーになる', () => {
      expect(() => Category.create('food')).toThrow(
        "Invalid category: food. Must be 'transportation' or 'entertainment'.",
      )
    })

    it('空文字はエラーになる', () => {
      expect(() => Category.create('')).toThrow()
    })
  })

  describe('等値性', () => {
    it('同じ値は等しい', () => {
      expect(Category.create('transportation').equals(Category.create('transportation'))).toBe(true)
    })

    it('異なる値は等しくない', () => {
      expect(Category.create('transportation').equals(Category.create('entertainment'))).toBe(false)
    })
  })
})

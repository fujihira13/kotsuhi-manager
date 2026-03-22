import { Category } from './category.vo'
import { Subcategory } from './subcategory.vo'

describe('Subcategory', () => {
  const transportation = Category.create('transportation')
  const entertainment = Category.create('entertainment')

  describe('正常系 - transportation', () => {
    it.each(['train', 'bus', 'taxi', 'parking', 'other'])(
      '"transportation" + "%s" で生成できる',
      (sub) => {
        const subcategory = Subcategory.create(sub, transportation)
        expect(subcategory.value).toBe(sub)
      },
    )
  })

  describe('正常系 - entertainment', () => {
    it.each(['meal', 'cafe', 'drink', 'gift', 'entertainment', 'other'])(
      '"entertainment" + "%s" で生成できる',
      (sub) => {
        const subcategory = Subcategory.create(sub, entertainment)
        expect(subcategory.value).toBe(sub)
      },
    )
  })

  describe('異常系', () => {
    it('transportation に entertainment のサブ区分は不可', () => {
      expect(() => Subcategory.create('meal', transportation)).toThrow(/Invalid subcategory/)
    })

    it('entertainment に transportation のサブ区分は不可', () => {
      expect(() => Subcategory.create('train', entertainment)).toThrow(/Invalid subcategory/)
    })

    it('存在しないサブ区分はエラー', () => {
      expect(() => Subcategory.create('airplane', transportation)).toThrow(/Invalid subcategory/)
    })
  })

  describe('validValues()', () => {
    it('transportation の有効値を返す', () => {
      expect(Subcategory.validValues(transportation)).toEqual([
        'train',
        'bus',
        'taxi',
        'parking',
        'other',
      ])
    })

    it('entertainment の有効値を返す', () => {
      expect(Subcategory.validValues(entertainment)).toEqual([
        'meal',
        'cafe',
        'drink',
        'gift',
        'entertainment',
        'other',
      ])
    })
  })

  describe('等値性', () => {
    it('同じ値は等しい', () => {
      expect(Subcategory.create('train', transportation).equals(Subcategory.create('train', transportation))).toBe(true)
    })

    it('異なる値は等しくない', () => {
      expect(Subcategory.create('train', transportation).equals(Subcategory.create('bus', transportation))).toBe(false)
    })
  })
})

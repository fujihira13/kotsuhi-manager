import { TemplateEntity } from './template.entity'

const BASE_PARAMS = {
  name: 'JR通勤',
  category: 'transportation',
  subcategory: 'train',
  sortOrder: 0,
}

describe('TemplateEntity', () => {
  describe('create()', () => {
    describe('正常系', () => {
      it('必須項目のみで生成できる', () => {
        const template = TemplateEntity.create(BASE_PARAMS)
        expect(template.id.toString()).toMatch(/^[0-9a-f-]{36}$/)
        expect(template.name).toBe('JR通勤')
        expect(template.category.value).toBe('transportation')
        expect(template.subcategory.value).toBe('train')
        expect(template.amount).toBeNull()
        expect(template.memoTemplate).toBeNull()
        expect(template.sortOrder.value).toBe(0)
      })

      it('任意項目（amount, memoTemplate）を含めて生成できる', () => {
        const template = TemplateEntity.create({
          ...BASE_PARAMS,
          amount: 230,
          memoTemplate: '定期区間外',
        })
        expect(template.amount?.value).toBe(230)
        expect(template.memoTemplate).toBe('定期区間外')
      })

      it('name が trim される', () => {
        const template = TemplateEntity.create({ ...BASE_PARAMS, name: '  タクシー  ' })
        expect(template.name).toBe('タクシー')
      })

      it('交際費テンプレートを生成できる', () => {
        const template = TemplateEntity.create({
          name: '会食',
          category: 'entertainment',
          subcategory: 'meal',
          sortOrder: 1,
        })
        expect(template.category.value).toBe('entertainment')
        expect(template.subcategory.value).toBe('meal')
      })
    })

    describe('異常系', () => {
      it('空の name はエラー', () => {
        expect(() => TemplateEntity.create({ ...BASE_PARAMS, name: '' })).toThrow(/empty/)
      })

      it('空白のみの name はエラー', () => {
        expect(() => TemplateEntity.create({ ...BASE_PARAMS, name: '   ' })).toThrow(/empty/)
      })

      it('無効な category はエラー', () => {
        expect(() => TemplateEntity.create({ ...BASE_PARAMS, category: 'food' })).toThrow()
      })

      it('category と subcategory の組み合わせ不正はエラー', () => {
        expect(() =>
          TemplateEntity.create({ ...BASE_PARAMS, category: 'entertainment', subcategory: 'train' }),
        ).toThrow(/Invalid subcategory/)
      })

      it('amount 0 はエラー', () => {
        expect(() => TemplateEntity.create({ ...BASE_PARAMS, amount: 0 })).toThrow()
      })

      it('sortOrder が負の数はエラー', () => {
        expect(() => TemplateEntity.create({ ...BASE_PARAMS, sortOrder: -1 })).toThrow()
      })
    })
  })

  describe('update()', () => {
    it('name を更新できる', () => {
      const original = TemplateEntity.create(BASE_PARAMS)
      const updated = original.update({ name: '新幹線' })
      expect(updated.name).toBe('新幹線')
    })

    it('amount を null にクリアできる', () => {
      const template = TemplateEntity.create({ ...BASE_PARAMS, amount: 500 })
      const updated = template.update({ amount: null })
      expect(updated.amount).toBeNull()
    })

    it('空白のみの name への更新はエラー', () => {
      const template = TemplateEntity.create(BASE_PARAMS)
      expect(() => template.update({ name: '   ' })).toThrow(/empty/)
    })

    it('update() は元の Entity を変更しない（イミュータブル）', () => {
      const original = TemplateEntity.create(BASE_PARAMS)
      original.update({ name: '変更後' })
      expect(original.name).toBe('JR通勤')
    })
  })

  describe('toExpenseInput()', () => {
    it('amount 設定済みテンプレートから支出入力値を生成できる', () => {
      const template = TemplateEntity.create({ ...BASE_PARAMS, amount: 230, memoTemplate: '定期外' })
      const input = template.toExpenseInput()
      expect(input.category).toBe('transportation')
      expect(input.subcategory).toBe('train')
      expect(input.amount).toBe(230)
      expect(input.memo).toBe('定期外')
    })

    it('amount 未設定テンプレートは amount が null になる', () => {
      const template = TemplateEntity.create(BASE_PARAMS)
      const input = template.toExpenseInput()
      expect(input.amount).toBeNull()
    })
  })
})

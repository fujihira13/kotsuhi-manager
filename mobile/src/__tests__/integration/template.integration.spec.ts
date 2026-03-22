import { TemplateNotFoundError } from '@/src/domain/template/errors/template-not-found.error'
import { TemplateId } from '@/src/domain/template/value-objects/template-id.vo'
import { CreateTemplateUseCase } from '@/src/application/template/create-template/create-template.usecase'
import { UpdateTemplateUseCase } from '@/src/application/template/update-template/update-template.usecase'
import { DeleteTemplateUseCase } from '@/src/application/template/delete-template/delete-template.usecase'
import { ListTemplatesUseCase } from '@/src/application/template/list-templates/list-templates.usecase'
import { ReorderTemplatesUseCase } from '@/src/application/template/reorder-templates/reorder-templates.usecase'
import { DrizzleTemplateRepository } from '@/src/infrastructure/persistence/sqlite/template.repository.impl'
import { createTestDatabase } from './test-database'

describe('Template 統合テスト', () => {
  const db = createTestDatabase()
  const templateRepo = new DrizzleTemplateRepository(db)

  const createUseCase = new CreateTemplateUseCase(templateRepo)
  const updateUseCase = new UpdateTemplateUseCase(templateRepo)
  const deleteUseCase = new DeleteTemplateUseCase(templateRepo)
  const listUseCase = new ListTemplatesUseCase(templateRepo)
  const reorderUseCase = new ReorderTemplatesUseCase(templateRepo)

  beforeEach(async () => {
    await templateRepo.deleteAll()
  })

  describe('CreateTemplateUseCase', () => {
    it('必須項目のみでテンプレートを作成・保存できる', async () => {
      const result = await createUseCase.execute({
        name: '電車代',
        category: 'transportation',
        subcategory: 'train',
      })

      expect(result.id).toMatch(/^[0-9a-f-]{36}$/)
      const saved = await templateRepo.findById(TemplateId.create(result.id))
      expect(saved).not.toBeNull()
      expect(saved!.name).toBe('電車代')
      expect(saved!.category.value).toBe('transportation')
      expect(saved!.subcategory.value).toBe('train')
      expect(saved!.amount).toBeNull()
      expect(saved!.memoTemplate).toBeNull()
      expect(saved!.sortOrder.value).toBe(0) // 最初のテンプレートは sortOrder=0
    })

    it('任意項目（amount, memoTemplate）を含めて保存できる', async () => {
      const result = await createUseCase.execute({
        name: '会議費',
        category: 'entertainment',
        subcategory: 'meal',
        amount: 1500,
        memoTemplate: '会議後の食事',
      })

      const saved = await templateRepo.findById(TemplateId.create(result.id))
      expect(saved!.amount?.value).toBe(1500)
      expect(saved!.memoTemplate).toBe('会議後の食事')
    })

    it('複数登録すると sortOrder が末尾に自動追加される', async () => {
      const first = await createUseCase.execute({
        name: 'テンプレート1',
        category: 'transportation',
        subcategory: 'train',
      })
      const second = await createUseCase.execute({
        name: 'テンプレート2',
        category: 'entertainment',
        subcategory: 'meal',
      })
      const third = await createUseCase.execute({
        name: 'テンプレート3',
        category: 'transportation',
        subcategory: 'bus',
      })

      const firstSaved = await templateRepo.findById(TemplateId.create(first.id))
      const secondSaved = await templateRepo.findById(TemplateId.create(second.id))
      const thirdSaved = await templateRepo.findById(TemplateId.create(third.id))

      expect(firstSaved!.sortOrder.value).toBe(0)
      expect(secondSaved!.sortOrder.value).toBe(1)
      expect(thirdSaved!.sortOrder.value).toBe(2)
    })
  })

  describe('UpdateTemplateUseCase', () => {
    it('名前と金額を更新できる', async () => {
      const { id } = await createUseCase.execute({
        name: '電車代',
        category: 'transportation',
        subcategory: 'train',
      })

      await updateUseCase.execute({ id, name: '電車代（更新）', amount: 800 })

      const updated = await templateRepo.findById(TemplateId.create(id))
      expect(updated!.name).toBe('電車代（更新）')
      expect(updated!.amount?.value).toBe(800)
      expect(updated!.category.value).toBe('transportation') // 変更なし
    })

    it('存在しない ID で TemplateNotFoundError がスローされる', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440999'
      await expect(updateUseCase.execute({ id: fakeId, name: '更新' })).rejects.toThrow(
        TemplateNotFoundError,
      )
    })
  })

  describe('DeleteTemplateUseCase', () => {
    it('テンプレートを削除できる', async () => {
      const { id } = await createUseCase.execute({
        name: '削除対象',
        category: 'transportation',
        subcategory: 'taxi',
      })

      await deleteUseCase.execute({ id })

      const found = await templateRepo.findById(TemplateId.create(id))
      expect(found).toBeNull()
    })

    it('存在しない ID で TemplateNotFoundError がスローされる', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440999'
      await expect(deleteUseCase.execute({ id: fakeId })).rejects.toThrow(TemplateNotFoundError)
    })
  })

  describe('ListTemplatesUseCase', () => {
    it('sortOrder 昇順で全テンプレートを取得できる', async () => {
      await createUseCase.execute({
        name: 'テンプレートA',
        category: 'transportation',
        subcategory: 'train',
      })
      await createUseCase.execute({
        name: 'テンプレートB',
        category: 'entertainment',
        subcategory: 'meal',
      })
      await createUseCase.execute({
        name: 'テンプレートC',
        category: 'transportation',
        subcategory: 'bus',
      })

      const result = await listUseCase.execute()

      expect(result).toHaveLength(3)
      expect(result[0].name).toBe('テンプレートA')
      expect(result[0].sortOrder).toBe(0)
      expect(result[1].name).toBe('テンプレートB')
      expect(result[1].sortOrder).toBe(1)
      expect(result[2].name).toBe('テンプレートC')
      expect(result[2].sortOrder).toBe(2)
    })

    it('テンプレートが 0 件の場合、空配列を返す', async () => {
      const result = await listUseCase.execute()
      expect(result).toHaveLength(0)
    })
  })

  describe('ReorderTemplatesUseCase', () => {
    it('指定した順序で sortOrder が更新される', async () => {
      const a = await createUseCase.execute({
        name: 'A',
        category: 'transportation',
        subcategory: 'train',
      })
      const b = await createUseCase.execute({
        name: 'B',
        category: 'entertainment',
        subcategory: 'meal',
      })
      const c = await createUseCase.execute({
        name: 'C',
        category: 'transportation',
        subcategory: 'bus',
      })

      // C → A → B の順に並び替え
      await reorderUseCase.execute({ orderedIds: [c.id, a.id, b.id] })

      const result = await listUseCase.execute()
      expect(result[0].name).toBe('C') // sortOrder=0
      expect(result[1].name).toBe('A') // sortOrder=1
      expect(result[2].name).toBe('B') // sortOrder=2
    })
  })
})

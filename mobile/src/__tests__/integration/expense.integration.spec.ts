import { ExpenseNotFoundError } from '@/src/domain/expense/errors/expense-not-found.error'
import { ExpenseEntity } from '@/src/domain/expense/expense.entity'
import { ExpenseId } from '@/src/domain/expense/value-objects/expense-id.vo'
import { ExpenseDate } from '@/src/domain/expense/value-objects/expense-date.vo'
import { Money } from '@/src/domain/expense/value-objects/money.vo'
import { Category } from '@/src/domain/shared/value-objects/category.vo'
import { Subcategory } from '@/src/domain/shared/value-objects/subcategory.vo'
import { CreateExpenseUseCase } from '@/src/application/expense/create-expense/create-expense.usecase'
import { UpdateExpenseUseCase } from '@/src/application/expense/update-expense/update-expense.usecase'
import { DeleteExpenseUseCase } from '@/src/application/expense/delete-expense/delete-expense.usecase'
import { GetExpenseByIdUseCase } from '@/src/application/expense/get-expense-by-id/get-expense-by-id.usecase'
import { ListExpensesUseCase } from '@/src/application/expense/list-expenses/list-expenses.usecase'
import { DrizzleExpenseRepository } from '@/src/infrastructure/persistence/sqlite/expense.repository.impl'
import { DrizzleLastInputRepository } from '@/src/infrastructure/persistence/sqlite/last-input.repository.impl'
import { createTestDatabase } from './test-database'

describe('Expense 統合テスト', () => {
  const db = createTestDatabase()
  const expenseRepo = new DrizzleExpenseRepository(db)
  const lastInputRepo = new DrizzleLastInputRepository(db)

  const createUseCase = new CreateExpenseUseCase(expenseRepo, lastInputRepo)
  const updateUseCase = new UpdateExpenseUseCase(expenseRepo)
  const deleteUseCase = new DeleteExpenseUseCase(expenseRepo)
  const getByIdUseCase = new GetExpenseByIdUseCase(expenseRepo)
  const listUseCase = new ListExpensesUseCase(expenseRepo)

  beforeEach(async () => {
    await expenseRepo.deleteAll()
    await lastInputRepo.clear()
  })

  describe('CreateExpenseUseCase', () => {
    it('必須項目のみで支出を作成・保存できる', async () => {
      const result = await createUseCase.execute({
        date: '2026-03-22',
        amount: 500,
        category: 'transportation',
        subcategory: 'train',
      })

      expect(result.id).toMatch(/^[0-9a-f-]{36}$/)
      const saved = await expenseRepo.findById(ExpenseId.create(result.id))
      expect(saved).not.toBeNull()
      expect(saved!.date.value).toBe('2026-03-22')
      expect(saved!.amount.value).toBe(500)
      expect(saved!.category.value).toBe('transportation')
      expect(saved!.subcategory.value).toBe('train')
      expect(saved!.memo).toBeNull()
      expect(saved!.satisfaction).toBeNull()
    })

    it('任意項目（memo, satisfaction）を含めて保存できる', async () => {
      const result = await createUseCase.execute({
        date: '2026-03-22',
        amount: 3000,
        category: 'entertainment',
        subcategory: 'meal',
        memo: '歓迎会',
        satisfaction: 4,
      })

      const saved = await expenseRepo.findById(ExpenseId.create(result.id))
      expect(saved!.memo).toBe('歓迎会')
      expect(saved!.satisfaction?.value).toBe(4)
    })

    it('副作用: LastInput が作成した支出の入力値で更新される', async () => {
      await createUseCase.execute({
        date: '2026-03-22',
        amount: 1500,
        category: 'entertainment',
        subcategory: 'cafe',
        memo: 'コーヒー代',
      })

      const lastInput = await lastInputRepo.get()
      expect(lastInput.category).toBe('entertainment')
      expect(lastInput.subcategory).toBe('cafe')
      expect(lastInput.memo).toBe('コーヒー代')
    })

    it('副作用: 2回目の作成で LastInput が最新の入力値に上書きされる', async () => {
      await createUseCase.execute({
        date: '2026-03-21',
        amount: 500,
        category: 'transportation',
        subcategory: 'train',
      })
      await createUseCase.execute({
        date: '2026-03-22',
        amount: 1000,
        category: 'entertainment',
        subcategory: 'drink',
        memo: '飲み会',
      })

      const lastInput = await lastInputRepo.get()
      expect(lastInput.category).toBe('entertainment')
      expect(lastInput.subcategory).toBe('drink')
      expect(lastInput.memo).toBe('飲み会')
    })
  })

  describe('UpdateExpenseUseCase', () => {
    it('金額と備考を更新できる', async () => {
      const { id } = await createUseCase.execute({
        date: '2026-03-22',
        amount: 500,
        category: 'transportation',
        subcategory: 'train',
      })

      await updateUseCase.execute({ id, amount: 800, memo: '乗り換えあり' })

      const updated = await expenseRepo.findById(ExpenseId.create(id))
      expect(updated!.amount.value).toBe(800)
      expect(updated!.memo).toBe('乗り換えあり')
      expect(updated!.category.value).toBe('transportation') // 変更なし
    })

    it('存在しない ID で ExpenseNotFoundError がスローされる', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440999'
      await expect(updateUseCase.execute({ id: fakeId, amount: 100 })).rejects.toThrow(
        ExpenseNotFoundError,
      )
    })
  })

  describe('DeleteExpenseUseCase', () => {
    it('支出を削除できる', async () => {
      const { id } = await createUseCase.execute({
        date: '2026-03-22',
        amount: 500,
        category: 'transportation',
        subcategory: 'bus',
      })

      await deleteUseCase.execute({ id })

      const found = await expenseRepo.findById(ExpenseId.create(id))
      expect(found).toBeNull()
    })

    it('存在しない ID で ExpenseNotFoundError がスローされる', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440999'
      await expect(deleteUseCase.execute({ id: fakeId })).rejects.toThrow(ExpenseNotFoundError)
    })
  })

  describe('GetExpenseByIdUseCase', () => {
    it('全フィールドを含む支出を取得できる', async () => {
      const { id } = await createUseCase.execute({
        date: '2026-03-22',
        amount: 2500,
        category: 'entertainment',
        subcategory: 'meal',
        memo: '会食',
        satisfaction: 5,
      })

      const result = await getByIdUseCase.execute({ id })

      expect(result.id).toBe(id)
      expect(result.date).toBe('2026-03-22')
      expect(result.amount).toBe(2500)
      expect(result.category).toBe('entertainment')
      expect(result.subcategory).toBe('meal')
      expect(result.memo).toBe('会食')
      expect(result.satisfaction).toBe(5)
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
    })

    it('存在しない ID で ExpenseNotFoundError がスローされる', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440999'
      await expect(getByIdUseCase.execute({ id: fakeId })).rejects.toThrow(ExpenseNotFoundError)
    })
  })

  describe('ListExpensesUseCase', () => {
    beforeEach(async () => {
      // テストデータを登録（異なる日付・カテゴリ）
      await createUseCase.execute({
        date: '2026-03-22',
        amount: 500,
        category: 'transportation',
        subcategory: 'train',
      })
      await createUseCase.execute({
        date: '2026-03-21',
        amount: 1000,
        category: 'entertainment',
        subcategory: 'meal',
      })
      await createUseCase.execute({
        date: '2026-02-15',
        amount: 300,
        category: 'transportation',
        subcategory: 'bus',
      })
    })

    it('フィルタなしで全件を日付降順で取得できる', async () => {
      const result = await listUseCase.execute({})

      expect(result).toHaveLength(3)
      expect(result[0].date).toBe('2026-03-22')
      expect(result[1].date).toBe('2026-03-21')
      expect(result[2].date).toBe('2026-02-15')
    })

    it('month フィルタで指定月のみ取得できる', async () => {
      const result = await listUseCase.execute({ month: '2026-03' })

      expect(result).toHaveLength(2)
      expect(result.every((e) => e.date.startsWith('2026-03'))).toBe(true)
    })

    it('category フィルタで transportation のみ取得できる', async () => {
      const result = await listUseCase.execute({ category: 'transportation' })

      expect(result).toHaveLength(2)
      expect(result.every((e) => e.category === 'transportation')).toBe(true)
    })

    it('month + category 複合フィルタで絞り込める', async () => {
      const result = await listUseCase.execute({ month: '2026-03', category: 'transportation' })

      expect(result).toHaveLength(1)
      expect(result[0].date).toBe('2026-03-22')
      expect(result[0].category).toBe('transportation')
    })

    it('同日に複数登録した場合、createdAt 降順（新しい順）で返る', async () => {
      await expenseRepo.deleteAll()
      // 異なるタイムスタンプを持つエンティティを直接保存してタイムスタンプ差を保証する
      const cat1 = Category.create('transportation')
      const firstEntity = ExpenseEntity.reconstruct({
        id: ExpenseId.generate(),
        date: ExpenseDate.create('2026-03-22'),
        amount: Money.create(100),
        category: cat1,
        subcategory: Subcategory.create('train', cat1),
        memo: null,
        satisfaction: null,
        createdAt: new Date('2026-03-22T10:00:00.000Z'),
        updatedAt: new Date('2026-03-22T10:00:00.000Z'),
      })
      await expenseRepo.save(firstEntity)

      const cat2 = Category.create('entertainment')
      const secondEntity = ExpenseEntity.reconstruct({
        id: ExpenseId.generate(),
        date: ExpenseDate.create('2026-03-22'),
        amount: Money.create(200),
        category: cat2,
        subcategory: Subcategory.create('cafe', cat2),
        memo: null,
        satisfaction: null,
        createdAt: new Date('2026-03-22T11:00:00.000Z'),
        updatedAt: new Date('2026-03-22T11:00:00.000Z'),
      })
      await expenseRepo.save(secondEntity)

      const result = await listUseCase.execute({})
      expect(result[0].id).toBe(secondEntity.id.toString()) // 後のタイムスタンプが先
      expect(result[1].id).toBe(firstEntity.id.toString())
    })
  })
})

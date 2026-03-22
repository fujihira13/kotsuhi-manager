import { GetLastInputUseCase } from '@/src/application/last-input/get-last-input.usecase'
import { CreateExpenseUseCase } from '@/src/application/expense/create-expense/create-expense.usecase'
import { DrizzleExpenseRepository } from '@/src/infrastructure/persistence/sqlite/expense.repository.impl'
import { DrizzleLastInputRepository } from '@/src/infrastructure/persistence/sqlite/last-input.repository.impl'
import { createTestDatabase } from './test-database'

describe('LastInput 統合テスト', () => {
  const db = createTestDatabase()
  const expenseRepo = new DrizzleExpenseRepository(db)
  const lastInputRepo = new DrizzleLastInputRepository(db)

  const getLastInputUseCase = new GetLastInputUseCase(lastInputRepo)
  const createExpenseUseCase = new CreateExpenseUseCase(expenseRepo, lastInputRepo)

  beforeEach(async () => {
    await expenseRepo.deleteAll()
    await lastInputRepo.clear()
  })

  describe('GetLastInputUseCase', () => {
    it('前回入力値がない場合、全フィールドが null の初期値を返す', async () => {
      const result = await getLastInputUseCase.execute()

      expect(result.category).toBeNull()
      expect(result.subcategory).toBeNull()
      expect(result.memo).toBeNull()
    })

    it('支出を作成後、前回入力値が更新されている', async () => {
      await createExpenseUseCase.execute({
        date: '2026-03-22',
        amount: 1500,
        category: 'entertainment',
        subcategory: 'meal',
        memo: '会食費',
      })

      const result = await getLastInputUseCase.execute()
      expect(result.category).toBe('entertainment')
      expect(result.subcategory).toBe('meal')
      expect(result.memo).toBe('会食費')
    })

    it('memo なしで支出を作成した場合、前回入力の memo が null になる', async () => {
      await createExpenseUseCase.execute({
        date: '2026-03-22',
        amount: 500,
        category: 'transportation',
        subcategory: 'train',
      })

      const result = await getLastInputUseCase.execute()
      expect(result.category).toBe('transportation')
      expect(result.subcategory).toBe('train')
      expect(result.memo).toBeNull()
    })

    it('2回支出を作成すると、最後の支出の入力値が反映される', async () => {
      await createExpenseUseCase.execute({
        date: '2026-03-21',
        amount: 500,
        category: 'transportation',
        subcategory: 'train',
        memo: '電車代',
      })
      await createExpenseUseCase.execute({
        date: '2026-03-22',
        amount: 3000,
        category: 'entertainment',
        subcategory: 'drink',
        memo: '歓送迎会',
      })

      const result = await getLastInputUseCase.execute()
      expect(result.category).toBe('entertainment')
      expect(result.subcategory).toBe('drink')
      expect(result.memo).toBe('歓送迎会')
    })
  })
})

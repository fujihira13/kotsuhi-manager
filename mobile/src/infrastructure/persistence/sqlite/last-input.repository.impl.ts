import { eq } from 'drizzle-orm'
import type { Database } from './database'
import type { LastInput, LastInputRepository } from '@/src/application/last-input/last-input'
import { lastInput } from './schema'

const LAST_INPUT_ID = 1

export class DrizzleLastInputRepository implements LastInputRepository {
  constructor(private readonly db: Database) {}

  async get(): Promise<LastInput> {
    const result = await this.db
      .select()
      .from(lastInput)
      .where(eq(lastInput.id, LAST_INPUT_ID))
    if (!result[0]) {
      return { category: null, subcategory: null, memo: null, amount: null }
    }
    const record = result[0]
    return {
      category: (record.category as LastInput['category']) ?? null,
      subcategory: (record.subcategory as LastInput['subcategory']) ?? null,
      memo: record.memo ?? null,
      amount: record.amount ?? null,
    }
  }

  async save(data: LastInput): Promise<void> {
    await this.db
      .insert(lastInput)
      .values({
        id: LAST_INPUT_ID,
        category: data.category,
        subcategory: data.subcategory,
        memo: data.memo,
        amount: data.amount,
      })
      .onConflictDoUpdate({
        target: lastInput.id,
        set: {
          category: data.category,
          subcategory: data.subcategory,
          memo: data.memo,
          amount: data.amount,
        },
      })
  }

  async clear(): Promise<void> {
    await this.db.delete(lastInput).where(eq(lastInput.id, LAST_INPUT_ID))
  }
}

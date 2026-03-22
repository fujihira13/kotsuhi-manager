import { and, desc, eq, gte, like, lte } from 'drizzle-orm'
import type { Database } from './database'
import { Category } from '@/src/domain/shared/value-objects/category.vo'
import { Subcategory } from '@/src/domain/shared/value-objects/subcategory.vo'
import { ExpenseEntity } from '@/src/domain/expense/expense.entity'
import type { ExpenseRepository, ListExpensesFilter } from '@/src/domain/expense/expense.repository'
import { ExpenseId } from '@/src/domain/expense/value-objects/expense-id.vo'
import { ExpenseDate } from '@/src/domain/expense/value-objects/expense-date.vo'
import { Money } from '@/src/domain/expense/value-objects/money.vo'
import { Satisfaction } from '@/src/domain/expense/value-objects/satisfaction.vo'
import { expenses } from './schema'

export type ExpenseRecord = typeof expenses.$inferSelect

/** DBレコード → ドメインエンティティ */
export function toExpenseEntity(record: ExpenseRecord): ExpenseEntity {
  const category = Category.create(record.category)
  return ExpenseEntity.reconstruct({
    id: ExpenseId.create(record.id),
    date: ExpenseDate.create(record.date),
    amount: Money.create(record.amount),
    category,
    subcategory: Subcategory.create(record.subcategory, category),
    memo: record.memo ?? null,
    satisfaction: record.satisfaction != null ? Satisfaction.create(record.satisfaction) : null,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
  })
}

/** ドメインエンティティ → DBレコード */
export function toExpenseRecord(entity: ExpenseEntity): typeof expenses.$inferInsert {
  return {
    id: entity.id.toString(),
    date: entity.date.value,
    amount: entity.amount.value,
    category: entity.category.value,
    subcategory: entity.subcategory.value,
    memo: entity.memo,
    satisfaction: entity.satisfaction?.value ?? null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  }
}

export class DrizzleExpenseRepository implements ExpenseRepository {
  constructor(private readonly db: Database) {}

  async save(expense: ExpenseEntity): Promise<void> {
    await this.db.insert(expenses).values(toExpenseRecord(expense))
  }

  async findById(id: ExpenseId): Promise<ExpenseEntity | null> {
    const result = await this.db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id.toString()))
    return result[0] ? toExpenseEntity(result[0]) : null
  }

  /** 日付降順・同日内は createdAt 降順で返す */
  async findAll(filter?: ListExpensesFilter): Promise<ExpenseEntity[]> {
    const result = await this.db
      .select()
      .from(expenses)
      .where(
        and(
          filter?.month ? like(expenses.date, `${filter.month}-%`) : undefined,
          filter?.category ? eq(expenses.category, filter.category) : undefined,
        ),
      )
      .orderBy(desc(expenses.date), desc(expenses.createdAt))
    return result.map(toExpenseEntity)
  }

  /** 集計・頻出金額算出用：期間指定で取得する */
  async findByDateRange(from: string, to: string): Promise<ExpenseEntity[]> {
    const result = await this.db
      .select()
      .from(expenses)
      .where(and(gte(expenses.date, from), lte(expenses.date, to)))
      .orderBy(desc(expenses.date), desc(expenses.createdAt))
    return result.map(toExpenseEntity)
  }

  async update(expense: ExpenseEntity): Promise<void> {
    const record = toExpenseRecord(expense)
    await this.db.update(expenses).set(record).where(eq(expenses.id, record.id!))
  }

  async delete(id: ExpenseId): Promise<void> {
    await this.db.delete(expenses).where(eq(expenses.id, id.toString()))
  }

  async deleteAll(): Promise<void> {
    await this.db.delete(expenses)
  }
}

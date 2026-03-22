import { asc, eq } from 'drizzle-orm'
import type { Database } from './database'
import { Category } from '@/src/domain/shared/value-objects/category.vo'
import { Subcategory } from '@/src/domain/shared/value-objects/subcategory.vo'
import { Money } from '@/src/domain/expense/value-objects/money.vo'
import { SortOrder } from '@/src/domain/template/value-objects/sort-order.vo'
import { TemplateEntity } from '@/src/domain/template/template.entity'
import type { TemplateRepository } from '@/src/domain/template/template.repository'
import { TemplateId } from '@/src/domain/template/value-objects/template-id.vo'
import { templates } from './schema'

export type TemplateRecord = typeof templates.$inferSelect

/** DBレコード → ドメインエンティティ */
export function toTemplateEntity(record: TemplateRecord): TemplateEntity {
  const category = Category.create(record.category)
  return TemplateEntity.reconstruct({
    id: TemplateId.create(record.id),
    name: record.name,
    category,
    subcategory: Subcategory.create(record.subcategory, category),
    amount: record.amount != null ? Money.create(record.amount) : null,
    memoTemplate: record.memoTemplate ?? null,
    sortOrder: SortOrder.create(record.sortOrder),
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
  })
}

/** ドメインエンティティ → DBレコード */
export function toTemplateRecord(entity: TemplateEntity): typeof templates.$inferInsert {
  return {
    id: entity.id.toString(),
    name: entity.name,
    category: entity.category.value,
    subcategory: entity.subcategory.value,
    amount: entity.amount?.value ?? null,
    memoTemplate: entity.memoTemplate,
    sortOrder: entity.sortOrder.value,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  }
}

export class DrizzleTemplateRepository implements TemplateRepository {
  constructor(private readonly db: Database) {}

  async save(template: TemplateEntity): Promise<void> {
    await this.db.insert(templates).values(toTemplateRecord(template))
  }

  async findById(id: TemplateId): Promise<TemplateEntity | null> {
    const result = await this.db
      .select()
      .from(templates)
      .where(eq(templates.id, id.toString()))
    return result[0] ? toTemplateEntity(result[0]) : null
  }

  /** sortOrder 昇順で返す */
  async findAll(): Promise<TemplateEntity[]> {
    const result = await this.db.select().from(templates).orderBy(asc(templates.sortOrder))
    return result.map(toTemplateEntity)
  }

  async update(template: TemplateEntity): Promise<void> {
    const record = toTemplateRecord(template)
    await this.db.update(templates).set(record).where(eq(templates.id, record.id!))
  }

  async delete(id: TemplateId): Promise<void> {
    await this.db.delete(templates).where(eq(templates.id, id.toString()))
  }

  /** 並び替え：複数テンプレートの sortOrder を一括更新する */
  async updateSortOrders(orders: { id: TemplateId; sortOrder: number }[]): Promise<void> {
    const now = new Date().toISOString()
    for (const order of orders) {
      await this.db
        .update(templates)
        .set({ sortOrder: order.sortOrder, updatedAt: now })
        .where(eq(templates.id, order.id.toString()))
    }
  }

  async deleteAll(): Promise<void> {
    await this.db.delete(templates)
  }
}

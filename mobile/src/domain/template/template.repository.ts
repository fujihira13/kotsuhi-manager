import { TemplateEntity } from './template.entity'
import { TemplateId } from './value-objects/template-id.vo'

export interface TemplateRepository {
  save(template: TemplateEntity): Promise<void>
  findById(id: TemplateId): Promise<TemplateEntity | null>
  /** sortOrder 昇順で返す */
  findAll(): Promise<TemplateEntity[]>
  update(template: TemplateEntity): Promise<void>
  delete(id: TemplateId): Promise<void>
  /** 並び替え：複数テンプレートの sortOrder を一括更新する */
  updateSortOrders(orders: { id: TemplateId; sortOrder: number }[]): Promise<void>
  deleteAll(): Promise<void>
}

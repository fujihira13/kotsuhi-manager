import { Category } from '../shared/value-objects/category.vo'
import { Subcategory } from '../shared/value-objects/subcategory.vo'
import { Money } from '../expense/value-objects/money.vo'
import { SortOrder } from './value-objects/sort-order.vo'
import { TemplateId } from './value-objects/template-id.vo'

export interface TemplateProps {
  id: TemplateId
  name: string
  category: Category
  subcategory: Subcategory
  amount: Money | null
  memoTemplate: string | null
  sortOrder: SortOrder
  createdAt: Date
  updatedAt: Date
}

export interface CreateTemplateParams {
  name: string
  category: string
  subcategory: string
  amount?: number | null
  memoTemplate?: string | null
  sortOrder: number
}

export interface UpdateTemplateParams {
  name?: string
  category?: string
  subcategory?: string
  amount?: number | null
  memoTemplate?: string | null
  sortOrder?: number
}

export class TemplateEntity {
  private readonly props: TemplateProps

  private constructor(props: TemplateProps) {
    this.props = props
  }

  static create(params: CreateTemplateParams): TemplateEntity {
    if (!params.name || params.name.trim().length === 0) {
      throw new Error('Template name cannot be empty or whitespace only.')
    }
    const category = Category.create(params.category)
    const subcategory = Subcategory.create(params.subcategory, category)
    const now = new Date()

    return new TemplateEntity({
      id: TemplateId.generate(),
      name: params.name.trim(),
      category,
      subcategory,
      amount: params.amount != null ? Money.create(params.amount) : null,
      memoTemplate: params.memoTemplate ?? null,
      sortOrder: SortOrder.create(params.sortOrder),
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstruct(props: TemplateProps): TemplateEntity {
    return new TemplateEntity(props)
  }

  update(params: UpdateTemplateParams): TemplateEntity {
    if (params.name !== undefined && params.name.trim().length === 0) {
      throw new Error('Template name cannot be empty or whitespace only.')
    }
    const category = params.category ? Category.create(params.category) : this.props.category
    const subcategory = params.subcategory
      ? Subcategory.create(params.subcategory, category)
      : this.props.subcategory

    return new TemplateEntity({
      ...this.props,
      name: params.name !== undefined ? params.name.trim() : this.props.name,
      category,
      subcategory,
      amount:
        params.amount !== undefined
          ? params.amount != null
            ? Money.create(params.amount)
            : null
          : this.props.amount,
      memoTemplate:
        params.memoTemplate !== undefined ? params.memoTemplate : this.props.memoTemplate,
      sortOrder:
        params.sortOrder !== undefined ? SortOrder.create(params.sortOrder) : this.props.sortOrder,
      updatedAt: new Date(),
    })
  }

  get id(): TemplateId {
    return this.props.id
  }
  get name(): string {
    return this.props.name
  }
  get category(): Category {
    return this.props.category
  }
  get subcategory(): Subcategory {
    return this.props.subcategory
  }
  get amount(): Money | null {
    return this.props.amount
  }
  get memoTemplate(): string | null {
    return this.props.memoTemplate
  }
  get sortOrder(): SortOrder {
    return this.props.sortOrder
  }
  get createdAt(): Date {
    return this.props.createdAt
  }
  get updatedAt(): Date {
    return this.props.updatedAt
  }
}

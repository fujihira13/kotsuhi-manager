import { Category } from '../shared/value-objects/category.vo'
import { Subcategory } from '../shared/value-objects/subcategory.vo'
import { ExpenseDate } from './value-objects/expense-date.vo'
import { ExpenseId } from './value-objects/expense-id.vo'
import { Money } from './value-objects/money.vo'
import { Satisfaction } from './value-objects/satisfaction.vo'

export interface ExpenseProps {
  id: ExpenseId
  date: ExpenseDate
  amount: Money
  category: Category
  subcategory: Subcategory
  memo: string | null
  satisfaction: Satisfaction | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateExpenseParams {
  date: string
  amount: number
  category: string
  subcategory: string
  memo?: string | null
  satisfaction?: number | null
}

export interface UpdateExpenseParams {
  date?: string
  amount?: number
  category?: string
  subcategory?: string
  memo?: string | null
  satisfaction?: number | null
}

export class ExpenseEntity {
  private readonly props: ExpenseProps

  private constructor(props: ExpenseProps) {
    this.props = props
  }

  /**
   * 新規支出を生成する。不変条件の検証を行う。
   * ドメインイベント: ExpenseCreated を発行する想定（アプリケーション層で処理）
   */
  static create(params: CreateExpenseParams): ExpenseEntity {
    const category = Category.create(params.category)
    const subcategory = Subcategory.create(params.subcategory, category)
    const now = new Date()

    return new ExpenseEntity({
      id: ExpenseId.generate(),
      date: ExpenseDate.create(params.date),
      amount: Money.create(params.amount),
      category,
      subcategory,
      memo: params.memo ?? null,
      satisfaction: params.satisfaction != null ? Satisfaction.create(params.satisfaction) : null,
      createdAt: now,
      updatedAt: now,
    })
  }

  /** DBから復元する（バリデーションスキップ） */
  static reconstruct(props: ExpenseProps): ExpenseEntity {
    return new ExpenseEntity(props)
  }

  /** 支出を更新した新しい ExpenseEntity を返す（イミュータブル） */
  update(params: UpdateExpenseParams): ExpenseEntity {
    const category = params.category ? Category.create(params.category) : this.props.category
    const subcategory = params.subcategory
      ? Subcategory.create(params.subcategory, category)
      : this.props.subcategory

    return new ExpenseEntity({
      ...this.props,
      date: params.date !== undefined ? ExpenseDate.create(params.date) : this.props.date,
      amount: params.amount !== undefined ? Money.create(params.amount) : this.props.amount,
      category,
      subcategory,
      memo: params.memo !== undefined ? params.memo : this.props.memo,
      satisfaction:
        params.satisfaction !== undefined
          ? params.satisfaction != null
            ? Satisfaction.create(params.satisfaction)
            : null
          : this.props.satisfaction,
      updatedAt: new Date(),
    })
  }

  get id(): ExpenseId {
    return this.props.id
  }
  get date(): ExpenseDate {
    return this.props.date
  }
  get amount(): Money {
    return this.props.amount
  }
  get category(): Category {
    return this.props.category
  }
  get subcategory(): Subcategory {
    return this.props.subcategory
  }
  get memo(): string | null {
    return this.props.memo
  }
  get satisfaction(): Satisfaction | null {
    return this.props.satisfaction
  }
  get createdAt(): Date {
    return this.props.createdAt
  }
  get updatedAt(): Date {
    return this.props.updatedAt
  }
}

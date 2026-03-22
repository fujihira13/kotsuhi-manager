export type CategoryValue = 'transportation' | 'entertainment'

export class Category {
  private constructor(readonly value: CategoryValue) {}

  static create(value: string): Category {
    if (value !== 'transportation' && value !== 'entertainment') {
      throw new Error(`Invalid category: ${value}. Must be 'transportation' or 'entertainment'.`)
    }
    return new Category(value as CategoryValue)
  }

  toString(): string {
    return this.value
  }

  equals(other: Category): boolean {
    return this.value === other.value
  }
}

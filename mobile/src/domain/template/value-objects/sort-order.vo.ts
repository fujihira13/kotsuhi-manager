export class SortOrder {
  private constructor(readonly value: number) {}

  static create(value: number): SortOrder {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error(`Invalid sort order: ${value}. Must be a non-negative integer.`)
    }
    return new SortOrder(value)
  }

  equals(other: SortOrder): boolean {
    return this.value === other.value
  }
}

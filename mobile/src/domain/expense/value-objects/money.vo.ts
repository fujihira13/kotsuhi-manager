export class Money {
  private constructor(readonly value: number) {}

  static create(value: number): Money {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error(`Invalid money value: ${value}. Must be a positive integer (>= 1).`)
    }
    return new Money(value)
  }

  toString(): string {
    return this.value.toString()
  }

  equals(other: Money): boolean {
    return this.value === other.value
  }
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export class ExpenseDate {
  private constructor(readonly value: string) {}

  static create(value: string): ExpenseDate {
    if (!DATE_REGEX.test(value)) {
      throw new Error(`Invalid date format: ${value}. Expected YYYY-MM-DD.`)
    }
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${value}`)
    }
    return new ExpenseDate(value)
  }

  toString(): string {
    return this.value
  }

  equals(other: ExpenseDate): boolean {
    return this.value === other.value
  }
}

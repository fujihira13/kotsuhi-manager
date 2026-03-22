const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export class ExpenseId {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static create(value: string): ExpenseId {
    if (!value || value.trim().length === 0) {
      throw new Error('ExpenseId cannot be empty')
    }
    if (!UUID_REGEX.test(value)) {
      throw new Error(`Invalid ExpenseId format: ${value}`)
    }
    return new ExpenseId(value)
  }

  static generate(): ExpenseId {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    return new ExpenseId(uuid);
  }

  toString(): string {
    return this.value
  }

  equals(other: ExpenseId): boolean {
    return this.value === other.value
  }
}

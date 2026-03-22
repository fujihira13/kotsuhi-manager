export type SatisfactionValue = 1 | 2 | 3 | 4 | 5

export class Satisfaction {
  private constructor(readonly value: SatisfactionValue) {}

  static create(value: number): Satisfaction {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new Error(`Invalid satisfaction value: ${value}. Must be an integer between 1 and 5.`)
    }
    return new Satisfaction(value as SatisfactionValue)
  }

  toString(): string {
    return this.value.toString()
  }

  equals(other: Satisfaction): boolean {
    return this.value === other.value
  }
}

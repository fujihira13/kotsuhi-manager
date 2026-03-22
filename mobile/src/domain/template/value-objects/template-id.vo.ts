const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export class TemplateId {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static create(value: string): TemplateId {
    if (!value || value.trim().length === 0) {
      throw new Error('TemplateId cannot be empty')
    }
    if (!UUID_REGEX.test(value)) {
      throw new Error(`Invalid TemplateId format: ${value}`)
    }
    return new TemplateId(value)
  }

  static generate(): TemplateId {
    return new TemplateId(crypto.randomUUID())
  }

  toString(): string {
    return this.value
  }

  equals(other: TemplateId): boolean {
    return this.value === other.value
  }
}

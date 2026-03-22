import { Category } from './category.vo'

export type TransportationSubcategoryValue = 'train' | 'bus' | 'taxi' | 'parking' | 'other'
export type EntertainmentSubcategoryValue =
  | 'meal'
  | 'cafe'
  | 'drink'
  | 'gift'
  | 'entertainment'
  | 'other'
export type SubcategoryValue = TransportationSubcategoryValue | EntertainmentSubcategoryValue

const TRANSPORTATION_SUBCATEGORIES: readonly TransportationSubcategoryValue[] = [
  'train',
  'bus',
  'taxi',
  'parking',
  'other',
]

const ENTERTAINMENT_SUBCATEGORIES: readonly EntertainmentSubcategoryValue[] = [
  'meal',
  'cafe',
  'drink',
  'gift',
  'entertainment',
  'other',
]

export class Subcategory {
  private constructor(readonly value: SubcategoryValue) {}

  static create(value: string, category: Category): Subcategory {
    if (category.value === 'transportation') {
      if (!TRANSPORTATION_SUBCATEGORIES.includes(value as TransportationSubcategoryValue)) {
        throw new Error(
          `Invalid subcategory '${value}' for transportation. Valid values: ${TRANSPORTATION_SUBCATEGORIES.join(', ')}`,
        )
      }
    } else {
      if (!ENTERTAINMENT_SUBCATEGORIES.includes(value as EntertainmentSubcategoryValue)) {
        throw new Error(
          `Invalid subcategory '${value}' for entertainment. Valid values: ${ENTERTAINMENT_SUBCATEGORIES.join(', ')}`,
        )
      }
    }
    return new Subcategory(value as SubcategoryValue)
  }

  static validValues(category: Category): readonly SubcategoryValue[] {
    return category.value === 'transportation'
      ? TRANSPORTATION_SUBCATEGORIES
      : ENTERTAINMENT_SUBCATEGORIES
  }

  toString(): string {
    return this.value
  }

  equals(other: Subcategory): boolean {
    return this.value === other.value
  }
}

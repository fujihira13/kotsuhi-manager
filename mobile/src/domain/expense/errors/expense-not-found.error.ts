export class ExpenseNotFoundError extends Error {
  constructor(id: string) {
    super(`Expense not found: ${id}`)
    this.name = 'ExpenseNotFoundError'
  }
}

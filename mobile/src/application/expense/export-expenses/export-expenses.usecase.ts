import { File, Paths } from 'expo-file-system'
import Papa from 'papaparse'
import { ExpenseRepository } from '@/src/domain/expense/expense.repository'
import { CATEGORY_LABELS, SUBCATEGORY_LABELS } from '@/src/presentation/constants'
import { ExportExpensesQuery, ExportExpensesResult } from './export-expenses.query'

export class ExportExpensesUseCase {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(query: ExportExpensesQuery): Promise<ExportExpensesResult> {
    const expenses = await this.expenseRepository.findAll(
      query.month ? { month: query.month } : undefined,
    )

    const rows = expenses.map((e) => ({
      日付: e.date.value,
      金額: e.amount.value,
      カテゴリ: CATEGORY_LABELS[e.category.value],
      サブカテゴリ: SUBCATEGORY_LABELS[e.subcategory.value],
      メモ: e.memo ?? '',
      満足度: e.satisfaction ? e.satisfaction.value : '',
    }))

    const csv = Papa.unparse(rows, { header: true })

    const fileName = query.month
      ? `expenses-${query.month}.csv`
      : 'expenses-all.csv'

    const file = new File(Paths.cache, fileName)
    file.write(csv)

    return { fileUri: file.uri, fileName }
  }
}

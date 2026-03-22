/**
 * 依存性注入コンテナ（シングルトンパターン）
 * DB インスタンス → Repository → UseCase の順で組み立てる
 * UI 層はここからユースケースを import して使用する
 */
import { db } from '../persistence/sqlite/database'
import { DrizzleExpenseRepository } from '../persistence/sqlite/expense.repository.impl'
import { DrizzleTemplateRepository } from '../persistence/sqlite/template.repository.impl'
import { DrizzleLastInputRepository } from '../persistence/sqlite/last-input.repository.impl'

import { CreateExpenseUseCase } from '@/src/application/expense/create-expense/create-expense.usecase'
import { UpdateExpenseUseCase } from '@/src/application/expense/update-expense/update-expense.usecase'
import { DeleteExpenseUseCase } from '@/src/application/expense/delete-expense/delete-expense.usecase'
import { GetExpenseByIdUseCase } from '@/src/application/expense/get-expense-by-id/get-expense-by-id.usecase'
import { ListExpensesUseCase } from '@/src/application/expense/list-expenses/list-expenses.usecase'
import { GetSummaryUseCase } from '@/src/application/summary/get-summary/get-summary.usecase'
import { GetFrequentAmountsUseCase } from '@/src/application/frequent-amount/get-frequent-amounts/get-frequent-amounts.usecase'

import { CreateTemplateUseCase } from '@/src/application/template/create-template/create-template.usecase'
import { UpdateTemplateUseCase } from '@/src/application/template/update-template/update-template.usecase'
import { DeleteTemplateUseCase } from '@/src/application/template/delete-template/delete-template.usecase'
import { ListTemplatesUseCase } from '@/src/application/template/list-templates/list-templates.usecase'
import { ReorderTemplatesUseCase } from '@/src/application/template/reorder-templates/reorder-templates.usecase'

import { GetLastInputUseCase } from '@/src/application/last-input/get-last-input.usecase'
import { ClearAllDataUseCase } from '@/src/application/clear-all-data/clear-all-data.usecase'
import { ExportExpensesUseCase } from '@/src/application/expense/export-expenses/export-expenses.usecase'

// ── Repository ───────────────────────────────────────────────────────────────
const expenseRepository = new DrizzleExpenseRepository(db)
const templateRepository = new DrizzleTemplateRepository(db)
const lastInputRepository = new DrizzleLastInputRepository(db)

// ── Expense UseCase ──────────────────────────────────────────────────────────
export const createExpenseUseCase = new CreateExpenseUseCase(expenseRepository, lastInputRepository)
export const updateExpenseUseCase = new UpdateExpenseUseCase(expenseRepository)
export const deleteExpenseUseCase = new DeleteExpenseUseCase(expenseRepository)
export const getExpenseByIdUseCase = new GetExpenseByIdUseCase(expenseRepository)
export const listExpensesUseCase = new ListExpensesUseCase(expenseRepository)
export const getSummaryUseCase = new GetSummaryUseCase(expenseRepository)
export const getFrequentAmountsUseCase = new GetFrequentAmountsUseCase(expenseRepository)

// ── Template UseCase ─────────────────────────────────────────────────────────
export const createTemplateUseCase = new CreateTemplateUseCase(templateRepository)
export const updateTemplateUseCase = new UpdateTemplateUseCase(templateRepository)
export const deleteTemplateUseCase = new DeleteTemplateUseCase(templateRepository)
export const listTemplatesUseCase = new ListTemplatesUseCase(templateRepository)
export const reorderTemplatesUseCase = new ReorderTemplatesUseCase(templateRepository)

// ── LastInput UseCase ────────────────────────────────────────────────────────
export const getLastInputUseCase = new GetLastInputUseCase(lastInputRepository)

// ── Export UseCase ───────────────────────────────────────────────────────────
export const exportExpensesUseCase = new ExportExpensesUseCase(expenseRepository)

// ── ClearAllData UseCase ─────────────────────────────────────────────────────
export const clearAllDataUseCase = new ClearAllDataUseCase(
  expenseRepository,
  templateRepository,
  lastInputRepository,
)

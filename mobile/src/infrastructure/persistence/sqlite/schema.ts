import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * 支出テーブル
 * - category: 'transportation' | 'entertainment'
 * - subcategory: category に従属する小分類
 * - satisfaction: 1〜5 の整数（任意）
 */
export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  date: text('date').notNull(), // YYYY-MM-DD
  amount: integer('amount').notNull(), // 1 以上の正の整数
  category: text('category').notNull(), // 'transportation' | 'entertainment'
  subcategory: text('subcategory').notNull(),
  memo: text('memo'),
  satisfaction: integer('satisfaction'), // 1〜5 or null
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

/**
 * テンプレートテーブル
 * - amount: 未設定の場合 null（登録時に手入力）
 * - sortOrder: 0 以上の整数（並び順）
 */
export const templates = sqliteTable('templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'transportation' | 'entertainment'
  subcategory: text('subcategory').notNull(),
  amount: integer('amount'), // null = 未設定
  memoTemplate: text('memo_template'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

/**
 * 前回入力値テーブル（単一行・アプリケーション層の関心事）
 * id は常に 1 固定
 */
export const lastInput = sqliteTable('last_input', {
  id: integer('id').primaryKey().default(1),
  category: text('category'), // 'transportation' | 'entertainment' | null
  subcategory: text('subcategory'),
  memo: text('memo'),
})

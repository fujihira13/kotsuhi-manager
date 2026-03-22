import BetterSQLite3 from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '@/src/infrastructure/persistence/sqlite/schema'
import type { Database } from '@/src/infrastructure/persistence/sqlite/database'

const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    amount INTEGER NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    memo TEXT,
    satisfaction INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    amount INTEGER,
    memo_template TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS last_input (
    id INTEGER PRIMARY KEY DEFAULT 1,
    category TEXT,
    subcategory TEXT,
    memo TEXT
  );
`

/**
 * テスト用インメモリ SQLite データベースを作成する
 * better-sqlite3 を使用し、ExpoSQLiteDatabase 互換の型にキャストする
 * （Drizzle の query API は sync/async 双方で同一であるため、await 呼び出しは正常に動作する）
 */
export function createTestDatabase(): Database {
  const sqlite = new BetterSQLite3(':memory:')
  sqlite.exec(CREATE_TABLES_SQL)
  return drizzle(sqlite, { schema }) as unknown as Database
}

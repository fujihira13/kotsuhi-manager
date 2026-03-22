import { openDatabaseSync } from 'expo-sqlite'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import * as schema from './schema'

/**
 * Expo SQLite データベースのシングルトンインスタンス
 * マイグレーションは drizzle-kit で生成し、アプリ起動時に適用する
 *
 * マイグレーション生成: npm run db:generate
 * マイグレーション適用: useMigrations フック または migrate() 関数を使用する
 */
const expo = openDatabaseSync('kotsuhi.db', { enableChangeListener: true })

export const db = drizzle(expo, { schema })
export type Database = typeof db

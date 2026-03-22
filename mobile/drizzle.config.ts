import type { Config } from 'drizzle-kit'

export default {
  schema: './src/infrastructure/persistence/sqlite/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config

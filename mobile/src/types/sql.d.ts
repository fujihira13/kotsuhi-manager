/** Drizzle ORM: .sql マイグレーションファイルの型宣言 */
declare module '*.sql' {
  const content: string
  export default content
}

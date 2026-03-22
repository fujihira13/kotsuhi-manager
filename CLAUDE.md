# CLAUDE.md

## アーキテクチャ

DDD / Hexagonal Architecture（Clean Architecture）で構成されています。

```
presentation（Resolver/Controller）
  → application（Service）
  → domain（Entity/ValueObject）← infrastructure（Adapter/Repository）
```

各モジュールは `src/core/{module_name}/` に配置。

## DDDワークフロースキル（実行順序）

```
/sd-basic-design
  → /sd-domain-implementation
  → /sd-application-implementation
  → /sd-adapter-implementation
  → /sd-integration-test
```

各スキルは前のスキルの PR がマージされてから実行する。

## バックエンドコマンド

```bash
cd backend
npm run start:dev         # 開発サーバー起動
npm run test              # テスト実行
npm run lint              # Biome lint
npm run db:up             # Docker PostgreSQL 起動
npm run prisma:migrate:dev
npm run prisma:generate
```

## モバイルコマンド

```bash
cd mobile
npx expo start
npx tsc --noEmit
```

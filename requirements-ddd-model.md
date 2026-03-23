# DDD ドメインモデル定義（交通費・交際費ログ MVP）

要件定義（requirements-mobile-mvp.md）を DDD の観点で補完した設計ドキュメント。

---

## 1. ユビキタス言語（Ubiquitous Language）

| 用語（日本語） | 用語（英語） | 説明 |
|--------------|------------|------|
| 支出 | Expense | 記録された1件の交通費または交際費 |
| 金額 | Money | 支出の金額（1以上の正の整数） |
| 区分 | Category | 支出の大分類（交通費・交際費の2種） |
| サブ区分 | Subcategory | 区分に属する小分類 |
| 満足度 | Satisfaction | 支出に対する満足度（1〜5の整数） |
| 利用日 | ExpenseDate | 支出が発生した日付（YYYY-MM-DD） |
| テンプレート | Template | よく使う支出パターンの雛形 |
| 並び順 | SortOrder | テンプレートの表示順序（0以上の整数） |
| 集計 | Summary | 期間指定の支出分析結果（読み取り専用） |
| 頻出金額 | FrequentAmount | 直近一定期間の履歴から算出した頻出金額候補 |
| 前回入力値 | LastInput | 最後に保存した支出の区分・サブ区分・メモ |

> **注意:** コード上の識別子は英語、UI・ドキュメントは日本語で統一する。

---

## 2. 境界づけられたコンテキスト（Bounded Context）

MVP はシングルユーザー・ローカルファーストのため、単一コンテキスト内で設計する。

```
┌────────────────────────────────────────────────────────┐
│               交通費・交際費ログ コンテキスト                 │
│                                                        │
│  ┌─────────────┐    ┌─────────────┐                   │
│  │  Expense    │    │  Template   │                   │
│  │  Aggregate  │    │  Aggregate  │                   │
│  └─────────────┘    └─────────────┘                   │
│                                                        │
│  ┌──────────────────────────────┐                     │
│  │  Summary（Read Model）        │                     │
│  └──────────────────────────────┘                     │
│                                                        │
│  ※ LastInput はアプリケーション層の関心事（非ドメイン）      │
└────────────────────────────────────────────────────────┘
```

将来的にクラウド同期を追加する場合、同期機能は別コンテキストとして分離する。

---

## 3. 集約（Aggregate）

### 3.1 Expense 集約

- **集約ルート:** Expense
- **識別子:** ExpenseId（UUID）

#### 属性

| 属性 | 型 | 制約 |
|-----|------|------|
| id | ExpenseId | 必須、UUID |
| date | ExpenseDate | 必須 |
| amount | Money | 必須 |
| category | Category | 必須 |
| subcategory | Subcategory | 必須、category と整合すること |
| memo | string | 任意 |
| satisfaction | Satisfaction | 任意 |
| createdAt | datetime | 必須、保存時に自動設定 |
| updatedAt | datetime | 必須、更新時に自動設定 |

#### 不変条件（Invariants）

1. `subcategory` は `category` に対して有効な値でなければならない
   - `transportation` → `train | bus | taxi | parking | other`
   - `entertainment` → `meal | cafe | drink | gift | entertainment | other`
2. `amount` は 1 以上の整数でなければならない
3. `satisfaction` を指定する場合は 1〜5 の整数でなければならない

---

### 3.2 Template 集約

- **集約ルート:** Template
- **識別子:** TemplateId（UUID）

#### 属性

| 属性 | 型 | 制約 |
|-----|------|------|
| id | TemplateId | 必須、UUID |
| name | string | 必須、空白のみ不可 |
| category | Category | 必須 |
| subcategory | Subcategory | 必須、category と整合すること |
| amount | Money | 任意 |
| memoTemplate | string | 任意 |
| sortOrder | SortOrder | 必須、0 以上の整数 |
| createdAt | datetime | 必須、保存時に自動設定 |
| updatedAt | datetime | 必須、更新時に自動設定 |

#### 不変条件（Invariants）

1. `subcategory` は `category` に対して有効な値でなければならない
2. `name` は空白のみの文字列であってはならない
3. `amount` を指定する場合は 1 以上の整数でなければならない
4. `sortOrder` は 0 以上の整数でなければならない

---

## 4. 値オブジェクト（Value Objects）

### 4.1 Money

```
値: 正の整数
制約: 1 以上の整数であること
等価性: 値による比較
不変: 一度生成した後は変更不可
```

### 4.2 Category

```
値: 'transportation' | 'entertainment'
等価性: 値による比較
```

### 4.3 Subcategory

```
値（transportation）: 'train' | 'bus' | 'taxi' | 'parking' | 'other'
値（entertainment）: 'meal' | 'cafe' | 'drink' | 'gift' | 'entertainment' | 'other'
制約: 単独では使用不可。必ず Category とペアで有効性を検証する
等価性: 値による比較
```

### 4.4 Satisfaction

```
値: 1 | 2 | 3 | 4 | 5
制約: 1〜5 の整数であること
等価性: 値による比較
```

### 4.5 ExpenseDate

```
値: YYYY-MM-DD 形式の文字列
制約: 有効な日付であること（将来日付は許可）
等価性: 値による比較
```

### 4.6 SortOrder

```
値: 0 以上の整数
制約: 0 以上の整数であること
等価性: 値による比較
```

---

## 5. ドメインイベント（Domain Events）

### 5.1 ExpenseCreated

**発生タイミング:** 支出が正常に保存された後
**ペイロード:** `expenseId`, `category`, `subcategory`, `memo`
**購読者（副作用）:** アプリケーション層の `LastInputUpdater` が `LastInput` を更新する

### 5.2 AllDataCleared

**発生タイミング:** 全データ削除が完了した後
**ペイロード:** `clearedAt`
**購読者（副作用）:** アプリケーション層の `LastInputUpdater` が `LastInput` を初期化する

> **注:** MVP では `ExpenseUpdated`, `ExpenseDeleted` はドメインイベントとして扱わない（副作用なし）。
> 将来の同期機能追加時には追加を検討する。

---

## 6. ドメインサービス（Domain Services）

### 6.1 FrequentAmountCalculator

**責務:** 支出の一覧から頻出金額の上位 N 件を算出する
**理由:** 複数の Expense を横断するロジックであり、単一エンティティに属さない
**入力:** `Expense[]`（直近 windowDays 日以内）, `limit: number`
**出力:** `{ amount: Money; count: number }[]`（降順、上位 limit 件）

### 6.2 ExpenseSummaryCalculator

**責務:** 期間内の支出を集計し、区分別・サブ区分別・満足度分布を算出する
**理由:** 複数の Expense を横断する集計ロジックであり、単一エンティティに属さない
**入力:** `Expense[]`（対象期間内）
**出力:** `Summary`（後述の Read Model 参照）

---

## 7. コマンドとクエリの分離（CQRS）

### Commands（状態変更）

| コマンド | 集約 | 説明 |
|---------|------|------|
| CreateExpenseCommand | Expense | 支出を新規登録する |
| UpdateExpenseCommand | Expense | 支出を編集する |
| DeleteExpenseCommand | Expense | 支出を削除する |
| CreateTemplateCommand | Template | テンプレートを作成する |
| UpdateTemplateCommand | Template | テンプレートを編集する |
| DeleteTemplateCommand | Template | テンプレートを削除する |
| ReorderTemplatesCommand | Template | テンプレートの並び順を変更する |
| ClearAllDataCommand | - | 全データ（支出・テンプレート・LastInput）を削除する |

### Queries（読み取り）

| クエリ | 説明 |
|-------|------|
| ListExpensesQuery | 支出一覧を取得する（月・区分フィルタ、日付降順） |
| GetExpenseByIdQuery | 支出を1件取得する |
| ListTemplatesQuery | テンプレート一覧を取得する（並び順） |
| GetSummaryQuery | 期間指定の集計を取得する |
| GetFrequentAmountsQuery | 頻出金額候補を取得する（直近90日・上位5件） |
| GetLastInputQuery | 前回入力値を取得する |

---

## 8. Read Models（読み取り専用モデル）

### ExpenseListItem

```
id, date, amount, category, subcategory, memo, satisfaction
```

### Summary

```
period: { from: ExpenseDate; to: ExpenseDate }
totalAmount: Money
breakdown:
  - category: Category
    total: Money
    share: number（構成比 0.0〜1.0）
    subcategories:
      - subcategory: Subcategory
        total: Money
        share: number
satisfactionStats:
  average: number | null
  distribution: { value: Satisfaction; count: number }[]
```

### FrequentAmountItem

```
amount: Money
count: number
```

---

## 9. LastInput（アプリケーション層の関心事）

`LastInput` はドメインではなく、アプリケーション層（UX 補助）の関心事として扱う。
ドメインイベント `ExpenseCreated` を購読して更新する。

```
lastUsedCategory: Category | null
lastUsedSubcategory: Subcategory | null
lastUsedMemo: string | null
```

---

## 10. 未決事項・設計メモ

| 項目 | 内容 | 判断 |
|-----|------|------|
| 将来の同期ID設計 | UUID を使えばサーバー側と衝突しにくい | UUID v4 を採用 |
| 将来日付の許可 | 要件に制限なし | 許可（MVPでは検証しない） |
| Subcategory の組み合わせ検証 | Category と Subcategory のペア検証はドメイン層で行う | Subcategory VO が Category を受け取り検証 |
| AllDataCleared の対象 | 支出・テンプレート・LastInput を対象とする（要件定義 6.9 参照） | schemaVersion は削除しない |

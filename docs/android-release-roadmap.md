# Android リリースロードマップ

## 概要

このドキュメントは「交通費・交際費ログ」Android アプリを Google Play Store に提出するまでの手順書です。

**アプリ情報**
- パッケージ名: `com.kotsuhi.manager`
- 現在のバージョン: `1.0.0`（versionCode: 1）
- ビルドツール: EAS Build（Expo Application Services）

> **クローズドテストは必須です（2023年以降の Google Play ルール）**
> 個人開発者が新規アプリを本番公開するには、**12人以上のテスターが 14日間以上** クローズドテストを行うことが条件です。
> この条件を満たすまで本番リリースのボタンは押せません。

---

## フロー全体図

```
[1] 事前準備
    ↓
[2] Preview ビルド（APK）← 自分の実機テスト用
    ↓
[3] 実機テスト（自分で動作確認）
    ↓
[4] Production ビルド（AAB）
    ↓
[5] クローズドテスト提出 → Google 審査（数時間〜数日）
    ↓ 審査通過
[6] テスター 12人に招待リンクを送付
    ↓ テスターがインストール
[7] クローズドテスト実施（14日間カウント待ち）
    ↓ 12人 × 14日間 達成
[8] 本番リリース提出
    ↓
[9] Google Play Console でリリース設定・公開
```

---

## Step 1: 事前準備

> **既にビルド経験がある場合:** 1-1・1-2 はスキップしてください。1-3（サービスアカウントキー）が未取得の場合のみ実施が必要です。

### 1-1. EAS にログイン（初回のみ）

```bash
cd mobile
npx eas-cli login
```

### 1-2. EAS 紐付け確認（初回・環境変更時のみ）

`app.json` の `extra.eas.projectId` が EAS サーバー上のプロジェクトと一致しているかを確認するコマンドです。**ビルドが一度でも成功していれば紐付けは完了済みなのでスキップ可。**

```bash
npx eas-cli project:info
```

> `projectId: 3add0b1d-eada-4059-aab3-29711d1d7009` が表示されれば OK。

### 1-3. Google サービスアカウントキーの取得（EAS Submit 用）

EAS Submit で自動提出する場合のみ必要。

1. [Google Play Console](https://play.google.com/console) にログイン
2. 左メニュー「セットアップ」→「API アクセス」
3. 「サービスアカウントを作成」→ Google Cloud Console で作成
4. サービスアカウントに「リリースマネージャー」権限を付与
5. JSON キーをダウンロードして `mobile/google-service-account.json` として保存

> **注意:** `google-service-account.json` は `.gitignore` に追加して Git にコミットしないこと。

---

## Step 2: Preview ビルド（テスト用 APK）

テスト配布用の APK をビルドします。

```bash
cd mobile
npx eas-cli build --profile preview --platform android
```

**ビルド完了後:**
- EAS のダッシュボードまたは CLI からダウンロード URL が発行される
- APK を実機にインストールしてテストする

---

## Step 3: 実機テスト チェックリスト

Preview APK を実機でテストします。全て ✅ になってから次のステップへ進んでください。

### 基本動作
- [ ] アプリが正常にインストールできる
- [ ] アプリが起動する（クラッシュなし）
- [ ] 初回起動時に DB マイグレーションが正常に完了する
- [ ] 2 回目以降の起動が正常

### 主要機能
- [ ] 交通費の新規入力ができる
- [ ] 入力した交通費が一覧に表示される
- [ ] 交通費の編集ができる
- [ ] 交通費の削除ができる
- [ ] 金額の計算が正しい

### 権限・セキュリティ
- [ ] 不要な権限ダイアログが表示されない（ストレージ・課金など）
- [ ] アプリが必要以上のシステムリソースにアクセスしない

### UI
- [ ] ダークモード / ライトモードが正常に切り替わる
- [ ] 端末サイズでレイアウトが崩れない

---

## Step 4: Production ビルド（Google Play 用 AAB）

テストが完了したら、Google Play 提出用の AAB をビルドします。

```bash
cd mobile
npx eas-cli build --profile production --platform android
```

**production プロファイルの動作:**
- `buildType: app-bundle`（AAB 形式）
- `distribution: store`（Google Play 向け）
- `autoIncrement: true`（versionCode を自動インクリメント）

---

## Step 5: クローズドテスト提出（AAB をアップロードして Google 審査へ）

> **なぜこのステップが必要か:** 個人開発者が本番公開するには「12人以上のテスターが14日間以上クローズドテストを行う」ことが Google の必須条件です。まずアプリを提出して Google の審査を通す必要があります。

### 5-1. AAB を Play Console に提出する

**方法 A: EAS Submit（`google-service-account.json` 取得済みの場合）**

```bash
cd mobile
npx eas-cli submit --platform android --profile closed-testing
```

**方法 B: 手動アップロード（こちらが簡単）**

1. [EAS ダッシュボード](https://expo.dev) から AAB ファイルをダウンロード
2. [Play Console](https://play.google.com/console) にログイン
3. 左メニュー「テスト」→「**クローズドテスト**」をクリック
4. 「**新しいリリースを作成**」をクリック
5. AAB ファイルをアップロード
6. リリースノートを入力（例：「初回クローズドテスト」）
7. 「**審査に提出**」をクリック

> Google の審査が始まります。通常数時間で完了しますが、最大数日かかる場合があります。審査中はテスターへの配布ができません。

---

## Step 6: テスター 12人に招待リンクを送付

> **審査が通ってから行います。** 審査中はリンクを送っても相手はインストールできません。

### 6-1. テスターグループを作成する

1. Play Console で「テスト」→「**クローズドテスト**」を開く
2. 「**テスターを管理**」タブをクリック
3. 「**グループを作成**」→ グループ名を入力（例：「テスターグループ」）
4. テスターの Gmail アドレスを1件ずつ入力して追加（12件以上）
5. 「**変更を保存**」

> **重要:** テスターのアドレスは必ず **Gmail（Google アカウント）** であること。招待したアドレスと別のアカウントでログインしているとインストールできません。

### 6-2. 招待リンクをテスターに送る

1. 「テスターを管理」画面の下部に **「テストへの参加リンク」** が表示される
2. そのリンク（`https://play.google.com/apps/...`）をコピー
3. テスター 12人全員に送る（LINE・メール・Slack など何でも可）

### 6-3. テスター側の操作手順（テスターに伝える内容）

テスターは以下の手順でインストールします：

1. 受け取ったリンクをスマートフォンで開く
2. 「**テスターになる**」ボタンをタップ
3. Google アカウントでログイン（招待されたアドレスと一致していること）
4. 「**Google Play でダウンロード**」→ Play Store が開く
5. 通常のアプリと同様にインストール

---

## Step 7: クローズドテスト実施（14日間カウント）

テスターが全員インストールしたら、14日間のカウントが始まります。

### テスターへの依頼内容

テスターに以下を確認してもらってください：

- [ ] アプリが正常にインストール・起動できる
- [ ] 交通費の新規入力ができる
- [ ] 入力した交通費が一覧に表示される
- [ ] 交通費の編集・削除ができる
- [ ] 不具合・クラッシュがないか確認
- [ ] UI が端末サイズで崩れていないか確認

### 14日間カウントの確認方法

1. Play Console の「クローズドテスト」→「**統計**」タブを開く
2. 「テスター数」と「テスト経過日数」を確認
3. **12人以上 かつ 14日以上** になったら本番リリースのボタンが有効になる

> カウントはテスターがインストールした日から計測されます。招待日ではありません。テスターがアンインストールしてもカウントは継続します。

---

## Step 8: 本番リリース提出

14日間のテストが完了したら本番トラックに提出します。

**方法 A: Play Console 上でプロモート（推奨・再ビルド不要）**

クローズドテストと同じ AAB を本番に昇格させます：

1. Play Console「クローズドテスト」画面を開く
2. 現在のリリースの「**本番にプロモート**」ボタンをクリック
3. リリースノートを確認・入力して「審査に提出」

**方法 B: EAS Submit（新たにビルドする場合）**

```bash
cd mobile
npx eas-cli submit --platform android --profile production
```

---

## Step 9: Google Play Console でのリリース設定

提出後に Play Console で確認・設定すること:

- [ ] ストアの説明文（日本語）が正しいか確認
- [ ] スクリーンショットが設定されているか確認
- [ ] フィーチャーグラフィック（`image/feature-graphic.png`）が設定されているか確認
- [ ] コンテンツレーティングが完了しているか確認
- [ ] プライバシーポリシー URL が設定されているか確認
- [ ] ターゲット国・地域が設定されているか確認
- [ ] 審査提出

---

## ビルドプロファイル一覧

| プロファイル | 用途 | buildType | distribution | autoIncrement |
|-------------|------|-----------|--------------|---------------|
| `preview` | 社内テスト・実機確認 | APK | internal | - |
| `production` | Google Play 提出 | AAB | store | true |

---

## eas.json 現在の設定

```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk", "distribution": "internal" }
    },
    "production": {
      "android": { "buildType": "app-bundle", "distribution": "store", "autoIncrement": true }
    }
  },
  "submit": {
    "closed-testing": {
      "android": { "serviceAccountKeyPath": "./google-service-account.json", "track": "alpha" }
    },
    "production": {
      "android": { "serviceAccountKeyPath": "./google-service-account.json", "track": "production" }
    }
  }
}
```

| submit プロファイル | トラック | 用途 |
|--------------------|----------|------|
| `closed-testing` | alpha | クローズドテスト（12人招待） |
| `production` | production | 本番リリース |

---

## クローズドテスト よくある注意点

| 注意点 | 内容 |
|--------|------|
| 審査が終わるまで配布できない | 「審査に提出」後、通過するまでリンクを送っても相手はインストール不可 |
| テスターは Gmail アドレスが必要 | Google アカウントでないと参加できない |
| 招待アドレスと一致している必要がある | 別のGoogleアカウントでログインしているとPlay Storeに表示されない |
| 14日間カウントはインストール日から | 招待日・参加リンク開封日ではなく実際のインストール日から計測 |
| アンインストールしてもカウント継続 | 一度参加すればOK |
| 12人に満たない場合は追加招待 | 14日間中いつでもテスターを追加できる |

---

## トラブルシューティング

### ビルドが失敗する場合

```bash
# EAS CLI のバージョン確認（>= 16.0.0 が必要）
npx eas-cli --version

# ローカルで型チェック
cd mobile
npx tsc --noEmit
```

### テスターがインストールできない場合

- 招待したメールアドレスと、テスターがログインしているGoogleアカウントが一致しているか確認
- Googleの審査がまだ通っていないか確認（Play Console の「クローズドテスト」のステータスを確認）
- テスターがリンクを開いて「テスターになる」を押したか確認（押さないとPlay Storeに表示されない）

### submit が失敗する場合

- `google-service-account.json` が `mobile/` ディレクトリに存在するか確認
- サービスアカウントに Play Console の「リリースマネージャー」権限が付与されているか確認

### 14日間カウントが進まない場合

- テスターが実際にインストールしているか Play Console の「統計」タブで確認
- インストールしていないテスターには再度リンクを送付

### versionCode の重複エラー

`autoIncrement: true` が設定されているため、通常は自動管理されます。
手動で変更する場合は `mobile/app.json` の `android.versionCode` を更新してください。

---

## 関連ドキュメント

- [google-play-submission.md](./google-play-submission.md) — Google Play 審査・ストアリスト設定
- [privacy-policy.md](./privacy-policy.md) — プライバシーポリシー

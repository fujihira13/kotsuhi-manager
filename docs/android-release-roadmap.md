# Android リリースロードマップ

## 概要

このドキュメントは「交通費マネージャー」Android アプリを Google Play Store に提出するまでの手順書です。

**アプリ情報**
- パッケージ名: `com.kotsuhi.manager`
- 現在のバージョン: `1.0.0`（versionCode: 1）
- ビルドツール: EAS Build（Expo Application Services）

---

## フロー全体図

```
[1] 事前準備（Google Play Console 設定）
    ↓
[2] Preview ビルド（テスト用 APK）
    ↓
[3] 実機テスト
    ↓
[4] Production ビルド（Google Play 用 AAB）
    ↓
[5] EAS Submit（自動提出）または手動アップロード
    ↓
[6] Google Play Console でリリース設定
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

## Step 5: Google Play への提出

### 方法 A: EAS Submit（推奨）

`google-service-account.json` を配置済みの場合:

```bash
cd mobile
npx eas-cli submit --platform android --profile production
```

提出先トラック: `internal`（内部テスト）

Play Console で公開範囲を変更する場合は、Console 上で操作してください。

### 方法 B: 手動アップロード

1. EAS ダッシュボードから AAB ファイルをダウンロード
2. [Google Play Console](https://play.google.com/console) にログイン
3. 「内部テスト」→「新しいリリースを作成」
4. AAB ファイルをアップロード
5. リリースノートを記入して保存・公開

---

## Step 6: Google Play Console でのリリース設定

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
    "production": {
      "android": { "serviceAccountKeyPath": "./google-service-account.json", "track": "internal" }
    }
  }
}
```

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

### submit が失敗する場合

- `google-service-account.json` が `mobile/` ディレクトリに存在するか確認
- サービスアカウントに Play Console の権限が付与されているか確認
- Play Console でアプリが「内部テスト」トラックに設定されているか確認

### versionCode の重複エラー

`autoIncrement: true` が設定されているため、通常は自動管理されます。
手動で変更する場合は `mobile/app.json` の `android.versionCode` を更新してください。

---

## 関連ドキュメント

- [google-play-submission.md](./google-play-submission.md) — Google Play 審査・ストアリスト設定
- [privacy-policy.md](./privacy-policy.md) — プライバシーポリシー

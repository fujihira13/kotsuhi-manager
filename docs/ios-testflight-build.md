# iOS TestFlight ビルド手順

## 前提条件

### Apple Developer Program への加入（必須）

TestFlight 配布には Apple Developer Program への加入（年額 $99）が必要です。

1. https://developer.apple.com/programs/enroll/ にアクセス
2. Apple ID でサインインし「Enroll」を選択
3. 個人（Individual）または組織を選択して支払い完了
4. 審査通過後（通常 1〜2 日）に App Store Connect が利用可能になる

> **加入が完了するまで以下の手順は実行できません。**

---

## Step 1: EAS ログイン確認

```bash
cd mobile
eas whoami
```

未ログインの場合:
```bash
eas login
```

---

## Step 2: App Store Connect でアプリを作成

1. https://appstoreconnect.apple.com にアクセス
2. 「マイ App」→「+」→「新規 App」をクリック
3. 以下の情報を入力:
   - プラットフォーム: iOS
   - 名前: 交通費・交際費ログ
   - プライマリ言語: 日本語
   - バンドル ID: `com.kotsuhi.manager`
   - SKU: `kotsuhi-manager`（任意の一意な文字列）

---

## Step 3: iOS ビルド実行

```bash
cd mobile
eas build --platform ios --profile preview
```

実行中に以下を求められます:
- Apple ID（メールアドレス）
- パスワード
- 2ファクタ認証コード

> **証明書・プロビジョニングプロファイルは EAS が自動生成・管理します。**

ビルド完了後、EAS ダッシュボード（https://expo.dev）でステータスを確認できます。

### iOS ビルドプロファイル一覧

| プロファイル | コマンド | 用途 |
|---|---|---|
| preview | `eas build --platform ios --profile preview` | TestFlight 配布（テスト用） |
| production | `eas build --platform ios --profile production` | App Store リリース用 |

---

## Step 4: TestFlight にアップロード

ビルド完了後:
```bash
eas submit --platform ios --latest
```

または submit プロファイルを指定する場合:
```bash
eas submit --platform ios --profile production --latest
```

> **初回実行時**: `mobile/eas.json` の `submit.production.ios` に以下を設定してから実行してください。
> - `appleId`: Apple ID（メールアドレス）
> - `ascAppId`: App Store Connect のアプリ数字 ID（アプリ詳細ページの URL 末尾に表示）
> - `appleTeamId`: Apple Developer Portal の「Membership」で確認できる 10 桁の英数字

または EAS ダッシュボードから手動で App Store Connect にアップロードすることも可能です。

アップロード後 15〜30 分で App Store Connect の TestFlight タブにビルドが届きます。

---

## Step 5: テスターへの配布

1. App Store Connect の「TestFlight」タブを開く
2. 「内部テスト」または「外部テスト」にテスターを追加
3. テスターのデバイスに TestFlight アプリをインストールして招待メールから参加

---

## ビルド番号の更新

`eas.json` の `production` プロファイルで `autoIncrement: true` が設定されているため、
`eas build --profile production` 実行時に `buildNumber` は EAS が自動でインクリメントします。
手動での変更は不要です。

> `version`（例: `1.0.0`）はユーザーに表示されるバージョン。変更が必要な場合は `mobile/app.json` の `version` を更新してください。
> `buildNumber` は EAS が自動管理します（`eas.json` の `autoIncrement: true`）。

---

## Android ビルド（参考）

| プロファイル | コマンド | 出力 |
|---|---|---|
| preview (APK) | `eas build --platform android --profile preview` | .apk（直接インストール可能） |
| production (AAB) | `eas build --platform android --profile production` | .aab（Play Store 用） |

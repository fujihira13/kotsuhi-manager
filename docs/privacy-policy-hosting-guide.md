# プライバシーポリシー公開・Google Play登録 手順書

Google Play Store にアプリを公開するには、インターネット上でアクセスできるプライバシーポリシーのURLが必要です。

---

## 全体の流れ

```
1. GitHubリポジトリをPublicに設定
   ↓
2. GitHub Pagesを有効化
   ↓
3. プライバシーポリシーのURLを確認
   ↓
4. Google Play Console にURLを登録
```

---

## Step 1: GitHubリポジトリを Public に設定する

GitHub Pages の無料プランは **Public リポジトリ** が対象です。

1. GitHubでリポジトリを開く
2. `Settings` タブを開く
3. 下部の「Danger Zone」→「Change repository visibility」
4. **Public** に変更する

> **注意**: リポジトリを Public にするとコードが公開されます。APIキーや秘密情報がコードに含まれていないか事前に確認してください。

---

## Step 2: GitHub Pages を有効化する

1. GitHubでリポジトリの `Settings` タブを開く
2. 左メニューの **Pages** をクリック
3. **Source** セクションで以下を設定:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
4. **Save** をクリック

数分後、以下の形式でURLが発行されます：

```
https://{GitHubユーザー名}.github.io/{リポジトリ名}/
```

例：ユーザー名が `yamada`、リポジトリ名が `kotsuhi-manager` の場合
```
https://yamada.github.io/kotsuhi-manager/
```

---

## Step 3: プライバシーポリシーのURLを確認する

`docs/privacy-policy.html` が以下のURLで公開されます：

```
https://{GitHubユーザー名}.github.io/{リポジトリ名}/docs/privacy-policy.html
```

例：
```
https://yamada.github.io/kotsuhi-manager/docs/privacy-policy.html
```

### 確認手順

1. 上記のURLをブラウザで開く
2. プライバシーポリシーの内容が表示されることを確認
3. スマートフォンでも確認する（Google Play の審査でチェックされます）

> GitHub Pages が反映されるまで最大10分程度かかる場合があります。

---

## Step 4: Google Play Console にURLを登録する

1. [Google Play Console](https://play.google.com/console) にログイン
2. 対象のアプリを選択
3. 左メニューから **ポリシーとプログラム** → **アプリのコンテンツ** を開く
4. **プライバシーポリシー** セクションで「編集」をクリック
5. URLを入力する（例: `https://yamada.github.io/kotsuhi-manager/docs/privacy-policy.html`）
6. **保存** をクリック

---

## ファイル構成

```
docs/
├── privacy-policy.md        # Markdown版（開発者用の参照資料）
├── privacy-policy.html      # HTML版（GitHub Pagesで公開するファイル）
└── privacy-policy-hosting-guide.md  # 本手順書
```

---

## よくある質問

### Q: リポジトリをPublicにしたくない場合は？

GitHub Pro（有料）または GitHub Team/Enterprise を利用すれば Private リポジトリでも GitHub Pages を使えます。

代替案として以下も利用できます：
- **Google Sites** (無料): Googleアカウントがあれば簡単に作成可能
- **Notion** (無料プランあり): ページを公開URLで共有可能
- **GitHub Gist**: 単一ファイルをHTMLで共有可能（公式サポート外だが機能する）

### Q: プライバシーポリシーを更新した場合は？

`docs/privacy-policy.html` を編集して `main` ブランチにpushすれば、GitHub Pagesに自動反映されます。Google Play Console への再登録は不要です（URLが変わらなければ）。

### Q: 英語版は必要か？

日本語のみでの配信であれば日本語版のみで問題ありません。将来的にグローバル展開する場合は英語版の追加を検討してください。

---

## チェックリスト

- [ ] GitHubリポジトリが Public になっている
- [ ] GitHub Pages が有効化されている
- [ ] `https://{username}.github.io/{repo}/docs/privacy-policy.html` でページが表示される
- [ ] スマートフォンのブラウザで表示確認済み
- [ ] Google Play Console のプライバシーポリシーURLに登録済み

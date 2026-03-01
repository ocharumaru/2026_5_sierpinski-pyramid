# Git 運用ルール

## ブランチ構成

```
main          ← 本番（安定版のみマージ）
└── develop   ← 開発の起点（ここから機能ブランチを切る）
    ├── feature/koch-snowflake
    ├── feature/menger-sponge
    ├── fix/animation-bug
    └── ...
```

- **`main`** — 常に動作する安定版。直接コミットしない。
- **`develop`** — 開発のベースブランチ。機能が完成したらここにマージ。
- **`feature/*`** — 新機能の作業ブランチ。develop から切って develop にマージ。
- **`fix/*`** — バグ修正用。develop から切って develop にマージ。

## 基本的な作業の流れ

### 1. 新しい機能を始める

```bash
# develop ブランチに移動して最新を取得
git switch develop
git pull

# 機能ブランチを作成
git switch -c feature/koch-snowflake
```

### 2. 作業中のコミット

```bash
git add src/fractals/KochSnowflake.jsx
git commit -m "feat: コッホ雪片の生成ロジックを追加"
```

### 3. 作業が完了したらプルリクエストを作成

```bash
# プルリク前に必ず動作確認
npm run dev

# リモートにプッシュ
git push -u origin feature/koch-snowflake

# GitHub でプルリクエストを作成（develop ← feature/koch-snowflake）
gh pr create --base develop --title "feat: コッホ雪片を追加" --body "変更内容の説明"
```

### 4. レビュー → マージ

1. **Slack でプルリクの URL を共有し、レビューを依頼する**
2. レビューで承認されたらマージする
3. マージ後、不要になったブランチを削除する

```bash
git switch develop
git pull
git branch -d feature/koch-snowflake
```

## マージ時のルール

- **プルリクエスト経由でマージする。** ローカルで直接 `git merge` しない。
- **マージ前に Slack で報告する。** プルリクの URL と影響範囲を共有してからマージすること。
- **マージ前に `npm run dev` で動作確認する。** 正常に表示されることを確認してからマージする。
- **`develop` へのマージは全員に周知してから行う。**

## 共通コンポーネント（`src/hooks/`）の扱い

`src/hooks/` 配下の共通フックは複数のフラクタルから利用されるため、慎重に扱う。

- **なるべく触らない。** 既存の共通フックの動作を変更しない。
- **機能拡張が必要な場合はバージョンアップとして対応する。** 新しい引数の追加など、後方互換性を保つ形で拡張する。既存の呼び出し元が壊れないことを確認する。
- **共通フックを変更する場合は、全フラクタルの動作確認を行う。**
- **特定のフラクタルにしか使わないロジックは共通化しない。** そのフラクタルのファイル内に置く。

## ブランチ命名規則

| 接頭辞 | 用途 | 例 |
|---|---|---|
| `feature/` | 新しいフラクタルや機能追加 | `feature/mandelbulb` |
| `fix/` | バグ修正 | `fix/animation-timer` |
| `refactor/` | コードの整理・リファクタリング | `refactor/ui-panel` |

## コミットメッセージの書き方

`種類: 内容` の形式で書く。日本語OK。

```
feat: メンガースポンジを追加
fix: ステップアニメーションが停止しないバグを修正
refactor: UIパネルのスタイルを共通化
docs: READMEにセットアップ手順を追加
```

| 種類 | 意味 |
|---|---|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `refactor` | 動作を変えないコード改善 |
| `docs` | ドキュメントのみ |
| `style` | 見た目の変更（CSS等） |

## 注意事項

- **`main` に直接コミットしない。** 必ず develop 経由でマージする。
- **作業前に `git pull` する。** 他の人の変更を取り込んでから作業を始める。
- **こまめにコミットする。** 大きな変更を一度にコミットしない。
- **`.env` や `node_modules/` をコミットしない。** `.gitignore` で除外されていることを確認する。

## よく使うコマンド早見表

```bash
git switch develop                          # develop に移動
git switch -c feature/xxx                   # 新しいブランチを作成して移動
git status                                  # 変更状態を確認
git add <ファイル名>                          # ステージングに追加
git commit -m "feat: 内容"                   # コミット
git log --oneline                           # 履歴を簡潔に表示
git push -u origin feature/xxx              # リモートにプッシュ
gh pr create --base develop                 # プルリクエストを作成
git switch develop                          # develop に戻る
git pull                                    # リモートの最新を取得
git branch -d feature/xxx                   # マージ済みブランチを削除
```

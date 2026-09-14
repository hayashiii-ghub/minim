# minim

[minim — UI with agents.](https://minim.haygsiiii.chatgpt.site/)

AIとのやりとりを、少ない入力と読みやすい返答で進めるための小さなプラグインです。

本体は[minim.md](minim.md)の6つの約束です。

- 依頼の目的から作業が逸れていないか確かめる
- 既存の実装や仕組みを確認し、使えるものは使う
- Gitの履歴で分かる変更経緯は、コードのコメントに書かない
- 平易な言葉で説明する
- 絵文字を添えたひと言を、本文から分けて冒頭に置く
- 作業途中の報告を除き、返答の最後に次の行動を選択肢で示す。必要な数だけ最大5つ示し、専用UIか「あいうえお」で選べるようにする

## 返答例

```text
🔍 使い方を確認しました

入力ファイルの形式が書かれていません。CSVの例を1つ載せると、使い始めやすくなります。
```

## Codexへの導入

プラグインとSessionStartフックに対応するCodex、およびbashが必要です。

```bash
codex plugin marketplace add hayashiii-ghub/minim
codex plugin add minim@minim
```

Codexでminimとそのフックを有効にし、新しいタスクを開いてください。スキルを指定する必要はありません。

## Codexの更新

配布一覧を更新してから、minimを再導入します。

```bash
codex plugin marketplace upgrade minim
codex plugin add minim@minim
```

更新後はフックの有効状態を確認し、新しいタスクを開いてください。

## Codexの解除

minimをアンインストールします。

```bash
codex plugin remove minim@minim
```

配布一覧の登録も外す場合は、続けて実行します。

```bash
codex plugin marketplace remove minim
```

解除後も、新しいタスクを開いてください。既存のタスクには、読み込まれた約束が残ることがあります。

## Cursorへの導入

このリポジトリのフォルダで、次のコマンドを実行します。Python 3.9以上が必要です。

```bash
python3 scripts/install_cursor.py
```

Cursorで`Developer: Reload Window`を実行して、新しい会話を開けば使えます。Customize → Rulesに`minim`が表示されます。

**更新も同じコマンドです。** リポジトリを更新してから実行し、Cursorを再読み込みしてください。以前のリンク方式からの移行も自動で行います。

解除するときは`~/.cursor/plugins/local/minim`フォルダを削除し、Cursorを再読み込みします。

<details>
<summary>登録先・バックアップ・動作確認</summary>

[Cursorのローカル導入手順](https://cursor.com/docs/plugins#test-plugins-locally)にあるコピー方式で、`~/.cursor/plugins/local/minim`へ実ファイルを登録します。ローカルプラグインの読み込みが許可されている必要があります。

既存の登録は`~/.cursor/plugins/backups/`へ退避します。シンボリックリンクの参照先には触れません。macOSのCursor 3.20.17では登録先の外を指すリンクが拒否されたため、この方式にしています。

2026年9月14日、macOSのCursor 3.20.17のローカルIDEで、ルールの読み込みと`alwaysApply: true`を確認しました。Kimi K3 Maxとの新しい会話では、絵文字付きの見出し、返答後の標準選択UI、選択内容への応答を確認しています。クラウド環境での動作は未確認です。

</details>

## 仕組み

CodexではSessionStartフックが`minim.md`の本文を直接渡します。開始・再開・クリア・圧縮の各イベントに登録します。追加のスキルやMCPサーバーはありません。

Cursorでは`alwaysApply: true`のルールに同じ本文を生成します。共通形式とCursor形式の判定、およびフックの自動検出が混ざらないよう、配布物は`dist/codex/minim/`と`dist/cursor/minim/`へ分けます。

会話の振る舞いは、利用するモデルや他の指示にも左右されます。macOSのCodexと上記のCursor環境で確認しており、他の環境での動作は未確認です。

## 構成

```text
minim.md                 約束の正本
plugin.json              配布情報の正本
adapters/codex/hooks/     Codexへの接続
scripts/                 生成・検査
dist/codex/minim/        Codex用の生成物
dist/cursor/minim/       Cursor用の生成物
.agents/plugins/         Codex配布一覧の生成物
```

## 開発

サイトのコードは`site/`で管理し、ChatGPT Sitesで公開しています。[サイトの更新手順](site/README.md)を参照してください。

本文の正本は`minim.md`、配布情報の正本は[Agent Plugins形式](https://agent-plugins.org/specification)の`plugin.json`です。名前・バージョンなどはここで一度だけ編集します。

`python3 scripts/generate.py`がCodex・Cursorそれぞれの配布物を`dist/`へ生成します。配布一覧の`.agents/plugins/marketplace.json`も生成します。生成物は直接編集しません。Codexのフックは`adapters/codex/hooks/`で編集します。

```bash
python3 scripts/generate.py
python3 scripts/check.py
```

Python 3とbashで、生成物と正本の一致・配布先の参照・Cursorルールの本文と常時適用設定・Codexの本文読込と欠落時の診断を確認します。CIでも生成漏れを検出します。実際の会話での表示は別途各アプリで確かめます。

## ライセンス

[MIT](LICENSE)。接続の実装は[hikizan](https://github.com/hayashiii-ghub/hikizan)の対話UI試作から引き継いでいます。

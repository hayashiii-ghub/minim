# minim

[UI with agents.](https://minim.haygsiiii.chatgpt.site/)

少ない入力と読みやすい返答で、AIとの会話を進める小さなプラグイン。
絵文字付きの見出しに、数えられるときの進み具合と、次の行動を選べる選択肢を添えます。[プロンプト全文](minim.md)

## Codexへの導入

プラグインとSessionStartフックに対応するCodex、およびbashが必要です。

```bash
codex plugin marketplace add hayashiii-ghub/minim
codex plugin add minim@minim
```

minimとそのフックを有効にして、新しいタスクを開きます。

## Cursorへの導入

Python 3.9以上と、ローカルプラグインの読み込み許可が必要です。

```bash
git clone https://github.com/hayashiii-ghub/minim.git
cd minim
python3 scripts/install_cursor.py
```

取得済みなら、そのフォルダで最後のコマンドだけ実行します。
Cursorで`Developer: Reload Window`を実行し、新しい会話を開きます。

## 更新・解除

**Codexの更新**

```bash
codex plugin marketplace upgrade minim
codex plugin add minim@minim
```

更新後はフックを確認し、新しいタスクを開きます。解除は`codex plugin remove minim@minim`。配布一覧も外す場合は`codex plugin marketplace remove minim`を実行し、新しいタスクを開きます。

**Cursorの更新** — リポジトリのフォルダで実行します。

```bash
git pull
python3 scripts/install_cursor.py
```

解除は`~/.cursor/plugins/local/minim`フォルダを削除します。更新・解除後はCursorを再読み込みし、新しい会話を開きます。以前の登録は`~/.cursor/plugins/backups/`に退避されます。

---

macOSのCodexとCursorのローカルIDEで動作確認済み。返答はモデルや他の指示にも左右されます。

[開発ガイド](AGENTS.md) · [サイトの更新](site/README.md) · [MIT](LICENSE)

接続の実装は[hikizan](https://github.com/hayashiii-ghub/hikizan)の対話UI試作を引き継いでいます。

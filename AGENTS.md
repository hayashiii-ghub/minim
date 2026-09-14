# 開発ガイド

本体は`minim.md`です。約束を平易な言葉で短く保ち、作業手順や専門スキルを追加しません。

配布情報の正本はAgent Plugins形式の`plugin.json`です。Codex専用の表示情報は同ファイルの`extensions.com.openai.codex`に置きます。これは生成時に使う情報で、クライアントの直接対応を前提としません。

Codexへの接続は`adapters/codex/hooks/`、生成処理は`scripts/generate.py`で編集します。`dist/`と`.agents/plugins/marketplace.json`は生成物なので直接編集しません。

変更後は`python3 scripts/generate.py`、`python3 scripts/check.py`を実行します。接続の検査と、実際の会話での確認は区別してください。

# minim

Codexとのやりとりを、少ない入力と読みやすい返答で進めるための小さなプラグインです。

本体は[minim.md](plugins/minim/minim.md)の6つの約束です。

- 依頼の目的から作業が逸れていないか確かめる
- 既存の実装や仕組みを確認し、使えるものは使う
- Gitの履歴で分かる変更経緯は、コードのコメントに書かない
- 平易な言葉で説明する
- 絵文字を添えたひと言を、本文から分けて冒頭に置く
- 選択肢は必要な数だけ最大5つ。専用UIを優先し、テキストでは「あいうえお」で選べるようにする

## 導入

プラグインとSessionStartフックに対応するCodex、およびbashが必要です。

```bash
codex plugin marketplace add hayashiii-ghub/minim
codex plugin add minim@minim
```

Codexでminimとそのフックを有効にし、新しいタスクを開いてください。スキルを指定する必要はありません。

## 仕組み

SessionStartフックが`minim.md`の本文を直接渡します。開始・再開・クリア・圧縮の各イベントに登録します。追加のスキルやMCPサーバーはありません。

会話の振る舞いは、利用するモデルや他の指示にも左右されます。macOSのCodexで確認しており、他の環境での動作は未確認です。

## 開発

本文は`plugins/minim/minim.md`、接続は`plugins/minim/hooks/`で編集します。配布一覧は`.agents/plugins/marketplace.json`、プラグイン情報は`plugins/minim/.codex-plugin/plugin.json`です。

```bash
python3 scripts/check.py
```

Python 3とbashで、配布先の参照・本文の読込・本文がない場合の診断を確認します。実際の会話での表示は別途Codexで確かめます。

## ライセンス

[MIT](LICENSE)。接続の実装は[hikizan](https://github.com/hayashiii-ghub/hikizan)の対話UI試作から引き継いでいます。

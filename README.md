# minim

[UI with agents.](https://minim.hayashiii-gpt.chatgpt.site/)

少ない入力と読みやすい返答で、AIとの会話を進める小さなプラグイン。
絵文字付きの見出しに、数えられるときの進み具合と、次の行動を選べる選択肢を添えます。[プロンプト全文](minim.md)

## 使い方

使っているエージェントに、次の文を渡してください。

```text
https://github.com/hayashiii-ghub/minim
このリポジトリのAGENTS.mdを読んで、今使っているエージェントでminimを常に使えるように設定して。
```

更新・解除も「minimを更新して」「minimを外して」と頼めます。
macOSのCodexとCursorのローカルIDEで動作確認済み。導入手順は[AGENTS.md](AGENTS.md)にあります。
返答はモデルや他の指示にも左右されます。

[MIT](LICENSE)

接続の実装は[hikizan](https://github.com/hayashiii-ghub/hikizan)の対話UI試作を引き継いでいます。

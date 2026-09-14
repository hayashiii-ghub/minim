# minim site

公開先: https://minim.haygsiiii.chatgpt.site/

`index.html`がサイトのソースです。プロンプト本文を変更する場合は、リポジトリの`minim.md`と一致させます。

```bash
python3 site/build.py
python3 -m http.server 4173 --directory site/out
```

ブラウザで`http://localhost:4173`を開いて確認します。`out/`は生成物で、Gitには登録しません。

## ChatGPT Sitesへの反映

GitHubへのpushだけでは公開サイトは更新されません。Sitesへの反映は別に行います。

1. `.openai/hosting.json`にある既存の`project_id`を使います。新しいSiteは作成しません。
2. Sites専用の作業コピーで、ソースをこのディレクトリの内容に更新し、`python3 build.py`を実行します。
3. Sitesの手順に従い、専用の保存先へpushし、その変更から作った公開用ファイルを保存・デプロイします。公開範囲は一般公開のままにします。

この環境のSites専用の作業コピーは、Git管理外の`.sites-runtime/site/`に保持しています。別の環境では、Sitesから既存Siteの保存先を取得して作業コピーを用意します。

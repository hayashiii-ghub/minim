# minim

少ない入力と読みやすい返答で、AIとの会話を進めるプラグイン。
絵文字付きの見出し、進み具合、次の行動の選択肢を添えます。

[サイト](https://minim.shigoto.dev/) · [プロンプト全文](minim.md) · [MIT](LICENSE)

## 使い方

使っているエージェントに、次の文を渡してください。

```text
https://github.com/hayashiii-ghub/minim
このリポジトリのAGENTS.mdを読んで、今使っているエージェントでminimを常に使えるように設定して。
```

更新・解除もエージェントに頼めます。手順は[AGENTS.md](AGENTS.md)。
返答はモデルや他の指示にも左右されます。

## サイトの開発と公開

Cloudflareの本番構成は `minim.shigoto.dev` → `minim-site` です。mode省略・`preview`は独自ドメインを持たない `minim-site-preview`、明示した `production`だけが本番Workerと独自ドメインを対象にします。既存の `bun run build` が作る `site/dist/` を配信します。切替完了はDNS・TLS・公開URLの確認で判断し、復旧用のVercelプロジェクトと旧デプロイは保持します。

Node.js 24.22.1、Bun 1.4.4、cf 1.0.0-beta.28、Wrangler 4.158.0を使います。依存の版は `package.json` と `bun.lock` で固定します。

Cloudflare Buildsの自動公開は `main` だけを対象にし、Node.js 24.22.1 / Bun 1.4.4、ルート `/` で実行します。buildは `bun run check && bun run test && bun run cf:build:production`、deployは `node node_modules/cf/bin/cf deploy --prebuilt --mode production --worker minim-site` です。接続だけで有効化済みとは扱わず、trigger設定と実行結果を確認します。下の手動公開手順も引き続き使えます。

| 対象 | 設定 |
| --- | --- |
| image / container | `dev-environment:0.1.1` / `minim-cf-preview-dev` |
| ソース | このrepoを `/workspace` へmount |
| home / Linux用の依存 | `minim-cf-preview-home` → `/home/dev` / `minim-cf-preview-node-modules` → `/workspace/node_modules` |
| プレビュー | Mac `127.0.0.1:8793` → container `8793`。設定・生成物は `.cloudflare/` |

初回のimage・volume・container準備は `/Users/hayashi/work/projects/dev-environment/README.md` の共通手順で上の名前とポートを指定します。Macの資格情報はcontainerへ持ち込みません。共通imageに含まれるBun 1.4.4をそのまま使います。

```sh
container start minim-cf-preview-dev
container exec -w /workspace minim-cf-preview-dev bun install --frozen-lockfile
container exec -w /workspace minim-cf-preview-dev bun run check
container exec -w /workspace minim-cf-preview-dev bun run test
container exec -w /workspace minim-cf-preview-dev bun run cf:check:production
container exec -w /workspace minim-cf-preview-dev bun run cf:check
container exec -w /workspace minim-cf-preview-dev bun run cf:dev
```

終了はプレビューをCtrl+Cで止め、`container stop minim-cf-preview-dev`。volumeは残します。Macで編集・Git操作・CF認証を行います。cf CLIはMacの既存Node 24.22.1環境へ導入し、既定Nodeの版は変更していません。

公開するときは目的のmodeでcontainer内のbuildを済ませ、同じrepoからMacでprebuiltを公開します。

| 対象 | container内のbuild | Macでの公開 |
| --- | --- | --- |
| プレビュー | `bun run cf:build` | `fnm exec --using=24.22.1 cf deploy --prebuilt --worker minim-site-preview` |
| 本番 | `bun run cf:build:production` | `fnm exec --using=24.22.1 cf deploy --prebuilt --mode production --worker minim-site` |

両modeは同じ `.cloudflare/output/` を上書きするため、公開直前に対象のmodeで再buildし、`config.json` の `buildContext.mode` と `worker.config.json` のWorker名・独自ドメインを確認します。cf 1.0.0-beta.28は明示したmodeの不一致を拒否しますが、省略時はBuild Outputのmodeをそのまま使うため、公開時は上の `--worker` も明示します。本番の公開は独自ドメインの設定も適用するため、Cloudflare DNSの有効化と既存レコード・証明書の状態を確認してから実行します。

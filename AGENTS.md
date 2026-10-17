# エージェント向け

## 導入・更新・解除

使っている環境を確認し、下の方法で設定します。導入には生成済みの`dist/`を使い、Bunや開発用の依存を追加する必要はありません。対象の環境や導入範囲が分からない場合は確認します。

**Codex** — プラグインとSessionStartフックに対応するCodex、およびbashが必要です。

```sh
codex plugin marketplace add hayashiii-ghub/minim
codex plugin add minim@minim
```

更新は`codex plugin marketplace upgrade minim`の後に`codex plugin add minim@minim`を実行します。プラグインとフックが有効か確認し、新しいチャットを案内します。解除は`codex plugin remove minim@minim`。配布一覧も外す依頼なら`codex plugin marketplace remove minim`を実行します。

**Cursor** — `dist/cursor/minim/`を`~/.cursor/plugins/local/minim/`へ実ファイルで配置します。

同じファイルシステム内に一時コピーを用意し、旧登録があれば`~/.cursor/plugins/backups/`へ退避してから入れ替えます。シンボリックリンクはリンク自体を退避し、参照先には触れません。配置に失敗したら旧登録を戻します。Bunが既にあれば`bun run install:cursor`で同じ処理を行えます。

更新は最新の配布物で同じ手順を行います。解除は登録先のminimだけを外し、バックアップや他の設定を残します。ローカルプラグインの読み込み許可を確認し、`Developer: Reload Window`と新しい会話を案内します。

導入後は本文と版の一致を確認します。ファイルの配置・接続検査と、実際の会話への適用確認は区別してください。

## 開発

本体は`minim.md`です。約束を平易な言葉で短く保ち、作業手順や専門スキルを追加しません。

配布情報の正本はAgent Plugins形式の`plugin.json`です。Codex専用の表示情報は`extensions.com.openai.codex`から生成時に取り出します。クライアントの直接対応は前提にしません。

Codexへの接続は`adapters/codex/hooks/`、生成処理は`scripts/generate.ts`で編集します。`dist/`と`.agents/plugins/marketplace.json`は生成物なので直接編集しません。

開発にはBun 1.4.2とTypeScriptを使います。`bun install --frozen-lockfile`の後、変更時は`bun run generate`、`bun run check`、`bun run test`、`bun run build`を実行します。検査は配布物・サイト本文の一致、フックの本文伝達、Cursorの既存登録の保護、静的サイトの公開URLと配信に絞ります。

## サイト

`site/index.html`の本文を`minim.md`と揃えます。BunとTypeScriptによる静的サイトで、ブラウザ用JavaScriptはありません。`bun run build`で`site/dist/`を生成し、`bun run dev`でローカル表示を確認できます。公開URLの正本は`plugin.json`の`homepage`で、canonical・OG・サイトマップへ反映します。

公開先はVercelの`minim`プロジェクト、URLは`https://minim.shigoto.dev/`です。GitHub連携のRoot Directoryはリポジトリのルート、Framework PresetはOther。ルートの`vercel.json`が依存導入・ビルド・出力先を指定します。PRのPreviewで確認し、`main`でProductionへ反映します。Google Cloud DNSにはVercelが指定するサブドメイン用レコードを設定します。

`site/.openai/hosting.json`は旧Sitesの識別情報として保持します。旧URLの転送が必要なときだけ参照し、通常の公開には使いません。

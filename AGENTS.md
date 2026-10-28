# エージェント向け

説明は `README.md`、作業指示は `AGENTS.md` に集約し、別の説明文書は作成前に確認する。

## 導入・更新・解除

- 対象環境・導入範囲を確認する。導入は生成済みの `dist/` を使い、Bunや開発依存を追加しない。
- Codexはプラグイン・SessionStartフック対応版とbashが必要。導入は次の2行。更新は `codex plugin marketplace upgrade minim` の後に2行目を実行する。

```sh
codex plugin marketplace add hayashiii-ghub/minim
codex plugin add minim@minim
```

- Codexの解除は `codex plugin remove minim@minim`。配布一覧も外す依頼なら `codex plugin marketplace remove minim`。
- Cursorは `dist/cursor/minim/` を `~/.cursor/plugins/local/minim/` へ実ファイルで配置する。同じファイルシステムに一時コピーを作り、旧登録を `~/.cursor/plugins/backups/` へ退避して入れ替える。失敗時は復元し、シンボリックリンクの参照先には触れない。Bunが既にあれば `bun run install:cursor` を使える。
- Cursorの更新は同じ手順。解除は登録先のminimだけを外し、バックアップ・他の設定を残す。ローカルプラグインの許可と `Developer: Reload Window` を確認する。
- 本文・版・フックの接続を確認して新しい会話を案内する。実際の会話への適用確認と、配置・接続検査は区別する。

## 開発・公開

- 本文の正本は `minim.md`。平易な約束だけを短く保ち、専門スキルや作業手順を足さない。
- 配布情報はAgent Plugins形式の `plugin.json` が正本。`extensions.com.openai.codex` は生成時に取り出し、クライアントの直接対応を前提にしない。
- 接続は `adapters/codex/hooks/`、生成は `scripts/generate.ts` で編集する。`dist/` と `.agents/plugins/marketplace.json` は直接編集しない。
- Bun 1.4.2を使う。`bun install --frozen-lockfile` の後、変更時は `bun run generate`、`bun run check`、`bun run test`、`bun run build`。
- 配布物・サイト本文の一致、フックの本文伝達、Cursorの旧登録保護、公開URLと配信を確認する。
- サイトは `site/index.html` の静的HTML。本文は `minim.md`、公開URLは `plugin.json` の `homepage` に揃える。`bun run dev` で確認し、終了後に停止する。
- Vercelはリポジトリルートを使い、`vercel.json` に従う。PRはPreview、`main` はProduction。`site/.openai/hosting.json` は旧Sitesの転送確認用に保持する。

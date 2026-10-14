import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

export const repoRoot: string = resolve(import.meta.dir, "..");

type Plugin = {
  name: string;
  description: string;
  extensions?: { "com.openai.codex"?: Record<string, unknown> };
  [key: string]: unknown;
};

export function outputs(): Map<string, string> {
  const source = JSON.parse(readFileSync(join(repoRoot, "plugin.json"), "utf8")) as Plugin;
  const common = Object.fromEntries(
    Object.entries(source).filter(([key]) => key !== "$schema" && key !== "extensions"),
  );
  const codex = { ...common, ...source.extensions?.["com.openai.codex"] };
  const cursor = { ...common, rules: "./rules/" };
  const body = readFileSync(join(repoRoot, "minim.md"), "utf8");
  if (!body.trim()) throw new Error("minim.mdが空です");
  const encode = (data: unknown): string => JSON.stringify(data, null, 2) + "\n";
  const codexRoot = join(repoRoot, "dist/codex/minim");
  const license = readFileSync(join(repoRoot, "LICENSE"), "utf8");
  const files = new Map<string, string>([
    [join(codexRoot, ".codex-plugin/plugin.json"), encode(codex)],
    [join(codexRoot, "minim.md"), body],
    [join(codexRoot, "LICENSE"), license],
  ]);

  for (const name of readdirSync(join(repoRoot, "adapters/codex/hooks")).sort()) {
    const path = join(repoRoot, "adapters/codex/hooks", name);
    if (statSync(path, { throwIfNoEntry: false })?.isFile()) {
      files.set(join(codexRoot, "hooks", name), readFileSync(path, "utf8"));
    }
  }
  files.set(join(repoRoot, ".agents/plugins/marketplace.json"), encode({
    name: source.name,
    interface: { displayName: "Minim" },
    plugins: [{
      name: source.name,
      source: { source: "local", path: "./dist/codex/minim" },
      policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
      category: "Productivity",
    }],
  }));
  files.set(join(repoRoot, "dist/cursor/minim/.cursor-plugin/plugin.json"), encode(cursor));
  files.set(join(repoRoot, "dist/cursor/minim/rules/minim.mdc"),
    "---\ndescription: " + JSON.stringify(source.description)
    + "\nalwaysApply: true\n---\n\n" + body);
  files.set(join(repoRoot, "dist/cursor/minim/LICENSE"), license);
  return files;
}

function main(): void {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== "--check")) {
    console.error("使い方: bun scripts/generate.ts [--check]");
    process.exitCode = 2;
    return;
  }
  const stale: string[] = [];
  for (const [path, content] of outputs()) {
    if (args[0] === "--check") {
      if (!statSync(path, { throwIfNoEntry: false })?.isFile()
          || readFileSync(path, "utf8") !== content) {
        stale.push(relative(repoRoot, path));
      }
    } else {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, content, "utf8");
    }
  }
  if (stale.length) throw new Error("再生成が必要です: " + stale.join(", "));
}

if (import.meta.main) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

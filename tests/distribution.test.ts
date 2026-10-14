import { expect, test } from "bun:test";
import { cpSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { outputs, repoRoot } from "../scripts/generate.ts";

const codexRoot = join(repoRoot, "dist/codex/minim");
const prompt = readFileSync(join(repoRoot, "minim.md"), "utf8");
type HookGroup = { matcher: string; hooks: { type: string; command: string }[] };
const registration = JSON.parse(readFileSync(join(codexRoot, "hooks/hooks.json"), "utf8")) as {
  hooks: { SessionStart: HookGroup[] };
};

function commandsFor(source: string): string[] {
  return registration.hooks.SessionStart
    .filter((group) => new RegExp(group.matcher).test(source))
    .flatMap((group) => group.hooks.filter((hook) => hook.type === "command")
      .map((hook) => hook.command));
}

function withPlugin(run: (plugin: string, cwd: string) => void): void {
  const temporary = mkdtempSync(join(tmpdir(), "minim-hook-"));
  try {
    const plugin = join(temporary, "with spaces", "minim");
    cpSync(codexRoot, plugin, { recursive: true });
    run(plugin, temporary);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

function runHook(command: string, plugin: string, cwd: string) {
  return Bun.spawnSync(["bash", "-c", command], {
    cwd,
    env: { ...process.env, PLUGIN_ROOT: plugin },
    stdout: "pipe",
    stderr: "pipe",
  });
}

test("正本から生成される配布物がバイト単位で一致する", () => {
  for (const [path, content] of outputs()) {
    expect(readFileSync(path)).toEqual(Buffer.from(content, "utf8"));
  }
});

test("サイトの本文がminim.mdと一致する", async () => {
  const items: string[] = [];
  await new HTMLRewriter().on('ul[aria-label="minimのプロンプト"] > li', {
    element() { items.push(""); },
    text(chunk) {
      const index = items.length - 1;
      items[index] = (items[index] ?? "") + chunk.text;
    },
  }).transform(new Response(readFileSync(join(repoRoot, "site/index.html"), "utf8"))).text();
  const lines = prompt.trimEnd().split("\n");
  expect(lines.every((line) => line.startsWith("- "))).toBe(true);
  expect(items.map((item) => item.trim())).toEqual(lines.map((line) => line.slice(2)));
});

test("Cursorの登録先ルールが本文を常時適用する", () => {
  const cursorRoot = join(repoRoot, "dist/cursor/minim");
  const manifest = JSON.parse(readFileSync(join(cursorRoot, ".cursor-plugin/plugin.json"), "utf8")) as {
    rules: string;
  };
  const rule = readFileSync(join(cursorRoot, manifest.rules, "minim.mdc"), "utf8");
  const match = rule.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/u);
  expect(match?.[1]?.split("\n")).toContain("alwaysApply: true");
  expect(match?.[2]).toBe(prompt);
});

test("Codexの登録と各開始イベントが空白入りパスでも本文へ接続する", () => {
  const marketplace = JSON.parse(readFileSync(join(repoRoot, ".agents/plugins/marketplace.json"), "utf8")) as {
    plugins: { name: string; source: { source: string; path: string } }[];
  };
  const entry = marketplace.plugins.find((plugin) => plugin.name === "minim");
  expect(entry?.source.source).toBe("local");
  expect(resolve(repoRoot, entry?.source.path ?? "")).toBe(codexRoot);
  const commands = new Set<string>();
  for (const source of ["startup", "resume", "clear", "compact"]) {
    const matching = commandsFor(source);
    expect(matching.length).toBeGreaterThan(0);
    matching.forEach((command) => commands.add(command));
  }
  expect(commandsFor("not-startup")).toEqual([]);
  withPlugin((plugin, cwd) => {
    for (const command of commands) {
      const result = runHook(command, plugin, cwd);
      expect(result.exitCode).toBe(0);
      expect(result.stdout.toString()).toBe(`<minim>\n${prompt}\n</minim>\n`);
      expect(result.stderr.toString()).toBe("");
    }
  });
});

test("Codexの本文が欠落または空なら失敗を知らせる", () => {
  const commands = commandsFor("startup");
  expect(commands.length).toBeGreaterThan(0);
  withPlugin((plugin, cwd) => {
    const body = join(plugin, "minim.md");
    unlinkSync(body);
    for (const missing of [true, false]) {
      if (!missing) writeFileSync(body, "");
      for (const command of commands) {
        const result = runHook(command, plugin, cwd);
        expect(result.exitCode).not.toBe(0);
        expect(result.stdout.toString()).toBe("");
        expect(result.stderr.toString()).toContain("本文を読めません");
      }
    }
  });
});

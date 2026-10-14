import { afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import * as fs from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { install } from "../scripts/install-cursor";

let root: string;
let destination: string;
const sourceRule = resolve(import.meta.dir, "../dist/cursor/minim/rules/minim.mdc");

beforeEach(() => {
  root = fs.mkdtempSync(join(tmpdir(), "minim-install-test-"));
  destination = join(root, "plugins/local/minim");
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

test("install and update preserve previous files", () => {
  expect(install(destination)).toBeNull();
  const rule = join(destination, "rules/minim.mdc");
  const expectedRule = fs.readFileSync(sourceRule, "utf8");
  expect(fs.readFileSync(rule, "utf8")).toBe(expectedRule);

  fs.writeFileSync(rule, "user-edited rule");
  fs.writeFileSync(join(destination, "old-file"), "keep this");
  const backup = install(destination);
  expect(backup).not.toBeNull();
  expect(fs.readFileSync(join(backup!, "rules/minim.mdc"), "utf8")).toBe("user-edited rule");
  expect(fs.readFileSync(join(backup!, "old-file"), "utf8")).toBe("keep this");
  expect(fs.existsSync(join(destination, "old-file"))).toBe(false);
  expect(fs.readFileSync(rule, "utf8")).toBe(expectedRule);
});

test("symlink migration leaves target untouched", () => {
  const original = join(root, "original");
  fs.mkdirSync(original);
  fs.writeFileSync(join(original, "keep"), "unchanged");
  fs.mkdirSync(dirname(destination), { recursive: true });
  fs.symlinkSync(original, destination, "dir");

  const backup = install(destination);
  expect(backup).not.toBeNull();
  expect(fs.lstatSync(backup!).isSymbolicLink()).toBe(true);
  expect(fs.lstatSync(destination).isSymbolicLink()).toBe(false);
  expect(fs.readdirSync(original)).toEqual(["keep"]);
  expect(fs.readFileSync(join(original, "keep"), "utf8")).toBe("unchanged");
});

test("failed replacement restores previous install", () => {
  install(destination);
  fs.writeFileSync(join(destination, "keep"), "restore me");
  const rename = fs.renameSync;
  const simulatedFailure = new Error("simulated failure");
  const replacement = spyOn(fs, "renameSync").mockImplementation((source, target) => {
    if (basename(dirname(String(source))).startsWith(".minim-install-")) {
      throw simulatedFailure;
    }
    return rename(source, target);
  });

  try {
    expect(() => install(destination)).toThrow(simulatedFailure);
  } finally {
    replacement.mockRestore();
  }
  expect(fs.readFileSync(join(destination, "keep"), "utf8")).toBe("restore me");
});

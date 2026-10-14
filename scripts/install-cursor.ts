#!/usr/bin/env bun
import * as fs from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

const source = resolve(import.meta.dir, "../dist/cursor/minim");

export function install(destination: string): string | null {
  destination = resolve(destination);
  const parent = dirname(destination);
  const plugins = dirname(parent);
  fs.mkdirSync(parent, { recursive: true });
  const temporary = fs.mkdtempSync(join(plugins, ".minim-install-"));
  let backup: string | null = null;

  try {
    const staged = join(temporary, "minim");
    fs.cpSync(source, staged, { recursive: true });

    if (fs.lstatSync(destination, { throwIfNoEntry: false })) {
      const backups = join(plugins, "backups");
      fs.mkdirSync(backups, { recursive: true });
      backup = join(fs.mkdtempSync(join(backups, "minim-")), "minim");
      fs.renameSync(destination, backup);
    }

    try {
      fs.renameSync(staged, destination);
    } catch (error) {
      if (backup !== null) fs.renameSync(backup, destination);
      throw error;
    }

    return backup;
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

if (import.meta.main) {
  const destination = join(homedir(), ".cursor/plugins/local/minim");
  const backup = install(destination);
  console.log(`minimを登録しました: ${destination}`);
  if (backup !== null) console.log(`以前の登録は退避しました: ${backup}`);
  console.log("CursorでDeveloper: Reload Windowを実行し、新しい会話を開いてください。");
}

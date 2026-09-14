#!/usr/bin/env python3
"""正本と生成物の一致、各環境への本文の受け渡しを確認する。"""

import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

REPO = Path(__file__).resolve().parent.parent
ROOT = REPO / "plugins/minim"
subprocess.run(['python3', str(REPO / 'scripts/generate.py'), '--check'], check=True)
source = json.loads((ROOT / 'plugin.json').read_text())
assert source['$schema'] == 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json'
assert set(source) <= {'$schema', 'name', 'version', 'description', 'author', 'homepage', 'repository', 'license', 'keywords', 'extensions'}
cursor = REPO / 'dist/cursor/minim'
cursor_manifest = json.loads((cursor / '.cursor-plugin/plugin.json').read_text())
for key in ('name', 'version', 'description', 'author', 'homepage', 'repository', 'license'):
    assert cursor_manifest[key] == source[key]
assert cursor_manifest['rules'] == './rules/'
assert not (cursor / 'hooks').exists()
assert not (cursor / 'plugin.json').exists()
rule = (cursor / 'rules/minim.mdc').read_text()
frontmatter, body = rule.removeprefix('---\n').split('\n---\n\n', 1)
assert 'alwaysApply: true' in frontmatter.splitlines()
assert body == (ROOT / 'minim.md').read_text()
marketplace = json.loads((REPO / ".agents/plugins/marketplace.json").read_text())
assert marketplace["name"] == "minim"
assert len(marketplace["plugins"]) == 1
entry = marketplace["plugins"][0]
assert entry["name"] == "minim"
assert (REPO / entry["source"]["path"]).resolve() == ROOT
assert (ROOT / "LICENSE").read_bytes() == (REPO / "LICENSE").read_bytes()
manifest = json.loads((ROOT / ".codex-plugin/plugin.json").read_text())
assert manifest["name"] == "minim"
assert not any(key in manifest for key in ("skills", "mcpServers", "apps"))
hooks = json.loads((ROOT / "hooks/hooks.json").read_text())["hooks"]
assert list(hooks) == ["SessionStart"]
assert len(hooks["SessionStart"]) == 1
group = hooks["SessionStart"][0]
assert len(group["hooks"]) == 1
for source in ("startup", "resume", "clear", "compact"):
    assert re.fullmatch(group["matcher"], source)
assert not re.fullmatch(group["matcher"], "not-startup")
subprocess.run(["bash", "-n", str(ROOT / "hooks/session-start.sh")], check=True)

with tempfile.TemporaryDirectory() as temporary:
    plugin = Path(temporary) / "with spaces" / "minim"
    shutil.copytree(ROOT, plugin, ignore=shutil.ignore_patterns(".git"))
    body = plugin / "minim.md"

    def run():
        return subprocess.run(
            ["bash", "-c", group["hooks"][0]["command"]],
            cwd=temporary,
            env={**os.environ, "PLUGIN_ROOT": str(plugin)},
            capture_output=True,
            text=True,
        )

    result = run()
    assert result.returncode == 0, result.stderr
    assert result.stdout == f"<minim>\n{body.read_text()}\n</minim>\n"
    assert result.stderr == ""
    body.unlink()
    for missing in (True, False):
        if not missing:
            body.write_text("")
        result = run()
        assert result.returncode == 1
        assert result.stdout == ""
        assert "本文を読めません" in result.stderr

print("✔ minim: 生成物の一致・Cursor常時適用ルール・Codex本文読込・欠落時の診断を確認しました")

#!/usr/bin/env python3
"""共通の配布情報と本文から、各環境向けのファイルを生成する。"""

import argparse
import json
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
ROOT = REPO / 'plugins/minim'


def outputs():
    source = json.loads((ROOT / 'plugin.json').read_text())
    common = {key: value for key, value in source.items()
              if key not in ('$schema', 'extensions')}
    codex = {**common, **source.get('extensions', {}).get('com.openai.codex', {})}
    cursor = {**common, 'rules': './rules/'}
    body = (ROOT / 'minim.md').read_text()
    assert body.strip(), 'minim.mdが空です'
    encode = lambda data: json.dumps(data, ensure_ascii=False, indent=2) + '\n'
    return {
        ROOT / '.codex-plugin/plugin.json': encode(codex),
        REPO / 'dist/cursor/minim/.cursor-plugin/plugin.json': encode(cursor),
        REPO / 'dist/cursor/minim/rules/minim.mdc': (
            '---\ndescription: ' + json.dumps(source['description'], ensure_ascii=False)
            + '\nalwaysApply: true\n---\n\n' + body),
        REPO / 'dist/cursor/minim/LICENSE': (REPO / 'LICENSE').read_text(),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='生成せず差分を検査する')
    args = parser.parse_args()
    stale = []
    for path, content in outputs().items():
        if args.check:
            if not path.is_file() or path.read_text() != content:
                stale.append(str(path.relative_to(REPO)))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
    if stale:
        parser.exit(1, '再生成が必要です: ' + ', '.join(stale) + '\n')


if __name__ == '__main__':
    main()

#!/usr/bin/env bash
# 対話の約束をCodexのセッション開始時に渡す。
# スキル選択を経由せず、再開・圧縮後も同じ本文を受け取れるようにする。
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BODY="$ROOT/minim.md"
if [ ! -r "$BODY" ] || [ ! -s "$BODY" ]; then
  printf 'minimを適用できません: 本文を読めません (%s)\n' "$BODY" >&2
  exit 1
fi
printf '<minim>\n'
cat "$BODY"
printf '\n</minim>\n'

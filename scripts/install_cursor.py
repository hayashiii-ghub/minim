#!/usr/bin/env python3
"""minimをCursorへ実ファイルで導入・更新する。"""

from pathlib import Path
import tempfile

from generate import REPO, outputs


def install(destination):
    source = REPO / "dist/cursor/minim"
    files = {path.relative_to(source): content for path, content in outputs().items()
             if path.is_relative_to(source)}
    destination.parent.mkdir(parents=True, exist_ok=True)
    backup = None
    with tempfile.TemporaryDirectory(prefix=".minim-install-",
                                     dir=destination.parent.parent) as temporary:
        staged = Path(temporary) / "minim"
        for relative, content in files.items():
            target = staged / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content, encoding="utf-8")

        if destination.exists() or destination.is_symlink():
            backups = destination.parent.parent / "backups"
            backups.mkdir(exist_ok=True)
            backup = Path(tempfile.mkdtemp(prefix="minim-", dir=backups)) / "minim"
            destination.rename(backup)
        try:
            staged.rename(destination)
        except OSError:
            if backup is not None:
                backup.rename(destination)
            raise
    return backup


if __name__ == "__main__":
    destination = Path.home() / ".cursor/plugins/local/minim"
    backup = install(destination)
    print(f"minimを登録しました: {destination}")
    if backup is not None:
        print(f"以前の登録は退避しました: {backup}")
    print("CursorでDeveloper: Reload Windowを実行し、新しい会話を開いてください。")

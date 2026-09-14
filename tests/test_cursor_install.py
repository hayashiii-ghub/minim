"""実ファイルの導入と、旧登録を壊さない移行を確認する。"""

from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from install_cursor import install


class CursorInstallTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.destination = self.root / "plugins/local/minim"

    def test_install_and_update_preserve_previous_files(self):
        self.assertIsNone(install(self.destination))
        rule = self.destination / "rules/minim.mdc"
        self.assertIn("alwaysApply: true", rule.read_text())
        rule.write_text("user-edited rule")
        (self.destination / "old-file").write_text("keep this")
        backup = install(self.destination)
        self.assertEqual((backup / "rules/minim.mdc").read_text(), "user-edited rule")
        self.assertEqual((backup / "old-file").read_text(), "keep this")
        self.assertFalse((self.destination / "old-file").exists())
        self.assertIn("alwaysApply: true", rule.read_text())

    def test_symlink_migration_leaves_target_untouched(self):
        original = self.root / "original"
        original.mkdir()
        (original / "keep").write_text("unchanged")
        self.destination.parent.mkdir(parents=True)
        self.destination.symlink_to(original, target_is_directory=True)
        backup = install(self.destination)
        self.assertTrue(backup.is_symlink())
        self.assertFalse(self.destination.is_symlink())
        self.assertEqual(list(original.iterdir()), [original / "keep"])
        self.assertEqual((original / "keep").read_text(), "unchanged")

    def test_failed_replacement_restores_previous_install(self):
        install(self.destination)
        (self.destination / "keep").write_text("restore me")
        rename = Path.rename

        def fail_staging(path, target):
            if path.parent.name.startswith(".minim-install-"):
                raise OSError("simulated failure")
            return rename(path, target)

        with patch.object(Path, "rename", fail_staging):
            with self.assertRaises(OSError):
                install(self.destination)
        self.assertEqual((self.destination / "keep").read_text(), "restore me")


if __name__ == "__main__":
    unittest.main()

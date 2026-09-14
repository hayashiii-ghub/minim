"""Prepare the static site for Sites hosting."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parent
(root / "out").mkdir(exist_ok=True)
shutil.copyfile(root / "index.html", root / "out" / "index.html")
print("Static site ready: out/index.html")

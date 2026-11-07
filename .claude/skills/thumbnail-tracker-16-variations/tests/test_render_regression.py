"""Render examples/read-their-mind-final.json with the bundled fonts and compare with tests/golden/.

Thresholds: mean absolute difference < 2.0 (of 255) and 99th percentile < 40 per image.
The goldens were rendered by the pre-3.0 renderer with Google-hosted fonts, so this also
proves the bundled fonts match. Skips cleanly without Node, Playwright or Chromium, or when THUMB_SKIP_RENDER=1.
Set THUMB_REGRESSION_REPORT=1 to print the numbers.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
GOLDEN = ROOT / "tests" / "golden"
SPEC = ROOT / "examples" / "read-their-mind-final.json"
FILES = ["yt-D1-spotlight.jpg", "li-video-D1-1920x1080.jpg", "li-post-D1-1080x1350.jpg"]
MAD_MAX, P99_MAX = 2.0, 40

PROBE = """
const tries = ['playwright', '/opt/node-tools/node_modules/playwright', 'playwright-core'];
let pw; for (const t of tries) { try { pw = require(t); break; } catch (_) {} }
if (!pw) { console.log('no-playwright'); process.exit(0); }
pw.chromium.launch().then(b => b.close()).then(() => console.log('ok'), () => console.log('no-chromium'));
"""


def renderer_available():
    if not shutil.which("node"):
        return "node not found"
    try:
        r = subprocess.run(["node", "-e", PROBE], capture_output=True, text=True, timeout=60)
    except Exception as e:  # noqa: BLE001
        return f"probe failed: {e}"
    out = r.stdout.strip()
    return None if out == "ok" else (out or r.stderr.strip()[:200] or "playwright probe failed")


try:
    import numpy  # noqa: F401
    from PIL import Image  # noqa: F401
    import imgdiff
    _deps = None
except ImportError as e:
    _deps = f"missing Python dependency: {e}"

_skip = ("THUMB_SKIP_RENDER=1" if os.environ.get("THUMB_SKIP_RENDER") == "1" else None) or _deps or renderer_available()


@unittest.skipIf(_skip, f"render regression skipped: {_skip}")
class RenderRegressionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.mkdtemp(prefix="tt-regress-")
        env = dict(os.environ, THUMB_OFFLINE="1")
        env.pop("THUMB_FONTS", None)
        r = subprocess.run(["node", str(ROOT / "scripts" / "render.cjs"), str(SPEC), cls.tmp],
                           capture_output=True, text=True, env=env, timeout=300)
        cls.log = r.stdout + r.stderr
        cls.rc = r.returncode
        cls.results = {}

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.tmp, ignore_errors=True)
        if os.environ.get("THUMB_REGRESSION_REPORT") and cls.results:
            print("\nrender regression:", json.dumps(cls.results, indent=1), file=sys.stderr)

    def test_render_succeeded_without_font_warnings(self):
        self.assertEqual(self.rc, 0, self.log)
        self.assertNotIn("bundled fonts missing", self.log)

    def test_matches_golden(self):
        self.assertEqual(self.rc, 0, self.log)
        for name in FILES:
            with self.subTest(name):
                r = imgdiff.diff(Path(self.tmp) / name, GOLDEN / name)
                self.results[name] = {"mad": r["mad"], "p99": r["p99"]}
                self.assertIsNotNone(r["mad"], f"size differs: {r}")
                self.assertLess(r["mad"], MAD_MAX, f"{name}: {r}")
                self.assertLess(r["p99"], P99_MAX, f"{name}: {r}")


if __name__ == "__main__":
    unittest.main()

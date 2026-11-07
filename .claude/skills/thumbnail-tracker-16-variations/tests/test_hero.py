"""The objects-only standard: the six approved specs rebuild to their goldens, the schema holds the 4-word rule,
and nothing sits under YouTube's timestamp."""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
sys.path.insert(0, str(ROOT / "scripts" / "hero"))
from validate import load_schema, validate  # noqa: E402

EX = ROOT / "examples" / "objects-only-2026-11"
SPECS = sorted(EX.glob("*.json"))
ROUND2 = sorted((ROOT / "examples" / "objects-only-2026-11-round2").glob("*.json"))
GOLDEN = ROOT / "tests" / "golden"
MAD_MAX, P99_MAX = 2.0, 40
TIMESTAMP = (1150, 660, 1270, 710)


class TestSpecs(unittest.TestCase):
    def test_six_specs_validate(self):
        self.assertEqual(len(SPECS), 6)
        schema = load_schema(str(ROOT / "schemas" / "hero.schema.json"))
        for p in SPECS:
            with self.subTest(spec=p.name):
                errs, _ = validate(json.loads(p.read_text(encoding="utf-8")), schema)
                self.assertEqual(errs, [])

    def test_four_words_max(self):
        schema = load_schema(str(ROOT / "schemas" / "hero.schema.json"))
        bad = {"id": "x", "studio": {"preset": "dark-red"},
               "layers": [{"type": "text", "text": "one two three four five", "x": 0, "y": 100, "size": 100}]}
        errs, _ = validate(bad, schema)
        self.assertTrue(errs, "five words must fail the schema")
        for p in SPECS:
            s = json.loads(p.read_text(encoding="utf-8"))
            words = [w for w in re.split(r"\s+", s["words"]) if w]
            self.assertLessEqual(len(words), 4, p.name)

    def test_timestamp_corner_clear(self):
        import build_hero
        for p in SPECS:
            s = json.loads(p.read_text(encoding="utf-8"))
            warnings = []
            build_hero.build_page(s, warnings)
            self.assertEqual([w for w in warnings if "timestamp" in w], [], p.name)

    def test_round2_specs_validate_and_build_clean(self):
        import build_hero
        schema = load_schema(str(ROOT / "schemas" / "hero.schema.json"))
        self.assertEqual(len(ROUND2), 6)
        for p in ROUND2:
            with self.subTest(spec=p.name):
                s = json.loads(p.read_text(encoding="utf-8"))
                errs, _ = validate(s, schema)
                self.assertEqual(errs, [])
                warnings = []
                build_hero.build_page(s, warnings)
                self.assertEqual(warnings, [])
                self.assertLessEqual(len([w for w in re.split(r"\s+", s["words"]) if w]), 4)

    def test_three_looks_per_video(self):
        for prefix in ("AI-Harnesses", "Grok"):
            names = [p.stem for p in SPECS if p.stem.startswith(prefix)]
            self.assertTrue(any(n.endswith("objects-dark") for n in names), prefix)
            self.assertTrue(any(n.endswith("objects-bright") for n in names), prefix)
            self.assertTrue(any(n.endswith("on-brand") for n in names), prefix)

    def test_no_face_layers(self):
        """Master rule 6: the standard has no photo layer at all."""
        for p in SPECS:
            self.assertNotIn("face", p.read_text(encoding="utf-8").lower(), p.name)

    def test_finishes_exist(self):
        import palettes
        for p in SPECS:
            for L in json.loads(p.read_text(encoding="utf-8"))["layers"]:
                f = L.get("finish")
                if f:
                    table = {"text": palettes.TYPE, "logo": palettes.LOGO, "clock": palettes.CLOCK, "handset": palettes.HANDSET}[L["type"]]
                    self.assertIn(f, table, f"{p.name}: {L['type']} finish {f}")


PROBE = """
const tries = ['playwright', '/opt/node-tools/node_modules/playwright', 'playwright-core'];
let pw; for (const t of tries) { try { pw = require(t); break; } catch (_) {} }
if (!pw) { console.log('no-playwright'); process.exit(0); }
pw.chromium.launch().then(b => b.close()).then(() => console.log('ok'), () => console.log('no-chromium'));
"""


def renderer_available():
    if not shutil.which("node"):
        return "node not found"
    r = subprocess.run(["node", "-e", PROBE], capture_output=True, text=True, timeout=60)
    out = r.stdout.strip()
    return None if out == "ok" else (out or "playwright probe failed")


_skip = ("THUMB_SKIP_RENDER=1" if os.environ.get("THUMB_SKIP_RENDER") == "1" else None) or renderer_available()


@unittest.skipIf(_skip, f"hero render skipped: {_skip}")
class TestRenderMatchesGolden(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.mkdtemp(prefix="tt-hero-")
        r = subprocess.run([sys.executable, str(ROOT / "scripts" / "hero" / "build_hero.py"), *map(str, SPECS), cls.tmp],
                           capture_output=True, text=True, timeout=600)
        cls.rc, cls.log = r.returncode, r.stdout + r.stderr

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.tmp, ignore_errors=True)

    def test_build_succeeded_without_warnings(self):
        self.assertEqual(self.rc, 0, self.log[-2000:])
        self.assertNotIn("WARNING", self.log)

    def test_matches_golden(self):
        import imgdiff
        for p in SPECS:
            name = f"{p.stem}-YouTube-1280x720.jpg"
            with self.subTest(name=name):
                res = imgdiff.diff(Path(self.tmp) / name, GOLDEN / f"hero-{name}")
                self.assertLessEqual(res["mad"], MAD_MAX, res)
                self.assertLessEqual(res["p99"], P99_MAX, res)


if __name__ == "__main__":
    unittest.main()

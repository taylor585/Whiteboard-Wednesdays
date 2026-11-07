"""Variety pack (3.1): plan() builds a varied batch, check() fails samey ones, stickers render."""
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
import variety  # noqa: E402

BRIEF = {"title": "How to Build an App With Claude (Without Rebuilds)", "line": "Motion Planning",
         "mark": "Planning", "mood": "confused", "prefix": "T"}


def fails(spec, **kw):
    return [m for level, m in variety.check(spec, **kw)[1] if level == "FAIL"]


class PlanTests(unittest.TestCase):
    def test_plan_passes_its_own_check(self):
        spec = variety.plan(BRIEF)
        self.assertEqual(len(spec["thumbnails"]), 5)
        self.assertEqual(fails(spec), [])

    def test_house_mix_two_dark_three_light(self):
        rows, _ = variety.check(variety.plan(BRIEF))
        self.assertEqual(sorted(r["ground"] for r in rows), ["dark", "dark", "light", "light", "light"])

    def test_one_face_each_by_default(self):
        rows, _ = variety.check(variety.plan(BRIEF))
        self.assertTrue(all(r["faces"] == 1 for r in rows))

    def test_six_adds_one_multi_face_wildcard(self):
        spec = variety.plan({**BRIEF, "count": 6})
        rows, out = variety.check(spec)
        self.assertEqual(sum(r["faces"] > 1 for r in rows), 1)
        self.assertEqual(fails(spec), [])

    def test_mark_word_follows_case(self):
        caps = variety.plan(BRIEF)["thumbnails"][0]
        self.assertIn(caps["highlight"], caps["headline"])
        self.assertEqual(caps["headline"], caps["headline"].upper())

    def test_shipped_example_is_the_plan(self):
        shipped = json.loads((ROOT / "examples" / "variety-motion-planning.json").read_text())
        brief = json.loads((ROOT / "examples" / "variety" / "brief.json").read_text())
        self.assertEqual(shipped, variety.plan(brief))


class CheckTests(unittest.TestCase):
    def test_samey_batch_fails(self):
        t = {"archetype": "scene", "theme": "dark", "font": "serif", "headline": "Same line",
             "highlight": "line", "highlight_style": "color"}
        spec = {"thumbnails": [dict(t, id=f"s{i}") for i in range(5)]}
        msgs = " ".join(fails(spec))
        for word in ("grounds", "backgrounds", "typefaces", "case", "marks", "emoji", "duplicate"):
            self.assertIn(word, msgs)

    def test_marker_font_counts_as_caps(self):
        self.assertEqual(variety.axes({"font": "marker", "headline": "motion planning"})["case"], "CAPS")

    def test_emoji_in_chip_text_counts(self):
        t = {"elements": [{"type": "chip", "text": "🤯"}]}
        self.assertEqual(variety.axes(t)["emoji"], "yes")

    def test_many_faces_strict_fails(self):
        many = {"face": {"frame": "circle"}, "stickers": [{"type": "photo"}]}
        spec = {"thumbnails": [dict(many, id="a"), dict(many, id="b")]}
        self.assertTrue(any("faces" in m for m in fails(spec, strict=True)))

    def test_cli_exit_codes(self):
        with tempfile.TemporaryDirectory() as d:
            good, bad = Path(d, "good.json"), Path(d, "bad.json")
            good.write_text(json.dumps(variety.plan(BRIEF)))
            bad.write_text(json.dumps({"thumbnails": [{"id": f"x{i}", "font": "sans", "headline": "a b"} for i in range(5)]}))
            run = lambda p: subprocess.run([sys.executable, str(ROOT / "scripts" / "variety.py"), "check", str(p)],
                                           capture_output=True, text=True).returncode
            self.assertEqual(run(good), 0)
            self.assertEqual(run(bad), 1)


@unittest.skipIf(os.environ.get("THUMB_SKIP_RENDER"), "THUMB_SKIP_RENDER set")
class StickerRenderTests(unittest.TestCase):
    def test_example_renders(self):
        with tempfile.TemporaryDirectory() as d:
            env = {**os.environ, "THUMB_OFFLINE": "1"}
            r = subprocess.run(["node", str(ROOT / "scripts" / "render.cjs"),
                                str(ROOT / "examples" / "variety-motion-planning.json"), d],
                               capture_output=True, text=True, env=env)
            if r.returncode and "Cannot find module" in r.stderr:
                self.skipTest("playwright not installed")
            self.assertEqual(r.returncode, 0, r.stderr)
            self.assertNotIn("WARNING", r.stdout)
            self.assertEqual(len(list(Path(d).glob("VP*.jpg"))), 5)


if __name__ == "__main__":
    unittest.main()

"""Schemas: shipped examples validate; broken specs, batches and brands fail."""
import copy
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
import validate as v  # noqa: E402


def errors(inst, kind):
    return v.validate(inst, v.load_schema(kind))[0]


SPEC = {"thumbnails": [{"id": "t1", "archetype": "marker", "headline": "Read their mind."}]}
BRAND = {"name": "Pecuna Factorem", "owner": "Taylor Cunningham", "language": "en-GB",
         "colours": {"ground": "#F5EAD8", "ink": "#1C1A17", "accent": "#8B6002", "accent_bright": "#CB8E03",
                     "highlight": "#F6DF8C", "problem": "#B3261E", "fix": "#2E7D32", "dark_ground": "#0A0908"},
         "fonts": {"headline": "Fraunces", "body": "Instrument Sans", "label": "IBM Plex Mono"},
         "logo": "official logo mark only", "cta_pinned": "Want to chat? ...",
         "hashtags": {"min": 3, "max": 5}, "rules": ["..."]}


class ExampleTests(unittest.TestCase):
    def test_examples_validate(self):
        files = sorted((ROOT / "examples").glob("*.json"))
        self.assertTrue(files)
        for f in files:
            with self.subTest(f.name):
                e, _w, _k = v.validate_file(f)
                self.assertEqual(e, [], f"{f.name}: {e}")

    def test_schemas_are_valid_json(self):
        for k in ("spec", "batch", "brand"):
            self.assertIn("properties", v.load_schema(k))

    def test_brand_shape_accepted(self):
        self.assertEqual(errors(BRAND, "brand"), [])

    def test_cli(self):
        import contextlib
        import io
        with contextlib.redirect_stdout(io.StringIO()) as out:
            self.assertEqual(v.main(["-q", str(ROOT / "examples" / "sample-spec.json")]), 0)
        self.assertIn("ok:", out.getvalue())


class BadSpecTests(unittest.TestCase):
    def bad(self, **fields):
        s = copy.deepcopy(SPEC)
        s["thumbnails"][0].update(fields)
        return errors(s, "spec")

    def test_good_spec(self):
        self.assertEqual(errors(SPEC, "spec"), [])

    def test_missing_thumbnails(self):
        self.assertTrue(errors({}, "spec"))

    def test_missing_id(self):
        s = {"thumbnails": [{"archetype": "marker"}]}
        self.assertTrue(any("id" in m for _p, m in errors(s, "spec")))

    def test_unknown_archetype(self):
        self.assertTrue(self.bad(archetype="verdik"))

    def test_bad_enums(self):
        for f, val in [("theme", "blue"), ("format", "gif"), ("font", "comic"), ("highlight_style", "glow")]:
            with self.subTest(f):
                self.assertTrue(self.bad(**{f: val}))

    def test_accent_must_be_hex(self):
        self.assertTrue(self.bad(accent="orange"))
        self.assertFalse(self.bad(accent="#abc"))

    def test_id_must_be_filename_safe(self):
        self.assertTrue(self.bad(id="a/b"))
        self.assertTrue(self.bad(id=""))

    def test_wrong_types(self):
        self.assertTrue(self.bad(canvas={"w": "1280", "h": 720}))
        self.assertTrue(self.bad(scale="2"))
        self.assertTrue(self.bad(headline_size=True))

    def test_bad_scene_element(self):
        self.assertTrue(self.bad(archetype="scene", elements=[{"type": "blob"}]))
        self.assertTrue(self.bad(archetype="scene", elements=[{"x": 1}]))

    def test_unknown_field_is_warning_only(self):
        s = copy.deepcopy(SPEC)
        s["thumbnails"][0]["headlne"] = "typo"
        e, w = v.validate(s, v.load_schema("spec"))
        self.assertEqual(e, [])
        self.assertTrue(any("headlne" in p for p, _m in w))


class BadBatchAndBrandTests(unittest.TestCase):
    BATCH = {"video": {"title_working": "x"}, "titles": [{"text": "A title"}], "thumbnails": SPEC["thumbnails"],
             "linkedin": [{"angle": "problem", "mode": "native", "pair": 0, "text": "Hook"}]}

    def test_good_batch(self):
        self.assertEqual(errors(self.BATCH, "batch"), [])

    def test_bad_batch(self):
        for mutate in (lambda b: b.pop("video"),
                       lambda b: b["titles"].append({"formula": "x"}),
                       lambda b: b["linkedin"][0].update(mode="carousel"),
                       lambda b: b["linkedin"][0].update(text="x" * 3001),
                       lambda b: b["thumbnails"].append({"id": "t2", "archetype": "nope"})):
            b = copy.deepcopy(self.BATCH)
            mutate(b)
            self.assertTrue(errors(b, "batch"))

    def test_bad_brand(self):
        b = copy.deepcopy(BRAND)
        b["colours"]["ink"] = "black"
        self.assertTrue(errors(b, "brand"))
        b = copy.deepcopy(BRAND)
        del b["fonts"]
        self.assertTrue(errors(b, "brand"))


if __name__ == "__main__":
    unittest.main()

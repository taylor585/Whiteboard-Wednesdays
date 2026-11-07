"""3.3 variety: the checker fails samey rounds, and the "How To Think With AI" round passes and builds clean."""
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
sys.path.insert(0, str(ROOT / "scripts" / "hero"))
import variety_check  # noqa: E402
from validate import load_schema, validate  # noqa: E402

THINK = sorted((ROOT / "examples" / "think-variety-2026-11").glob("*.json"))
THINK16 = sorted((ROOT / "examples" / "think-16-2026-11").glob("*.json"))


def spec(i, **look):
    base = dict(layout=f"l{i}", ground=f"g{i}", font=f"f{i % 3}", accent=f"a{i % 3}", hero=f"h{i}", emoji=i % 2 == 0)
    base.update(look)
    return {"id": f"s{i}", "look": base}


class TestChecker(unittest.TestCase):
    def test_varied_round_passes(self):
        fails, _ = variety_check.check([spec(i) for i in range(5)])
        self.assertEqual(fails, [])

    def test_repeated_layout_ground_or_hero_fails(self):
        for key in ("layout", "ground", "hero"):
            with self.subTest(key=key):
                fails, _ = variety_check.check([spec(0, **{key: "same"}), spec(1, **{key: "same"}), spec(2)])
                self.assertTrue(any(key in f for f in fails), fails)

    def test_too_few_fonts_fails(self):
        fails, _ = variety_check.check([spec(i, font="anton") for i in range(4)])
        self.assertTrue(any("font" in f for f in fails))

    def test_emoji_all_or_none_fails(self):
        fails, _ = variety_check.check([spec(i, emoji=True) for i in range(5)])
        self.assertTrue(any("emoji" in f for f in fails))

    def test_missing_look_fails(self):
        fails, _ = variety_check.check([{"id": "x"}])
        self.assertTrue(fails)

    def test_history_and_wildcard_warn(self):
        past = [spec(0)]
        _, warns = variety_check.check([spec(0, hero="new")], past)
        self.assertTrue(any("recent published" in w for w in warns))
        _, warns = variety_check.check([spec(0, layout="words-left"), spec(1, layout="on-brand-ledge")])
        self.assertTrue(any("wildcard" in w for w in warns))


class TestThinkRound(unittest.TestCase):
    def test_round_passes_checker(self):
        self.assertEqual(len(THINK), 6)
        specs = [json.loads(p.read_text(encoding="utf-8")) for p in THINK]
        fails, warns = variety_check.check(specs)
        self.assertEqual(fails, [])
        self.assertEqual(warns, [])

    def test_specs_validate_and_build_clean(self):
        import build_hero
        schema = load_schema(str(ROOT / "schemas" / "hero.schema.json"))
        for p in THINK:
            with self.subTest(spec=p.name):
                s = json.loads(p.read_text(encoding="utf-8"))
                self.assertEqual(validate(s, schema)[0], [])
                warnings = []
                build_hero.build_page(s, warnings)
                self.assertEqual(warnings, [])


class TestSixteenRound(unittest.TestCase):
    def test_sixteen_pass_checker_and_build_clean(self):
        import build_hero
        self.assertEqual(len(THINK16), 16)
        specs = [json.loads(p.read_text(encoding="utf-8")) for p in THINK16]
        fails, warns = variety_check.check(specs)
        self.assertEqual(fails, [])
        self.assertEqual(len({s["look"]["layout"] for s in specs}), 8)
        for s in specs:
            w = []
            build_hero.build_page(s, w)
            self.assertEqual(w, [], s["id"])

    def test_sixteen_rules(self):
        same = [spec(i, layout="versus", ground=f"g{i}") for i in range(3)] + [spec(i + 3) for i in range(13)]
        for s in same:
            s["words"] = f"line {int(s['id'][1:]) % 5}"
        fails, _ = variety_check.check(same)
        self.assertTrue(any('"versus" is used 3 times' in f for f in fails), fails)
        few = [spec(i) for i in range(16)]
        for s in few:
            s["words"] = "same"
        fails, _ = variety_check.check(few)
        self.assertTrue(any("different lines" in f for f in fails), fails)


if __name__ == "__main__":
    unittest.main()

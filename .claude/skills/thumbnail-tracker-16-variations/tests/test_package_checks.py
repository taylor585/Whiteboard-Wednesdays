"""package.check / package.placeholders, and fetch_videos.hashtags."""
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
import package  # noqa: E402

GOOD_DESC = "Intro\n\n0:00 Start\n\n1:30 The problem\n\n4:10 The fix\n"
GOOD_POST = "A hook that is not a title.\n\nBody.\n\n#MetaAds #Marketing #ICP"


def batch(**kw):
    b = {"video": {"title_working": "x"},
         "titles": [{"text": "Why Your Meta Ads Land the Wrong People"}],
         "thumbnails": [{"id": "t1", "archetype": "marker"}],
         "descriptions": [{"style": "pecuna", "text": GOOD_DESC}],
         "linkedin": [{"angle": "problem", "text": GOOD_POST}]}
    b.update(kw)
    return b


def has(problems, needle):
    return any(needle in p for p in problems)


class CheckTests(unittest.TestCase):
    def test_clean_batch_has_no_problems(self):
        self.assertEqual(package.check(batch()), [])

    def test_title_over_70(self):
        p = package.check(batch(titles=[{"text": "x" * 71}]))
        self.assertTrue(has(p, "71 characters"))
        self.assertEqual(package.check(batch(titles=[{"text": "x" * 70}])), [])

    def test_chapters_not_from_zero(self):
        d = "0:05 a\n1:00 b\n2:00 c"
        self.assertTrue(has(package.check(batch(descriptions=[{"text": d}])), "start at 0:00"))

    def test_fewer_than_three_chapters(self):
        d = "0:00 a\n1:00 b"
        self.assertTrue(has(package.check(batch(descriptions=[{"text": d}])), "at least 3 chapters"))

    def test_chapters_under_10s_apart(self):
        d = "0:00 a\n0:05 b\n2:00 c"
        self.assertTrue(has(package.check(batch(descriptions=[{"text": d}])), "10s apart"))

    def test_hour_chapters_parse(self):
        d = "0:00 a\n30:00 b\n1:02:00 c"
        self.assertEqual(package.check(batch(descriptions=[{"text": d}])), [])

    def test_referral_link_without_disclosure(self):
        d = GOOD_DESC + "\nTool: https://example.com/?ref=taylor\n"
        self.assertTrue(has(package.check(batch(descriptions=[{"text": d}])), "no disclosure"))
        d2 = d + "Affiliate link: I earn a commission.\n"
        self.assertEqual(package.check(batch(descriptions=[{"text": d2}])), [])

    def test_linkedin_hook_over_140(self):
        post = "h" * 141 + "\n\n#a1 #b2 #c3"
        self.assertTrue(has(package.check(batch(linkedin=[{"text": post}])), "141 characters"))

    def test_linkedin_hook_repeats_title(self):
        post = "Why your meta ads land the wrong people.\n\n#One #Two #Three"
        self.assertTrue(has(package.check(batch(linkedin=[{"text": post}])), "repeats a YouTube title"))

    def test_hashtags_out_of_range(self):
        for tags, bad in [("#One #Two", True), ("#One #Two #Three", False),
                          ("#A #B #C #D #E", False), ("#A #B #C #D #E #F", True)]:
            p = package.check(batch(linkedin=[{"text": "Hook\n\n" + tags}]))
            self.assertEqual(has(p, "hashtags"), bad, tags)

    def test_numbers_and_entities_are_not_hashtags(self):
        p = package.check(batch(linkedin=[{"text": "Hook #1 of 3 &#39;\n\n#One #Two #Three"}]))
        self.assertEqual(p, [])

    def test_linkedin_over_3000(self):
        post = "Hook\n\n" + "x" * 3000 + "\n#One #Two #Three"
        self.assertTrue(has(package.check(batch(linkedin=[{"text": post}])), "3,000"))


class PlaceholderTests(unittest.TestCase):
    def test_placeholders_found(self):
        b = batch(descriptions=[{"text": "Book: [BOOKING LINK]\nMore: [your link]"}],
                  linkedin=[{"text": "See [YOUTUBE LINK] and [your link]"}])
        self.assertEqual(package.placeholders(b), ["[BOOKING LINK]", "[YOUTUBE LINK]", "[your link]"])

    def test_ordinary_brackets_ignored(self):
        b = batch(descriptions=[{"text": "[1] see note [ok] [Ab]"}], linkedin=[])
        self.assertEqual(package.placeholders(b), [])


class SchemaGateTests(unittest.TestCase):
    def test_schema_check_flags_duplicates(self):
        b = batch(thumbnails=[{"id": "t1", "archetype": "marker"}, {"id": "t1", "archetype": "quote"}])
        lines, hard = package.schema_check(b)
        self.assertTrue(hard)
        self.assertTrue(all(line.startswith("SCHEMA:") for line in lines))

    def test_schema_check_clean(self):
        lines, hard = package.schema_check(batch())
        self.assertFalse(hard)


class FetchVideosHashtagTests(unittest.TestCase):
    def test_only_real_hashtags(self):
        import fetch_videos
        text = "Tip #1, #17 of 20. #MetaAds #ai_tools &#39; x#nope #MetaAds"
        self.assertEqual(fetch_videos.hashtags(text), ["#MetaAds", "#ai_tools"])
        self.assertEqual(fetch_videos.hashtags(""), [])
        self.assertEqual(fetch_videos.hashtags(None), [])


if __name__ == "__main__":
    unittest.main()

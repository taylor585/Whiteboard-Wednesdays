import json
import os
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "scripts"))
import output  # noqa: E402

T = "How AI Harnesses Can 10x Your Quality and Output"


def full(title=T, reels=1):
    files = []
    for folder, names in output.expected(title, reels).items():
        ext = "" if folder == output.COPY else ".mp4" if folder == output.VIDEOS else ".jpg"
        files += [{"title": n + ext, "folder": folder} for n in names]
    return files


class Names(unittest.TestCase):
    def test_master_rules(self):
        e = output.expected(T)
        self.assertEqual(e["Post Videos"][:2], [f"{T} - YouTube", f"{T} - LinkedIn"])
        self.assertTrue(all(n.startswith(f"{T} - Instagram and Facebook") for n in e["Post Videos"][2:]))
        self.assertEqual(e["Post Thumbnail"], [f"{T} - Thumbnail - YouTube", f"{T} - Thumbnail - LinkedIn"])
        self.assertEqual(e["Post Copy"], [f"{T} - Post Copy"])
        self.assertEqual(len(set(e["Post Videos"])), 4)

    def test_two_reels(self):
        v = output.expected(T, 2)["Post Videos"]
        self.assertIn(f"{T} - Instagram and Facebook - Reel 2", v)
        self.assertIn(f"{T} - Instagram and Facebook - 4x5 2", v)
        self.assertEqual(len(v), 6)

    def test_safe(self):
        self.assertEqual(output.safe('AI: the "10x" / quality?'), "AI - the 10x - quality")
        self.assertEqual(output.safe("Dream 100? We're Doing Dream 30"), "Dream 100 We're Doing Dream 30")


class Check(unittest.TestCase):
    def test_pass(self):
        self.assertTrue(all(ok for ok, _ in output.check(T, full())))

    def test_other_videos_ignored(self):
        self.assertTrue(all(ok for ok, _ in output.check(T, full() + full("Another video"))))

    def test_missing_duplicate_wrong(self):
        files = full()
        files = [f for f in files if "Thumbnail - LinkedIn" not in f["title"]]
        files.append(dict(files[0]))
        files.append({"title": f"{T} - Thumbnail - big red arrow.jpg", "folder": "Post Thumbnail"})
        files.append({"title": f"{T} - YouTube.jpg", "folder": "Post Thumbnail"})
        msgs = [m for ok, m in output.check(T, files) if not ok]
        self.assertTrue(any(m.startswith("missing") and "LinkedIn" in m for m in msgs))
        self.assertTrue(any(m.startswith("duplicate") for m in msgs))
        self.assertTrue(any("big red arrow" in m for m in msgs))
        self.assertTrue(any("YouTube.jpg" in m for m in msgs))

    def test_video_must_be_video(self):
        files = [f if f["title"] != f"{T} - YouTube.mp4" else {"title": f"{T} - YouTube.jpg", "folder": "Post Videos"} for f in full()]
        self.assertTrue(any("not a video" in m for ok, m in output.check(T, files) if not ok))


class Doc(unittest.TestCase):
    def test_headings_in_order(self):
        with open(os.path.join(HERE, "..", "examples", "copy.example.json"), encoding="utf-8") as f:
            h = output.doc(json.load(f))
        order = [f"<h1>{T}</h1>", "<h2>Winning thumbnails</h2>", "<h2>LinkedIn post</h2>",
                 "<h2>YouTube description</h2>", "<h2>Instagram and Facebook copy - 4x5 post</h2>",
                 "<h2>Instagram and Facebook copy - Reel</h2>"]
        pos = [h.index(x) for x in order]
        self.assertEqual(pos, sorted(pos))
        self.assertIn("YouTube: ", h)
        self.assertIn("LinkedIn: ", h)

    def test_missing_thumbnail_says_so(self):
        h = output.doc({"title": T, "thumbnails": {"youtube": {"file": "x.jpg"}}})
        self.assertIn("LinkedIn: Not picked yet", h)

    def test_escapes(self):
        h = output.doc({"title": "A <b> & C", "linkedin": {"post": "x < y"}})
        self.assertIn("A &lt;b&gt; &amp; C", h)
        self.assertIn("x &lt; y", h)


if __name__ == "__main__":
    unittest.main()

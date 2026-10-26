# The brief

One brief feeds all three platforms. Save it as `brief.txt` beside the posts: `check_post.py --brief` reads the `KEY: value` lines. A transcript is better than any brief: pass it with `--transcript` and take PROOF and CHAPTERS from it.

**Minimum:** TITLE, KEYWORD, PROMISE, PROOF, CHAPTERS (real timestamps), PILLAR. Everything else is optional. Don't ask Taylor for anything the conversation already gives you.

```text
TITLE: I Built an AI Harness So Claude Code Can Run for 24 Hours
KEYWORD: AI harness
PILLAR: AI agents / Claude Code
PROMISE: Use AI harnesses to manage more clients and run tasks for longer with fewer mistakes
AUDIENCE: Agency owners and 1–3 person teams using Claude Code or Codex
PROOF: 2 hours with nothing done; about 20% effective without a harness, closer to 80% with one; 24–36 hours; 58 problems; 11 parts; 9–15 questions; nine-step framework; under an hour
CHAPTERS: 0:00 The bouncing ball · 0:42 Why harnesses · … · 29:43 Build your own
DURATION: 33:00
BEST LINES: "It's actually a liability because it's cost you tokens."
CLIENTS: names that must never appear (or "none")
END CARD CTA: link in bio            (Reels only: the CTA the video ends on)
LINKS: contact https://pecunafactorem.com/contact · booking [BOOKING LINK] · YouTube [YOUTUBE LINK]
PLATFORMS: YouTube, LinkedIn (native cut), Instagram (Reel)
```

| Key | Used for | Checked by |
|---|---|---|
| TITLE | Title length; the LinkedIn hook mustn't copy it | `check_post.py` |
| KEYWORD | Must appear in the YouTube hook (first 40 characters) and the Instagram first line | `check_post.py` (YouTube) |
| PROOF | The only figures allowed in any post | `check_post.py` (all) |
| DURATION | Last chapter must be before the end | `check_post.py` (YouTube) |
| CLIENTS | Names that fail the check if they appear | `check_post.py` (all) |
| END CARD CTA | The Instagram caption's CTA must match it | `check_post.py` (Instagram) |

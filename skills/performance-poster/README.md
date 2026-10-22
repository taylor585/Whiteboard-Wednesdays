# Performance Poster 1.0

Writes the posts that go out with a Pecuna Factorem video (the YouTube description, the LinkedIn post and the Instagram caption) and checks each one against the platform's limits and Taylor's house rules before it's handed over.

Built 22 October 2026 from the Performance Poster research report (`research/performance-poster/Performance-Poster-Research.pdf` in the Whiteboard Wednesdays repo). It reuses Thumbnail Tracker 3.3.1's house style, CTA library, voice profile and headline log by copying them; Thumbnail Tracker itself is unchanged and still makes thumbnails and titles.

## Use it

Say "post this" with a brief or transcript, or name one platform ("just the YouTube description", "write the Reel caption"). See `SKILL.md`.

Check any post by hand:

```bash
python3 scripts/check_post.py youtube   post.txt --brief brief.txt [--transcript t.txt] [--duration 33:00]
python3 scripts/check_post.py linkedin  post.txt --brief brief.txt [--goal comments]
python3 scripts/check_post.py instagram post.txt --brief brief.txt --format reel [--end-card "link in bio"]
```

## Layout

| Path | What |
|---|---|
| `SKILL.md` | The instructions Claude follows |
| `references/limits.json` | Every limit, with source, URL and re-check date (18 Jan 2027). The one place to change a rule. |
| `references/youtube.md`, `linkedin.md`, `instagram.md` | Structure, rules, research and hashtag research per platform |
| `references/hashtags/` | Starter tag sets (`pecuna.md`, not yet verified live) and the hashtag log |
| `references/brief-template.md` | The brief |
| `references/shared/` | Copied from Thumbnail Tracker 3.3.1 |
| `scripts/` | `check_post.py`, `hashtag_log.py`, `headline_log.py`, `package_skill.py` |
| `examples/` | Real briefs and posts; every one passes the checker |
| `tests/` | 30 tests: every number in the checker table, every example, the logs |

## Build the zip

```bash
python3 scripts/package_skill.py     # writes dist/performance-poster-<version>.zip, verifies hashes, runs the tests in a fresh copy
```

Then upload the zip in claude.ai → Settings → Capabilities → Skills.

## Decisions still with Taylor

- **Hashtag counts.** The house rule (3–5 on YouTube and LinkedIn) is applied. The research says 3 on YouTube and 1–2 on LinkedIn. The skill defaults to 3 on both, which satisfies both rules. Change `limits.json` to adopt the research rule.
- **Starter hashtags** are unverified. Check each one in the app before first use and mark it verified in `references/hashtags/pecuna.md`.

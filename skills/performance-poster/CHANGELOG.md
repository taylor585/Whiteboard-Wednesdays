# Changelog

## 1.0.0 (22 October 2026)

First build, from Section 6 of the Performance Poster research report (20 Oct 2026).

- YouTube descriptions, LinkedIn posts (plus the first comment) and Instagram captions (Reel, carousel, image) from one brief.
- `check_post.py`: every limit in the report's checker table, read from `references/limits.json`. Byte-based YouTube limit; exact CTA line; chapters; blank-line spacing; keyword placement; hashtag caps; LinkedIn fold, body links and bait; Instagram first line, one CTA, end-card match, generic tags, mentions and alt text; a truth check that fails any figure not in the brief or transcript, and any client named.
- `hashtag_log.py`: which tags went on which post, and how each did.
- Shared files copied from Thumbnail Tracker 3.3.1 (house style, CTA library, Taylor's voice, headline log with rows 1–47).
- Lessons from the Reel 3 test (20 Oct 2026) built in: the caption's CTA must match the Reel's end card; safe zones are checked frame by frame; the Reel cover's 3:4 grid crop.
- Examples: AI Harnesses (YouTube, LinkedIn), Reel 3 (Instagram), ICP Research (YouTube, as published), AI Vision Boards (YouTube, chapter times still to fill).
- House-rule conflicts (hashtag counts) left as the house rule, with the research's suggestion shown as a warning.

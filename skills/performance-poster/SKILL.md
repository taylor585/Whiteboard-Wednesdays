---
name: performance-poster
description: Write the posts that go out with a video, checked against each platform's real limits. It turns a video brief into the full YouTube description (pinned WhatsApp CTA, hook, What you'll learn, chapters, How we can help, hashtags), a LinkedIn post (hook inside the fold, first-comment link, 1 question) and an Instagram caption (Reel or carousel, one CTA, up to 5 hashtags, alt text, safe zones), each in the Pecuna Factorem house style, with character counts and a pass/fail check. Also researches and logs hashtags. Use whenever someone asks for a YouTube description, chapters, a LinkedIn post or caption, an Instagram caption or Reel caption, hashtags for any platform, "post this", "write the posts", character limits, or checking a post before publishing, even if they never say "performance poster". Thumbnails and titles stay with thumbnail-tracker.
---

# Performance Poster (1.0)

Turn one video brief into finished, checked posts for YouTube, LinkedIn and Instagram. Every rule is traceable to the Performance Poster research report (20 Oct 2026) or to Taylor's house rules, and every limit lives in `references/limits.json`. Don't stop at advice: write the post, run the checker, hand it over ready to paste.

## Master rules

1. **Proof is real.** Use only figures, results and quotes said in the video or given in the brief. `check_post.py` fails any number it can't find in the brief or transcript. Never invent results, links or testimonials. Never name a client Taylor hasn't cleared ("a med spa client"). Figures drawn live on screen and not given to you stay out.
2. **House style first.** For Pecuna Factorem, apply `references/shared/house-style.md` every time: the pinned WhatsApp CTA exactly on line 1 of YouTube descriptions (one space after 👉), a blank line between every bullet, chapter and paragraph, UK English, and one copy-and-paste text box per platform. CTAs come from `references/shared/cta-library.md`.
3. **Check before you hand over.** Run `scripts/check_post.py` on every post and fix every FAIL. Show Taylor a short scorecard (counts, hashtags and why, any WARN he needs to act on). A post with a FAIL is never delivered as finished.
4. **Placeholders are visible.** If a link or timestamp isn't known, leave `[BOOKING LINK]`, `[YOUTUBE LINK]` or `X:XX` and list it under "to fill before posting". Never guess a timestamp or URL.
5. **Write like Taylor, and log hooks.** Hooks and first lines follow `references/shared/taylor-voice.md`. Log every hook he writes, edits, picks or publishes, and your own suggestions, with `scripts/headline_log.py` (kind `hook_youtube`, `hook_linkedin` or `hook_instagram`), and hand back the updated spreadsheet. Log hashtags used with `scripts/hashtag_log.py`.
6. **Be honest about evidence.** Research findings carry a confidence level and are mostly vendor correlation. Keep them separate from house rules. Where they disagree (hashtag counts, below), follow the house rule and say what the research suggests.
7. **Simple asks get the answer straight away.** "Just the YouTube description", "check this caption", "how many hashtags on Instagram?" get the post or the answer, with no plan.

## Which file for which ask

| The user asks for… | Do | Read |
|---|---|---|
| "Post this", "write the posts", a full set | **Full set** below | `references/brief-template.md`, all three platform files |
| A YouTube description, chapters, a pinned comment | **YouTube** | `references/youtube.md`, `references/shared/house-style.md`, `references/shared/cta-library.md` |
| A LinkedIn post | **LinkedIn** | `references/linkedin.md` |
| An Instagram caption (Reel, carousel, image) | **Instagram** | `references/instagram.md` |
| Hashtags, "which hashtags", hashtag research | Pick from the verified sets, then research | `references/hashtags/pecuna.md`, the platform file's research section |
| "Check this post", "is this too long?" | Run `check_post.py`, report | `references/limits.md` |
| A limit or number ("max characters on LinkedIn?") | Answer from `limits.json`, with its source and confidence | `references/limits.md` |
| Results after posting ("it got 4.2% CTR") | Log it | `scripts/headline_log.py update`, `scripts/hashtag_log.py update` |
| Thumbnails or titles | Hand to **thumbnail-tracker**; this skill doesn't make them | n/a |

## Full set (from a brief)

1. **Get the brief.** The minimum is the topic, the final title, the promise, the real proof said in the video, chapters with real timestamps and the content pillar (`references/brief-template.md`). A transcript is best: with one, pull the proof and chapters from it yourself (transcribe with faster-whisper if it's installed, or ask for the transcript). Don't ask for anything the conversation already gives you.
2. **Pick the keyword** (the title's searchable noun) and the hashtags (`references/hashtags/pecuna.md`, by pillar). Say which hashtags you'd check live and why.
3. **Write each post** in the platform's structure (`references/youtube.md`, `linkedin.md`, `instagram.md`). Save each as a file, e.g. `<work>/youtube-description.txt`, `linkedin-post.txt`, `linkedin-first-comment.txt`, `instagram-caption.txt`, plus the brief as `brief.txt`.
4. **Check each one:**

   ```bash
   python3 <skill-dir>/scripts/check_post.py youtube   <work>/youtube-description.txt --brief <work>/brief.txt [--transcript t.txt]
   python3 <skill-dir>/scripts/check_post.py linkedin  <work>/linkedin-post.txt     --brief <work>/brief.txt
   python3 <skill-dir>/scripts/check_post.py instagram <work>/instagram-caption.txt --brief <work>/brief.txt --format reel
   ```

   Fix every FAIL and re-run. Read every WARN and either fix it or tell Taylor why it stays.
5. **Deliver.** For each platform: one copy-and-paste text box, then a one-line scorecard (characters, hook length, hashtags, checker result), then "to fill before posting". For LinkedIn, give the first comment in its own box. For Instagram, add the display-name keyword, on-screen text and safe-zone notes (`references/instagram.md`).
6. **Log** the hooks (`headline_log.py add`) and hashtags (`hashtag_log.py add`), export both spreadsheets and hand them back. After 48 hours, log results.

## House rules vs research (Taylor decides; current settings)

| Rule | House rule (applied) | Research suggests | Setting in `limits.json` |
|---|---|---|---|
| YouTube hashtags | 3–5 | exactly 3 (only 3 ever show) | `youtube.hashtags` min 3, max 5, target 3. Default to 3: it satisfies both. |
| LinkedIn hashtags | 3–5 | 1–2, max 3 (3+ goes with lower reach) | `linkedin.hashtags` min 3, max 5, warn over 3. Default to 3: it satisfies both. |
| LinkedIn link | in the post or first comment | first comment (body links −19% to −36% reach) | checker warns on a body link |
| Instagram hashtags | none yet | 3–5, cap 5 | `instagram.hashtags` 3–5, hard cap 5 |
| Instagram CTA | none yet | one CTA | one CTA, and it must match the Reel's end card if there is one |

When Taylor approves a change, edit the setting in `limits.json` and the line in `references/shared/house-style.md`, then run the tests.

## Files

- `references/limits.json`: every limit, with source, URL and re-check date. `references/limits.md`: the same, readable.
- `references/youtube.md`, `linkedin.md`, `instagram.md`: structure, rules, research and where to research hashtags.
- `references/hashtags/pecuna.md`: starter tag sets per pillar, with their verification status.
- `references/brief-template.md`: the brief.
- `references/shared/`: copied from thumbnail-tracker 3.3.1 (house style, CTA library, Taylor's voice, headline log). If thumbnail-tracker's copies change, copy them again; don't edit one without the other.
- `scripts/check_post.py`: the checker. `scripts/hashtag_log.py`, `scripts/headline_log.py`: the logs. `scripts/package_skill.py`: builds the zip and runs the tests.
- `examples/`: AI Harnesses (YouTube, LinkedIn), Reel 3 (Instagram), ICP Research (YouTube, as published), AI Vision Boards (YouTube, with chapter times still to fill). Every example passes the checker; the tests prove it.

## When the limits are out of date

`limits.json` has `recheck_by`. After that date, tell Taylor the limits are due a check before relying on them, and re-verify the official ones (YouTube Help, LinkedIn Help, Meta's API reference and @creators) with a web search.

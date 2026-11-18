# YouTube descriptions

The description's job is to **convert and help**: the line-1 CTA, a keyword-led hook, chapters and the offer. Across 150 videos (Nick Saraev, Riley Brown, Sabri Suby), no description feature consistently separated hits from misses; the title and thumbnail decide the click. So keep it clean, accurate and on brand, and spend creative effort on the hook.

House style (`shared/house-style.md`) overrides anything here.

## Structure, in order

| # | Part | Rule |
|---|---|---|
| 1 | CTA line | Exactly: `Want to chat? Give me a message on WhatsApp. This is my personal number 👉 https://pecunafactorem.com/contact` (108 characters). Then a blank line. |
| 2 | Hook | Opens with the title's searchable noun (the brief's KEYWORD) in its first ~40 characters, so it lands inside the first ~150 characters overall. The promise, plus one real proof detail. |
| 3 | Summary | 2–3 sentences: why it matters now, what the video walks through. Always written fresh for this video (Nick shipped stale summaries on 9 of 30). Starts "In this Whiteboard Wednesdays…" for the series. |
| 4 | Offer line | CTA 02: "Want this built for your agency? Book a call:" plus the booking link, or the contact link if there's no booking link. Or the video's free download, if it promises one. |
| 5 | What you'll learn: | 3–10 bullets (•) of real specifics from the video, a blank line between each. Only claims the video makes. |
| 6 | Chapters | `0:00` first, at least 3, ascending, each at least 10 seconds, real timestamps only, plain keyword names, a blank line between each. Unknown times stay `X:XX`. |
| 7 | How we can help | CTA 03 adapted to the video's services, then the contact link on its own line. |
| 8 | Links | `Pecuna Factorem: https://pecunafactorem.com`. Never invent a URL. |
| 9 | Disclosure | Only if there's an affiliate, referral or sponsor link: "Some links are affiliate links; I may earn a commission." A legal requirement in the UK and US. |
| 10 | Hashtags | 3 by default: one topic, one audience, one series (`#WhiteboardWednesdays`) or a second topic. House rule allows up to 5; only 3 are ever shown. |

**Worked examples:** `examples/ai-harnesses/description-final.txt`, `examples/icp-research/description-final.txt` (as published).

## Hard limits

| Item | Limit | Source | Confidence |
|---|---|---|---|
| Title | 100 characters; `<` and `>` not allowed. House: ≤70. | Official (Help 57404) | HIGH |
| Title truncation | ~60–70 desktop search, ~40–60 mobile (measured in pixels) | Third-party | LOW |
| Description | 5,000 bytes. Emojis and curly quotes cost 3–4 bytes, so budget in bytes. | Official (Data API) | HIGH |
| Above "…more" | "The first few lines"; ~157 characters desktop, ~100–150 mobile | Official (no number); third-party | LOW |
| Hashtags | Up to 3 shown above the title. Over 60 and all are ignored. Each must relate to the video. | Official (Help 6390658) | HIGH |
| Tags field | 500 characters, commas included. Tags "play a minimal role". | Official | HIGH |
| Chapters | 0:00 first, at least 3, ascending, each ≥10 s | Official (Help 9884579) | HIGH |
| Shorts | Links in Shorts descriptions and comments aren't clickable (since 31 Aug 2023) | Third-party quoting YouTube | MEDIUM |
| Misleading metadata | Banned as "malicious clickbait" | Official (Help 2801973) | HIGH |

## What the creator data shows

| Creator (latest 30) | Median length | Line 1 | Hashtags | Chapters |
|---|---|---|---|---|
| Nick Saraev | ~3,500 | CTA (30/30) | 0/30 | 24/30 |
| Riley Brown | ~950 | hook or keyword sentence | 7/30 (partner tags) | 29/30 |
| Sabri Suby | ~310 | summary | 0/30 | 0/30 |

- All three lengths produce hits, so no length is required. Our guide is ~800–2,000 characters; never pad. (HIGH)
- Never open with a sponsor or third-party link: on Riley's channel, sponsor-first lines sat on his weakest videos (0.21× vs 1.12×, n = 4 vs 26). Your own CTA on line 1 is fine. (MEDIUM)
- Chapters are a channel habit and a viewer aid, not a lever. Hashtags are near-absent. (HIGH, usage)

## Pinned comment and Shorts

- **Pinned comment:** repeat the CTA, short (LOW confidence it changes anything).
- **Shorts:** don't rely on description links. Point to the long-form video or the channel links.

## Where to research keywords and hashtags (10 minutes per video)

1. **YouTube search autocomplete** on the topic noun, in a private window (the a–z trick widens it).
2. **YouTube Studio → Analytics → Research tab:** searches from the last 28 days, "Your viewers' searches", content gaps. The best free source.
3. **Google Trends, set to YouTube Search:** compare 2–3 phrasings (UK and worldwide, past 12 months).
4. Put the winner in the first 50 characters of the title (thumbnail-tracker's job) and the first 40 of the hook.
5. **Pick 3 hashtags** (topic, audience, series) and open each one's results page to check it has related videos.

Optional: Google Ads Keyword Planner (web volumes, not YouTube), vidIQ or TubeBuddy (modelled estimates). Don't build on the Studio Inspiration tab; it's being phased out from Aug 2026.

## Checks (`check_post.py youtube`)

FAIL: over 5,000 bytes; line 1 not the exact CTA; no blank line after it; keyword missing from the hook; title over 70 (house) or 100; chapters not starting at 0:00, fewer than 3, out of order or under 10 s apart, or past the video's end; two bullets or chapters with no blank line between; a referral link with no disclosure; hashtags outside 3–5 or over 60; a figure not in the brief or transcript; a client named.

WARN: length outside 800–2,000; keyword after the first 40 characters; a missing section heading; chapter times still `X:XX`; hashtags over 3; any placeholder.

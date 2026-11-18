# Instagram captions

Up to five hashtags, chosen for relevance rather than reach. The hook and keyword go in the first line, captions stay short, and there's one clear CTA. House style (`shared/house-style.md`) overrides anything here.

## Structure

1. **First line:** ≤60 characters on Reels (the overlay cut), ≤125 in the feed. The outcome or the problem, with the main search phrase ("AI agent", "Claude Code", "Meta ads"). Instagram search reads captions.
2. **Body:** 1–3 short lines of value. Reels 125–500 characters in total (the video carries the message); carousels under ~30 words (the slides carry it); single images 300–800, story-led.
3. **One CTA**, chosen for the goal:

   | Goal | CTA | Notes |
   |---|---|---|
   | Traffic to the long-form video | "Full video on YouTube, link in bio." | Use this when the Reel's end card says "link in bio". |
   | DMs and leads | "Comment FILES and I'll DM you the list." | Needs comment-to-DM automation: one private reply per comment, within 7 days (Meta, HIGH). |
   | Reach to new people | "Send this to the person running your AI agents." | Sends are a top ranking signal (Mosseri). |
   | Comments | A specific question | +36.7% comments (Metricool, 24.4M posts, MEDIUM) |

   **The caption's CTA must match the Reel's end card.** If the end card says "link in bio", the caption says it too; to switch CTA, change the end card. (Lesson from the Reel 3 test, 20 Oct 2026.) Pass `--end-card` or put `END CARD CTA:` in the brief so the checker enforces it.
4. **Hashtags:** 3–5 at the end of the caption, never the first comment: 1 branded + 1 broad + 1–3 niche (`hashtags/pecuna.md`).

**Worked example:** `examples/ai-harnesses-reel-3/` (caption, brief, transcript): passes every check.

## Also deliver with every Reel

- **Display-name keyword:** the name field is searchable (30 characters), e.g. "Taylor | AI Agents for Agencies". Suggest it once; it's a profile change, not a per-post one.
- **On-screen text:** repeat the key phrase in the opening on-screen text; Instagram reads the video too (Mosseri, reported, MEDIUM).
- **Safe zones (1080×1920):** keep text out of the top ~220 px and bottom ~420 px (convention; Meta's ads guidance: 14% top, 35% bottom). Check a frame every ~5 s with ffmpeg and a red box over each zone; badges that pop up briefly are easy to miss. Reel 3 failed this at 0:10 ("Survived the crash" badge in the top zone).
- **Length:** ≤3 minutes reportedly needed to reach non-followers.
- **Cover:** the Reel cover shows 9:16 on the Reels tab but is cropped to 3:4 (1080×1440) on the profile grid. Keep the title inside the middle 3:4. (Convention; check in the app.)
- **Alt text:** not available on Reels. On carousels and images, write custom alt text for every slide (≤125 characters recommended, 1,000 max).

## Hard limits (date-stamped)

| Item | Limit | Source | Confidence |
|---|---|---|---|
| Hashtags | 5 per post or Reel (was 30), from 18 Dec 2025 | Official (@creators) | HIGH |
| Caption | 2,200 characters, hashtags and links included | Official (Meta API) | HIGH |
| Fold | ~125 feed, ~55–60 Reels overlay | Convention | MEDIUM/LOW |
| @mentions | 20 per caption | Official (API) | HIGH |
| Carousel | 20 slides; one caption | Official (API) | HIGH |
| Alt text | 1,000 per image; not Reels or Stories | Official (API) | HIGH |
| Bio / name / username | 150 / 30 / 30 | Third-party | MED–HIGH |
| Following hashtags | Removed 13 Dec 2024 (you can still tag and search) | Third-party | HIGH |

## Hashtag research

Instagram's position: hashtags label and help search; they don't increase reach. "Using fewer (up to 5) more targeted hashtags, rather than many generic ones, can improve both your content's performance and people's experience." Avoid `#reels`, `#explore`, `#viral`, `#fyp` (the checker fails them). The largest study (Metricool, 24.4M posts) found posts with at least one hashtag had 31.7% fewer views: correlation, but hashtags clearly don't help reach.

**Where to find them:**

| Source | What it gives | Reliability |
|---|---|---|
| In-app search (Tags and keyword results) | Autocomplete ranked by what people in your country click | High |
| Professional Dashboard → Reels Trends | Trending audio and hashtags for Reels | Medium |
| A hashtag's own page | Top posts; no results or "recent posts hidden" means restricted | Medium |
| Peer and competitor posts | What AI and agency creators actually use | Medium |
| Meta Graph API hashtag search | Top and recent media; 30 tags per 7 days | High (needs app review) |
| Flick, Later, Metricool | Search, banned-tag audit | Medium (paid) |
| Inflact, RiteTag, Display Purposes | Generators; data access unverified since Dec 2024 | Low: ideas only |

Check **Settings → Account Status** to confirm the account can appear in search.

## Checks (`check_post.py instagram`)

FAIL: over 2,200; first line over 60 (Reel) or 125 (feed); hashtags outside 3–5; a generic reach-bait tag; over 20 mentions; not exactly one CTA; CTA doesn't match the end card; a figure not in the brief or transcript; a client named.

WARN: body outside the format's range; hashtags not at the end; no alt text on carousels or images; any placeholder.

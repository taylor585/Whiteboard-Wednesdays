# LinkedIn posts

The hook has to land in the first ~140 characters. Keep links out of the post body. Upload video natively. Use few hashtags. House style (`shared/house-style.md`) overrides anything here.

## Structure

1. **Hook (line 1):** ≤110 characters ideally, never over 140 (the mobile "…see more" fold). The problem in the buyer's words, a confession, or a contrarian claim, in Taylor's voice. Not the YouTube title word for word. A number from the video helps (61% of highly viral posts had a data point; LinkPost, MEDIUM).
2. **Proof (lines 2–3):** one real figure, quote or result from the video.
3. **Body:** a short story or teaching block. Short paragraphs, white space between them. A few `→` lines are fine for a list.
4. **Takeaway:** one line, the thing to do differently, and where the full walkthrough is ("the link is in the first comment").
5. **CTA:** one specific question that invites a real reply ("Which job would you trust an agent to run overnight first?"). Or CTA 04 (book a call) for a native video. No bait.
6. **Hashtags:** on their own line at the end. Default 3 (see the hashtag rule below).

**First comment:** the YouTube link, with CTA 05's wording ("Full walkthrough, including …: [YOUTUBE LINK]"). Post it yourself, straight after publishing.

**Length:** 900–1,500 characters for reach; 1,500–2,500 for a teaching or opinion post aimed at comments (`--goal comments`). Hard limit 3,000.

**Worked example:** `examples/ai-harnesses/linkedin-post.txt` and `linkedin-first-comment.txt`. The older ICP posts (`examples/icp-research/linkedin-posts.md`) were written before this research: they put a link and 4 hashtags in the body.

## Format: what to post

| Format | When | Notes |
|---|---|---|
| Native video cut, 30–90 s | Default for a new video | Captioned; the post text must match the video (LinkedIn demotes "videos that don't match the text", Mar 2026). Cover: 1920×1080 from thumbnail-tracker. |
| Document carousel (PDF of the whiteboard frames) | Teaching videos | Top engagement rate of any format (7.00%, company pages; Socialinsider, MEDIUM). |
| Image teaser 1080×1350 | Alongside a link in the first comment | The 4:5 thumbnail from thumbnail-tracker. |

Video reach on personal profiles fell 36% year on year (AuthoredUp, MEDIUM), so test carousels too.

## Hashtag rule (house vs research)

- **House rule:** 3–5.
- **Research:** 1–2, max 3, zero is fine. Two median-based studies: Magicpost (566,957 posts) 0 → 874 impressions, 1 → 847, 2 → 825, 3 → 637, 5 → 492; LinkPost (516,144) 1 hashtag +21% likes, 4–6 hashtags −40%. Metricool (673,658) claims +85% with hashtags but doesn't say against what (LOW).
- **Applied:** 3, which satisfies both. If Taylor adopts the research rule, change `linkedin.hashtags` in `limits.json` to min 0, max 3, target 2.
- **Why still use any:** LinkedIn's feed lead (Jul 2025) said the hashtag feed is going, but hashtags still help "when people are trying to search for a specific trend or topic". "Don't go overboard."

## Hard limits

| Item | Limit | Source | Confidence |
|---|---|---|---|
| Post | 3,000 characters | Official (Help a528176) | HIGH |
| "…see more" fold | ~210 desktop, ~140 mobile; fewer with media or line breaks | Vendor-observed | MEDIUM |
| Comment | 1,250 characters (older sources: 1,750) | AuthoredUp test, Mar 2026 | MEDIUM |
| Native video | 5 GB, 15 minutes (assume 10 from a phone); aspect 1:2.4–2.4:1 | Official | HIGH |
| Document | 100 MB, 300 pages | Official | HIGH |
| Poll | Question 140; 2–4 options of 30 | Official | MED–HIGH |
| Article | 125,000; SEO title <60, description 140–160 | Official | HIGH |

## What the research says

| Question | Finding | Confidence |
|---|---|---|
| Length | Reach peaks ~150–174 words (~900–1,050 characters); comments keep rising with longer posts | MEDIUM |
| Links in the body | −36% (LinkPost), −26.5% (Ordinal), −18.8% (van der Blom). Never confirmed by LinkedIn. | MEDIUM |
| Frequency | 2–5 posts a week beats 1 (+1,182 impressions per post; Buffer, 2M+ posts) | MED–HIGH |
| Demoted (official, Mar 2026) | "Comment to agree" bait, engagement pods, comment automation, videos that don't match the text | HIGH |

## Where to research hashtags and topics

| Source | Use it for | Cost |
|---|---|---|
| LinkedIn search → Posts → Latest, searching `#tag` or a keyword | The main check: is the tag in real, recent use by the right people, and do those posts get engagement? | Free |
| LinkedIn News / Top stories | Timing an angle (topics, not tags) | Free |
| ~10 peer and competitor posts per pillar | Which tags AI and agency peers use, and whether those posts perform. By hand; no scraping. | Free |
| Taplio, AuthoredUp | Fold preview, inspiration, analytics on your own posts | Paid |
| RiteTag, Shield | Use with caution: data source undisclosed; Shield may no longer operate | — |

## Checks (`check_post.py linkedin`)

FAIL: over 3,000; hook over 140; hook = YouTube title; bait phrase; hashtags in the hook; hashtags outside 3–5; a figure not in the brief or transcript; a client named.

WARN: length outside the goal's range; hook over 110; a link in the body; a "comment WORD and I'll…" automation CTA; no closing question; hashtags not on the last line; hashtags over 3; any placeholder.

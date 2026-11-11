# Instagram captions and hashtags: research for the Performance Poster skill

Prepared 20 October 2026 for Pecuna Factorem (Taylor Cunningham). UK English.

Labels used in this file:
- **official**: Instagram, Meta, @creators or Adam Mosseri, read at source or quoted verbatim from source.
- **third-party**: trade press, vendor or analytics studies.
- **observed**: practitioner observation, or a vendor/convention figure with no stated method.
- **Confidence**: high, medium or low. **n**: sample size, where the source gives data.

Instagram blocks logged-out fetching. instagram.com returned HTTP 429 and help.instagram.com returned an empty shell. Several Help Centre pages therefore could not be read directly; this is flagged wherever it applies.

---

## PART 1: Hard limits (date-stamped)

| Item | Limit | Status / date | Source | Confidence |
|---|---|---|---|---|
| Caption length | **2,200 characters** (hashtags and links count) | Meta Instagram Platform API reference, read 20 Oct 2026. Every third-party guide agrees. | official (developers.facebook.com, IG User Media `caption`) | high |
| Hashtags per post or Reel | **5** (was 30) | Announced by @creators on Threads, **18 Dec 2025**: "Starting today, Instagram will allow up to 5 hashtags in a reel or post." Rolled out gradually. Instagram had earlier tested a 3-tag cap on some accounts. | official (@creators Threads post DSalXGPCWM4); third-party (Social Media Today 18 Dec 2025; Social Samosa 19 Dec 2025) | high |
| Hashtags via the API | The API reference still says "Maximum 2200 characters, **30 hashtags**, and 20 @ tags" (read 20 Oct 2026) | Not updated, or not enforced, for API publishing. **Do not rely on it**: assume the 5-tag cap applies everywhere. | official, but stale | medium (that the doc is stale) |
| Hashtags in the first comment | Unclear. A vendor (Inro) says comments are also capped at 5. Hipertextual said the web version still let users paste long lists in Dec 2025. One hashtag-generator page claims comments still take 30. | Not confirmed by Instagram | third-party, conflicting | low |
| @mentions in a caption | **20** @ tags | API reference, read 20 Oct 2026 | official | high (caption). Per-comment mention cap: unverified |
| Carousel slides | **20** images and/or videos | Rolled out to everyone 9 Aug 2024 (a cap of 15 was tested in Mar 2024). API: "Carousels can have up to 20 total images, videos, or a mix." | official (API); third-party (TechRadar, Social Media Today, Aug 2024) | high |
| Captions on individual carousel slides | Not supported (one caption per post) | API reference | official | high |
| Alt text | Up to **1,000 characters** per image in the API. Images only; Reels and Stories are not supported. In the app: Advanced settings > Write alt text, or edit after posting. | API read 20 Oct 2026; Help Centre steps quoted via search | official | high (API); medium (app character cap not stated) |
| Reels length (in-app camera) | **Up to 20 minutes** recording | Camera update reported **25 Nov 2025** (PetaPixel, Lindsey Gamble). Rolled out unevenly by account. | third-party (could not open the Help Centre page) | medium |
| Reels length (API publishing) | **15 minutes max, 3 seconds min** | API reference, read 20 Oct 2026 | official | high |
| Reels length (recommendation to non-followers) | Reported as **3 minutes or under**. Longer Reels reportedly go mainly to existing followers. | Third-party claims (Buffer, Inro). Not confirmed by Instagram in what I could read. | third-party | low–medium |
| Caption truncation, feed | About **125 characters**, or roughly 2 lines, before "…more" | A convention. Inro reviewed 8 sources and found none that cited a test; Meta does not document a preview length. | observed | medium |
| Caption truncation, Reels | Shorter: about **55–60 characters**, often 1 line over the video (Bundle.social; a single source) | Varies by device and font size | observed | low |
| Bio | **150 characters** | Every third-party guide agrees | third-party | high |
| Name field (display name) | **30 characters**, and searchable | Third-party guides | third-party | medium–high |
| Username | **30 characters** | Metricool, Jan 2026 | third-party | high |
| Links in bio | **5** in the app. Metricool lists 1 for standard accounts and 3 for verified accounts; the 5-link bio feature launched in 2023. | Conflicting; check in the app | third-party | low |
| Comment length | **2,200 characters** (Metricool, Sendible). Sendcove says 1,000. | Conflicting | third-party | low–medium |
| Story link sticker | Available to **all accounts** since Oct 2021 (replaced swipe-up in Aug 2021, initially for 10k+ accounts). Reportedly 1 link sticker per Story frame. | The "1 per frame" figure is a single vendor claim | third-party (Adweek) | high (availability); low (per-frame cap) |
| Reels on-screen safe zone | **No official organic spec.** Meta's ads guidance gives about **14% top, 35% bottom, 6% each side** of 1080×1920 (about 269 px, 672 px and 65 px). The common convention is 220 px top and 420 px bottom. | Ads only; no organic spec exists | official for ads (via Inro and Hopper HQ summaries); observed for the 220/420 convention | medium |
| Comment-to-DM ("Private Replies" API) | **One** automated private message per comment, sent within **7 days** of the comment. Follow-ups only after the person replies, within 24 hours of that reply. | Meta developer docs, read 20 Oct 2026 | official | high |
| Hashtag research via the API | **30 unique hashtags per account per rolling 7 days** (ig_hashtag_search). Sensitive hashtags return a generic error. | Meta developer docs | official | high |
| Following hashtags | **Removed 13 Dec 2024.** You can still tag and search hashtags. | Third-party (Lindsey Gamble, Music 3.0, Nov 2024) | third-party | high |

---

## PART 2: Hashtags on Instagram

### 2.1 Official position (dated)
| Date | Statement | Source | Confidence |
|---|---|---|---|
| 2021 (exact date unverified) | @creators tips said to use **3–5 hashtags**; using 10–20 will not add distribution | Reported by Hootsuite; I could not open the original @creators post | medium |
| Feb 2025 | Mosseri said hashtags "don't work" to increase reach | Instagram Reel DGdsCt5pr0R, cited by Social Media Today | medium (paraphrased via SMT) |
| May 2025 (per SMT; the Reel ID looks like mid-2024) | Mosseri: hashtags don't improve visibility, but they help show what a post is about and connect related posts | Instagram Reel C7opYxFxicG, via SMT | medium |
| **18 Dec 2025** | @creators: up to 5 hashtags per Reel or post. Instagram's guidance: "using fewer (up to 5) more targeted hashtags, rather than many generic ones, can improve both your content's performance and people's experience." Avoid generic tags such as #reels and #explore. | @creators Threads post; quoted by Social Samosa and SMT | high |
| Jun 2026 (page updated 23 Jun 2026) | Meta Transparency Centre, IG Search: account results are matched on **username and profile name**. Keyword and hashtag suggestions are matched on text similarity plus click-through from people who ran the same search in your country. | transparency.meta.com IG Search | high |
| Jul 2026 | Mosseri Q&A (as reported by Kontentino, 20 Jul 2026): search "uses all the information we can", including captions, comments and embedding models that read the photo or video itself. Hashtags help classify a post but don't meaningfully expand its reach. | Kontentino summary; I could not verify the original | low–medium |
| Jul 2025 | Public posts from professional accounts can be **indexed by Google and other search engines** (captions and alt text included) | WERSM via Kontentino | medium |

**Bottom line (high confidence):** hashtags are now a **labelling and search aid, not a reach lever**. Use up to 5 specific tags. Keywords in the caption, on-screen text, name field and bio matter as much or more for search.

**Do hashtags in the first comment count?** Under the 30-tag regime, comment tags counted towards the same total, and Hootsuite's May 2024 test found placement made no difference. Under the 5-tag cap, Instagram has not said. Put them **in the caption**: that is the documented path, and comments add nothing proven. Confidence: medium.

### 2.2 Banned and restricted hashtags: how to check
1. Search for the tag in the app and open its page. If it shows no results, or a notice that recent posts are hidden or limited, it is restricted. Instagram reviews restricted tags periodically and may restore them. (Observed; the sources are mostly 2017–2019 blogs, so the current UI wording may differ. Confidence: medium.)
2. Check **Account Status** in Settings to see whether your account is eligible to be recommended or to appear in Search. (Official, Instagram ranking post, 31 May 2023.)
3. The Graph API returns a generic error for tags Meta deems sensitive (official). Third-party tools such as Flick use this to flag banned tags.
4. Avoid tags that are generic or spammy (#reels, #explore, #viral, #fyp), as Instagram itself advises.

### 2.3 Strategy: tiers and sizing
There is no official tiering. The industry convention is: **1 broad, 2–3 niche or topic, 1 branded**. With only 5 slots, size each tag by topical fit, not by post count.
- Broad (roughly 1M+ posts): signals the general category. Rarely ranks you.
- Niche / topic (roughly 10k–500k posts): the best chance of appearing in topic results.
- Branded (#PecunaFactorem, #WhiteboardWednesdays): useful for collecting the series in one place, not for discovery.

The post-count bands above are practitioner conventions (observed, low confidence) and not from Instagram. Since the 5-tag cap, relevance matters more than the size bands.

### 2.4 Where to find relevant and trending hashtags
| Source | What it gives | Cost | Reliability |
|---|---|---|---|
| In-app Search (Tags / keyword results) | Autocomplete suggestions. Suggestions rank on query similarity and click-through in your country (official, Transparency Centre). | Free | High for relevance. Post counts are shown inconsistently; **check live in the app**. |
| Hashtag pages | A top-posts grid. The "Recent" tab was tested for removal in Apr 2022 (TechCrunch). Hashtag following was removed in Dec 2024. Whether post counts still show is unverified for Oct 2026. | Free | Medium |
| Professional Dashboard > **Reels Trends** | Trending audio and trending hashtags for Reels, with an option to save audio. Professional accounts only, and possibly region-limited. | Free | Medium (third-party descriptions: Izea, Metricool) |
| Post Insights | Shows how people found the post (reach by surface: Home, Explore, Profile, Reels, etc.). A separate "reach from hashtags" line has **not been verified** as still present. | Free | Low on the hashtag-specific metric |
| Meta Business Suite / Graph API hashtag search | Top and recent media for a tag. 30 unique tags per 7 days. | Free (needs app review for API use) | High (official) |
| Competitors' posts | The tags that peers such as AI or agency creators actually use. Each tag can be tapped through. | Free | Medium; mirrors the market but may copy poor habits |
| Flick | Hashtag search, collections, banned-tag audit, and per-hashtag performance tracking via Instagram's API. From about £11/month (annual); no free plan, 7-day trial. | Paid | Medium (pricing from 2026 reviews, not the official page) |
| Later, Metricool | Hashtag suggestions and trackers bundled with scheduling. Metricool has a hashtag tracker. | Freemium / paid | Medium |
| Inflact, RiteTag, Display Purposes | Generators and "hot or overused" colour scoring (RiteTag). **I could not verify current status or Instagram data access** after the Basic Display API ended on 4 Dec 2024. | Mixed | Low; treat as idea generators only |

### 2.5 Starter hashtag set for Pecuna's content pillars (candidates, NOT verified)
**Every tag below is a candidate.** Post counts, restriction status and relevance must be checked live in the app before use. Use at most 5 per post: 1 branded + 1 broad + up to 3 niche.

| Pillar | Branded (pick 1) | Broad (pick 1) | Niche (pick 2–3) |
|---|---|---|---|
| AI agents / Claude Code / Codex | #WhiteboardWednesdays | #AI or #ArtificialIntelligence | #ClaudeCode, #ClaudeAI, #AIAgents, #AIAutomation, #Codex, #AIForBusiness |
| Meta ads | #PecunaFactorem | #DigitalMarketing | #MetaAds, #FacebookAds, #PaidSocial, #AdStrategy |
| Agency growth | #WhiteboardWednesdays | #MarketingAgency | #AgencyOwner, #AgencyGrowth, #AgencyLife, #UKBusiness |
| ICP research | #PecunaFactorem | #Marketing | #IdealCustomerProfile, #CustomerResearch, #B2BMarketing, #MarketResearch |
| Content creation | #WhiteboardWednesdays | #ContentMarketing | #ContentCreation, #ContentStrategy, #VideoMarketing, #CreatorEconomy |

Check in particular whether #ClaudeCode and #Codex are used for unrelated topics (Codex is also a common word and brand), and whether #ICP is used for other meanings (ICP is also a cryptocurrency); #ICP is excluded above for that reason.

---

## PART 3: Caption performance research, 2024–2026

### 3.1 Large third-party studies
| Study | n / period | Finding | Confidence |
|---|---|---|---|
| **Metricool 2026 Instagram Study** (press release 16 Jun 2026) | 24,364,803 posts, 375,118 accounts; Jan–Feb 2025 vs Jan–Feb 2026 | Posts with at least 1 hashtag: **31.70% fewer views and 33.89% fewer interactions** than the platform average (correlation, not cause). Questions in the caption: **+36.70% comments**. Comment-focused CTAs: **+202.78% comments**. Carousels: 9× the saves of single images. Reels: more than 4× the interactions of single images. Most views arrive in the first 3 days. | high that the figures are reported; medium on causation |
| **Socialinsider caption length** (published 21 Feb 2024, updated 19 Oct 2026) | 9,117,401 posts, 82,952 business pages; Jan–Jul 2023 | Captions **under about 30 words** tend to get higher engagement (engagement by followers). Engagement tends to fall as captions get longer. Tested CTAs: "Let us know in the comments", "Read more", "Like if…", "Check the link in bio", "Available now". Per-CTA figures are only in a chart; a secondary source quotes "Read more" 0.58% and "Let us know in the comments" 0.51%. | medium (2023 data; engagement by followers, not reach) |
| Socialinsider carousel caption bands (secondary write-up) | Same dataset | Carousel engagement rate: 0–30 words **0.84%**, 30–60 **0.73%**, 60–90 **0.50%**, 90+ **0.30%** | low–medium (secondary, not verified on the original page) |
| Socialinsider × Sked Social | About 102M business posts (per Social Media Today, earlier) | Short captions (about 10 words) work best overall, especially on carousels. On **video**, captions of 30+ words did better. | low–medium (older; thresholds conflict) |
| **Socialinsider 2026 benchmarks** (20 Feb 2026) | 35M posts, 447,613 pages; Jan–Dec 2025 | Format engagement (2025 report): carousels about 0.55%, Reels about 0.50%, images about 0.45%. No caption or hashtag analysis. | high (format); n/a (captions) |
| **PostPlanify** (Oct 2026) | 6,126 posts, 168 accounts; 6 Jul–4 Oct 2026 (medians; length includes hashtags) | Best band **301–800 characters (4.57% engagement rate)**. 51–125 characters was worst (1.38%). Reels at 126–500 characters: 3.95%; 500+: 4.32%; 125 or fewer: 1.69%. The reach pattern is inconsistent. | low (small, vendor-only sample; correlational) |
| Hootsuite hashtag experiment (3 Nov 2021) | 20 posts, 1 account | 3–5 tags averaged 462 reach vs 394 for 30 tags. At least 1 tag beat none. | low |
| Hootsuite placement test (23 May 2024) | Small single-account test | Placement (caption or comment) did not matter | low |
| Buffer frequency study (13 Aug 2025) | 2M+ posts, 100k+ accounts | Posting 3–5 times a week is the sweet spot; going from 1–2 to 3–5 posts a week gave about 12% more reach per post. No caption data. | high (frequency only) |
| LiveDune (Jan 2023) | 19M posts | Most captions are 150 characters or fewer. No usable engagement figures. | low |

### 3.2 Official signals that bear on captions
- **Sends per reach** is "one of the most important signals" in ranking, especially for reaching non-followers (Mosseri, Jan 2025 video series). Captions that give people a reason to send the post to a colleague are therefore worth writing. Confidence: medium–high.
- Search reads captions and also looks at the media itself (Mosseri, Jul 2026, via Kontentino). Name-field and username matches are official ranking inputs for account search (Transparency Centre). Confidence: medium.
- Comment-to-DM automation is allowed through the official Private Replies API (1 message per comment, within 7 days). Vendor uplift claims, such as "+1,537% comments", have **no published method**. Confidence: low.

### 3.3 Format by format: a synthesis (evidence conflicts, test on your own account)
- **Reels:** the caption is secondary to the video. Large studies (Socialinsider × Sked) and the small PostPlanify study both point to medium-length captions of roughly 125–500 characters doing as well or better than very short ones. The hook belongs on screen and in the first line. Confidence: low–medium.
- **Carousels:** the large study (Socialinsider, 9M posts, 2023 data) favours **short captions (under 30 words)** because the slides carry the content. The small 2026 study disagrees. Confidence: medium for "short works fine"; low for "long is better".
- **Single images:** the caption does the work, so a longer, story-style caption is defensible. Single-image reach fell about 22% year on year (Metricool). Confidence: low–medium.
- **First line:** about 125 characters or fewer in feed, about 55–60 on the Reels overlay (observed). The first line must carry the hook and the main keyword. Confidence: medium.
- **Emoji:** no large study found. Use sparingly, for scannability only. Confidence: low.
- **Line breaks:** no study found. They help readability (observed). Confidence: low.
- **CTA:** ask a question or ask for comments (Metricool: +36.7% and +202.8% comments). Use "comment KEYWORD for the guide" with Private Replies automation. Use "link in bio" for traffic. Confidence: medium.

### 3.4 Creator caption styles (Nick Saraev, Sabri Suby, Riley Brown, Jeremy Haynes, Alex Finn, Daniel Priestley)
**Could not verify.** Instagram returned HTTP 429 for profiles. Web searches for each name plus "Instagram caption" returned no relevant results; there is no indexed coverage of their Instagram captions. **n = 0. Confidence: none.** Nothing is claimed here. To fill this in, Taylor (logged in) should screenshot each creator's last 10 Reels and captions, and log caption length, first line, CTA type (comment keyword, DM, link in bio) and hashtag count. Separately, the thumbnail-tracker skill holds YouTube research on Saraev, Suby and Riley Brown; that is not Instagram data.

---

## PART 4: Recommended Instagram setup (Pecuna)

| Element | Recommendation | Evidence | Confidence |
|---|---|---|---|
| Caption length: Reels | 125–500 characters. Hook in line 1, 1–3 short lines of value or context, then a CTA. | PostPlanify (n=6,126, small); Socialinsider × Sked (video 30+ words better) | low–medium |
| Caption length: carousels | Short: under 30 words (about 150–200 characters) plus a CTA. Let the slides carry the content. | Socialinsider (n=9.1M, 2023 data) | medium |
| Caption length: single image | 300–800 characters, story-led, line breaks | PostPlanify (small); "the caption is the post" | low |
| Hard cap | 2,200 characters, hashtags included | Meta API | high |
| First line | 125 characters or fewer (aim for 60 or fewer for Reels). State the outcome and include the main keyword, e.g. "Claude Code built our ad report in 10 minutes." | Truncation convention; search reads captions | medium |
| Hashtag count | **3–5** (hard cap 5): 1 branded, 1 broad, 1–3 niche | @creators, 18 Dec 2025; Mosseri | high (cap); medium (mix) |
| Hashtag placement | At the end of the caption, not the first comment | Official path; first-comment status under the cap is unclear | medium |
| Keywords | Put 1–2 search phrases naturally in line 1 and the body (e.g. "Meta ads", "Claude Code", "agency owners"). Repeat the key phrase in on-screen text. Add the main topic to the name field, e.g. "Taylor, AI for Agencies" (30 characters max). | Transparency Centre (name/username match); Mosseri Jul 2026; Google indexing since Jul 2025 | medium |
| CTA | One per post. Choose from: a question (comments); "Comment WORD and I'll DM you the template" (Private Replies: 1 message, within 7 days); "Send this to your media buyer" (sends); "Link in bio" (traffic). | Metricool 2026 (n=24.4M); Mosseri on sends; Meta Private Replies docs | medium |
| Alt text | Write custom alt text for each image or carousel slide: what the slide says and shows, ideally 125 characters or fewer (Access Now guidance). Cap is 1,000 characters in the API. Not available for Reels. | Meta API; Instagram Help Centre (via search); accessibility guidance | high (feature); medium (length) |
| Emoji / line breaks | 0–3 functional emoji. Short paragraphs with blank lines. | No large study | low |
| Reels on-screen text | Keep text inside about 220 px of the top and about 420 px of the bottom of 1080×1920 (the convention). For ads-safe, use 14% top and 35% bottom. | Meta ads safe-zone %; convention | medium |
| Reels length for discovery | 3 minutes or under for non-follower reach | Third-party reports | low–medium |

---

## Sources (accessed 20 Oct 2026)
- @creators Threads, hashtag limit (18 Dec 2025): https://www.threads.com/@creators/post/DSalXGPCWM4 (official)
- Meta Instagram Platform, IG User Media reference: https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media (official)
- Meta Private Replies: https://developers.facebook.com/docs/instagram-platform/private-replies (official)
- Meta Hashtag Search API: https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-hashtag-search (official)
- Meta Transparency Centre, IG Search ranking: https://transparency.meta.com/features/explaining-ranking/ig-search/ (official)
- Instagram ranking explained (31 May 2023): https://about.instagram.com/blog/announcements/instagram-ranking-explained (official)
- Instagram Help Centre, alt text: https://help.instagram.com/iphone-app/503708446705527 (official; content seen via search only)
- Social Media Today, 5-hashtag limit (18 Dec 2025): https://www.socialmediatoday.com/news/instagram-implements-new-limits-on-hashtag-use/808309/
- Social Samosa (19 Dec 2025): https://www.socialsamosa.com/news-2/instagram-hashtags-five-per-post-10923075
- Hipertextual: https://hipertextual.com/internet/instagram-limite-cinco-hashtags-publicacion/
- Metricool 2026 Instagram Study press release (16 Jun 2026): https://metricool.com/press-release-instagram-study-2026/
- Metricool Instagram limits (21 Jan 2026): https://metricool.com/instagram-limits/
- Socialinsider caption length study: https://www.socialinsider.io/blog/instagram-caption-length/
- Socialinsider 2026 benchmarks: https://www.socialinsider.io/blog/instagram-hashtag-study/
- PostPlanify caption length: https://postplanify.com/blog/instagram-caption-length
- Sked Social × Socialinsider: https://skedsocial.com/blog/sked-social-socialinsider-an-in-depth-look-at-how-instagram-engagement-has-changed-this-year.md
- Stack Influence (secondary write-up of Socialinsider): https://stackinfluence.com/short-instagram-captions-boost-engagement/
- Hootsuite hashtag experiment (2021): https://blog.hootsuite.com/experiment-instagram-hashtags/
- Hootsuite hashtag tips (@creators 3–5): https://blog.hootsuite.com/social-media-updates/instagram/hashtag-tips/
- Buffer posting frequency (2M posts): https://buffer.com/resources/how-often-to-post-on-instagram/
- Buffer Reels length: https://buffer.com/library/instagram-reels-length
- LiveDune: https://livedune.com/blog/best-instagram-caption-length/
- Kontentino, Instagram search SEO (20 Jul 2026): https://www.kontentino.com/q-and-a/instagram-search-seo/
- Lindsey Gamble, end of hashtag follows: https://www.lindseygamble.com/blog/instagram-is-getting-rid-of-the-ability-to-follow-hashtags
- Lindsey Gamble, 20-minute Reels camera: https://www.lindseygamble.com/blog/instagram-updates-reels-camera-with-20-minute-recording-support
- PetaPixel, 20-minute Reels (25 Nov 2025): https://petapixel.com/2025/11/25/instagram-updates-camera-so-you-can-film-20-minute-reels (403 when fetched; date from the URL)
- TechRadar, 20-slide carousels: https://www.techradar.com/computing/instagram/instagram-will-now-let-you-post-up-to-20-photos-or-videos-in-a-gallery-your-friends-should-be-thrilled
- TechCrunch, Recent tab test (2022): https://techcrunch.com/2022/04/19/instagram-removes-recent-tab-hashtag-pages/amp/
- Inro, Reels safe-zone checker: https://www.inro.social/tools/instagram-reels-safe-zone-checker
- Ignite Social Media, safe zones: https://www.ignitesocialmedia.com/content-creation/what-are-the-safe-zones-for-tiktoks-and-instagram-reels/
- Bundle.social, character limits: https://bundle.social/blog/instagram-character-limits-guide
- Izea, Reels Trends: https://izea.com/resources/reels-trends-feature/
- Search Engine Journal, sends signal: https://searchenginejournal.com/instagram-algorithm-shift-why-sends-matter-more-than-ever/521389
- Flick review: https://inmagic.ai/flick-review/
- Adweek, link sticker for all: https://develop.adweek.com/?p=1362854

## Couldn't verify
- The Instagram Help Centre wording for the 5-tag cap ("You can use up to 5 tags on a post"), seen only via a vendor quote. help.instagram.com did not render.
- Whether hashtags in **comments** are capped at 5, still allow more, or count towards the caption cap.
- Whether the 5-tag cap is enforced on **API or scheduler publishing** (the API docs still say 30).
- An official feed or Reels caption truncation length (none published).
- The current number of links in the bio (5 vs 1 or 3; sources conflict).
- Comment length (2,200 vs 1,000) and the @mention cap per comment.
- Whether hashtag pages still show post counts in Oct 2026, and whether Post Insights still has a "from hashtags" reach line.
- The official Reels upload limit in the app (15 vs 20 minutes) and the "3 minutes or under for non-follower recommendation" rule.
- The current status of Display Purposes, RiteTag and Inflact, and Flick's official pricing.
- The exact date and original post of the @creators "3–5 hashtags" tip (2021), and the Feb/May 2025 Mosseri hashtag quotes, which were seen via Social Media Today only.
- The original Mosseri Jul 2026 search Q&A (Kontentino summary only).
- **How all six named creators write Instagram captions (n=0).**
- Any large study on emoji or line breaks in Instagram captions, 2024–2026.

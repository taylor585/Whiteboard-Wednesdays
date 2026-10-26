# YouTube descriptions and metadata: research for "Performance Poster"

Prepared 20 October 2026 for Pecuna Factorem (Taylor Cunningham, Whiteboard Wednesdays). UK English.

**How to read this file**
- **Source labels.** Every hard limit is marked **official** (YouTube Help or Google developer docs), **third-party** (tool vendors, blogs, news) or **observed** (our own data or tests).
- **Evidence labels.** Every finding gives its n and a confidence rating (high, medium or low).
- **Sections.** Research findings (Parts 1–4) are kept apart from house rules (Part 5).
- **Data.** Part 2 was computed by `desc_analysis.py`, which sits in the same folder as this file. Its full tables are in `desc_tables.md` and its per-video rows in `desc_rows.json`.

---

## Part 1: Hard limits and platform rules

### 1.1 Limits table

| Item | Limit or rule | Label | Source | Confidence |
|---|---|---|---|---|
| Title length | **100 characters** maximum. `<` and `>` are not allowed. | official | YouTube Help, "Add video information" (answer/57404); Data API `snippet.title` | high |
| Title truncation in search (desktop) | About **60–70 characters** before "…". Truncation is by pixel width, not by character count. | third-party | socialk.it, advancedcharactercounter.com, howmanywords.app (aggregated by search) | low–medium |
| Title truncation (mobile search, feed, suggested) | About **40–60 characters** (one analysis puts it at 45–55). Shorts may cut nearer 40. | third-party | creaticalc.com, howmanywords.app | low |
| Description length | **5,000 characters** in the Help Centre. The Data API says **5,000 bytes**. `<` and `>` are not allowed. | official (both) | answer/57404; answer/12948449; Data API `snippet.description` | high (limit); medium on chars vs bytes |
| Description shown before "…more" | **Official:** "the first few lines", with no number given. **Third-party:** desktop about **157 characters**; mobile about **100–150**, and sources disagree. | official (qualitative) / third-party (numbers) | answer/12948449; socialk.it, unilink.us, advancedcharactercounter.com | high (that the top matters); low (exact numbers) |
| Description snippet in search results | No official number. Third-party guides say about 150 characters, often without splitting desktop from mobile. | third-party | collabpals.com tool page | low |
| Hashtags shown by the title | "Up to three hashtags that are considered the most engaging", taken from the description | official | YouTube Help, "Hashtag policies" (answer/6390658) | high |
| Hashtag overflow | "If a video or playlist has **more than 60 hashtags**, we'll ignore each hashtag on that content." | official | answer/6390658 | high |
| Hashtag conduct | No spaces. Must relate directly to the video. "Don't add too many tags…": over-tagging "may result in the removal of your video from your uploads or from searches". Ordinary tags or repeated sentences written as hashtags are not allowed. | official | answer/6390658 | high |
| Hashtags in titles | Allowed, and they link to a hashtag results page. The Help page does **not** say whether title hashtags replace the three shown above the title. | official (allowed) / unverified (interaction) | answer/6390658 | medium |
| Tags field | **500 characters in total**. Commas count. A tag containing a space counts as if wrapped in quotes (+2). Example: `Foo-Baz` counts as 7 and `Foo Baz` as 9. | official (Data API) | developers.google.com/youtube/v3/docs/videos | high |
| Tags' importance | "Tags play a minimal role in your video's discovery". They are useful mainly for words people commonly misspell. | official | YouTube Help, "Add tags" (answer/146402) | high |
| Tags in the description | "Adding excessive tags to your video description is against our policies on spam, deceptive practices and scams." | official | answer/146402 | high |
| Chapters | First timestamp **00:00**. **At least three** timestamps, in ascending order. Each chapter **at least 10 seconds**. Automatic chapters are on by default but not every video qualifies (e.g. channels with active strikes). | official | YouTube Help, "Video chapters" (answer/9884579) | high |
| Comment length (including a pinned comment) | **10,000 characters** in several guides. One unverified claim says comments containing links are cut at about 500 characters until expanded. | third-party | influencermarketinghub.com, typecount.com, howmanywords.app | low–medium |
| Shorts: links | Links in Shorts **descriptions and comments are not clickable**, a change rolled out gradually from 31 August 2023. Third-party guides say description links never came back. | third-party (news quoting YouTube's announcement) | tubefilter.com (10 Aug 2023); searchenginejournal.com; malwarebytes.com; link.boo (later status) | medium (change); low (current status) |
| Shorts: title and description limits | No Shorts-specific limit was found. The general 100 / 5,000 limits are assumed to apply. | unverified | none | low |
| Shorts: hashtags | YouTube suggests hashtags as you type them on a Short. No Shorts-specific count limit is documented. | official | answer/6390658 | medium |
| Misleading metadata | Banned under "Malicious clickbait": "Using maliciously misleading titles, thumbnails, descriptions or imagery". Example: a title offering a full match where the video shows a clip. Links to malware in the description are banned under off-platform diversion. | official | YouTube Help, "Spam, deceptive practices and scams policies" (answer/2801973) | high |

### 1.2 What this means for the poster (research, not house rules)

- **Description budget.** Plan to **5,000 bytes**, not 5,000 characters. Emojis and curly quotes take 3–4 bytes each, so a description full of emojis can be rejected over the API before it reaches 5,000 characters. This is an inference from the two official texts, not a tested case. Confidence: medium.
- **Title.** Front-load the searchable noun within about **50 characters**. That keeps it visible on mobile, the narrowest place it appears (third-party estimate). Confidence: medium.
- **Hashtags.** Only the first three ever have visible value (the "by the title" slot). Above 60, every hashtag is ignored, and over-tagging carries a removal risk. Confidence: high.
- **Tags.** Use them only for misspellings and brand variants, and keep the total within 500 characters as the API counts it.

---

## Part 2: Analysis of real creator descriptions

### 2.1 Data and method

- **Source.** The thumbnail-tracker teardowns, collected on 12 October 2026: Nick Saraev, Riley Brown and Sabri Suby, each with a latest-30 sample and an all-time top-20 sample. That makes 150 videos.
- **They are teardowns, not raw descriptions.** Analysts recorded the above-the-fold text, length, link counts, the first link line, chapters, hashtags and the job of the first line. Full text exists for only 5 of Riley's latest 30. The fields therefore differ by creator and sample, and each cell reports its own n.
- **Re-fetching failed.** We tried to pull the raw descriptions with `yt-dlp`, but YouTube returned **HTTP 429** and then "Sign in to confirm you're not a bot". That is **observed** and was not worked around.
- **Outlier.** A video's views divided by the median of the 10 uploads either side of it.
- **Main keyword.**
  - (a) The analyst's `front_keyword` from the title. This exists for the latest 30 only.
  - (b) A proxy: any title word of 4+ letters that is not a stopword. This exists for all samples.
- **The first 150 characters** were taken from the above-the-fold text, or from the first line where that is all we have. For Riley's latest 30, 22 of 30 openings are shorter than 150 characters (only line 1 is stored), so keyword presence there is **under-counted**.
- **CTA on line 1** means any one of these:
  - the analyst marked the first line as a CTA or link;
  - line 1 contains a URL;
  - line 1 starts with a CTA verb (join, download, get, check out, the app that…).
- **Hashtag position** could not be computed. The teardowns record counts, not positions.
- **Statistics.** Median-split comparisons and Spearman rank correlations (rho) against the outlier ratio. These are small samples and observational data with no CTR or search-traffic data, so read them as **direction only**.

### 2.2 Table A: what the descriptions look like

Each cell shows the median [IQR] (n), or a count out of n.

| Creator | Sample | n | Length (chars) | First line (chars) | Analyst keyword in first 150 | Title word in first 150 | Links (total) | First link line | Hashtags > 0 | Chapters | CTA on line 1 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Nick | latest30 | 30 | 3,494 [3,233–3,890] | 85 [85–85] | 1/30 | 3/30 | 2 [2–5] | 1 [1–1] | 0/30 | 24/30 | 30/30 |
| Nick | top20 | 20 | not recorded | 85 [68–85] | n/a | 5/20 | not recorded | 1 [1–2] (n=18) | 0/20 | 16/20 | 18/20 |
| Riley | latest30 | 30 | 944 [632–1,296] | 65 [32–118] | 13/30 | 22/30 | 1 [0–2] | 3 [3–5] (n=24) | 7/30 | 29/30 | 4/30 |
| Riley | top20 | 20 | 1,058 [876–1,706] | 64 [37–89] | n/a | 18/20 | not recorded | 2 [1–2] (n=9, fold only) | 1/20 | 18/20 | 3/20 |
| Sabri | latest30 | 30 | 312 [242–355] | 94 [83–116] | 14/30 | 22/30 | 5 [4–5] | 3 [3–3] | 0/30 | 0/30 | 2/30 |
| Sabri | top20 | 20 | 1,101 [366–2,118] | 52 [52–122] | n/a | 6/20 | not recorded | 2 [1–2] (n=5, fold only) | 13/20* | 1/20 | 2/20 |

\* Sabri's top-20 hashtag counts were 0 (7 videos), 1 (4, mostly the branded #heysabri), 3, 4 and 7 (1 each), and 8, 10 and 12 (2 each). Riley's 7 of 30 are mostly partner tags (#ChatGPT_Partner).

**What Table A shows**
- **Three house styles.** Nick writes long descriptions (median about 3,500 characters) that open with a CTA on line 1 every time. Riley writes mid-length descriptions (about 1,000) that open with a hook or keyword sentence, with a link by line 3. Sabri's recent ones are short (about 300) and open with a summary, with the link on line 3. **Confidence: high** (n=30 each, a direct count).
- **Keyword placement.** Nick almost never puts the title keyword in the first 150 characters (1/30 analyst keyword, 3/30 proxy), because the CTA takes that space. Riley and Sabri do so in about half (analyst keyword) to three-quarters (proxy) of their latest 30. **Confidence: high** for Nick; **medium** for Riley, where the count is understated.
- **Hashtags and chapters.** Hashtags are near-absent in the latest 30. Chapters are Nick's and Riley's habit, while Sabri leaves them out (0/30). **Confidence: high.**

### 2.3 Table B: median outlier when the feature is present or high vs absent or low

Numeric features are split at their own median; n is shown for each side.

| Creator | Sample | Length (> median vs ≤) | Keyword in 150 (analyst) | Title word in 150 | Links | First link line (later vs earlier) | Hashtags | Chapters | CTA line 1 |
|---|---|---|---|---|---|---|---|---|---|
| Nick | latest30 | 0.84 (15) vs 0.59 (15) | 0.84 (1) vs 0.79 (29) | 0.84 (3) vs 0.79 (27) | 0.58 (12) vs 1.04 (18) | no variance | no variance | 0.69 (24) vs 1.08 (6) | no variance (30/30) |
| Nick | top20 | n/a | n/a | 6.62 (5) vs 9.22 (15) | n/a | 7.70 (7) vs 9.22 (11) | no variance | 9.75 (16) vs 6.64 (4) | 8.46 (18) vs 8.39 (2) |
| Riley | latest30 | 0.92 (15) vs 1.12 (15) | 0.77 (13) vs 1.12 (17) | 0.90 (22) vs 1.25 (8) | 0.58 (9) vs 1.12 (21) | **1.11 (9) vs 0.41 (15)** | 0.58 (7) vs 1.11 (23) | 1.11 (29) vs 0.18 (1) | **0.21 (4) vs 1.12 (26)** |
| Riley | top20 | 9.45 (10) vs 6.86 (10) | n/a | 7.55 (18) vs 11.89 (2) | n/a | no variance | 2.61 (1) vs 7.57 (19) | 7.55 (18) vs 7.77 (2) | 7.54 (3) vs 7.57 (17) |
| Sabri | latest30 | 1.43 (15) vs 0.56 (15) | 1.49 (14) vs 0.69 (16) | 1.25 (22) vs 0.63 (8) | 4.62 (2) vs 1.06 (28) | 0.56 (1) vs 1.06 (29) | no variance | no variance | 8.64 (2) vs 0.91 (28) |
| Sabri | top20 | 30.25 (10) vs 12.96 (10) | n/a | 25.49 (6) vs 16.49 (14) | n/a | no variance | 35.45 (9) vs 13.85 (11) | 84.55 (1) vs 15.53 (19) | 28.18 (2) vs 17.33 (18) |

### 2.4 Table C: Spearman rank correlation with outlier

Each cell shows rho (n).

| Creator | Sample | Length | First-line length | Links | URLs above the fold | First link line | Hashtags | Chapter count |
|---|---|---|---|---|---|---|---|---|
| Nick | latest30 | +0.03 (30) | +0.00 (30) | −0.14 (30) | +0.20 (30) | n/a | n/a | −0.05 (30) |
| Nick | top20 | n/a | +0.03 (20) | n/a | +0.07 (20) | +0.03 (18) | n/a | +0.06 (20) |
| Riley | latest30 | −0.12 (30) | −0.24 (30) | −0.32 (30) | −0.10 (30) | **+0.39 (24)** | −0.07 (30) | +0.21 (30) |
| Riley | top20 | +0.22 (20) | −0.20 (20) | n/a | −0.04 (20) | +0.09 (9) | −0.38 (20) | +0.32 (20) |
| Sabri | latest30 | +0.24 (30) | +0.10 (30) | +0.38 (30) | +0.35 (30) | −0.38 (30) | n/a | n/a |
| Sabri | top20 | +0.51 (20) | −0.23 (20) | n/a | −0.33 (20) | −0.58 (5) | +0.39 (20) | +0.38 (20) |

**Sensitivity check.** We dropped the newest 5 uploads of each latest-30 sample, because their ratios are still settling (n=25 each; see Table D in `desc_tables.md`). Every direction stayed the same. Riley's CTA-on-line-1 gap held at 0.21 (4) vs 1.12 (21). Sabri's length gap widened to 2.51 vs 0.62.

### 2.5 What the numbers say

| # | Finding | n | Confidence | Caveat |
|---|---|---|---|---|
| D1 | **No description feature consistently separates hits from misses across the three channels.** Signs flip between creators and samples. For example, length is + for Sabri (rho +0.24 / +0.51) and Riley's top 20 (+0.22) but − for Riley's latest 30 (−0.12). Chapters are − for Nick's latest 30 (0.69 vs 1.08) and + for his top 20 (9.75 vs 6.64). | 150 | medium | Observational; no CTR or search data |
| D2 | **Sponsor or third-party CTAs early in the description go with Riley's weak videos.** CTA on line 1: 0.21 (n=4) vs 1.12 (n=26). Later first link: rho +0.39 (n=24). In his all-time top 20, own-product links on line 1 are neutral: 7.54 (3) vs 7.57 (17). | 30 + 20 | medium | n=4 in the CTA group, and those CTAs are sponsor lines. Sponsored videos may be weaker topics, so this is reverse causation risk. |
| D3 | **Sabri's longer recent descriptions sat on his better videos.** 1.43 vs 0.56, rho +0.24. | 30 | low | The research notes this is a time confound: template B was added to old winners. Not causal. |
| D4 | **Keyword in the first 150 characters: no consistent effect.** Sabri + (1.49 vs 0.69); Riley − (0.77 vs 1.12); Nick untestable (1/30). | 90 | low | Teardown text was incomplete for Riley |
| D5 | **Hashtags: near-absent among these creators.** Latest-30 videos with any hashtag: 7/90. Sabri's top 20 with many hashtags (8–12) are three luxury-brand exposés from one topic run. | 150 | high (usage); low (effect) | Effect untestable |
| D6 | **Chapters are a channel habit.** Nick 24/30 and 16/20; Riley 29/30 and 18/20; Sabri 0/30 and 1/20. They are not linked to outlier in a consistent direction. | 150 | high (habit); low (effect) | Chapters also show in search as "key moments" (not tested here) |
| D7 | **All three hit channels write descriptions of very different lengths** (about 300, 1,000 and 3,500 characters). So no length is "required" to get a hit. | 90 | high | — |

### 2.6 Do the numbers confirm the existing laws?

| Law (overview.md) / framework claim | Our result | Verdict |
|---|---|---|
| **17.** "The description doesn't decide the click; write it to convert and help." Riley's sponsor-first lines sit on his weakest videos; own-product line-1 CTAs sit on hits. | D1: no consistent signal. D2: sponsor-first 0.21 vs 1.12 (n=4 vs 26); own-product line 1 in the top 20 is neutral (7.54 vs 7.57). | **Confirms** (medium) |
| **18.** "Chapters are a house habit, not a lever." Nick 24/30, Riley 29/30, Sabri 0/30; Nick 0.69 vs 1.08 (n=6). | Same counts. We reproduce 0.69 (24) vs 1.08 (6), and the top 20 reverses it (9.75 vs 6.64). | **Confirms** (medium) |
| **19.** Disclose affiliate links. | Not tested. It is a compliance rule; disclosure was not re-counted. | Not tested |
| **20.** "Real hashtags are essentially unused." Latest 30: Sabri 0, Nick 0, Riley 7/30; all-time Nick 0/20, Riley 1/20. | Same counts. Sabri's top 20 shows 13/20 with at least 1 hashtag (4 of them just #heysabri; 8–12 on 6 videos). | **Confirms** (high) |
| Framework: "first ~150 characters show in search and above …more" | No official number. Third-party estimates are about 157 on desktop and 100–150 on mobile. YouTube itself only says "the first few lines". | **Partly confirmed.** Keep it as a third-party estimate. |
| Framework: chapter rules (0:00, ≥3, ≥10 s, ascending) | Matches YouTube Help answer/9884579 exactly. | **Confirms** (official) |
| Framework: hashtags default 0–3 | Consistent with the official "up to three shown". | **Confirms** |

### 2.7 Other creators (optional)

- **Not fetched:** Jeremy Haynes, Alex Finn and Daniel Priestley. `yt-dlp` got HTTP 429 and then a bot check ("Sign in to confirm you're not a bot") on the first request. Per the brief, we moved on.
- **Nothing is claimed about their descriptions.**

---

## Part 3: Where to find what people search, and choosing the three hashtags

### 3.1 Keyword sources

| Source | What it gives | Free? | Label | Notes for a UK agency channel |
|---|---|---|---|---|
| **YouTube search autocomplete** | Live suggestions as you type, which reflect real queries. No volumes. | Free | observed (common practice) | Use a private window to cut personalisation. The "a–z" trick ("claude code a…", "claude code b…") widens the list. |
| **YouTube Studio → Analytics → Research tab** | **Searches across YouTube:** top related searches over the last 28 days, each rated low/medium/high popularity. **Your viewers' searches:** what your audience and viewers of similar channels searched. A "Content gap" label and filters by geography and language. | Free (in Studio) | official (answer/11962757) | Insights are limited to **English searches from viewers in the US, UK, India, Australia and Canada**. A small channel may see "not enough data". |
| **YouTube Studio Inspiration tab** | AI ideas for topics, titles, thumbnails and outlines (9 at a time). | Free | official (answer/15575509) | **Being phased out gradually from August 2026.** YouTube points creators to **Ask Studio** instead. Desktop and English only. Don't build the skill on it. |
| **Google Trends, "YouTube Search" property** | Relative interest over time and by region, comparing up to 5 terms on a 0–100 scale. No absolute volumes. | Free | third-party description (Google's own page for the filter was not found) | The default is web search, so switch the property to YouTube Search. One help centre says YouTube Search covers 12 months (unverified). |
| **Google Ads Keyword Planner** | Google web search volumes. YouTube's own help page suggests it for keyword ideas. | Free with an Ads account | official (mentioned in answer/12948449) | These are web volumes, not YouTube volumes. |
| **vidIQ** | Keyword score, related keywords with volume and competition estimates, trends, AI ideas. | Freemium. The vidIQ site lists a free tier with 150 monthly AI credits; paid "Boost" was listed at $19/month or $199/year. | third-party (vendor) | Its volume figures are modelled estimates, not YouTube data |
| **TubeBuddy** | Keyword Explorer (search volume and competition estimates), tag tools, A/B testing on paid tiers. | Unclear. Sources conflict on whether a free tier still exists; Pro was listed at about $15/month. | third-party | Check tubebuddy.com/pricing before relying on it |

**Recommended workflow (house practice, not research).** It takes about 10 minutes per video:
1. Run autocomplete on the topic noun ("Claude Code …", "AI agency …").
2. Check the Research tab for the same noun. Note the popularity level and whether it is a content gap.
3. Run Google Trends (YouTube Search, UK and worldwide, past 12 months) to compare 2–3 phrasings.
4. Put the winning phrase in the title's first 50 characters and in the hook line.

### 3.2 Choosing the three hashtags shown above the title

- **Official.** YouTube picks "up to three hashtags that are considered the most engaging" from the description. You don't directly control which three, so **only add hashtags you'd be happy to see there**. Every hashtag must relate directly to the video; over 60 and all are ignored. (answer/6390658, high)
- **Practical approach.** This is a recommendation; YouTube does not document its selection method, so confidence is low.
  1. One **topic/search** hashtag that matches the main keyword (e.g. #ClaudeCode).
  2. One **audience** hashtag (e.g. #AgencyOwner).
  3. One **series/brand** hashtag (#WhiteboardWednesdays).
- **Check each one before using it.** Open the hashtag's results page and confirm it has related videos on it. Avoid hashtags that are empty or off-topic.
- **Placement.**
  - Put the hashtags at the end of the description (the house layout).
  - Hashtags in the title are allowed, but they use up title characters before the truncation point. The research creators don't use them.
  - Whether title hashtags displace the description hashtags shown above the title is **unverified**.

---

## Part 4: Recommendations

| Element | Recommendation | Evidence | Confidence |
|---|---|---|---|
| **Description length** | **No length target.** Aim for about 800–2,000 characters: enough for a hook, summary, bullets and chapters, and comfortably under the 5,000-**byte** API limit. Never pad. | Hits sit at about 300 (Sabri), about 1,000 (Riley) and about 3,500 (Nick) characters (D7, n=90). Length has no consistent direction (D1). The 5,000 limit is official. | medium (no target) / high (limit) |
| **First 150 characters** | Make them carry **the CTA, plus the searchable noun from the title** if they fit. Under the house rule, the WhatsApp CTA is 108 characters, so the hook line (line 2) should open with the keyword in its first ~40 characters so it lands inside the first ~150. | YouTube: "use the first few lines… to describe your video" and put 1–2 main words "prominently in both your description and title" (official). Third-party: about 157 visible on desktop and about 100–150 on mobile. The data show no consistent view effect (D4). | medium (official guidance); low (exact counts) |
| **CTA placement** | Put **your own offer or contact CTA on line 1** (house rule). **Never open with a sponsor or third-party link.** Put any sponsor after the hook, with a disclosure. | Riley: sponsor-first 0.21 vs 1.12 (n=4 vs 26), and a later first link goes with higher outliers (rho +0.39, n=24). Own-product line-1 CTAs on hits are neutral (7.54 vs 7.57). Nick has line-1 CTAs on 30/30 and still gets hits. | medium |
| **Hashtag count** | **3** (fill the visible slots and stop). Never more than 60. The house rule says 3–5; if 5 are used, YouTube still shows at most 3. | Official: up to 3 shown, more than 60 ignored, over-tagging risks removal. Creators: 7/90 latest videos use any (D5); no performance evidence either way. | high (rules) / low (effect) |
| **Chapters** | **Add them on every long-form video**: 0:00 first, at least 3, each at least 10 seconds, ascending, real timestamps, keyword-plain names. | Official rules (answer/9884579). They are a viewer aid and a habit on two of the three channels, not a lever (D6, law 18). | high (rules) / medium (value) |
| **Title** | ≤ 100 characters (hard limit). Main noun in the first ~50 characters. | Official 100. Third-party truncation estimates: 60–70 desktop, 40–60 mobile. | high / low–medium |
| **Tags field** | A few misspellings and brand variants only. Total ≤ 500 characters (commas and quotes count). | Official: "tags play a minimal role". | high |
| **Pinned comment** | Repeat the CTA in a pinned comment. Keep it short; there is no hard need to go near the reported 10,000-character limit. | 10,000 is third-party; no performance data. | low |
| **Shorts** | Don't rely on links in Shorts descriptions; they are not clickable. Put the link on the channel's prominent links or in the related long-form video. | Change announced 2023 (third-party coverage quoting YouTube); current status per third parties. | medium |

---

## Part 5: House rules (from Taylor's instructions, kept apart from the research)

These are brand rules. They override the research defaults where the two conflict.

- **Line 1 is always the pinned CTA.**
  - The line: "Want to chat? Give me a message on WhatsApp. This is my personal number 👉 https://pecunafactorem.com/contact" (with a space after the arrow), then a blank line.
  - It is 108 characters and 111 bytes, measured.
  - **Effect:** it uses most of the first ~150 characters that third-party guides say show above "…more" and in search snippets. The hook line therefore has to front-load the keyword.
- **Spacing.** A blank line between every "What you'll learn" bullet, every chapter line, every "How we can help" paragraph, and between all sections. Delivered in one copy-and-paste text box. Timestamps must still start their line, with the first at 0:00.
- **Hashtags: 3–5** (brand rule). The research supports 3 as the useful number, since only 3 are shown.
- **The full house style** is in thumbnail-tracker `references/brand/house-style.md` and `assets/cta/`.

---

## Sources

All accessed 20 October 2026.

| # | URL | Used for | Label |
|---|---|---|---|
| 1 | https://support.google.com/youtube/answer/57404 | Title 100 / description 5,000 characters | official |
| 2 | https://developers.google.com/youtube/v3/docs/videos | Title 100 characters; description 5,000 bytes; `<` `>` banned; tags 500 characters and how they are counted | official |
| 3 | https://support.google.com/youtube/answer/12948449 | Tips for descriptions: "first few lines", 1–2 main words, 5,000 maximum, Research tab and Keyword Planner | official |
| 4 | https://support.google.com/youtube/answer/6390658 (and ?hl=en-GB) | Hashtags: up to 3 shown by the title, more than 60 ignored, over-tagging, no spaces, relevance | official |
| 5 | https://support.google.com/youtube/answer/9884579 | Chapter rules | official |
| 6 | https://support.google.com/youtube/answer/146402?hl=en-GB | Tags have a minimal role; excessive tags in the description breach spam policy | official |
| 7 | https://support.google.com/youtube/answer/2801973?hl=en-GB | Malicious clickbait (misleading titles, thumbnails, descriptions); malware links in the description | official |
| 8 | https://support.google.com/youtube/answer/11962757 | Research tab (28 days, low/med/high, content gaps, US/UK/IN/AU/CA English) | official (via search result summary) |
| 9 | https://support.google.com/youtube/answer/15575509?hl=en-GB | Inspiration tab, deprecated gradually from August 2026; Ask Studio | official |
| 10 | https://tubefilter.com/2023/08/10/youtube-shorts-comments-spam/ | Shorts links not clickable from 31 August 2023 | third-party |
| 11 | https://www.searchenginejournal.com/youtube-implements-new-linking-policy-to-curb-spam/493701/ | Same | third-party |
| 12 | https://www.malwarebytes.com/blog/news/2023/08/youtube-makes-sweeping-changes-to-tackle-spam-on-shorts-videos | Same | third-party |
| 13 | https://link.boo/guides/youtube-shorts-link-in-description | Current Shorts link status | third-party |
| 14 | https://socialk.it/en/tools/youtube-character-counter | About 157 characters on desktop before "Show more"; title truncation | third-party |
| 15 | https://www.unilink.us/blog/youtube-link-in-description-best-practices | Above-fold estimates | third-party |
| 16 | https://advancedcharactercounter.com/youtube-description-character-limit-and-title-length-guide-2026/ | Above-fold and title truncation estimates | third-party |
| 17 | https://www.collabpals.com/tools/youtube-description-generator | About 150 characters on the watch page and in search | third-party |
| 18 | https://creaticalc.com/blog/youtube-title-mobile-feed | Mobile title truncation of 45–55 | third-party |
| 19 | https://howmanywords.app/blog/youtube-character-limits | Title truncation, comment 10,000 | third-party |
| 20 | https://influencermarketinghub.com/youtube-character-limits/ | Comment 10,000 | third-party |
| 21 | https://typecount.com/blog/youtube-description-character-limit | Comment 10,000 | third-party |
| 22 | https://vidiq.com/pt/compare/vidiq-vs-tubebuddy/ | vidIQ and TubeBuddy free tiers and prices (vendor-written) | third-party |
| 23 | https://creaticalc.com/vidiq-vs-tubebuddy | Whether TubeBuddy has a free tier (conflicting) | third-party |
| 24 | https://ppc.land/google-trends-tutorial-new-insights-into-search-behavior-and-topic-comparison/ | Google Trends YouTube Search property | third-party |
| 25 | thumbnail-tracker `references/research/data/*.json`, `overview.md` laws 17–20, `frameworks/description-framework.md`, `brand/house-style.md` | Part 2 data and the laws checked | observed (internal) |

## Couldn't verify

- **Exact character counts above "…more"** on desktop and mobile, and in the search snippet. YouTube gives no number, the third-party figures (157 desktop; 100–150 mobile; about 150 snippet) disagree, and we could not test them live.
- **Exact title truncation** in search and feeds. It is pixel-based, and only third-party estimates exist.
- **Whether hashtags in a title suppress or replace** the three description hashtags shown above the title.
- **Shorts-specific title and description limits.** None were found; we assume the same 100 / 5,000.
- **Whether description links are still non-clickable on Shorts today.** Only third-party guides cover the current status.
- **The comment character limit** (10,000) and the claim that comments with links are cut at about 500 characters. Third-party only.
- **The Google Trends "YouTube Search" 12-month data window.** We did not find Google's own help page for that filter.
- **TubeBuddy's current free tier and both vendors' prices.** The sources conflict.
- **Whether the Help Centre's "5,000 characters" or the API's "5,000 bytes" is enforced in Studio** for multi-byte characters. Not tested.
- **Raw description text for all 150 videos, and any data for Jeremy Haynes, Alex Finn or Daniel Priestley.** YouTube blocked `yt-dlp` with HTTP 429 and a bot check.
- **Hashtag position statistics.** The teardown data hold counts, not positions.
- **Any effect of descriptions on CTR, search traffic or link clicks.** No analytics data was available, so every performance finding here is observational.

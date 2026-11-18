# LinkedIn research for Performance Poster (Pecuna Factorem)

Researched 20 October 2026. UK English. Every number below has a source. Labels:
- **official**: LinkedIn Help, LinkedIn Pressroom, LinkedIn Engineering, or a named LinkedIn employee speaking on the record.
- **third-party**: a vendor or analyst study. The study, its n and its date are given where they were published.
- **observed**: something seen directly on a public page, or a value a tool vendor reports from its own testing.
- **Confidence**: high, medium or low.

Two caveats apply throughout:
- Nearly every large dataset comes from a tool vendor (Buffer, Metricool, Socialinsider, Ordinal, LinkPost, Magicpost, AuthoredUp, Shield Index). Each studies its own users' accounts, so the samples lean towards active, tool-using posters.
- All of these studies are observational. They show correlation, not causation.

---

## PART 1: Hard limits

| Item | Limit | Label | Source | Confidence |
|---|---|---|---|---|
| Personal post text | **3,000 characters**. LinkedIn: "Posts can contain up to 3,000 characters." | official | linkedin.com/help/linkedin/answer/a528176 | high |
| Company Page post text | **3,000 characters**. The same Help article covers posting as a Page. No separate Page limit is published. | official (inferred from the same article) | a528176 | medium-high |
| Posting volume | No number is published. LinkedIn says it "may limit how many posts a member or a LinkedIn Page can make in a certain time period" and may "limit the visibility of those posts". | official | a528176 | high |
| Article body | **125,000 characters** | official | linkedin.com/help/linkedin/answer/a522483 | high |
| Article title | ~150 characters. LinkedIn does not publish this. | third-party | authoredup.com/blog/linkedin-character-limit | low |
| Article/newsletter SEO title | Keep **under 60 characters** (longer titles are truncated). LinkedIn suggests an SEO description of **140–160 characters**. | official guidance | linkedin.com/help/linkedin/answer/a6244140 | medium |
| Newsletter name / description | 30 / 120 characters. These figures come from blogs, some of them old. | third-party | e.g. John Espirian, "LinkedIn newsletters explained" (linkedin.com/pulse) | low |
| "...see more" fold, desktop | ~**210 characters**. One source reports about 5 lines for a text-only post and 3 lines when there is media. | third-party/observed. LinkedIn has not published it. | AuthoredUp; Ordinal (linkedin-post-size); contentin.io | medium |
| "...see more" fold, mobile | ~**140 characters**. Some sources say ~150, or about 2 lines. Line breaks and wrapping shorten the visible text. | third-party/observed | same as above | medium |
| Comment | **1,250 characters**. AuthoredUp says it "verified... in testing as of March 2026". Older sources give 1,750. | observed (vendor test) | authoredup.com/blog/linkedin-character-limit | medium |
| Document (PDF carousel) post | **100 MB, 300 pages**, PDF/PPT/PPTX/DOC/DOCX, one document per post. LinkedIn also states a 1 million-word limit. Multi-layer PDFs must be flattened, and animations show as static pages. | official | linkedin.com/help/linkedin/answer/a518909 and a523054 | high |
| Native video (member post) | **Up to 5 GB.** Maximum **15 minutes**. Minimum 3 seconds on desktop and 2 seconds on mobile. Aspect ratio **1:2.4 to 2.4:1**. Formats include MP4 and MOV. | official | linkedin.com/help/linkedin/answer/a548372 | high (see note) |
| Video on Pages / Career Pages | A separate Help page says "Max video duration - 10 minutes". | official | linkedin.com/help/linkedin/answer/a1311816 | medium |
| Video post text | Same 3,000-character limit as any post. No separate caption limit is published. | official (inferred) | a528176 | medium |
| Polls | Question **140 characters**. **2–4 options** of up to **30 characters** each. Duration: 1 day, 3 days, 1 week (default) or 2 weeks. | official | linkedin.com/help/linkedin/answer/a527270 and a522948 | medium-high (the pages are a few years old) |
| Profile headline | **220 characters**. It was raised from 120 in 2020. | third-party (LinkedIn's own page was not found) | Pulse post "Character Limit for LinkedIn Headlines is now 220" (2020); unilink.us 2026 | medium |
| About section | **2,600 characters** | third-party | unilink.us; contentin.io | medium |
| Hashtags per post | **No published limit.** In July 2025 Rishi Jobanputra (LinkedIn) said "don't go overboard". | official advice, no number | digitalinformationworld.com (2025/07) quoting his LinkedIn video | medium |
| Mentions per post | **Not verified.** Third-party figures conflict: 30, 40, or "no limit". | third-party, conflicting | circleboom.com; mashup-web.com; bardeen.ai | low |

**Note on video length.** The fetched video troubleshooting page (a548372) lists a 15-minute maximum on both desktop and mobile. An earlier search summary of the same page said 10 minutes on mobile. Assume 10 minutes when uploading from a phone until this has been checked in the app.

### Links: previews and reach
- **Official position.** LinkedIn's Help Center does not document any rule that penalises links. Its March 2026 feed post (news.linkedin.com/2026/ImprovingTheFeed) says LinkedIn is reducing "recycled and click-driven posts", engagement bait such as "comment to agree", and "videos that don't match the text". Links are not named. Some blogs claim a LinkedIn director said "no intentional penalty", but I could not trace that to a primary source. Status: **unverified**.
- **Third-party evidence: link in the post body.** The direction is consistent across studies, but the size of the effect varies a lot.
  - LinkPost (n = 516,144 posts, 30,843 profiles, 2020–2026, about 62% French): median **448 impressions with a link** (n = 74,891) against **705 without** (n = 284,130), which is **−36%**. Confidence: medium.
  - Ordinal (sample size not stated, early 2023 to early 2026): **−26.5%** reach. In Ordinal's segmentation, company pages take most of the penalty and personal profiles show "almost none". Confidence: medium-low.
  - Richard van der Blom / Just Connecting (~1.3M posts; the edition is unclear): one external link in the body cuts median reach by **−18.8%**. This is a second-hand citation via agilitypr.com, and the paid report could not be accessed. Confidence: low-medium.
  - The "~60% penalty" figure that circulates is unsourced. Do not use it.
  - Counter-evidence: Metricool's 2025 study (577k+ posts from 47k+ company pages, cited via a Sprout/PR Daily summary) found link posts had **+4.9% impressions** and +13.5% interactions. This covers company pages only, and I did not verify it at source. Confidence: low.
- **Link in the first comment.** Only small tests exist.
  - Sprout Social: 4 posts against 4 posts. Link-in-comment posts averaged ~8,136 impressions against ~3,309. Confidence: low.
  - Agorapulse Social Media Lab: 6 posts against 6, on 2 accounts. Impressions were +169%, but likes were −25% and shares −72%. Confidence: low.
  - Claims that the first-comment workaround has been "penalised as of early 2026" have **no source**. Status: unverified.
- **Link previews.** Observed on a Daniel Priestley post: a pasted URL was shortened to lnkd.in and an external preview card was shown. Confidence: high for that one post (n = 1).

---

## PART 2: Hashtags

### 2.1 What changed (2024–2026)
| Finding | Label | Source | Confidence |
|---|---|---|---|
| In July 2025 Rishi Jobanputra (LinkedIn product leader for Feed) said: "we used to have a hashtag feed in the past, but people were not really using it... we are actually in the process of getting rid of it." He added: "where hashtags can come in useful is when people are trying to search for a specific trend or topic... use ones that are related to the topic... don't go overboard." | official (on-record LinkedIn employee, quoted via press) | digitalinformationworld.com/2025/07/linkedin-plans-to-remove-hashtag-feed.html; original: linkedin.com/posts/rishij_i-was-asked-recently-if-you-should-include-activity-7351729382903762944-4v4M | high |
| The phrase "Hashtags are a nice to have, not a need to have" is attributed to the same July 2025 post. | third-party attribution | linkedgrow.ai; contentin.io | medium |
| The ability to follow hashtags and hashtag follower counts was removed during 2024. The reported reason is low usage. | third-party | contentin.io; websitebuilderexpert.com; tryordinal.com | medium |
| The old Help article "Use hashtags and follow topics on LinkedIn" (a528144) returned **HTTP 404** on 20 Oct 2026. | observed | linkedin.com/help/linkedin/answer/a528144 | medium (a 404 is consistent with the feature being removed but does not prove it) |
| Creator mode was retired in early 2024. Profile "topics" hashtags ("Talks about") went in about February 2024 and the toggle went in about March 2024. | third-party (Social Media Today) | socialmediatoday.com/news/linkedins-removing-creator-mode-option/706585/ | medium-high |
| LinkedIn's March 2026 feed update does not mention hashtags. Ranking now uses LLM-augmented "Generative Recommenders" built on profile signals (industry, skills, experience) and engagement history. | official | news.linkedin.com/2026/ImprovingTheFeed | high |

### 2.2 Do hashtags affect reach? (the evidence conflicts)
| Study | n / date | Finding | Confidence |
|---|---|---|---|
| **Magicpost** | 1,207,829 posts (likes) and 566,957 posts with analytics (impressions). June 2026 pull. Medians. | Median impressions by number of hashtags: 0 → **874**, 1 → 847, 2 → 825, 3 → 637, 4 → 604, 5 → **492**, 6+ → 529. Likes peak at 1 hashtag (35, against 32 with none) and fall at 3+. The pattern holds across follower bands. Use is falling: 67.9% of posts had a hashtag in 2022, 23.2% in 2026. | medium. This is the largest sample and uses medians, but the vendor's methods are not peer-reviewed. |
| **LinkPost** | 516,144 posts, 2020–2026, mostly French. Median likes. | 0 hashtags → 19 likes, **1 → 23 (+21%)**, 2–3 → 17, **4–6 → 11 (−40%)**. | medium |
| **Metricool 2026 LinkedIn Study** | 673,658 posts, 63,108 accounts. Date range not stated. | Posts with at least one hashtag had "85% more impressions than the platform average". The "sweet spot" was 1–5. Engagement rate barely moved (personal profiles 1.82% against 1.77%). The comparison groups are not defined. | low-medium |
| AuthoredUp newsletter (2023): "+50% engagement" with hashtags | no method given | old and unverified | low |

**Reading of the evidence.** The two median-based studies (Magicpost and LinkPost) agree:
- **0–2 hashtags are roughly neutral.** One hashtag may give a small lift.
- **3 or more is associated with lower reach and fewer likes**, and the drop is steepest at 5 or more.

LinkedIn's official position is that hashtags are mainly for **search and topic labelling**, not distribution. **Confidence: medium.**

### 2.3 Hashtag count and placement
- **Count.** The evidence supports **1–3 hashtags, best at 1–2**. The common "3–5" advice predates the 2024–2025 changes and **the 2026 median data contradicts it** at 4–5 hashtags. Confidence: medium.
- **Placement.** No study measures placement. Editorial advice (Magicpost) is to put them **at the end, on their own line**, and keep them out of the first ~140 characters, which are the hook. Priestley's 2023 post did this: 4 hashtags at the end (n = 1). Confidence: low (opinion).

### 2.4 Where to research hashtags and trending topics
| Source | What it gives | Free? | Notes |
|---|---|---|---|
| LinkedIn search, filtered to **Posts**, searching `#tag` or a keyword and sorting by **Latest** | Real recent use of a tag, who is posting and what engagement they get | Free | The main check. Follower counts for hashtags no longer exist, so judge a tag by how often it is used and by the quality of the posts. Jobanputra says search is where hashtags still help. |
| LinkedIn News / "Top stories" (desktop sidebar or the News tab) | Topics LinkedIn's editors are currently featuring | Free | Shows topics rather than hashtags. Good for timing angles. |
| Creator mode "Talks about" | Was a source of topic hashtags on profiles | n/a | **Retired in 2024.** Do not rely on it. |
| Competitor and peer posts | Hashtags that peers in AI and agencies actually use, and whether those posts perform | Free, manual | Check about 10 peers per pillar. Do not scrape at scale (LinkedIn blocks logged-out scraping; HTTP 999 seen). |
| Sales Navigator | Lead and account search, and alerts on posts by saved leads | Paid (no free tier, trial only) | Shows what buyers (agency owners) post about. It is not a hashtag tool. |
| Shield (shieldapp.ai) | Personal post analytics, historically including hashtag and post history | Paid | **Status unverified.** The site returned HTTP 402, and one review site says the service is gone. Check before recommending. |
| Taplio | Post inspiration database, scheduling, analytics | Paid: Starter $39, Growth $69, Pro $199 a month. No free plan, 7-day trial. | Pricing from taplio.com/blog/taplio-pricing (2026). |
| AuthoredUp | Post editor, preview of the fold, analytics including a hashtag-performance view of **your own** posts | Paid (~$19.95 a month per a review site) | Pricing unverified. |
| RiteTag (RiteKit) | Hashtag suggestions through a browser extension that works on LinkedIn | Freemium | The source of its LinkedIn data is **not disclosed**. Its scoring seems built on Twitter/Instagram data. Use with caution. |

### 2.5 Starter hashtag candidates for Pecuna Factorem
**These are candidates to verify, not proven tags.** Check each one in LinkedIn search (Posts, Latest) for recent use by relevant peers. Pick **1–2 per post** (3 at most), with one broad tag and one niche tag.

| Pillar | Broad candidate | Niche candidates |
|---|---|---|
| AI agents / Claude Code / Codex | #AI | #ClaudeCode, #AIAgents, #Anthropic, #Codex, #GenerativeAI, #Automation |
| Meta ads & paid social | #DigitalMarketing | #MetaAds, #FacebookAds, #PaidSocial, #PerformanceMarketing |
| Agency growth & operations | #AgencyGrowth | #AgencyLife, #AgencyOwner, #MarketingAgency, #Operations |
| ICP / buyer research | #B2BMarketing | #ICP, #CustomerResearch, #BuyerPersona, #Positioning |
| Content & YouTube | #ContentMarketing | #YouTube, #ContentStrategy, #VideoMarketing, #WhiteboardWednesdays (a brand tag; may help with search and series recall) |

---

## PART 3: Post performance research (2024–2026)

### Length
| Source | n / date | Finding | Confidence |
|---|---|---|---|
| Shield Index | 167,940 posts, Nov 2025 to Feb 2026, medians | Engagement rate rises with length: under 75 words 2.23%, 250+ words **2.71%** (comments per impression about 3x higher). **Reach rate peaks at 150–174 words** (0.154x) and very long posts (250+) reach less (0.128x). The advantage of long posts shrank from 1.77x (Nov) to 1.32x (Feb). For accounts under 5k followers, 150–250 words gave the best reach rate. | medium |
| Ordinal | 248,275 posts, 2024–2026 | Engagement rate: **2,000–3,000 characters 1.33%** (highest), under 150 characters 1.22%, **600–1,500 characters weakest (0.81–1.06%)**. Average impressions were 10,677 for 2,000–3,000 characters against 2,171 for under 150. | medium |
| LinkPost | 516,144 posts | Median likes rise steadily with length: under 300 characters → 12, 700–1,200 → 19, 1,200–1,800 → 21, **1,800+ → 25**. | medium |
| AuthoredUp (via secondary sources) | 372,126 posts, Sept 2025 to Feb 2026 (claimed) | 1,301–2,500 characters gave ~27% higher engagement than under 400 characters. Another secondary source attributes "800–1,100 characters" to AuthoredUp instead. | low (conflicting and second-hand) |

Rough conversion: 150–174 words ≈ 900–1,050 characters, and 250 words ≈ 1,500 characters.

**Synthesis.** For **reach**, around **900–1,500 characters** looks best (Shield). For **engagement and comments**, longer posts of **1,500–2,500+ characters** do better (Ordinal, LinkPost, Shield). The 600–1,500 band shows weak engagement in Ordinal's data, which partly contradicts the house range.

### Hook before the fold
- The fold sits at ~210 characters on desktop and ~140 on mobile (third-party; see Part 1).
- LinkPost's top-1% playbook (438,413 posts): **80% of highly viral posts had a strong hook in the first 200 characters, and 61% had a data point in the hook.** "Strong" is not defined. Confidence: low-medium.
- The official basis for why the hook matters is dwell time. LinkedIn Engineering (Dangi et al., 12 May 2020) describes a P(skip) model that "predicts the probability that the member will 'skip' an update". Each update's score is lowered "by an amount proportional to the predicted P(skip)". Dwell time is counted once at least half of an update is on screen. Confidence: high that the mechanism existed in 2020; medium that it still applies in the same form.

### Formats
| Source | n / date | Finding | Confidence |
|---|---|---|---|
| Socialinsider LinkedIn Benchmarks 2026 | 1.3M posts, 16,645 **company pages**, Jan 2024 to Dec 2025. Engagement by impressions, averages. | **Native documents had the highest engagement rate at 7.00%** (+14% YoY). Multi-image posts got the most likes. **Video views fell 36% YoY.** The 2025 edition (~1M posts from 2024) put multi-image at 6.60%, documents at 5.85–6.10% (inconsistent within the report), video 5.60%, and text/image ~4–4.8% (via Sprout). | medium (company pages only, averages) |
| LinkPost | 516,144 posts | Median likes: **video 26, carousel 24**, image 20, **text-only 11**. Carousels got 2.3x the median impressions of text posts. | medium |
| Ordinal | 248,275 posts | Document/carousel engagement 1.65% overall. Within a subset of 353 posts, 4–6 page documents averaged 1.87% ("directional"). | low-medium |
| AuthoredUp (video posts article) | n not seen | Median reach per video post on **personal profiles fell 36% YoY**. For top company pages, video reached 1.72x the median. | low-medium |
| Native video against a YouTube link | — | No rigorous study found. Vendor claims such as "52% longer watch time" and "5x engagement" have no traceable source. The link-penalty data above applies to YouTube links. | low |
| LinkedIn (official) | Mar 2026 | LinkedIn is demoting "videos that don't match the text". | high |

### Posting frequency
- **Buffer** (2M+ posts from 94,000+ accounts; published 28 Aug 2025; within-account fixed-effects design, so each account is compared with itself), compared with posting once a week:
  - 2–5 posts a week: **+1,182 impressions per post**, +0.23 percentage points engagement rate.
  - 6–10 a week: +5,001 impressions, +0.76 points.
  - 11+ a week: +16,946 impressions, +1.40 points.
  - Confidence: medium-high. This is the strongest frequency study found.
- LinkedIn may still limit how often an account can post and the visibility of those posts (official, a528176). No number is given.
- The best time to post (Buffer, all platforms): 7am–4pm, with a spike around 10am on Tuesdays. Confidence: low for LinkedIn specifically, as it is US-weighted. LinkPost (mostly French data) found **12:00 CET was the best slot (25 median likes) and 7–10am the worst (16)**. Confidence: low-medium.

### Comments and dwell
- Official, March 2026: LinkedIn is acting against "comment automation, engagement pods, and unauthorized third-party tools" and against "comment to agree" bait. Confidence: high.
- Third-party: Vulse reports that from 9 August 2026 comments are ranked by relevance to each viewer, attributed to LinkedIn via Social Media Today. **Not verified at source.** Confidence: low.
- Shield Index: very long posts get about 3x more comments per impression. Confidence: medium.

### Creator post structure (observed, small n, low confidence)
LinkedIn returns HTTP 999 to logged-out profile fetches, so individual public post pages were read instead. **n = 3 posts, all about 3 years old**, so they may not reflect current practice.

| Creator | Post | Hook | Length | Hashtags | Link | Media | Engagement shown |
|---|---|---|---|---|---|---|---|
| Daniel Priestley | "3 Big Ideas" workshop | "I've put together a 10 minute workshop - 3 Big Ideas to Future-proof your business in a post AI world." (101 characters) | ~1,000 characters, labelled "Idea 1/2/3 – X vs Y" | 4 at the end (#business #ai #sales #future) | Yes: lnkd.in link in the body plus an external preview card | Link card | 76 reactions, 24 comments |
| Daniel Priestley | "There's only one thing people buy." | 34-character first sentence; ~190 characters before the fold | ~600 characters, inline 2-point list, one 🙏 | 0 | None | Native video | 206 reactions, 41 comments |
| Sabri Suby | "Charging by the hour is unethical. Here's why..." | 48 characters; contrarian claim plus an open loop | body truncated | 0 visible | None | Probably video (a commenter mentions a video) | 170 reactions, 15 comments; 40,222 followers |

- **Search results only:** Nick Saraev's profile has ~61K followers. His recent posts are first-person opinion and story posts (refund ethics, a cheap AI-built game cross-posted from X). These were not fetched, so treat this as low confidence.
- **Not found:** Riley Brown (appears only in a "who to follow" list), Alex Finn (the two profiles found are ambiguous), and Jeremy Haynes (no results).

**Pattern across n = 3 (low confidence):** a short, punchy, contrarian or promise-based first line under 110 characters; native video outperforming the link post in this tiny sample; hashtags mostly absent.

---

## PART 4: Recommendations for LinkedIn

| Lever | Recommendation | Evidence | Confidence | Against the Pecuna house rule |
|---|---|---|---|---|
| Hard maximum | 3,000 characters | LinkedIn Help a528176 (official) | high | **Confirmed** (3,000 max) |
| Post length | **900–1,500 characters** by default, for reach. Go to **1,500–2,500** for opinion or teaching posts where comments are the goal. | Shield (n = 167,940) peaks for reach at ~150–174 words; Ordinal (n = 248,275) and LinkPost (n = 516,144) favour longer posts for engagement. | medium | **Mostly confirmed** for reach. The data also supports going longer for engagement. Ordinal flags 600–1,500 as weak for engagement, so it is partly contradicted. |
| Hook | Put the full hook within **~140 characters** (the mobile fold), ideally one line of **≤110 characters**. Include a number or a contrarian claim. | Fold ~140/210 (third-party); LinkPost playbook (80% of viral posts hook within 200 characters); P(skip) dwell model (official 2020) | medium | **Confirmed** (under ~140 characters) |
| Hashtags (count) | **1–2**, maximum 3. Zero is fine. | Magicpost (n = 566,957, impressions): 0–2 neutral, 3+ lower, 5 lowest. LinkPost: 1 best, 4–6 −40%. Official: "don't go overboard". | medium | **Contradicted.** Change 3–5 to 1–2 (max 3). |
| Hashtags (placement) | At the end, on their own line, never in the hook | Editorial advice only; no placement study | low | Not covered by the house rule. Add it. |
| Links | For a personal profile: either accept a modest reach cost (~−19% to −36% in the body) or put the link in the **first comment**. Never put a link in the hook. | LinkPost −36%; Ordinal −26.5% (mainly company pages); van der Blom −18.8%; first-comment tests n = 4–6 per arm | medium for "the body costs reach"; low for "first comment fixes it" | n/a |
| Format for a YouTube video promo | **Native upload of a 30–90 second cut** (square or 4:5/vertical within 1:2.4–2.4:1, captioned), with the text matching the video. Full YouTube link in the first comment. A **document carousel** of the whiteboard frames is the alternative and a strong engagement option. Avoid a bare YouTube link post. | Socialinsider: documents highest (7.00%); LinkPost: video and carousel lead and text is lowest; link penalty studies; official note that LinkedIn demotes "videos that don't match the text". Video reach on personal profiles fell 36% YoY (AuthoredUp). | medium (no direct native-versus-YouTube study) | n/a |
| Frequency | **2–5 posts a week** at minimum. Gains continue to 6–10 if quality holds. | Buffer (n = 2M+ posts, 94k accounts, Aug 2025) | medium-high | n/a |
| CTA | A specific question that invites a substantive reply ("What's your X?"). No "comment YES" or "comment to agree" bait, and no pods or automation. Include one soft action (follow, or "link in comments"). | Official March 2026 crackdown on bait and pods; longer posts draw about 3x comments (Shield) | high (avoid bait); low (exact CTA wording) | n/a |
| Comment replies | Reply to every real comment within the first hours. Write the replies by hand. | The comments signal and the anti-automation stance (official); no timing study verified | low-medium | n/a |

---

## Sources (all accessed 20 Oct 2026)

**Official (LinkedIn)**
- https://www.linkedin.com/help/linkedin/answer/a528176 (post 3,000 limit; posting-rate limits)
- https://www.linkedin.com/help/linkedin/answer/a522483 (posts compared with articles; article 125,000)
- https://www.linkedin.com/help/linkedin/answer/a518909 and https://www.linkedin.com/help/linkedin/answer/a523054 (documents)
- https://www.linkedin.com/help/linkedin/answer/a548372 (video limits)
- https://www.linkedin.com/help/linkedin/answer/a1311816 (Page video limits)
- https://www.linkedin.com/help/linkedin/answer/a527270 and https://www.linkedin.com/help/linkedin/answer/a522948 (polls)
- https://www.linkedin.com/help/linkedin/answer/a6244140 (article/newsletter SEO title and description)
- https://www.linkedin.com/help/linkedin/answer/a528144 (hashtag help; returned 404)
- https://news.linkedin.com/2026/ImprovingTheFeed (12 Mar 2026 feed update)
- https://www.linkedin.com/blog/engineering/feed/understanding-feed-dwell-time (12 May 2020)
- https://www.linkedin.com/posts/rishij_i-was-asked-recently-if-you-should-include-activity-7351729382903762944-4v4M (Jobanputra, via press)

**Third-party studies**
- https://buffer.com/resources/how-often-to-post-on-linkedin/
- https://buffer.com/resources/buffer-data/
- https://www.socialinsider.io/social-media-benchmarks/linkedin
- https://www.socialinsider.io/data-geeks/linkedin_benchmarks_2026.pdf
- https://www.socialinsider.io/data-geeks/linkedin_benchmarks_2025.pdf
- https://www.tryordinal.com/blog/linkedin-post-size
- https://www.tryordinal.com/blog/linkedin-link-penalty-study
- https://theshieldindex.beehiiv.com/p/does-linkedin-post-length-actually-matter
- https://www.linkpost.gg/en/blog/analyse-516000-posts-linkedin
- https://magicpost.in/blog/linkedin-hashtag-generator-are-hashtags-still-useful-on-linkedin
- https://metricool.com/hashtags-on-linkedin/
- https://www.agilitypr.com/pr-news/social-media-influencer-marketing/the-linkedin-link-tax-why-sharing-your-blog-is-costing-you-60-percent-of-your-audience/
- https://sproutsocial.com/insights/linkedin-link-in-comments/
- https://agorapulse.com/social-media-lab/linkedin-comments-link
- https://authoredup.com/blog/linkedin-character-limit
- https://authoredup.com/blog/linkedin-video-posts

**Press and secondary**
- https://www.digitalinformationworld.com/2025/07/linkedin-plans-to-remove-hashtag-feed.html
- https://www.socialmediatoday.com/news/linkedins-removing-creator-mode-option/706585/
- https://contentin.io/glossary/character-limit/
- https://linkedgrow.ai/blog/linkedin-hashtag-strategy-guide
- https://taplio.com/blog/taplio-pricing
- https://help.ritekit.com/en/article/ritetag-pro-20-browser-extension-tutorial-1jve5fa/

**Observed (public posts)**
- https://www.linkedin.com/posts/danielpriestley_heres-daniel-priestleys-3-big-ideas-on-activity-7077895009890398208-tKDH
- https://www.linkedin.com/posts/danielpriestley_theres-only-one-thing-people-buy-no-matter-activity-7076943360799731712-zXjx
- https://www.linkedin.com/posts/ssuby_charging-by-the-hour-is-unethical-heres-activity-7000691858423119872-AFXz

## Couldn't verify
- An official LinkedIn statement on whether links are penalised, in either direction. The quote "no intentional penalty" attributed to a LinkedIn director has no traceable source.
- The claim that putting the link in the first comment has been penalised since 2026. No source.
- The exact "see more" fold. LinkedIn has never published it; the ~210/~140 figures are vendor observations and vary by device and app version.
- Official limits for comments, article titles, newsletter names and descriptions, headline and About. These are third-party figures only.
- The maximum number of mentions per post. Sources conflict (30, 40, none).
- A hashtag limit per post. None is published.
- The van der Blom / Just Connecting report's own figures. It is paid, and its edition and sample (1.3M or 1.8M posts) are inconsistent across secondary sources.
- The AuthoredUp length study (372k posts) in its original form.
- The Metricool 2025 "link posts +4.9%" result at source.
- The 9 Aug 2026 comment-ranking change.
- Whether Shield is still operating, and AuthoredUp's current pricing.
- The data source behind RiteTag's LinkedIn suggestions.
- Any rigorous comparison of native video with a YouTube link.
- Current LinkedIn practice of Jeremy Haynes, Riley Brown and Alex Finn (none found); Nick Saraev's posts (profile blocked, HTTP 999).
- Whether the video limit is 10 or 15 minutes from mobile. The two reads of the Help page conflict.

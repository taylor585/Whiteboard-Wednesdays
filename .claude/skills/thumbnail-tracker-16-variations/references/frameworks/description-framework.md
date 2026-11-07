# The description framework

How we write YouTube descriptions, and why each part is there. For Pecuna Factorem, `references/brand/house-style.md` sets the exact layout (the pinned WhatsApp CTA on line 1, a blank line between every bullet, chapter and paragraph) and overrides the defaults below.

## The framework at a glance

**Main finding:** the description doesn't decide the click. The title and thumbnail do. Across 150 videos, hit descriptions looked like everything else that creator posted that year. So descriptions are written to **convert and help**, with light search value, and the creative effort goes on the title and thumbnail.

| Part, in order | What it contains | Why (research or rule) |
|---|---|---|
| 1. CTA line | Pecuna: the pinned WhatsApp CTA, exactly as in the house style | Taylor's rule. Research: own-offer CTAs on line 1 sat on Riley's hits (5.9–9.9×); sponsor-first lines sat on his weakest videos (all four under 0.3× opened with, or reached by line 3, a sponsor CTA). |
| 2. Hook (1–2 lines) | The promise in plain words, the searchable noun from the title, one proof detail | The first ~150 characters show in search and above "…more". |
| 3. Summary paragraph | Why it matters now; what the video walks through | Nick's descriptions carried stale summaries on 9 of 30, so always write a fresh one. |
| 4. What you'll learn | 3–9 bullets with the transcript's real specifics | Riley's recap style. Only claims the video makes. |
| 5. Chapters | From 0:00, ascending, ≥10 seconds apart, at least 3, real timestamps | Nick 16/20 and Riley 18/20 of their top videos have chapters: a viewer aid, not a lever. YouTube's rules are checked by `scripts/package.py`. |
| 6. How we can help | The offer, then the contact link on its own line | Sabri-style closing offer. |
| 7. Links | Website and socials from the user's settings; never invented | Placeholders like `[BOOKING LINK]` are listed by the packager as `NOTE:` lines. |
| 8. Disclosure | For any affiliate, referral or sponsor link | A legal requirement (UK and US). Nick dropped his, so don't copy that. |
| 9. Hashtags | Pecuna: 3–5 (brand rule). Default: 0–3 | All three creators barely use them (Nick 0/20 of his top videos). The 3–5 comes from the brand rule, not the research. |

**Evidence:** `references/research/overview.md` laws 17–20. **Each creator's structure:** `references/research/creators.md`. **Worked example:** `examples/icp-buyer-research/description-final.txt` (as published, in house style).

**Confidence: medium.** We saw public descriptions and views, but no click-through, search-traffic or link-click data.

## Detail

Built from the same videos as `references/frameworks/headline-framework.md` (evidence: `references/research/overview.md`, per-creator structure: `references/research/creators.md`). **Main finding:** the description didn't separate hits from misses on any channel. Each channel's biggest hit had a funnel-style description that ignored search, and one carried a stale summary from another video. So write descriptions to **convert and help**, with light search value, and spend the creative effort on the title and thumbnail.

**Checked against the all-time top 20 per creator (60 videos): the finding holds.** The hits' descriptions look like everything else on the channel from the same year:
- **Chapters:** Nick 16/20 (the 4 without are all from 2024), Riley 18/20 (the two without are 5 and 10 minutes long), Sabri 1/20.
- **Hashtags:** Nick 0/20; Riley 1/20, the one sponsored video. Sabri runs 8–12 on three brainwash exposés and 0 on several other hits, so there's no signal either way.
- **Opening lines change by era, not by result.** Sabri's 2020 breakouts open with the same "Coaches, Consultants… FREE Training" line, and his 2023–25 hits open with a client-results proof line. Three of Riley's hits put a link to his own product on line 1 (5.9–9.9×), so a first-line call to action is fine when it isn't a sponsor.
- **Nick used to disclose.** "Some give me kickbacks" appears on 14 of his 20 older hits but is missing from his newest ones. Keep the disclosure.

## What the three creators do

| | Sabri Suby | Nick Saraev | Riley Brown |
|---|---|---|---|
| Line 1 | A one-line promise with proof ("Today, I investigate 5 of the biggest luxury brands… and reveal EXACTLY how…") | CTA: paid community | Series label or summary ("This is an Agent Native Episode.", "This week in AI: …") |
| Lead magnet | Line 3: free playbook | Line 2: free resources | By line 3: free resources page |
| Chapters | None | 24/30 | 29/30, numbered to match listicle titles |
| Length | ~300 characters | ~2,500 (fixed 1.9K bio) | 500–1,500 |
| Hashtags | 0 | 0 | 7/30, mostly required partner tags |
| Weak spots | No chapters | Stale summaries on 9/30; affiliate links without disclosure | 6/30 with no clickable link |

## The template (default)

In a full Package, write three versions (one per style below) and let the user pick. For Pecuna Factorem, write one version in the house style (`references/brand/house-style.md`), built on the Sabri structure, unless Taylor asks for options. For a description-only request, write one.

**1. The first two lines show in search and above "…more". Make them do two jobs:**
- **Line 1:** the promise in plain words, with the searchable noun from the title and one proof detail (number, result or duration). Max ~150 characters. A standing proof line about the creator's track record (Sabri-style) is a good fallback when the video has no number, but only with real figures from the user.
- **Line 2:** the single most useful link: lead magnet, template or resource. Label it with what they get ("Get the agent template:").

**2. Body (3–5 short lines):** what the viewer will be able to do, using the transcript's real specifics. No keyword stuffing.

**3. Chapters** (whenever the video is over 4 minutes):
- the first chapter is `0:00`;
- at least 3 chapters, each at least 10 seconds;
- timestamps come from the transcript, never guessed;
- names are plain and keyword-rich ("Connecting Claude Code to the Meta Ads API"), not clever;
- for listicle titles, number the chapters to match the count in the title ("#3 …"), as Riley does.

**4. Standing blocks** (from the user's saved settings):
- offer or community;
- socials;
- business link;
- disclosure for any affiliate, referral or sponsor link ("Some links are affiliate links; I may earn a commission."), which is a legal requirement in the UK and US. Nick's referral links had none: don't copy that.

**5. Hashtags:** the user's brand rule comes first (e.g. "3–5 hashtags" in their brief or settings). Without one: optional, at most 3, only if they're real and relevant. The three creators barely use them, so leave them out by default. Include them when a partner requires one.

## Styles

- **Sabri style:** short. A promise-with-proof line, the lead magnet, then socials. No chapters (add them anyway when the video is over 10 minutes; YouTube shows them in search).
- **Nick style:** CTA-first, with the community and free-resources lines on top, then a summary and chapters. Always regenerate the summary for this video.
- **Riley style:** a series label or summary, a bullet recap of the 3–5 biggest moments, a resources link, numbered chapters, and a comment prompt ("Which of the 9 tips are you trying first? Tell me in the comments.").

## House style

For Pecuna Factorem, `references/brand/house-style.md` overrides this template: pinned WhatsApp CTA on line 1, blank lines between every bullet, chapter and paragraph, 3–5 hashtags.

## Checks before delivering

- The summary describes *this* video (Nick shipped stale summaries on 9 of 30).
- Every link is real and comes from the user's settings or message. Never invent a URL; use `[your link]` placeholders.
- Chapters start at 0:00, are ascending, and none is past the video's end.
- No claim appears that the video doesn't make.
- A disclosure is present when any affiliate or sponsor link is.

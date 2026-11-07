# The original study: all of Nick Saraev's thumbnails

This is the first piece of research behind the skill. It came before the cross-creator work in `references/research/overview.md` and `references/research/creators.md`, and it is where the ten elements in `../design/playbook.md` §2 come from. Read it when you need the evidence behind an element, or want to repeat the study on another channel.

## Contents

1. What was done
2. The eras
3. The ten elements, with examples
4. Courses vs everything else
5. What underperformed
6. Caveats
7. How this became the playbook

## 1. What was done

- **When:** 11 October 2026.
- **Channel:** Nick Saraev (@nicksaraev, channel ID UCbo-KbSjJDG6JWQ_MTZ_rNA).
- **Sample:** every upload on the channel at the time: 320 videos.
- **Question asked:** "analyze all of Nick Saraev's YouTube thumbnails ... do a thorough breakdown of how they are done and all of the key elements that make them great".

### Method

1. **List every video.** The channel page's embedded data had video IDs but no titles, so the full list came from yt-dlp (version 2026.08.19) instead:
   ```bash
   yt-dlp --flat-playlist --print "%(id)s\t%(view_count)s\t%(duration)s\t%(title)s" \
     "https://www.youtube.com/@nicksaraev/videos" > all.tsv
   ```
   This gave 320 rows of ID, views, duration in seconds and title, newest first. Flat-playlist view counts are rounded by YouTube (see `../troubleshooting.md`).
2. **Rank by views.** Median views across all 320 were 27,000 (mean 67,763). The top 30 and the bottom 15 were listed to see the extremes.
3. **Download every thumbnail.** The 320×180 `mqdefault.jpg` for each video, from `i.ytimg.com`.
4. **Build contact sheets.** Pillow 12.3.0 laid the thumbnails out in upload order, 24 per sheet in a 4-column grid, each labelled with its position and views. That made 14 sheets.
5. **Look at every thumbnail.** Claude read all 14 sheets by eye, newest to oldest. Eras were set where the visual style visibly changed; nothing was inferred from titles.
6. **Check the biggest hits at full size.** The `maxresdefault.jpg` of the top 8 by views was combined into one sheet to read the fine detail (lettering, arrows, blur, icon style).
7. **Compute the numbers.** A short Python script split the upload list into the eras by position and printed, per era, the count, median views, mean views and the number of videos at 100K views or more. It also compared videos of 2 hours or more against the rest.

### Tools

`curl`, `yt-dlp`, Pillow and Python's `statistics` module. No API key, no login. The same workflow is now built into the skill as Track mode (`scripts/track_channel.py` for the listing, sheets and outlier ratios; `scripts/group_stats.py` for era comparisons).

### Reproduce it

The bundled `data/nick-all-uploads.tsv` lists the same 320 videos in the same order, collected a day later, so views have moved a little. To redo the era table on it:

```bash
printf '1-72\tclean-3d\n73-144\tmoney-guests\n145-188\tdark-green\n189-220\tminimal\n221-240\tyellow-transition\n241-302\tmake-template\n303-320\tearly\n' > tags.tsv
python3 <skill-dir>/scripts/group_stats.py <skill-dir>/references/research/data/nick-all-uploads.tsv tags.tsv
```

## 2. The eras

Positions count from the newest upload (1) to the oldest (320).

| Era (newest first) | Positions | Videos | Median views | Mean views | 100K+ hits |
|---|---|---|---|---|---|
| Clean light/cream backgrounds, glossy 3D app tiles, sentence-case lines with a full stop | 1–72 | 72 | 66.5K | 151,009 | 28 |
| Money + guests ("$20K/Mo" pills, side-by-side guest) | 73–144 | 72 | 22K | 60,759 | 9 |
| Dark green, moody lighting | 145–188 | 44 | 33.5K | 66,420 | 6 |
| Minimal: face centred, green top bar, small white caption | 189–220 | 32 | 27.5K | 37,640 | 2 |
| Bold yellow transition (mixed styles) | 221–240 | 20 | 15K | 22,060 | 0 |
| Make.com template: starry background, white cut-out outline, ALL-CAPS two-tone text | 241–302 | 62 | 15K | 25,079 | 2 |
| Early: raw screenshots, no design | 303–320 | 18 | 5.7K | 17,433 | 0 |

What the table shows:

- The current era is far ahead: the highest median (66.5K) and 28 of the channel's 100K+ videos.
- The order is not a clean staircase. The dark green era (33.5K) beat the money-and-guests era that followed it (22K).
- The two weakest designed eras are the bold yellow transition and the Make.com template, both at a 15K median.
- The early, undesigned thumbnails are the weakest of all (5.7K).

## 3. The ten elements, with examples

These are the elements found by looking at the thumbnails, in the order they were written up. Examples are quoted as they appear on the thumbnails.

### 1. One idea, at most 4–5 words, that adds to the title

| Title | Thumbnail line | Views |
|---|---|---|
| "What I'd Learn Instead of Automation in 2026" | "AUTOMATION: THE UGLY TRUTH" | 567K |
| "…AI Automation in 2027" | "A Reset is Coming.." over a curve on a chart | 282K |
| "Clawdbot Sucks, Actually" | "it's mostly hype." | 196K |

The working rule at the time: the title gives the facts and the thumbnail gives the emotion or the verdict.

### 2. A short line ending in a full stop

- His current signature is heavy sans-serif text in sentence case, ending with a full stop.
- Examples: "not even close." / "Fable is back. Use it wisely." / "It's too good." / "Total victory."
- The full stop makes the line read as a confident verdict.
- He moved away from the shouting ALL-CAPS style of the Make.com era, which had the weakest designed results.

### 3. His face takes about a third of the frame, usually on the right

- Tight crop, eyes near the top third, looking into the lens.
- A small set of poses, reused:
  - **hand on chin** (sceptical, thinking), his most-used pose by far;
  - **finger to lips** ("secret");
  - **big warm smile** on course videos.
- The wide-eyed, hands-on-cheeks shock faces of 2023–24 were dropped. Calm and credible now beats loud.

### 4. Logos are the main characters

- Products appear as big, glossy, 3D-looking app icons.
- The story is often told as a small equation: "Claude + /btw", "Antigravity + 3.1", "Skills + AutoImprove".
- Rivals get a **red X** through them.
- A recurring villain: a **crying red crab** (OpenClaw), used like a meme character.
- Viewers in this niche spot those logos instantly in the feed.

### 5. Visible proof

- Stripe "you received a payment" alerts, payment tables showing "Succeeded", revenue charts, GitHub star counts, benchmark bars (93.9% vs 80.8%) and subscriber counts.
- Oddly exact numbers ($20,354, $12,937.00, $27,350/m) feel real rather than made up.
- Some details are blurred or pixelated on purpose, which adds believability and curiosity at once: "No one is doing this" next to a pixelated logo.

### 6. Course thumbnails show the syllabus

- The actual curriculum is on the thumbnail: a numbered list on a whiteboard, a chalkboard flow, or a terminal printing a course outline.
- It signals "this is packed with value" at a glance.
- See section 4 for the numbers.

### 7. Visual language his audience already knows

- Slash commands as headlines: /mobile, /routines, /hacked, /free, /skills.
- Terminal windows, GitHub repo headers, tweet cards, and comments styled like YouTube comments.
- It looks like the tools his viewers use, so it reads as "for me".

### 8. Simple layout and few colours

- Text top-left, face on the right, the object in the middle or at the bottom.
- A **hand-drawn arrow** ties the text to the object; important words get a hand-drawn underline.
- One accent colour per thumbnail: Claude orange, purple or gold.
- Recent backgrounds are often white or cream, which stands out from the dark thumbnails most AI channels use.
- Everything still reads at phone size.

### 9. Hand-lettered marker text for opinion pieces

- "THE UGLY TRUTH", "DO THIS INSTEAD", "GET ANY CLIENT.", "NO PROOF? NO PROBLEM."
- The personal, handwritten look signals a frank take rather than a tutorial.

### 10. He drops a style once it goes stale

- The 62 near-identical Make.com thumbnails blurred together (median 15K).
- Each new style replaced one that had stopped working.
- A brand look helps, but a fixed template makes viewers assume they've already seen the video.

### Not confirmed

Many recent icons, chalkboards and 3D scenes look AI-generated or composited. That was a guess from looking at them and was never confirmed.

## 4. Courses vs everything else

| Group | Videos | Median views |
|---|---|---|
| 2 hours or longer | 19 | 172K |
| Under 2 hours | 301 | 25K |

- His three biggest videos are all full courses:
  - "CLAUDE CODE FULL COURSE 4 HOURS: Build & Sell (2026)": 2.6M;
  - "N8N FULL COURSE 6 HOURS (Build & Sell AI Automations + Agents)": 1.3M;
  - "AI Agents Full Course 2026: Master Agentic AI (2 Hours)": 893K.
- Other courses in the top 30 by views include "CLAUDE CODE ADVANCED FULL COURSE (3 HOURS)" (513K), "VIBE CODING FULL COURSE: Gemini 3.1 + Antigravity (6 Hrs)" (378K) and "CLAUDE CODE MARKETING FULL COURSE (6 HOURS)" (172K).
- Long courses behave like a different product, so a course's views say more about the format than about its thumbnail. The later cross-creator work found the same: Nick's 19 uploads of 2 hours or more have a median outlier ratio of 3.55 (`references/research/overview.md` §1, Confounds).

## 5. What underperformed

- **Hiring and agency-management topics** (1–4K views), whatever the design. The bottom of the channel is full of them: "7-Figure Agency Hiring Playbook ($2.4M Earned)" (1,100), "Don't Hire Anyone Until You Watch This Video" (2,000), "How I Built A 15+ Person Agency With No Management Skills" (2,100), "4 Terrible Mistakes to Avoid When Delegating Your Automation Agency" (2,300), "How to Hire Devs For Your Automation Agency" (3,700).
- **Screenshot-only thumbnails** with no face or framing (the early era, 5.7K median).
- **Generic text with no real object**: "DON'T DO THIS", "$10K?".
- **Two or more competing ideas** in one frame.
- **A template repeated across dozens of videos** (the Make.com era).

## 6. Caveats

- **Channel growth.** The channel grew over the same period the design improved. Newer eras sit on a bigger audience, so raw medians flatter them.
- **Topic heat.** Topics shifted towards Claude Code at the same time, and that topic was hot. Some of the current era's lift belongs to the topic, not the thumbnail.
- So the study shows his thumbnails improving. It does not prove the design alone caused the views.
- **Raw views, not outlier ratios.** This first pass compared raw view counts. Outlier ratios (views ÷ the median of the 10 uploads either side) are the fairer comparison and were added to the skill afterwards (`track_channel.py`, `method.md`).
- **Eras tagged by eye.** One person's reading of the contact sheets set the boundaries, and an era can hold a few off-style thumbnails.
- **Rounded views.** yt-dlp's flat listing rounds view counts to about two significant figures.
- **One channel.** Everything here is Nick's style in one niche (AI, automation, business education).

## 7. How this became the playbook

1. **Write-up.** The breakdown was delivered to the user on 11 October 2026 with a seven-step recipe: a 2–5 word verdict the title doesn't already say, ending in a full stop; one face pose; one hero object; an arrow or underline; one accent colour on a clean background; one blurred detail; a check that it reads at 160px wide.
2. **Skill.** The user asked for a skill built on it. The eras table and the ten elements became `references/design/playbook.md` §1 and §2. The archetypes in §3 (verdict, equation, command, proof, syllabus, marker, versus, social, trend, repo) are the layouts seen in the audit, built as renderer templates in `scripts/render.cjs`. The underperformers became §5, and the recipe became the §6 checklist.
3. **Cross-creator check.** The later research on Nick, Sabri Suby and Riley Brown (latest 30 each, then the all-time top 20 each; see `method.md`) tested the elements on outlier ratios and changed two of them:
   - **Element 1** became "always have a line". Thumbnails with no line were the weakest group on all three channels (pooled median 0.47×). "Add, don't repeat" held strongly on Sabri's channel only (1.49× vs 0.62×). On Nick's own latest 30 it reversed (0.815× vs 1.04×), and on Riley's it was flat. It is now a preference, not a rule.
   - **Proof (element 5)** was backed on Sabri's channel: thumbnails with a handwritten proof label scored 2.79× vs 0.69× without. Nick's all-time proof-screen hits ("Succeeded" payments table at 10.7×, repo stars at 9.2×) confirmed it on his channel.
4. **New layouts** from the other creators (caption bar, before/after split, quote card) and the object-only `scene` layout were added to §3 later. They did not come from this audit.

The playbook's opening line, "Distilled from a full audit of all 320 thumbnails on Nick Saraev's channel", refers to this study.

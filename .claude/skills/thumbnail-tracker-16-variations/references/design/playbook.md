# Thumbnail Playbook

**How it fits:**
- This is the design standard: the ten elements, layouts, copy rules, what flopped and the checklist.
- The step-by-step method that uses it is `references/frameworks/thumbnail-framework.md`.
- The full original study behind §1–2 is `references/research/nick-thumbnail-audit.md`.
- Rendered examples of every layout are in `references/design/layouts.md`.
- **For Pecuna Factorem with no phone photo (the default), the look is fixed by `references/design/objects-only-standard.md` (2 Nov 2026): lit, extruded 3D type and objects built with `scripts/hero/`. The ten elements below still apply; the standard says how they're drawn.**

Distilled from a full audit of all 320 thumbnails on Nick Saraev's channel (@nicksaraev, Oct 2026), cross-checked against view counts. Use it as the default standard for judging and creating thumbnails in the AI / automation / business-education niche. When you track a different channel, compare it against this and note where that creator deviates.

## Contents
1. What the data said
2. The ten elements
3. Archetypes (which layout for which video)
4. Copy rules for the thumbnail line
5. What underperformed
6. The pre-publish checklist
7. Cross-creator research summary (latest 30) and 7b (all-time top 20); full evidence in `references/research/overview.md`

## 1. What the data said

| Era (newest first) | Videos | Median views | 100K+ hits |
|---|---|---|---|
| Clean light/cream backgrounds, glossy 3D app tiles, sentence-case lines with a full stop | 72 | 66.5K | 28 |
| Money + guests ("$20K/Mo" pills, side-by-side guest) | 72 | 22K | 9 |
| Dark green, moody lighting | 44 | 33.5K | 6 |
| Minimal: face centred, green top bar, small white caption | 32 | 27.5K | 2 |
| Bold yellow transition | 20 | 15K | 0 |
| Make.com template: starry bg, white cut-out outline, ALL-CAPS 2-tone text | 62 | 15K | 2 |
| Early: raw screenshots | 18 | 5.7K | 0 |

- Full courses (2h+) had a median of 172K vs 25K for everything else. All three biggest videos (2.6M, 1.3M, 893K) are courses.
- Caveat: channel growth and topic heat (Claude Code) rose at the same time, so this shows his design improving; it does not prove the design alone caused the views. Outlier ratios (views vs neighbouring uploads) are the fairer comparison.

## 2. The ten elements

1. **Always have a line: one idea, 2–5 words, ideally adding a verdict or proof.**
   - Thumbnails with no line were the weakest group on all three researched channels (pooled median 0.47×, 8 of 10 under 0.7×; see §7).
   - Prefer a line that adds what the title doesn't: title "What I'd Learn Instead of Automation in 2026" → thumbnail "AUTOMATION: THE UGLY TRUTH" (567K).
   - Repeating the title's topic isn't fatal, though. It did fine on Nick's and Riley's channels and badly only on Sabri's. So "add, don't repeat" is a preference, not a rule.
2. **Sentence-case verdict with a full stop.** Heavy grotesk, tight tracking: "not even close." / "It's too good." / "Total victory." The full stop reads as certainty. Shouty ALL-CAPS templates were his weakest designed era.
3. **Face takes about a third of the frame, usually on the right.** Tight crop, eyes on the upper third, looking into the lens. A few poses, reused: hand on chin (skeptical/thinking, the most common), finger to lips (secret), warm smile (courses, wins). Wide-eyed shock faces were dropped.
4. **Logos are the main characters.** Products appear as big glossy 3D app tiles. The story is told as an equation (A + B) or a fight (rival crossed out with a red X). A recurring mascot or villain (his crying red crab) gives a meme-able character.
5. **Visible proof.** Stripe notifications, payment tables with "Succeeded", revenue charts, GitHub stars, benchmark bars (93.9% vs 80.8%). Oddly exact numbers ($20,354, $12,937.00) feel real. Blurring one detail adds believability and curiosity.
6. **Course thumbnails show the syllabus.** Whiteboard with a numbered list and a system doodle, or a terminal printing a course outline. It signals value density at a glance.
7. **Native audience language.** Slash commands as headlines (/mobile, /routines, /free), terminal windows, repo headers, tweet cards, comment cards. It looks like the tools the viewer uses.
8. **Simple layout and few colours.** Text top or top-left, face right, hero object in the centre or bottom. One hand-drawn arrow ties text to object; one hand-drawn underline marks the key word. One accent colour. Light/cream backgrounds stood out for Nick in a niche where many thumbnails are dark (Riley: dark on 17 of his top 20). Pick the opposite of the feed you compete in (`references/design/scene-design.md` §4).
9. **Hand-lettered marker text for opinion pieces.** "THE UGLY TRUTH", "DO THIS INSTEAD", "NO PROOF? NO PROBLEM." Personal, frank, not a tutorial.
10. **Retire a style before it goes stale.** 62 near-identical template thumbnails blurred together (median 15K). Keep a recognisable brand, not a fixed template.

## 3. Archetypes

| Archetype | Use for | Example line | Renderer key |
|---|---|---|---|
| Verdict | News, launches, comparisons, takes | "Meta should be worried." + hero tile, rival crossed out | `verdict` |
| Equation | Tool stacks, integrations, "X + Y does Z" | "Save 2x tokens." + [Claude] + [/btw] | `equation` |
| Command | A single feature, skill, command or prompt | macOS window "/routines" + face + arrow | `command` |
| Proof | Money, results, case studies, benchmarks | "just copy this." + Stripe notifications | `proof` |
| Syllabus | Full courses, long guides, frameworks | Whiteboard "FULL CLAUDE CODE COURSE" 1–6 | `syllabus` (`board: whiteboard|terminal`) |
| Marker | Opinion, warnings, "truth" videos | "AUTOMATION: THE UGLY TRUTH." | `marker` |
| Versus | Student/client results, interviews, case studies | guest + you, "$20K/Mo" pill, "university student" label | `versus` |
| Social | Hot takes, myths, answering a question | tweet card "Cold Calls ARE DEAD?" | `social` |
| Trend | Predictions, "what's next", career/market shifts | curve "A Reset is Coming.." + You are here | `trend` |
| Repo | Testing a tool, repo, app or launch | "github/reverse-engineer" + stars, face looking up | `repo` |
| Caption bar | Authority lessons, contrarian advice, "learn X fast" (Sabri, n=7, median 3.77×) | Face centred on dark; "DON'T RUN VIDEO ADS" in condensed white caps across the bottom with one red-boxed word; handwritten proof label ("$300m in ad spend") | `caption` |
| Before/after split | Transformations, beginner→expert, cheap vs premium (Sabri, n=4, all ≥1.43×) | Face centred between two states of one object, one big label per side (DAY 7 / DAY 30) | `split` |
| Quote card | A real customer or buyer quote is the hook | Pinned quote card, one phrase in red, face in a circle | `quote` |
| Scene (no photo) | No presenter photo; the idea can be acted out by one object | "Read their mind." + a report page and a glowing magnifying glass on the real quote | `scene` (see `references/design/scene-design.md`) |

Pick the archetype from the promise of the video, not its format. If two fit, render both and compare in the feed preview.

## 4. Copy rules for the thumbnail line

- 2–5 words. Over 6 means two ideas; cut one.
- Pick one angle: verdict ("not even close."), warning ("Don't fall for this."), secret ("No one is doing this."), proof ("just copy this."), promise ("Fire your media buyer."), or curiosity ("It watches everything.").
- End statements with a full stop. Questions only when the question itself is the hook ("$5K retainers?").
- Mark one word: underline, accent box, or strike-through. Never more than one mark.
- Numbers: specific beats round ($12,937 > $13K) unless round is the point ($1M).
- Write 3–5 options per video, then choose the one that adds the most the title doesn't say.

## 5. What underperformed

- Internal/ops topics (hiring, delegation, agency management): 1–4K views, regardless of design.
- Screenshot-only thumbnails with no face or framing.
- Generic text with no object ("DON'T DO THIS", "$10K?").
- Two or more competing ideas in one frame.
- A template applied to dozens of videos in a row.

## 6. Pre-publish checklist

- [ ] Reads at 168px wide (phone feed). If the line is unreadable, cut words, not font size.
- [ ] One idea, one accent colour, one mark, one arrow.
- [ ] There is a thumbnail line, and it adds something the title doesn't where possible.
- [ ] Face (if used) has eye contact and a pose that matches the emotion.
- [ ] Hero object is recognisable in under a second (logo, money, chart, list).
- [ ] The brightest point in the frame is the hero. On dark grounds, light the hero and dim the evidence (`references/design/scene-design.md` §2).
- [ ] Nothing important in the bottom-right 15% (YouTube's timestamp covers it).
- [ ] Looks different from your last 5 uploads in the feed preview.
- [ ] Proof shown is real. Blur private details; never invent revenue or results.

## 7. Cross-creator research (Sabri Suby, Nick Saraev, Riley Brown, Oct 2026)

Thumbnail-relevant summary. The full method, every law with its evidence, and the per-creator detail are in `references/research/overview.md` and `references/research/creators.md`. Look at `assets/research/top-hits-<creator>.jpg` to see the winners.

90 videos, the latest 30 long-form uploads per creator, scored by outlier ratio. Full write-up: `references/research/overview.md` (and the private research report page, https://claude.ai/artifact/GaBELL2tYrUjQ4cf5eJxph). Titles and descriptions have their own files: `references/frameworks/headline-framework.md` and `references/frameworks/description-framework.md`.

- **Always have a line.** No-line thumbnails: Sabri 0.45×, Nick 0.54×, Riley 0.31× (pooled n=10, 0.47×).
- **Products are the characters on all three channels.** Glossy logos, product mascots (Riley's GrokBot "mascot arena", n=3, 1.12×) and held products. It's a style constant, not a performance driver.
- **House layouts give recognition, not lift.** Riley's "desk anchor" (centred at a desk, two flanking logos, n=10, median 1.25×) appears on hits and misses alike. A recognisable layout is fine; the line and the topic still decide the result. On it, a verdict line ("IT'S OVER.") worked, while a topic-repeat line ("THE NEW GROKBOT") didn't.
- **Proof labels help on Sabri's channel.** Thumbnails with a handwritten proof label: 2.79× vs 0.69× without. It's one channel, but it's consistent with §2 element 5.
- **Confidence:** medium for "always have a line"; medium-low for the new layouts (one channel each, overlapping with title formula and video age).

### 7b. What the all-time top 20 per creator add (60 videos)

- **"Always have a line" still holds for today, with one caveat.** 4 of Nick's 20 hits carry no text, just tool logos or screens, but 3 of the 4 are from before 2025. 19 of Riley's 20 show a face with a median of 4 words. All 8 of Sabri's organic top-view thumbnails carry 5 words or fewer. Keep the line; logo-only is an older style.
- **The line adds to the title; it doesn't repeat it.** Sabri's hits: "The trick", "DON'T ASK. MAKE THEM BUY.", "$100 MILLION". His 2020 breakouts repeated the title in 4–10 words, but their ratios are inflated by a tiny channel.
- **Proof screens drive Nick's test and stunt hits.** A short lowercase line and a hand-drawn arrow point at a screen showing the result: a "Succeeded" payments table at 10.7×, "You Are Hired!" at 6.05×, repo stars at 9.2×. Use the `proof` and `repo` layouts with real screens.
- **Sabri's staged "secret" scene was his biggest layout.** It shows a finger-to-lips pose in front of a brand's storefront with 0–3 words. All 4 brainwash hits use it (median 9.04×). The recent misses came from the tired topic, not the layout.
- **Riley's winners show two faces or a solo face on the right** (duo median 9.9×, n=5; solo-right 9.2×, n=9). His 2025 run used a lowercase line with one orange-pill word ("the last tutorial you'll ever need"). His current desk anchor and dashboard spread are the lowest two of his top 20 (2.8× and 2.6×). Low confidence, since we only saw the winners.
- **Fake-post cards work.** Sabri's 15.5× hit is an X/Twitter-style post card with a yellow highlight bar: the `social` layout. Use the user's own account or an obviously made-up one.
- **Confidence:** medium. Each pattern comes from one creator's winners, and is mixed up with the topic and the year it came out.

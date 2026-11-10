# The Twitter engine

Section 1 of every pick sheet. We build videos on the back of a giant: take what the biggest names in AI and paid media have said recently and turn it into a video for business owners, with our own work as the proof.

## The framework: each giant's last 10 posts

For every giant in `references/giants.json` (**8 AI and 8 paid media**), study their **last 10 posts**: the 10 most recent we can find. That gives about **160 posts** a run.
- **Month run:** whittle the 160 down to the **best 30** and give one video per day for 30 days.
- **Sunday run:** take the best 7 of the fresh ones for next week, combined with the other two engines.

The bench in `giants.json` is not scanned. Swap people between the bench and the 16 when someone goes quiet.

## Framework 1: the scan (16 giants × last 10 posts = about 160 posts)

1. **Who:** the 16 giants in `giants.json`, 8 AI and 8 paid media. The bench is not scanned.
2. **What:** each giant's **last 10 posts**, the 10 most recent that web search can find. Count replies only when they say something.
3. **How:** 4 agents run at once, 4 giants each, with the prompt in `agent-prompts.md` § Twitter engine.
   - They use web search only: `site:x.com <handle> status`, "<name> X post", "<name> tweet <month> <year>", and news quoting their posts.
   - For thin giants, they top up from their blog, podcast, YouTube or LinkedIn, labelled by source. Tier 11 comes through Perpetual Traffic.
4. **Record:** one JSON line per post: giant, URL, source, text, quote or paraphrase, engagement (only if shown), and a 3 to 6 word topic.
5. **Date:** `x_posts.py build` dates every post from its X ID and keeps the 10 newest per giant. It marks each post FRESH (7 days), RECENT (8 to 30) or OLD, and names any giant with nothing found.
6. **Save:** `posts.md` goes to `video-plans/` so Taylor can read all 160.

## Framework 2: choosing the best 30 (160 posts → 30 videos)

Every post goes through the same five gates, in order. Expect roughly:
- 160 posts in;
- about 80 left after gate 1;
- about 50 after gate 2;
- about 35 to 40 threads after gate 3;
- 30 after gate 5.

**Gate 1: drop the noise.** Throw out:
- jokes, memes and one-word posts (unless the word is a launch teaser that later became news);
- replies that only say thanks, "looking into it" or "fixed";
- personal posts (sport, films, family, travel);
- job moves, rows and gossip;
- event and course adverts with no idea in them.

**Gate 2: keep only what a business owner can use.** A post stays if it gives at least one of these:
- a **launch** (a new model, feature or price);
- a **method** (how they do something);
- a **prompt** they share;
- a **number or result** ("$60K/month team into one person", "96% of spend went to other ads");
- a **warning** (a bug, a risk, a mistake to stop making);
- a **platform change** (Meta, Google, OpenAI or Anthropic changing how something works).

**Gate 3: merge into threads.** Posts on the same thing become one topic, listing every giant on it. Spread is the strongest signal:
- 4 or more giants on one thread is a top pick (Fable 5.2: Mollick, Albert, Riley Brown, Cherny);
- 2 or 3 is strong ("don't pause your best ads": Hott, Moran, Burns).

**Gate 4: make it ours.** Each thread needs a video a business owner would click and our version of it. "Here's what Karpathy said" is not a video; "Karpathy built X in 2 hours, here's the business version" is. Drop a thread if we can't say what the viewer gets.

**Gate 5: score with Part T, then pick 30 using these rules:**

| Factor | Weight | 5 means |
|---|---|---|
| Spread | ×3 | 4 or more giants on it |
| Fresh | ×2 | posted in the last 3 days |
| Fit | ×2 | a business owner can use it this week |
| Our proof | ×1 | we have work that shows it |
| Promise | ×1 | a clear "you will be able to..." |
| Open lane | ×1 | none of our YouTube creators has covered it |

- **Worthy:** 30/50 or more. Below 30, it doesn't go in the table. If fewer than 30 pass, show the ones that pass and say how many days are empty. Never pad.
- **The mix:** at least 10 paid-media videos in 30, and no giant leads more than 3.
- **No repeats:** no two titles open with the same two words, and no two videos on the same thread.
- **Ties:** fresher wins, then the one with our proof, then the one that shows a number.

**Then order the 30 days:**
1. Anything that expires goes first: launches in the last 7 days, dated platform changes, Black Friday and other seasonal dates.
2. Evergreen methods, prompts and AI-team stories fill the later days.
3. Alternate AI and paid media where you can.
4. Start the day after the run.

`plan_sheet.py` blocks a month plan that breaks the mechanical rules: fewer than 30 videos, a score under 30, fewer than 10 paid media, a giant leading more than 3, a missing link, or a repeated opening.

**How we read X without logging in:**
- Web search only. Search engines save public X posts, and news sites quote the big ones.
- Never open x.com pages directly, and never use mirrors, scrapers or syndication endpoints. X walls them behind a login, and the session's safety check rightly refuses them.

**What that means:**
- We see posts that search engines saved or that someone wrote about. These tend to be the bigger posts, so treat it as a sample, not the full feed.
- Search results carry no like or view counts, except where an article quotes them. Rows score on **spread** (how many giants are saying it), not engagement.
- Search snippets can cut words off. Before Taylor quotes a giant on camera, he opens the post and reads the exact words.
- `x_coverage` in giants.json records how well search finds each giant:
  - **good**: 10 posts are usually findable, as with most of the AI giants.
  - **thin**: few X posts are indexed, as with most of the paid-media giants. For these, top up from `also_read` and their blog, podcast, YouTube or LinkedIn, and label the source.

## Steps (runs alongside the other two engines)

1. **Start the agents.** Send 4 research agents in one message, 4 giants each (2 AI and 2 paid-media agents). Each one:
   - gets the prompt in `references/agent-prompts.md` § Twitter engine;
   - writes `<scratchpad>/x/batchN.json`.
2. **Build the table:**
   ```bash
   python3 <skill-dir>/scripts/x_posts.py build <scratchpad>/x/batch*.json --giants <skill-dir>/references/giants.json --out <scratchpad>/x
   ```
   This does the following:
   - dates every post from its X status ID (the ID holds the posting time, so it beats search-result labels);
   - drops duplicates and keeps the 10 newest per giant;
   - marks each post FRESH (last 7 days), RECENT (8 to 30) or OLD;
   - lists any giant with nothing found.
3. **Read `posts.md`.** For each giant, ask:
   - What did they launch, test, claim or argue?
   - Did they share a number, a prompt, a method or a result a business owner could copy?
   - Which posts are FRESH?
4. **Find the threads.** Group the posts into themes:
   - The same launch or idea posted by 2 or more giants in the same fortnight is the strongest signal.
   - Big AI launches (a new model, a pricing change) are timely and expire within days.
   - Paid-media threads are usually platform changes (Meta delivery, measurement, new ad terms) or creative testing methods.
5. **Make it ours** (`references/research-to-topics.md`):
   - Every row needs our version: our work as the proof, run on a business owner's problem.
   - "Here's what Karpathy said" is not a video. "Karpathy built X in 2 hours, here's the business version" is.
6. **Score with Part T** (`references/scoring.md`) and rank. Write at least 6 rows when that many pass.
7. **Write each giant's study** when Taylor asks for one ("study Karpathy's last 10"). Use the format in `examples/twitter-study-karpathy.md`: the 10 posts, then what's useful, then the videos we could build.

## Row format

| # | Topic (best title) | The giant(s) | Best evidence | Our version | Score |
|---|---|---|---|---|---|
| T1 | [title] | [names] | [giant, date: "quote", x.com URL] | [our twist] | **n/50** |

**Rules for the evidence column:**
- It must carry a link: the x.com post or the giant's own page.
- Mark paraphrases as paraphrases.
- Say "not shown" for engagement unless a source showed it.

## Title patterns that ride a giant

- "[Giant] Built [thing] in [time]. Here's the Business Version."
- "The Man Who Built [tool] Says [surprising advice]"
- "[New model] Just [did impressive thing]. So I Gave It My Business."
- "[Big claim from giant]. I Tested It."
- "[N]% of People [stat the giant gave]. Here's What the Top [n]% Do."

Name the giant in the title only when they are widely known to business owners, or are the news. Otherwise use what they built or said.

## Keeping the list fresh

- Taylor swaps giants in or out in `giants.json`.
- After each run:
  - update `x_coverage` from what was found;
  - flag giants with nothing found in 30 days as swap candidates on the sheet;
  - correct handles the agents verified.
- Never commit post text: `giants.json` holds names, handles and coverage only.

## The month run, step by step (the exact framework)

1. **Scan** with Framework 1. Each agent writes `<scratchpad>/x/batchN.json`.
2. **Table.** Run `x_posts.py build ... --out <scratchpad>/x`. That gives about 160 posts, dated from their IDs, 10 per giant. Save `posts.md` to `video-plans/`.
3. **Whittle** with Framework 2: the five gates, the worthy line (30/50), the mix rules and the ordering.
4. **Order:** things that expire first, evergreen later, alternating AI and ads, starting the day after the run.
5. **Plan file.** Write `<scratchpad>/plan-month.json` in the format at the top of `scripts/plan_sheet.py`:
   - one topic per day: title, giants, evidence (quote or marked paraphrase), URL, our version, score and score parts;
   - the My work and YouTube rows;
   - "whittled" lines and "notes".
6. **Render and check:**
   ```bash
   python3 <skill-dir>/scripts/plan_sheet.py <scratchpad>/plan-month.json --out "video-plans/30 videos - <first day> to <last day>.md" --scrub <scratchpad>/scrub.txt
   ```
   Fix the plan and re-render until it passes. Copy the plan file into `video-plans/` next to the sheet.
7. **Deliver.** Send the sheet and `posts.md` with SendUserFile, and paste the one-line table of 30 into the chat.

**The Sunday run** follows the same steps with `"kind": "week"` and 7 days, Monday to Sunday:
- Booked and locked titles go in as `{"day", "title", "from": "locked"}`.
- The rest come from the freshest Twitter threads and the best My work and YouTube rows.

**Title rules for the 30:**
- Every title promises the viewer something.
- Name a giant only when they are the news, or when business owners know them.
- No two titles open with the same words.

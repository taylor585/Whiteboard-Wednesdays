# The Twitter engine

Section 1 of every pick sheet. We build videos on the back of a giant: take what the biggest names in AI and paid media have said recently and turn it into a video for business owners, with our own work as the proof.

## The framework: each giant's last 10 posts

For every giant in `references/giants.json` (15 AI, 15 paid media), study their **last 10 posts**: the 10 most recent we can find.

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

1. **Start the agents.** Send 5 research agents in one message, about 6 giants each (3 AI, 2 paid media). Each one:
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

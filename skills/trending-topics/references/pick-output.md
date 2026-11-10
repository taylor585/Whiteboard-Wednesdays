# The pick sheet

Pick mode, and every Sunday run, ends with this sheet. Then stop for Taylor's swaps.
- Save it to `video-plans/Picks - week NN.md` in the working directory. Taylor opens files there, not in the scratchpad.
- Run `scripts/check_picks.py` on it, and fix anything until it passes.
- Send it with SendUserFile, along with the giants' post table (`video-plans/Twitter engine - last 10 posts (<date>).md`).
- Show the 7-day plan and the three engine tables in the chat as well.

The sheet has a **7-day plan** and **three engines, never mixed**, with these exact headings:
- **This week: 7 videos.** One row per day, Monday to Sunday. Each row names its engine row (T1, A2, C3) or "locked".
- **1. Twitter engine.** What the giants said in their last 10 posts, made ours (`references/twitter-engine.md`).
- **2. My work engine.** Everything we built in the last 30 days.
- **3. YouTube engine.** What our creators have already proven.

Taylor swaps any day for another row, or locks a title of their own.

## The plan table (week and month)

Rendered by `scripts/plan_sheet.py`, never by hand. Each video is one line:

| # | Day | Video | Giant | Lane | Score |
|---|---|---|---|---|---|
| T1 | Thu 12 Nov | Fable 5.2 Just Launched a Business. So I Gave It Mine. | Ethan Mollick +3 | AI | 44 |
| locked | Fri 13 Nov | [a locked or booked title] | - | booked | - |

- **Giant:** the lead giant, plus how many others posted the same thread.
- **Lane:** AI or Ads.
- **Score:** Part T, out of 50.
- **Mix line** underneath: how many AI, paid media and locked.
- Quotes and links stay out of this table and go in the Twitter engine table below it, so every row reads on one line on a phone.
- **Month run:** `## This month: 30 videos`, 30 rows. **Sunday run:** `## This week: 7 videos`, 7 rows.

## Filling the 7 days

1. Booked recordings and locked titles with a date take their days first.
2. The freshest Twitter rows (a launch from the last 3 days) go earliest in the week, before the moment passes.
3. Spread the subjects: no two ads videos in a row, and no two videos on the same giant.
4. Wednesday is the whiteboard video when one is booked.
5. Under the table: **Why this order** (one line), and **Ready as swaps** (3 to 5 rows).

## Template

```markdown
# Trending Topics: picks for week [YYYY-Www]

**Locked in:** [every locked title from the topic register, word for word, or "none"]

**Giants researched:** [n] of [n] giants, last 10 posts each found by web search ([n] posts). Nothing found: [names, or "nobody"]. Run [date].
**Our work researched:** [n] Claude Code sessions (every one updated [start] to [end], [n] read in depth by [n] parallel agents), [n] GitHub repos pushed in the window, [n] skills updated. Not readable: [list, or "nothing"].
**Creators researched:** [n] of [n] core channels, [n] core winners (1.4× or more), [n] in-window uploads. Scan [date].
**Left out as already done:** [titles from `topics.py recent`, or "none"]

## Locked: [title]
[For each locked title: what we have for it from both lanes, its status on the claim ladder, and "Before you record" tasks.]

## This week: 7 videos

| Day | Video | From |
|---|---|---|
| Mon [d] | [title] | [T1 / A2 / C3 / locked] |
| ... seven rows, Mon to Sun ... | | |

**Why this order:** [one line]
**Ready as swaps:** [3 to 5 rows]

## 1. Twitter engine

| # | Topic (best title) | The giant(s) | Best evidence | Our version | Score |
|---|---|---|---|---|---|
| T1 | [title] | [names] | [giant, date: "quote", x.com URL] | [our twist] | [n]/50 |

## 2. My work engine

| # | Topic (best title) | What we built | Status | Wow | Proof on screen | Score |
|---|---|---|---|---|---|---|
| A1 | [title] | [one line] | [live/working/rehearsed/half-built] | [why it blows people away] | [the number or demo] | [n]/50 |

## 3. YouTube engine

| # | Topic (best title) | What the creators proved | Best evidence | Our version | Score |
|---|---|---|---|---|---|
| C1 | [title] | [promise + format] | [creator, video, ratio, URL] | [our twist] | [n]/50 |

## Details: Twitter engine

### T1. [title]
- **The giants:** [each post: who, date, quote or marked paraphrase, URL, engagement if shown]
- **Hook:** "[one line]"
- **Our version and proof:** [our work that shows it]
- **Score:** spread [n]×3 · fresh [n]×2 · fit [n]×2 · proof [n] · promise [n] · open [n]
- **Risks:** [quotes to check on the live post, timing]

## Details: My work engine

### A1. [title]
- **Title options:** [2 or 3, borrowing a proven formula where one fits]
- **Hook:** "[one line]"
- **From:** [sessions, repos, skills, by name]
- **Proof:** [numbers and verbatim quotes]
- **Demo:** [what we show]
- **Creator echo:** [a core creator video on the same theme, with its URL, or "none"]
- **Score:** wow [n]×3 · proof [n]×2 · demo [n]×2 · fit [n] · fresh [n] · echo [n]
- **Risks and what to scrub:** [confidential details, unfinished parts, claims to verify]

## Details: YouTube engine

### C1. [title]
- **Title options**, **hook**, a **creator evidence table** (creator, video, views, outlier, in window, URL) and **our version**
- **Talking points we already have:** [the matching My work engine rows or sessions, or "none yet: before you record, [task]"]
- **Score:** proof [n]×3 · spread [n]×2 · promise [n]×2 · fresh [n] · fit [n] · open [n]
- **Risks**

## Things we noticed
[Anything worrying the research found, one line each: a public repo holding client material, an app open without a login, exposed keys, a claim we keep making that is not true yet. Or "nothing".]

Swap any of the 7 and I'll write the briefs.
```

## Rules

- **My work engine** lists every distinct thing we built in the window that passes the our-work gates, ranked by score, with at least 6 rows when that many pass.
  - Never pad it.
  - Never drop something because it was on an earlier sheet. Only drop what `topics.py recent` lists, or what was recorded outside the register (say which).
- **YouTube engine** lists 6 creator topics ranked by score. Core creators only, and every evidence row has its URL.
- **Twitter engine** lists at least 6 threads when that many pass Part T. Every row links to a post or the giant's page.
- **The 7-day plan** has 7 rows. If fewer than 7 strong topics exist, use locked titles and say which days are weak.
- **Locked titles** appear word for word above both tables. Do not reword them, "improve" them or re-score them.
- **Nothing private.** No client names, private links or personal data in either table. Describe clients by type ("a parenting app client").
- **Caveats.** Say "views rounded" for listing views, and flag ratios under about 3 weeks old as provisional.
- **One table per topic.** A topic goes in both tables only if it is genuinely both (our work plus a creator breakout). List it once, in My work engine, with the creator echo.
- **The claim ladder applies to every row.** The status column is not optional.

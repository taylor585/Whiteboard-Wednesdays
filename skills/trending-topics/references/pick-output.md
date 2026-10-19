# The pick sheet

Pick mode ends with this sheet, then stops for Taylor's choice.
- Save it to `video-plans/Picks - week NN.md` in the working directory. Taylor opens files there, not in the scratchpad.
- Run `scripts/check_picks.py` on it, and fix anything until it passes.
- Send it with SendUserFile.
- Show both tables in the chat as well.

The sheet has **two tables, never mixed**, with these exact headings:
- **Table One: Your own work.** Everything we built in the last 30 days.
- **Table Two: Ideas from creators.** What our creators have already proven.

Taylor picks from either table, or locks a title of their own.

## Template

```markdown
# Trending Topics: picks for week [YYYY-Www]

**Locked in:** [every locked title from the topic register, word for word, or "none"]

**Our work researched:** [n] Claude Code sessions (every one updated [start] to [end], [n] read in depth by [n] parallel agents), [n] GitHub repos pushed in the window, [n] skills updated. Not readable: [list, or "nothing"].
**Creators researched:** [n] of [n] core channels, [n] core winners (1.4× or more), [n] in-window uploads. Scan [date].
**Left out as already done:** [titles from `topics.py recent`, or "none"]

## Locked: [title]
[For each locked title: what we have for it from both lanes, its status on the claim ladder, and "Before you record" tasks.]

## Table One: Your own work

| # | Topic (best title) | What we built | Status | Wow | Proof on screen | Score |
|---|---|---|---|---|---|---|
| A1 | [title] | [one line] | [live/working/rehearsed/half-built] | [why it blows people away] | [the number or demo] | [n]/50 |

## Table Two: Ideas from creators

| # | Topic (best title) | What the creators proved | Best evidence | Our version | Score |
|---|---|---|---|---|---|
| C1 | [title] | [promise + format] | [creator, video, ratio, URL] | [our twist] | [n]/50 |

## Details: your own work

### A1. [title]
- **Title options:** [2 or 3, borrowing a proven formula where one fits]
- **Hook:** "[one line]"
- **From:** [sessions, repos, skills, by name]
- **Proof:** [numbers and verbatim quotes]
- **Demo:** [what we show]
- **Creator echo:** [a core creator video on the same theme, with its URL, or "none"]
- **Score:** wow [n]×3 · proof [n]×2 · demo [n]×2 · fit [n] · fresh [n] · echo [n]
- **Risks and what to scrub:** [confidential details, unfinished parts, claims to verify]

## Details: ideas from creators

### C1. [title]
- **Title options**, **hook**, a **creator evidence table** (creator, video, views, outlier, in window, URL) and **our version**
- **Talking points we already have:** [the matching Table One rows or sessions, or "none yet: before you record, [task]"]
- **Score:** proof [n]×3 · spread [n]×2 · promise [n]×2 · fresh [n] · fit [n] · open [n]
- **Risks**

## Things we noticed
[Anything worrying the research found, one line each: a public repo holding client material, an app open without a login, exposed keys, a claim we keep making that is not true yet. Or "nothing".]

## Recommended this week
1. [locked title]
2. [pick]: [one-line reason]
3. [pick]: [one-line reason]

**How they link as a series:** [one line]

Pick from either table and I'll plan the week.
```

## Rules

- **Table One** lists every distinct thing we built in the window that passes the our-work gates, ranked by score, with at least 6 rows when that many pass.
  - Never pad it.
  - Never drop something because it was on an earlier sheet. Only drop what `topics.py recent` lists, or what was recorded outside the register (say which).
- **Table Two** lists 6 creator topics ranked by score. Core creators only, and every evidence row has its URL.
- **Locked titles** appear word for word above both tables. Do not reword them, "improve" them or re-score them.
- **Nothing private.** No client names, private links or personal data in either table. Describe clients by type ("a parenting app client").
- **Caveats.** Say "views rounded" for listing views, and flag ratios under about 3 weeks old as provisional.
- **One table per topic.** A topic goes in both tables only if it is genuinely both (our work plus a creator breakout). List it once, in Table One, with the creator echo.
- **The claim ladder applies to every row.** The status column is not optional.

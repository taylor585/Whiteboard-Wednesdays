# The week pack

What Taylor gets after choosing 3 of the 5 picked topics: everything needed to record the week, delivered in the chat.

## Steps

1. Confirm the 3 chosen topics and the recording order Taylor wants. Default order: the strongest Lane A proof first, then follow the series link.
2. Build each brief with `references/brief-format.md`, one at a time, reading each topic's source in full (for a skill: its SKILL.md and every reference file, line by line).
3. Set each brief's **NEXT VIDEO** to the next brief in the week, and the last one to next week ("Next week: [top unused pick]").
4. Run `python3 <skill-dir>/scripts/check_brief.py <brief1> <brief2> <brief3>`. Fix every BLOCKING line and re-run until it exits 0. Never deliver a failing brief.
5. Write the week overview (template below).
6. Save the files to the session scratchpad (never the public repo):
   - `week-YYYY-Www-overview.md`
   - `week-YYYY-Www-1-[slug].md`, `-2-[slug].md`, `-3-[slug].md`
7. **Deliver in the chat:**
   - The week overview in full, as text.
   - Each brief's AT A GLANCE and READ BEFORE YOU RECORD blocks as text, so Taylor can start reading straight away.
   - Send all four files with SendUserFile (status `normal`) so they open on a phone. The full briefs live in the files.
   - One line naming what still needs Taylor: numbers, stories, demos to set up, claims to verify.

## Week overview template

```markdown
# WEEK [YYYY-Www]: Trending Topics

Picked on [date] from [n] chat sessions (last 14 days) and [n] creator uploads.

| # | Title | In 5 to 10 words | Length | Status |
|---|---|---|---|---|
| 1 | [title] | [the brief's PROMISE, shortened] | [min] | Ready / needs [x] |
| 2 | ... | ... | ... | ... |
| 3 | ... | ... | ... | ... |

## How they link
[one or two lines: the series thread, e.g. "the board decides what to build, the harness builds it"]

## Before you record (all three)
- [ ] [prep items merged from the three PREP CHECKLISTs, deduplicated]
- [ ] Verify: [all claims to check]

## Recording order
1. [title]: open [files/demos]
2. ...
3. ...

## Held for next week
- [the two unchosen picks, one line each, with their score]
```

## Rules

- Briefs are delivered in the chat. They are not committed to the repo (the repo is public) and not uploaded elsewhere unless Taylor asks.
- Keep client names out of on-camera lines unless Taylor confirms they can be shown. Flag them in "Verify first".
- If a topic cannot be built honestly (its source cannot be read, or the work turns out thinner than the pick suggested), say so, offer the next pick instead, and do not pad.

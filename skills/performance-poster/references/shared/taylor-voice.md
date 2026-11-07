# Writing like Taylor: headline voice profile

How Taylor Cunningham (Pecuna Factorem) writes titles and thumbnail lines. It's built from every headline he has written, spoken or picked, all logged in `references/brand/headline-log.csv`. Use it whenever you write titles or thumbnail lines for Pecuna Factorem.

**Evidence level:** at 16 October 2026 this rests on 6 titles and 8 thumbnail lines Taylor wrote, spoke or chose, plus two choices where he overrode a recommendation. That's a small sample, so treat this as a strong starting profile, not a law. Re-read the log and update this file every ~10 new headlines. Once CTR results exist, weight the patterns on his *winners* (`scripts/headline_log.py winners`), not just what he writes.

## The patterns

| # | Pattern | His examples | How often |
|---|---|---|---|
| 1 | **First person, something he made** ("I Built", "I Made") | "I Built an ICP Research AI Agent That Finds Your Ideal Clients On Meta" · "I Made AI Draw My App Before It Coded It" | 2 of 6 titles |
| 2 | **AI is named, often as the actor** | "…AI Agent…", "I Made AI Draw…", "…When Using AI", "Using AI Vision Boards…" | 4 of 6 titles |
| 3 | **Stacks real search terms** | He rewrote a 55-character recommendation into a 70-character title with four searchable terms: ICP research, AI agent, ideal clients, Meta | his one published title |
| 4 | **Short curiosity verdicts with a metaphor** ("This Is a…", "cheat code", "read their mind") | "This Is a Cheat Code When Using AI" · "Read their mind." | chosen over 3 planned titles |
| 5 | **Two beats, full stops, imperative** | "Stop Prompting Apps. Board Them First." · "Draw it. Then build it." · "No answer. Next clinic." | the dominant thumbnail-line shape |
| 6 | **Coined verbs and plain words** | "Board them first.", "Diagnose before you write." | recurring |
| 7 | **Speaks to "you/your" and the buyer's outcome** | "…Finds Your Ideal Clients…", "Take the words out of their mouth." | recurring |
| 8 | **Title Case for titles; sentence case with a full stop for thumbnail lines** | all examples | always |
| 9 | **Lines lifted from his own spoken words** | "Read their mind." (from "This person has just read my mind."), "AI doesn't know how to speak to humans." | his best thumbnail lines |

**What he avoids, or replaced:**
- bare keyword labels ("ICP Buyer Research" was only a working title);
- hype words and ALL CAPS;
- invented numbers. "Zero rebuilds." is on hold until the numbers back it.

## How to write like Taylor (use with the headline framework)

1. Write the 10 titles as usual (`references/frameworks/headline-framework.md`). Make **at least 4 of them in Taylor's voice** and tag them `voice: taylor`. Spread them across these shapes:
   - **I-built / I-made + search terms:** "I Built a … That Finds Your …";
   - **curiosity verdict:** "This Is a … When …";
   - **two-beat imperative:** "Stop X. Do Y First.";
   - **AI as the actor:** "I Made AI … Before It …".
2. Thumbnail lines in his voice:
   - **two-beat imperative fragments** with full stops ("Draw it. Then build it.");
   - **his own lines from the transcript first,** before anything new;
   - **metaphors** ("cheat code", "read their mind").
3. **Fix his known trade-off:** he leans towards curiosity or long keyword stacks.
   - A curiosity title gets a search-term variant to A/B ("This Is a Cheat Code When Building Apps With AI").
   - A long stack gets a ≤60-character variant so the end isn't cut on mobile.
   - Offer the variant; never overrule his pick.
4. **Score as normal,** then add a **voice match** note (strong / partial / off) beside each title. Don't change the 0–100 score: voice is how he writes, not proof of what wins. When the log shows which patterns win on CTR, prefer those.

## Logging (every time)

Every headline Taylor writes, edits, picks or publishes goes in the log:

```bash
python3 <skill-dir>/scripts/headline_log.py add --video "<video>" --kind title|thumbnail_line|working_title \
  --text "<exact text>" --source taylor|taylor-spoken|claude --status published|chosen|candidate|replaced \
  --tags "<pattern tags from the table above>" [--pair "<thumbnail line or title>"] [--notes "..."]
python3 <skill-dir>/scripts/headline_log.py export <out>/Taylor-Headline-Log.xlsx    # give Taylor the updated spreadsheet
```

- Log Claude's suggestions too (`--source claude`). What he passes over teaches as much as what he picks.
- **48 hours after publishing,** add the result:

  ```bash
  python3 <skill-dir>/scripts/headline_log.py update --id N --ctr 5.2 --avg 4.1
  ```

  At 30 days, add `--outlier`.
- **The skill's copy of the log can't save between claude.ai sessions.** The spreadsheet Taylor keeps is the master copy. When he attaches it, run `headline_log.py --log <work>/headline-log.csv import <his.xlsx>` first, then add, then export the updated spreadsheet back to him.

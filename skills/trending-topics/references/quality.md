# Quality gates and honest status

A pick sheet or brief is delivered only when every applicable check below passes. Report what was checked, not what was intended.

## Pick sheet

- [ ] Two tables, never mixed: Table 1 (our work) and Table 2 (creators); locked titles shown above both.
- [ ] Table 1: every session updated in the last 30 days indexed and every non-trivial one read; repos pushed in the window read; skills updated listed; counts and anything unreadable stated.
- [ ] Table 1: nothing dropped for being on an earlier sheet; only recorded or fully planned topics left out.
- [ ] Table 2: scan date, channels and failures stated; `lane-b.md` written; every row has a core creator winner (1.4× or more) with its URL.
- [ ] Every title promises the viewer something.
- [ ] No client names, private links or personal data in either table.
- [ ] Listing views are labelled rounded; provisional ratios (under about 3 weeks) labelled.
- [ ] Score breakdown shown for every topic; hard gates applied.
- [ ] Client names and confidential details flagged, not on camera unchecked.
- [ ] Proven themes left out are listed with the reason.
- [ ] Ends with the recommended picks and "Pick from either table and I'll plan the week."

## Trending Topic Brief

- [ ] `python3 scripts/check_brief.py <brief>` exits 0 (headings and order, every segment field, 5 to 10 word one-liners, every Act 1 problem crossed off, Act 3 NUMBERS, PACKAGING with 3 titles, LINE 1 of 150 characters or fewer, LINE 2, CHAPTERS).
- [ ] The source was read in full, line by line, before writing Act 1.
- [ ] Every QUOTE FROM THE SOURCE is verbatim from the source file.
- [ ] Act 3 numbers are blanks for Taylor; no invented figures.
- [ ] "Verify first" lists every unverified source, claim and client detail.
- [ ] Each title is scored with `headlines.md` §5; the A/B set uses 3 different formulas.
- [ ] The description follows `descriptions.md`; links are real or `[your link]`.
- [ ] Live examples have prompts to paste and a check-in prompt; built-not-run examples have the nine answers, locks, skill bindings and constraint rows.

## Week pack

- [ ] Talking points from our work found for each topic after the choice, or a "before you record" task where we have none.

- [ ] All three briefs pass `check_brief.py` together.
- [ ] NEXT VIDEO links each brief to the next.
- [ ] Overview, AT A GLANCE and READ BEFORE YOU RECORD shown as text in the chat; all files sent.
- [ ] Nothing chat-derived committed to the public repo.

## Honest status words

- **Verified:** the check was run and passed (say which).
- **Drafted, not verified:** written but a check could not run (say why).
- **Blocked:** a named input or access is missing.
Never call self-assessment approval. Never say a brief is record-ready before the checker passes.

# Descriptions

How we write the YouTube description for every Trending Topic video. It goes in the brief's PACKAGING section, drafted before recording and finished (chapters) after.

## The main finding (why we spend effort elsewhere)

In the packaging research (90 latest uploads plus 60 all-time hits from Nick Saraev, Sabri Suby and Riley Brown), **the description did not separate hits from misses on any channel.** Each channel's biggest recent hit had a funnel-only description; one carried a stale summary from another video. So we write descriptions to **convert and help**, with light search value, and put the creative effort into the title, thumbnail line and the video itself. (Evidence: `research-findings.md` §1, laws 17 to 20.)

## What the three creators do

| | Sabri Suby | Nick Saraev | Riley Brown |
|---|---|---|---|
| Line 1 | One-line promise with proof | CTA to paid community | Series label or summary |
| Lead magnet | Line 3: free playbook | Line 2: free resources | By line 3: resources page |
| Chapters | None | 24 of 30 | 29 of 30, numbered for listicles |
| Length | about 300 characters | about 2,500 | 500 to 1,500 |
| Hashtags | 0 | 0 | 7 of 30, mostly partner tags |
| Weak spot | No chapters | Stale summaries on 9 of 30; undisclosed affiliate links | 6 of 30 with no clickable link |

## Our template (default)

**Line 1 (shows in search and above "...more", 150 characters or fewer):** the brief's PROMISE in plain words, containing the title's searchable noun and one real proof detail (a number, result or duration). If the video has no number, use a standing track-record line, only with real figures Taylor supplies.

**Line 2:** the single most useful link, labelled with what they get ("Get the harness starter contract:"). Use `[your link]` until Taylor supplies the real URL. Never invent a URL.

**Body (3 to 5 short lines):** what the viewer will be able to do, using the brief's real specifics. Pull them from the Act 2 one-liners, in order. No keyword stuffing.

**Chapters (every video over 4 minutes):**
- first chapter `0:00`, at least 3 chapters, each at least 10 seconds;
- timestamps from the recording's transcript only, never guessed; before recording, write `CHAPTERS: from transcript after recording` and list the planned chapter names from the brief's sections;
- plain, keyword-rich names ("How the five locks stop drift"), not clever ones;
- one chapter per act or major segment: Cold open, Act 1 characters, The turn, Act 2 segments (grouped), Examples, Proof, Close.

**Standing blocks (from Taylor's settings):** Pecuna Factorem offer or call, socials, business link, and a disclosure for any affiliate, referral or sponsor link ("Some links are affiliate links; I may earn a commission."). The disclosure is a legal requirement in the UK and US.

**Hashtags:** Taylor's brand rule first. Without one: none by default, at most 3 and only if real and relevant. The three creators barely use them.

## Three styles (write all three, Taylor picks)

- **Sabri style:** short. Promise-with-proof line, the lead magnet, socials. Add chapters anyway when over 10 minutes.
- **Nick style:** offer first, then free resources, then a fresh summary of this video and chapters.
- **Riley style:** series label ("This is a Whiteboard Wednesday."), a 3 to 5 bullet recap of the biggest moments, resources link, numbered chapters, and a comment prompt ("Which of the five locks would have saved your last project? Tell me in the comments.").

## Checks before delivering (`check_brief.py` enforces the first three)

- LINE 1 is present and 150 characters or fewer.
- LINE 2 is present (a real link or `[your link]`).
- CHAPTERS are present (planned names before recording, real timestamps after).
- The summary describes this video, not a previous one.
- Every link comes from Taylor's settings or message.
- Chapters start at 0:00, ascend, and none is past the video's end.
- No claim the video does not make.
- A disclosure is present whenever any affiliate or sponsor link is.

## Worked example (from the gold brief)

```
LINE 1: How we stop Claude and Codex drifting, interrupting and bluffing on long jobs: a real business harness, live.
LINE 2: Get the harness starter contract: [your link]
BODY:
- Why AI answers its own questions first, then asks you once
- The five locks that keep piece twenty as good as piece one
- Green, amber, red: how it decides without bothering you
- Why a script, not the AI, decides when it's done
CHAPTERS: from transcript after recording. Planned: Same model, different results / Five AI failure types / What a harness is / Kickoff and locks / Decisions and memory / The done check / Live client build / Campaign harness walkthrough / Proof
STANDING: Pecuna Factorem call link, socials, disclosure if any affiliate link.
```

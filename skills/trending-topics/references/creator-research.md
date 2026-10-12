# Lane B: what is working for our creators

The creators show what the audience is clicking on right now. This lane scans them and turns uploads into themes with evidence.

## The creator list

- **Core (weight 1 to 3):** `references/creators.json`. Nick Saraev, Sabri Suby, Riley Brown, Jeremy Haynes, Alex Finn, The Calum Johnson Show, Skill Leap AI, Paul J Lipsky, Daniel Priestley (his Key Person of Influence channel, plus his personal channel) and Sergio C. Handles and channel IDs were verified live on 12 October 2026.
- **Secondary (weight 1):** the app watchlist at `public/creators.json` in the Whiteboard Wednesdays repo, read automatically when the repo is present.

## Run the scan

```bash
pip install yt-dlp            # optional; without it the scan is RSS-only (no outlier ratios)
python3 <skill-dir>/scripts/scan_creators.py --out <scratchpad>/scan --days 14
```

- `--core-only` for a quick run; leave it off for the full watchlist.
- `--depth 30` sets how many long-form uploads per channel feed the outlier ratio.
- `--include-shorts` adds Shorts to the ranked table (left out by default; topics come from long-form).

Read `scan.md` first: in-window uploads ranked by views per day, the outlier table, failures, caveats. Use `scan.json` for detail.

## Turn uploads into themes

1. Group in-window uploads by subject, not by creator. Name each theme in a few words ("ChatGPT Dots", "Grok Bot agents making money", "Meta ads post-Andromeda", "AI harnesses").
2. For each theme record: number of creators, the best upload (views per day and outlier ratio), how fresh it is, and the angle the creators took.
3. Mark heat:
   - **Hot:** 2 or more creators in the window, or any HOT or OUTLIER upload.
   - **Warm:** 1 creator, normal performance.
   - **Cold:** older uploads only.
4. Note what the creators did not show. That gap is usually our angle: they explain or react, and we show real work.

Theme line format (scratchpad, `lane-b.md`):

```
[T#] · [theme] · HEAT: hot/warm/cold · CREATORS: [names] · BEST: [title], [views], [views/day], outlier [x], [age] days, [url] · THEIR ANGLE: [explainer/news/tutorial/results] · GAP: [what nobody showed]
```

## Reading the numbers honestly

- Outlier ratio = views / median of the 10 listed uploads either side (same maths as thumbnail-tracker). Under 0.7 under, 0.7 to 1.4 normal, over 1.4 over, 2 or more a hit (bands from thumbnail-tracker/references/research-rubric.md).
- Listing views are rounded; RSS views are exact but only for the latest ~15 uploads, Shorts included.
- Views per day favours very new uploads; a day-old video with 6k views is promising, not proven.
- A course, a series or a hot news topic can carry a video regardless of packaging. Say so when it matters.
- If a channel fails, the scan logs why and continues. Re-verify that channel's handle if it fails twice.

## Adding or removing a creator (Creators mode)

1. Resolve the channel ID: fetch `https://www.youtube.com/@handle` and read `"externalId":"UC..."`, or let the scanner resolve it on first run.
2. Add an entry to `references/creators.json` `core` with name, handle, channel_id, niche tags and weight (3 most relevant, 1 least).
3. Run `scan_creators.py --core-only` once to confirm it scans.
4. Commit the change on a branch and open a PR, following the repo's CLAUDE.md.

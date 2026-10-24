# The creators: what they have already proven

Topics come from here. Our creators publish, their audience votes with views, and a video that beats the creator's own normal is a tested topic, promise and format. This step scans them and turns their winners into proven themes.

## The creator list

- **Core (weight 1 to 3), the only source of topics:** `references/creators.json`.
  - Nick Saraev, Sabri Suby, Riley Brown, Sergio C (weight 3).
  - Jeremy Haynes, Alex Finn, The Calum Johnson Show, Skill Leap AI, Paul J Lipsky, Daniel Priestley (his Key Person of Influence channel weight 2, his personal channel weight 1).
  - Handles and channel IDs were verified live on 12 October 2026.
- **Secondary (the app watchlist, `public/creators.json`):** off by default. Add it with `--with-secondary` only to support a core theme. It never sets a topic.

## Run the scan

```bash
pip install yt-dlp            # needed for outlier ratios; without it the scan is RSS-only and cannot find winners
python3 <skill-dir>/scripts/scan_creators.py --out <scratchpad>/scan --days 14
```

- `--depth 30` sets how many long-form uploads per channel feed the outlier ratio and the Core winners table.
- `--with-secondary` adds the app watchlist as a separate supporting table.
- `--include-shorts` adds Shorts to the ranked table (left out by default; topics come from long-form).

Read `scan.md` in this order:
1. **Core winners:** each creator's long-form uploads at 1.4× or more, any date. This is the main evidence.
2. **In-window uploads**, ranked by outlier ratio: what is fresh.
3. Outliers, failures, caveats.

## Turn winners into proven themes

1. Group the winners and in-window uploads **across creators**, two ways:
   - **by subject** ("Meta ads on a low budget", "Grok", "sales", "the new era of AI", "landing pages");
   - **by promise and format** ("Learn 97% of X in N minutes", "Give me N minutes", "I tested", "the top 0.01%", "what I'd learn instead").
2. For each theme record: the core creators with a winner on it, the best upload (outlier ratio, views), whether anything is fresh, the promise they made, and the format.
3. Mark heat:
   - **Proven:** 2 or more core creators with a winner, or one creator at 5× or more.
   - **Promising:** one creator between 1.4× and 5×.
   - **Unproven:** in-window uploads only, none above 1.4×.
4. Note what none of them did. That gap becomes our version.

Theme line format (scratchpad, `lane-b.md`; write it every run, the picks come from this file):

```
[T#] · [theme] · HEAT: proven/promising/unproven · CREATORS: [names] · BEST: [title], [views], outlier [x], [in window yes/no], [url] · PROMISE: [what the viewer is told they get] · FORMAT: [time-box/test/course/list/story/news] · GAP: [what none of them did]
```

## Reading the numbers honestly

- Outlier ratio = views / median of the 10 listed uploads either side (same maths as thumbnail-tracker). Under 0.7 under, 0.7 to 1.4 normal, over 1.4 over, 2 or more a hit (bands from thumbnail-tracker/references/research-rubric.md).
- Listing views are rounded; RSS views are exact but only for the latest ~15 uploads, Shorts included.
- Views per day favours very new uploads and big channels; use it for freshness, never to rank topics.
- A single 100×-plus viral (for example a 49M-view upload) is an anomaly; count it, but prove the theme with other creators.
- A course, a series or a hot news topic can carry a video regardless of packaging. Say so when it matters.
- If a channel fails, the scan logs why and continues. Re-verify that channel's handle if it fails twice.

## Adding or removing a creator (Creators mode)

1. Resolve the channel ID: fetch `https://www.youtube.com/@handle` and read `"externalId":"UC..."`, or let the scanner resolve it on first run.
2. Add an entry to `references/creators.json` `core` with name, handle, channel_id, niche tags and weight (3 most relevant, 1 least).
3. Run `scan_creators.py` once to confirm it scans.
4. Commit the change on a branch and open a PR, following the repo's CLAUDE.md.

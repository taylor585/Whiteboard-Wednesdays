# Workflows: Track, Watch and Audit

The step-by-step procedures for analysing channels and judging thumbnails. SKILL.md routes here. `<skill-dir>` means this skill's folder; use absolute paths.

## Track a channel

1. Run `python3 <skill-dir>/scripts/track_channel.py <@handle or URL> <workdir>`. Add `--limit 100` for very large channels, or `--shorts` for the Shorts tab.
2. Read `summary.txt`. Then **look at every `sheet_*.jpg`** (newest first) and `outliers.jpg`. The analysis is about what's in the frame, so look at the images themselves rather than inferring from titles. Two data caveats:
   - The listing's view counts are rounded.
   - YouTube hides a few counts. Those show as "?", are listed in summary.txt, and are left out of every stat.

   Mention both when a number matters.
3. Group the thumbnails into eras or recurring templates by tagging them by eye in a `tags.tsv` (`<index or range><TAB><tag>`). Then run `python3 <skill-dir>/scripts/group_stats.py <workdir>/videos.tsv tags.tsv`. It gives each group's size, median views, median outlier ratio and hit rate. The outlier ratio (views ÷ the median of the 10 uploads either side) controls for channel growth, so lean on it more than raw views. Also check format before crediting the thumbnail: long courses (see the 90min+ line) and recurring series often win on format alone.
4. Write the breakdown:
   - The headline numbers.
   - What the top outliers share, with concrete examples: the thumbnail line vs the title, face and pose, hero object, colour, layout.
   - What the flops share.
   - How the style has changed over time.
   - A reusable recipe.

   Cite videos by index (#12) so they can be checked. Keep "the data shows" separate from "my read", and name the confounds (topic heat, channel growth).
5. Give the user `report.html`, a browsable, sortable gallery that works in light and dark mode. It loads images from the `thumbs/` folder next to it, so share the whole workdir (zipped), or publish it as a page together with its `thumbs/` files. A bare HTML file shows no images. When they're comparing channels, run each one and set them side by side against the playbook's ten elements.
6. Optional: if they want audits scored against this creator, run `python3 <skill-dir>/scripts/audit.py --build-benchmark <workdir>/thumbs <workdir>/benchmark.json`. Better still, point it at only the top-outlier thumbnails.


## Watch channels over time

```bash
python3 <skill-dir>/scripts/watch.py add @handle --dir <state-dir>     # once per channel
python3 <skill-dir>/scripts/watch.py run --dir <state-dir>             # each check-in
python3 <skill-dir>/scripts/watch.py list --dir <state-dir>
```

- `add` takes `--limit N` (uploads scanned per run for that channel, default 30). It's stored, so scheduled runs don't need the flag.
- Keep `<state-dir>` somewhere that persists, such as the user's project or a synced folder, never a temp directory. If a task forces a temp location, say it has to move before the watch is scheduled.
- Each run writes `digests/<YYYY-MM-DD_HHMM>/digest.md` and `digest.jpg` (UTC). These flag:
  - NEW: first seen since the last run, or published in the last 7 days on the first run;
  - OUTLIER: 2× or more its neighbouring uploads, the same maths as the tracker;
  - TOP GAINER: the biggest gain since the last run.
- Growth numbers start from the second run. Publish dates and views per day come from the channel RSS feed, so they only exist for the latest ~15 uploads.
- Lead your reply with the breakouts, then say in a line or two which playbook elements explain each one, or say that it's the topic and not the packaging. Similar thumbnails flopping elsewhere is the tell.
- **It works:** the first live run caught Nick Saraev's GitHub-repo video jumping from 138K to 408K views in about two days, the kind of breakout this mode exists to flag.
- **Scheduling.** If the user wants regular check-ins, ask which day, what time and which timezone before creating anything. Then use the environment's scheduler (routine, cron, /loop) and tell them where the digests land. A scheduled job is outward-facing, so confirm before creating it.


## Audit a thumbnail

```bash
python3 <skill-dir>/scripts/audit.py <image path | image URL | YouTube URL | video ID> <out-dir> [--feed <dir of competitor thumbs>] [--benchmark <json>]
```

1. For a YouTube link, the script also saves `video.json` (title and channel). It can't get the view count. To answer "why is this doing well", run `track_channel.py` on that channel (`--limit 60` is enough) for its views, outlier ratio and context. Then point `--feed` at that run's `thumbs/` folder: the feed becomes the uploads published around the video, and the video itself is excluded.
2. The default benchmark is `references/benchmarks.json`, built from Nick Saraev's 72 most recent thumbnails (his best-performing style). Use a channel-specific benchmark when the user's niche looks very different.
3. **Look at `audit.png`**:
   - Is the line readable at 168px?
   - Does one shape survive the squint test?
   - Does it hold in greyscale?

   With `--feed`, also look at `feed.png`. Describe the feed and the competing videos only from what you can see in that image and in videos.tsv. Don't characterise neighbours (colours, formats, lengths) from memory or titles. Does it stand out among the others, or blend in? Its distinctiveness score is a colour distance from the feed average: around 0.3 or higher is different, below about 0.15 blends in.
4. Separate packaging from format before giving credit. A course, a series instalment or a hot topic can carry an average thumbnail. Then score it against the `references/design/playbook.md` §6 / `references/frameworks/thumbnail-framework.md` §7 checklist and the ten elements. Use metrics.json as supporting evidence, not as the verdict. A thumbnail can sit inside every range and still give nobody a reason to click.
5. Give a verdict and the top 3 fixes, ordered by impact. For "what should I steal", list the transferable elements. If you don't know the user's channel, give general moves and offer to audit their channel against them. When it helps, render a fixed version with the Create flow, and audit that version too for a before/after.

## Studying a creator's whole packaging (titles + thumbnails + descriptions)

Follow `references/research/method.md`: collect dossiers with `scripts/fetch_videos.py`, score every video against the creator's own normal, tag titles, thumbnails and descriptions with the rubric, and keep "the data shows" separate from "my read". For Nick Saraev, Sabri Suby and Riley Brown, start from `references/research/creators.md` (October 2026) and only fetch newer uploads.

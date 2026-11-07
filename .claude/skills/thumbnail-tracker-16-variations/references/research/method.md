# Research method

This file has two parts. The first says how the research behind the skill was collected in October 2026, so any figure in `references/research/overview.md` or `references/research/creators.md` can be traced and repeated. The second is the rubric for studying a creator's packaging, which is what you follow to research a new creator.

## How the research was collected (October 2026)

Three creators: Nick Saraev (@nicksaraev), Sabri Suby (@SabriSubyOfficial) and Riley Brown (@rileybrownai). Before this, Nick's whole channel had been audited by eye for thumbnails alone; see `nick-thumbnail-audit.md`.

### Sample 1: the latest 30 per creator (90 videos)

Collected on 12 October 2026, run from the folder that holds the skill:

```bash
for c in SabriSubyOfficial nicksaraev rileybrownai; do
  python3 -I thumbnail-tracker/scripts/fetch_videos.py research/$c --channel @$c --baseline 30 --all-dossiers
done
```

- `fetch_videos.py` lists the channel with yt-dlp, skips Shorts and anything under 180 seconds, and keeps the 30 latest long-form uploads.
- For each one it calls YouTube's `youtubei/v1/next` endpoint (one request a second) and saves `<id>/dossier.json` (exact views, likes, publish date, full description, real link URLs, above-the-fold lines, chapters) and `<id>/thumb.jpg`.
- `baseline.tsv` holds the 30 with their outlier ratios, and two labelled contact sheets (`sheet_1.jpg`, `sheet_2.jpg`) show all 30 thumbnails.
- All 90 dossiers came back with a description and likes. Chapters: Nick 24 of 30, Sabri 0 of 30.
- The latest 5 per creator are the "deep five", studied in full detail.

### Sample 2: the all-time top 20 per creator (60 videos)

Per creator, the top 10 by views plus the top 10 breakouts by outlier ratio, long-form (180 seconds or more) only, with no video counted twice. Drawn from the full upload histories: Nick 320, Sabri 473, Riley 194 uploads.

The picks came from a one-off script in the session that used the skill's own listing and outlier functions. The logic, if you need to repeat it:

```python
import sys; sys.path.insert(0, '<skill-dir>/scripts')
from track_channel import list_videos, add_outliers
rows = list_videos('https://www.youtube.com/@<handle>', 0, False)   # every upload, newest first
add_outliers(rows)
long = [r for r in rows if r['dur'] >= 180 and r['views']]
top_views = sorted(long, key=lambda r: -r['views'])[:10]
seen = {r['id'] for r in top_views}
top_breakouts = [r for r in sorted(long, key=lambda r: -(r['outlier'] or 0)) if r['id'] not in seen][:10]
```

It wrote `research-top/<handle>/all.tsv` (every upload with views, duration and outlier ratio) and `picks.json`. The dossiers were then fetched with:

```bash
python3 -I thumbnail-tracker/scripts/fetch_videos.py research-top/<handle>/dossiers <the 20 picked ids>
```

### The outlier ratio

Outlier = a video's views ÷ the median views of the 10 uploads either side of it on the same channel. The video itself and any hidden view counts are left out of the median. It is computed by `add_outliers` in `scripts/track_channel.py`, which `fetch_videos.py` and `watch.py` share.

| Band | Ratio |
|---|---|
| Under | below 0.7 |
| Normal | 0.7 to 1.4 |
| Over | above 1.4 |
| Hit | 2 or more |

### How the teardowns were done

- **One analyst agent per creator**, for each sample, all following this rubric.
- **Every thumbnail was looked at as an image.** In the latest 30, each agent read both contact sheets and every deep-five `thumb.jpg` on its own. In the top 20, each agent read every `thumb.jpg`. Visuals were never inferred from titles.
- **Work from the files only.** Agents fetched nothing new and wrote only inside their creator's research folder.
- **Nick's latest-30 agent** focused on titles, descriptions and the title–thumbnail pair, because the thumbnail playbook was already built from his channel. It was also told about his title changes after publishing (for example, dAzs_rU6080 was retitled twice in two days) as A/B-testing evidence.
- **The top-20 agents** compared the all-time winners with the latest-30 teardown: formula changes over time, the thumbnail layouts of the biggest hits, the description structure on hits, and era confounds (each hit's publish date, and old breakouts next to tiny-view neighbours). Each wrote 5–8 rules with evidence, a confidence (high, medium or low) and whether it confirms, strengthens or contradicts the earlier rule.
- **Figures were then checked by script, not by hand.** Formula-group medians were recomputed with Python from the tags. Hashtags were counted from the description text (a `#` followed by a letter), because the dossier's `hashtags` field picks up "#1" (see `../troubleshooting.md`). In the latest-30 build, all 141 outlier references in Sabri's teardown and the cross-creator file matched `baseline.tsv`, and all 13 quoted description blocks matched the dossiers byte for byte. The top-20 agents verified every outlier figure against `all.tsv`.
- **Errors found in the checks were corrected**, for example Riley's real hashtags appear on 7 of 30 videos, not only the two his first draft named, and Sabri has 13 videos under 0.7, not 15.

### The synthesis

1. **Cross-creator file.** The three latest-30 teardowns were combined into a cross-creator summary: laws shared by all three, each creator's signature, a title formula library, the description templates quoted, new thumbnail layouts, and confidence levels.
2. **Re-check.** Before writing the top-20 synthesis, the headline figures were recomputed against each creator's full upload list.
3. **"Law" rule.** A finding counts as a law only when it points the same way on all three channels, or is a strong single-channel pattern that the all-time check backed. Single-channel patterns stay "signals".
4. **Into the skill.** Each law feeds a named rule in `../frameworks/headline-framework.md`, `../design/playbook.md` (§7 and §7b), `../frameworks/description-framework.md` or `../frameworks/linkedin-framework.md`. `references/research/overview.md` lists every law with its evidence and the file it feeds; `references/research/creators.md` holds the per-creator detail.

### Data files

All in `data/` (see `data/README.md`):

| File | What it holds |
|---|---|
| `<creator>-all-uploads.tsv` | Every upload (Nick 320, Sabri 473, Riley 194): index, id, views, duration, outlier ratio, title |
| `<creator>-latest30.json` | The latest-30 teardown, one object per video |
| `<creator>-top20.json` | The top-20 teardown: `videos[]` and `rules[]` |

`<creator>` is `nick`, `sabri` or `riley`. The contact sheets of the top 20 are in `../../assets/research/top-hits-<creator>.jpg`.

---

# Packaging research rubric

Use this to study a creator's packaging (title, thumbnail and description, judged together) the same way every time, so findings from different creators can be compared and added to the playbook.

## Data

Collect with `python3 <skill-dir>/scripts/fetch_videos.py <out>/<creator> --channel @handle --baseline 30 --all-dossiers`. That gives:
- `baseline.tsv`: the latest 30 long-form uploads, with outlier ratios;
- `<id>/dossier.json`: full description, real links, chapters, exact views, likes and publish date;
- `<id>/thumb.jpg`: the thumbnail.

Study the latest 5 in depth (the "deep five"). Use all 30 for counts and to judge whether a video overperformed. The outlier ratio is views ÷ the median of the 10 uploads either side. Below about 0.7 is under, 0.7–1.4 normal, over 1.4 over, and 2 or more a hit.

Look at every thumbnail image. Don't infer the thumbnail from the title.

## 1. Title (score every video in the 30)

| Field | Record |
|---|---|
| `chars` / `words` | length. Note if over 60 characters, since mobile cuts long titles. |
| `front_keyword` | the first noun, tool or topic word, and its position (word number) |
| `formula` | one tag from the formula list below, or a new one you name |
| `intent` | `search` (someone would type this), `browse` (curiosity or news, made for the feed) or `both` |
| `specifics` | numbers, money, time, counts, the year |
| `named` | brands or tools named |
| `caps_words` | words in ALL CAPS (e.g. EVEN, HUGE, WAY) |
| `punct` | … .. ( ) : ? ! |
| `emotion` | e.g. awe, fear or loss, greed or gain, controversy, FOMO, relief, status |
| `promise` | in under 8 words, what the viewer gets |
| `hook_gap` | what's withheld so you have to click (or "none") |

Starting formula tags (extend them as you find new ones):
- `how-to` ("How to X")
- `how-i` ("How I X")
- `i-tested` ("I Tested / I Spent N Hours…")
- `x-is-insane-but-y` ("X Is Insane… But Y Is EVEN Bigger")
- `x-just-changed` ("X Just Changed / Just Got N Upgrades")
- `zero-to-number` ("$0 to $X")
- `ranked` ("I Ranked…")
- `what-id-do-instead`
- `explained`
- `full-course`
- `secret-or-exposed` ("How X Brainwash You")
- `new-era` ("The New Era of X")
- `listicle-n`
- `warning`
- `reaction-news`

## 2. Thumbnail (deep five in detail; the 30 for layout counts)

- Layout: the ten from `references/design/playbook.md` §3, or a new one you name and describe.
- The playbook's ten elements: line length and case, face and pose, hero object, proof, colour and accent, arrow or underline, background, readability at 168px.
- **Thumbnail line vs title**: `complements` (adds a verdict or emotion), `repeats` (same words) or `none` (no text).
- What would make someone click: one sentence.

## 3. The pair

- What the title carries vs what the thumbnail carries. Do they split the job, or duplicate it?
- The single promise of the package, and whether the description's first line restates or extends it.

## 4. Description (all 30 for structure counts; the deep five verbatim)

| Field | Record |
|---|---|
| `above_fold` | the first 1–2 lines, verbatim (shown in search and above "...more") |
| `first_line_job` | `summary`, `hook`, `CTA`, `keyword sentence` or `link` |
| `ctas` | list in order: lead magnet, community, course or offer, service, socials, sponsor, affiliate |
| `first_link_position` | which line the first link is on |
| `links` | count and kinds (own offer, socials, affiliate, sponsor, tools) |
| `chapters` | yes/no, count, whether it starts at 0:00, and the naming style (keyword-rich, curiosity, plain) |
| `hashtags` | count and which |
| `boilerplate` | blocks repeated across videos. Quote the template once. |
| `disclosure` | affiliate or sponsor wording, if any |
| `length` | characters |
| `keywords` | whether the title's keyword is repeated in the description, and where |

## 5. Performance context

For each deep-five video: views, likes and like rate, outlier ratio, and days since publish. Note title changes if seen. Compare the hits and misses inside the 30: which formula, layout and description patterns cluster among the 1.4+ videos vs the under-0.7 ones? With 30 videos, call these **signals**, not laws.

## 6. Output per creator

1. `teardown.json`: one object per video (all 30), with the fields above. Deep-five videos also get thumbnail, pair and description details.
2. `teardown.md`:
   - a one-paragraph style signature;
   - the deep five, each with its thumbnail, title and description notes;
   - title formula counts with median outlier ratio;
   - description template(s), quoted;
   - hits vs misses;
   - five "steal this" rules, each citing videos by index.

Keep "the data shows" separate from "my read", and name confounds (topic heat, format, series).

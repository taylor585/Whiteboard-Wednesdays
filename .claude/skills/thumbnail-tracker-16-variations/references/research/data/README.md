# Research data (collected 12 October 2026)

This is the raw evidence behind `references/research/overview.md` and `references/research/creators.md`. Use it to check a figure, or to answer "how did X do" without fetching anything. YouTube views keep moving, so for anything current, fetch fresh data with `scripts/fetch_videos.py` or `scripts/track_channel.py`.

| File | What it holds |
|---|---|
| `<creator>-all-uploads.tsv` | Every upload on the channel (Nick 320, Sabri 473, Riley 194), with these columns: `index` (1 = newest), `id`, `views`, `duration_s`, `outlier` (views ÷ median of the 10 uploads either side) and `title`. Same format as `scripts/track_channel.py`'s `videos.tsv`. |
| `<creator>-latest30.json` | Teardown of the latest 30 long-form uploads: title fields (formula, intent, specifics), thumbnail notes, description, likes, outlier. The field names vary a little by analyst (e.g. `like_rate` vs `like_rate_pct`). |
| `<creator>-top20.json` | Teardown of the all-time top 10 by views plus the top 10 breakouts (≥180s). It has `videos[]` (bucket, title_formula, thumb words/text/face/objects/layout, desc above_fold/cta/chapters/hashtags) and `rules[]` (rule, evidence, confidence, vs_recent). |

Creators: `nick` = Nick Saraev (@nicksaraev), `sabri` = Sabri Suby (@SabriSubyOfficial), `riley` = Riley Brown (@rileybrownai).

## Recompute a group

Tag videos by index range or id, then run the tracker's group stats:

```bash
printf '1-60\tlatest-60\n' > tags.tsv
python3 <skill-dir>/scripts/group_stats.py <skill-dir>/references/research/data/nick-all-uploads.tsv tags.tsv
```

For title-pattern medians (e.g. every title containing "course"), filter the TSV in Python and take the median of `outlier` for rows with `duration_s` ≥ 180. That's how the cross-creator figures in `references/research/overview.md` were computed.

## Caveats

- Hidden view counts are blank, and are left out of medians.
- Ratios for the newest ~5 uploads are still settling.
- Old breakouts on small channels are inflated (see `references/research/overview.md`, Method).

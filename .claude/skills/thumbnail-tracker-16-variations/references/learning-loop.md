# Learning loop: what happened after publishing

The research gives defaults. The user's own results are the real test. Log every published package and review it, so the rules can be tuned to this channel.

## After each upload

1. **Record the package** in `examples/packaging-log.csv` (or the user's own copy):
   - date;
   - the title as published;
   - characters;
   - formula;
   - thumbnail and layout;
   - whether it differs from the recommendation.
2. **At 48 hours,** read YouTube Studio → Analytics → Reach:
   - impressions click-through rate vs the channel's average;
   - views;
   - average view duration.

   Log the CTR.
3. **If CTR is below the channel average after 48 hours:**
   - Thumbnail: use Test & Compare with up to 3 thumbnails, or swap to the B thumbnail. Keep the title the same while testing the thumbnail.
   - Title: swap to the next A/B title. Keep the main search term the same, so search ranking isn't reset. Nick retitled one video three times in two days, keeping the "Viral … Repo" skeleton and changing only the proof frame.
4. **At 7 and 30 days,** log views and the outlier ratio (views ÷ the median of the 10 uploads either side, from `scripts/track_channel.py` on the user's channel).

## Reviewing the log (every ~10 uploads)

- Run `scripts/track_channel.py` on the user's channel. Tag the uploads by title formula and thumbnail layout (`tags.tsv`), then run `scripts/group_stats.py` for the median outlier per group.
- Compare the user's own winners with `references/research/overview.md`. Where the channel's data disagrees with a research rule, the channel wins. Note it in `references/brand/house-style.md`.
- Things to test first (from `references/research/overview.md` §5):
  - thumbnail line that complements vs repeats the title;
  - light vs dark thumbnails;
  - time-box titles on the user's core topic;
  - year refresh on evergreen videos;
  - the course-length threshold.

## Open item

- **ICP Buyer Research,** published 13 Oct 2026 with Taylor's title "I Built an ICP Research AI Agent That Finds Your Ideal Clients On Meta" and the D1 Spotlight thumbnail. CTR at 48 hours is not logged yet.

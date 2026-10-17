# Start using Trending Topics v3

Say this to Claude Code:

> Use Trending Topics. Find this week's 6 topics from what our creators have proven.

When the pick sheet arrives, reply with your three:

> Go with 1, 3 and 4. Plan the week.

Topics come from the creators only. Once you pick, the skill pulls our own work in as talking points, then you get a week overview and three Trending Topic Briefs in the chat. Each brief has a READ BEFORE YOU RECORD block at the top: read it, open what it lists, and record. Each brief ends with PACKAGING: three titles to A/B test, a thumbnail line for each, and the description.

Other things you can ask:

- "Build the brief for [topic or skill]." One brief.
- "Write titles and a description for this video." Packaging only.
- "What's working for my creators this fortnight?" Scan only.
- "One will be [title]." Saves your title as chosen and fills the other slots.
- "Add @handle to the creator list." Creators.

## First run on a machine

```bash
python3 --version              # 3.10 or newer
pip install -r requirements.txt   # optional: yt-dlp for outlier ratios; the scan works without it (RSS only)
python3 scripts/scan_creators.py --out /tmp/tt-scan --days 14
python3 tests/test_skill.py
python3 scripts/check_brief.py examples/harness-brief.md
```

Pick needs only the creator scan. The talking points step (after you pick) uses Claude Code's session tools; if those are missing, the skill reads local transcripts or asks you for a short note of what we did on the topic.

## Install on claude.ai

Upload `trending-topics.skill` in Settings > Capabilities > Skills. The scanner needs network access to YouTube; the talking points step works best in Claude Code.

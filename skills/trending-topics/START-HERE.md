# Start using Trending Topics v5

Say this to Claude Code:

> Use Trending Topics. Sunday run: give me next week's 7 videos.

When the pick sheet arrives, swap any day you don't like, then:

> Lock them in. Write the briefs.

Or lock your own title at any time:

> "Grok Voice WILL Replace Sales Reps!" is locked in.

After recording:

> We recorded the Grok video.

That marks it recorded, so it never comes back as a suggestion.

Every Sunday:

> Sunday run: plan next week's 7 videos.

You get **This week: 7 videos** (one per day, Monday to Sunday) drawn from three engines: 1. Twitter engine (the last 10 X posts of 30 AI and paid-media giants), 2. My work engine (every session, repo and skill from the last 30 days), 3. YouTube engine (the creators' breakout videos). Swap any day, then you get a Trending Topic Brief for each in the chat.

To study one giant:

> Study Karpathy's last 10 posts.

Each brief has a READ BEFORE YOU RECORD block at the top: read it, open what it lists, and record. Each brief ends with PACKAGING: three titles to A/B test, a thumbnail line for each, and the description.

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
python3 scripts/version_check.py
python3 tests/test_skill.py
python3 scripts/check_brief.py examples/harness-brief.md
```

My work engine uses Claude Code's session tools and GitHub; if those are missing, the skill reads local transcripts or asks you for a short note of what we did on the topic.

## Install on claude.ai

Upload `trending-topics.skill` in Settings > Capabilities > Skills. The scanner needs network access to YouTube; My work engine works best in Claude Code.

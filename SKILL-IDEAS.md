# Skill ideas: ten topics from Trending Topics

Topics has a switch in Sparks: **Creators** (creator uploads) or **Skill ideas** (ten topics written by the Trending Topics skill).
Taylor chose this on 2 November 2026: layout SI-A, five ideas from his own work and five from creators, and "Shortlist and lock".

The app cannot run the skill itself: the skill reads Claude Code sessions, repositories and skills, which only a Claude Code session can reach.
Since 11 November 2026 the page starts that session itself, in the cloud, through Taylor's Claude Code Remote connector (`create_session`, the same call Publish and the watchlist Refresh make); no local connector is involved.

## What the app does

1. **Ask the skill for 10 topics** writes `ideaRuns/<id>` to the app artifact's database with `status: "requested"`, `skill: "trending-topics-talking-points"`, `mix: "five-and-five"`, `count: 10`.
2. **Get ideas** then starts a Claude Code session with the prompt `Run topic ideas <id>. Follow SKILL-IDEAS.md in this repository exactly.` and saves `status: "starting"` and `session: {id, url, startedAt}` on the run. Sparks shows "Claude is finding ideas." with Open the session.
   Only if the connector is refused or unavailable does it save `status: "waiting"` and `note`, and show the line to send, `Run topic ideas <id>`, with Copy and Try again (Try again starts a session for the same run).
3. When the document turns `done`, Sparks lists the ideas ranked 1 to 10.
4. **+ Shortlist** creates a topic with the idea's title word for word, `status: "shortlisted"`, `origin: {kind: "skill", runId, ideaId, source, why}` and `skillLock: "pending"`, and records it in the run's `added` map.

## Steps for the session ("Run topic ideas <id>")

1. Read `ideaRuns/<id>` from the app artifact (https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea) with ArtifactData. Set `status: "running"` first, before any other step, leaving `session` as the app wrote it.
2. **Lock pending titles first.** For every document in `topics` with `skillLock: "pending"`, run the skill's `scripts/topics.py lock "<title>"` with the title exactly as stored, then set `skillLock: "locked"` and `lockedAt`.
3. Run the Trending Topics - Talking Points skill (5.4.1, `.claude/skills/trending-topics-talking-points`, replaced Trending Topics on 11 November 2026) Pick step, giving every idea its 4 main talking points: Table One (Taylor's own work, last 30 days) and Table Two (creator breakouts).
4. Keep the top five rows of each table, in the skill's own order, and interleave them as ranks 1 to 10 (own, creator, own, ...).
   Each idea is `{id: "i1".."i10", rank, title, why, source: "own" | "creator"}`.
   `title` is the skill's title word for word; `why` is one line from the skill's evidence (under 160 characters).
   Never invent an idea: if a table has fewer than five rows, write what it has and say so in `note`.
5. Write `status: "done"`, `finishedAt`, `ideas`, and `note` if needed, pinned to the version you read.
6. If the run cannot finish, write `status: "failed"` and `error` (one plain sentence Taylor can act on). The last good run stays on screen.

Never touch other topics, creator notes or settings while doing this.

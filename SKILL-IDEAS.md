# Skill ideas: Ask on Inspiration

Inspiration (`#/watchlist`, A3 "Depth by paper", 13 November 2026) is where new video ideas are found.
Its command field has two verbs: **Refresh creators** (the watchlist scan, SCAN.md) and **Ask**, which runs the Trending Topics skill and is described here.
Topics (`#/topics`) is now only the review step: it no longer asks the skill for ideas.

The app cannot run the skill itself: the skill reads Claude Code sessions, repositories, skills and X, which only a Claude Code session can reach.
The page starts that session itself, in the cloud, through Taylor's Claude Code Remote connector (`create_session`, the same call Publish makes).

## What the app does

1. **Ask** writes `ideaRuns/<id>` to the app artifact's database:
   `{status: "requested", skill: "trending-topics-talking-points", mode, prompt, count, mix, createdAt, ideas: [], added: {}, dismissed: {}}`.
   - `prompt`: what Taylor typed in the field, trimmed, up to 500 characters. `""` when he only pressed a chip, or pressed Ask with an empty field.
   - `mode`: the chip pressed, or `ask` for typed words alone. An empty Ask is `week7`.

     | mode | chip | count | mix |
     | --- | --- | --- | --- |
     | `week7` | This week's 7 | 7 | `week` |
     | `giants` | What the giants said on X | 10 | `x` |
     | `mywork` | From my work | 10 | `own` |
     | `breakouts` | Creator breakouts | 10 | `creator` |
     | `month30` | Plan the month (30) | 30 | `month` |
     | `ask` | (typed words only) | 10 | `mixed` |

   - `count`: how many ideas to write. `mix` is a summary of the mode, kept for older readers.
   - `dismissed`: `{ideaId: true}` for ideas Taylor dismissed on Inspiration (the run is never deleted). The page writes it; the session leaves it alone.
2. It then starts a Claude Code session with the prompt `Run topic ideas <id>. Follow SKILL-IDEAS.md in this repository exactly.` and saves `status: "starting"` and `session: {id, url, startedAt}` on the run. Inspiration shows the run as a group: Starting, then Running with the elapsed time against "about 15 minutes" and Open the session.
   If the connector refuses or is unavailable it saves `status: "waiting"` and `note`; if the connector has not answered within 60 seconds the page saves `status: "waiting"` itself and keeps the call open (if it later starts, the run moves on to `starting`). Either way the group shows the line to send, `Run topic ideas <id>`, with Copy and Try again (Try again starts a session for the same run).
3. When the document turns `done`, the group lists the ideas in rank order, each with its 4 talking points.
4. **Spark** creates a topic with the idea's title word for word, `status: "shortlisted"`, the idea's talking points as the topic's `points`, `origin: {kind: "skill", skill, runId, ideaId, source, why}` and `skillLock: "pending"`, and records it in the run's `added` map. A topic with the same title (ignoring case and punctuation) is reused, never doubled. **Add to schedule** does the same and books the next free Monday, Wednesday or Friday (`status: "planned"`).

Runs written before 13 November 2026 have no `mode`, `prompt`, `points` or `dismissed`, and `source: "own"` for Taylor's work: Inspiration still shows them (as "Ten topics", without the talking points disclosure), and Spark still works.

## Steps for the session ("Run topic ideas <id>")

1. Read `ideaRuns/<id>` from the app artifact (https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea) with ArtifactData. Set `status: "running"` and `runningAt` first, before any other step, leaving `session` as the app wrote it.
2. **Lock pending titles first.** For every document in `topics` with `skillLock: "pending"`, run the skill's `scripts/topics.py lock "<title>"` with the title exactly as stored, then set `skillLock: "locked"` and `lockedAt`.
3. Run the Trending Topics - Talking Points skill (`.claude/skills/trending-topics-talking-points`) for the run's `mode`, honouring `prompt` when it has words (it narrows or steers the search; it never replaces the skill's evidence rules):
   - `week7`: the Sunday run's shape, 7 ideas, one a day, from all three engines.
   - `giants`: the Twitter engine only (the last posts of the AI and paid-media giants), 10 ideas.
   - `mywork`: the My work engine only (the last 30 days of sessions, repositories and skills), 10 ideas.
   - `breakouts`: the YouTube engine only (creator breakouts), 10 ideas.
   - `month30`: the month run, the best 30 videos.
   - `ask`: all three engines, answering the prompt, 10 ideas.
   Older runs with no `mode` keep the old shape: five from Taylor's own work and five from creators, interleaved.
4. Write exactly `count` ideas (fewer only when the evidence runs out; then say so in `note`). Each idea is:
   `{id: "i1".., rank, title, why, source, points, tag?, evidence?}`
   - `title`: the skill's title word for word.
   - `why`: one line (under 160 characters) from the skill's evidence. Wrap the evidence words in `[[ ]]` (for example `Agent memory is the week's thread: [[3 giants]] talk on it.`); Inspiration draws them as highlight marks and the topic keeps the plain words. Paraphrase posts and say so.
   - `source`: `"creator"`, `"work"` or `"x"`, the engine the idea came from.
   - `points`: exactly 4 short talking points (strings, under 120 characters each), in recording order.
   - `tag` (optional): a short label for the source line, such as `breakout format`, `working` or `Karpathy +2`.
   - `evidence` (optional): `{videos: [YouTube video ids], handles: ["@creator" or X handles], posts: [post links]}`.
   Never invent an idea, a figure or a quotation.
5. While it runs, the session may write `progress: [{label, done, total, note?}]` (up to four rows, for example `{label: "X giants", done: 96, total: 160}`); Inspiration draws them as tick meters. Without it the group shows only the elapsed time.
6. Write `status: "done"`, `finishedAt`, `ideas`, and `note` if needed, pinned to the version you read.
7. If the run cannot finish, write `status: "failed"` and `error` (one plain sentence Taylor can act on). The last good run stays on screen.

Never touch other topics, creator notes, settings or the run's `added` and `dismissed` maps while doing this.

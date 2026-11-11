# Talking points and Briefs: the two session lines

Taylor asked for this on 11 November 2026: "add a new screen after Topics called 'Talking Points' ... it should generate a really sharp, one-page brief ... after Talking Points, add a 'Briefs' page ... record directly from that page, or click 'Turn into presentation'".

The app cannot research the web or build a deck itself, so each button writes a request into the app artifact's database and starts a Claude Code session through Taylor's Claude Code Remote connector (the same `create_session` call Publish uses).
If the connector is refused, the screen shows the line to send in a Claude chat instead.
This file is what that session follows.

## What the app does

- **Talking points** (`#/talking-points`, `public/talking-points.js`) lists every topic with `status: "shortlisted"`, plus every topic with a `recordDate` that has not posted, booked ones first by recording day.
  Each row shows the topic's `points`, numbered 01 to 04, or "No outline yet".
- **Create outline** writes `briefs/<topicId>` as `{topicId, title, status: "requested", createdAt, requestedAt, updatedAt}` (or updates `status`, `requestedAt` and clears `error` on an existing brief, keeping its last `sections`), then starts a session with the prompt `Create talking points <topicId>. Follow TALKING-POINTS.md in this repository exactly.` and saves `status: "starting"` with `session: {id, url, requestedAt, startedAt}`.
- **Briefs** (`#/briefs`, `#/briefs/<topicId>`, `public/briefs.js`) shows ready briefs, newest recording day first, and the ones still being written.
  One brief is one ruled page with Recording view, Print and **Turn into presentation**.
- **Turn into presentation** updates the brief with `deck: {status: "requested", requestedAt}`, starts a session with `Build deck from brief <topicId>. Follow TALKING-POINTS.md in this repository exactly.` and saves `deck: {status: "starting", requestedAt, session: {id, url, startedAt}}`.
  The page shows Open presentation as soon as the brief's `deck.deckId` or the topic's `deckId` is set.

## The brief document

Collection `briefs`, document id = the topic id.

```text
{topicId, title,
 status: 'requested' | 'starting' | 'running' | 'ready' | 'failed',
 error,                                   one plain sentence Taylor can act on, only when failed
 session: {id, url},
 createdAt, updatedAt,
 sections: {
   atAGlance: string,                     one or two sentences: who it is for, and the promise
   coldOpen: string,                      the first 30 to 45 seconds: what to show and the opening line
   points: [{title, beats: [string], proof: string}],   exactly 4; 2 to 4 beats each; proof names the source or demo
   close: string,                         the call to action and the next video
   prep: [string]                         3 to 6 things to have open, ready or checked before recording
 },
 sources: [{title, url}],
 deck: {status, session, deckId, error}}
```

The page shows `sections` as written: plain text, no Markdown, no HTML.

## Rules for both lines

- Read and write the app artifact https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea with ArtifactData only.
- Every write is pinned to the version you read (`if_version`). If it is refused because the document changed, read it again and redo that one write once. If it is refused a second time, stop and report it.
- Plain UK English. No em dashes or double hyphens in anything written to the database.
- Never post anything, never change a topic's `title`, `status`, `recordDate` or `postDate`, and never touch other topics, jobs, settings or creator notes.
- Never invent facts, figures, quotes, links or dates. When something cannot be verified, say so in the brief ("Not confirmed: ...") or leave it out.

## "Create talking points <topicId>"

1. Read `topics/<topicId>` and `briefs/<topicId>`. If either is missing, write nothing and report it. Write `status: "running"` (keep the `session` the app saved) and `updatedAt`.
2. Use the Trending Topics - Talking Points skill (`.claude/skills/trending-topics-talking-points`): its master rules (never invent, every market claim carries its URL, the claim ladder for anything of ours, say the caveats) and its rule that every video gets 4 main talking points.
   The brief written here is the app's one-page shape above, not the skill's full Trending Topic Brief. Use the full format's thinking (the promise, the hook, the run order, what to verify) to fill it.
3. Research the topic on the web so the content is current and specific.
   For a "what's new" or "just changed" topic, list what actually changed, with the date and the source for each change; prefer the maker's own release notes, help pages and announcements, then reputable reporting.
   For an opinion or method topic, find what is current and what the leading creators are saying, and say where our own work proves the point.
   Keep every URL you rely on for `sources` (3 to 8, the ones a viewer could open).
4. **The 4 talking points.** Write exactly 4 to the topic's `points` as `{id, title, note, done: false, position}` (positions 0 to 3).
   If the topic already has points, Taylor wrote them: keep each one's `id`, `title` and `done` and improve around them (fill `note`, add only what is missing to reach 4, put them in the best order). If he wrote more than 4, keep all of his and do not add any.
   Write the topic with `points` and `updatedAt` only.
5. **The brief.** Write `sections` in the shape above, with `sections.points` matching the topic's 4 points in the same order (the same titles).
   Make it sharp: one idea per point, beats that are things to say or show, a proof line that names the source, screenshot or demo. The whole page should read in about two minutes.
   Put anything that must be checked before recording in `prep`.
6. Write `sections`, `sources`, `status: "ready"`, `error: null` and `updatedAt` in one write.
7. If the run cannot finish (no reliable sources, a refused write), write `status: "failed"` and `error`. A brief that was ready before keeps its old `sections`.

## "Build deck from brief <topicId>"

1. Read `briefs/<topicId>` and `topics/<topicId>`. The brief must have `sections` with 4 points; if not, write `deck: {status: "failed", error: "The brief is not written yet."}` and stop.
   Write `deck.status: "running"` (keep `deck.session`).
2. Use the Whiteboard Wednesdays skill in this repository (`.claude/skills/whiteboard-wednesdays`, version 2.0.0). Read its SKILL.md and the references it names before building.
   - **Brand.** The skill asks which brand a deck uses and never marks a brand confirmed by itself. A deck built from a brief uses the brand Taylor confirmed for his Whiteboard Wednesdays videos only when a confirmed profile in the repository covers it. If none does, write `deck: {status: "failed", error: "Which brand should this deck use? Reply in a Claude chat, then press Turn into presentation again."}` and stop.
   - **Story.** The brief is the approved outline: the cold open opens the deck, each talking point is a chapter, its proof becomes the evidence slide, the close is the last slide. Keep the brief's wording where it is a line Taylor will say. Apply the variety rule and the five simplicity passes.
   - **Evidence.** Show each source exactly as the skill's evidence rules require. A claim the brief marks "Not confirmed" is not put on a slide.
3. Add the deck through `public/presentations.js` as CLAUDE.md "Skill integration" says: a unique stable id (`brief-<short-title>`, checked against every existing id), the deck's own published brand profile, local assets with unique file names, a reading page, no test fixtures.
   Validate it, test it at 375, 390, 768 and 1280px (every slide to the last, direct links, back and forward, no sideways scroll, no page errors), open a pull request, merge it, then republish the app artifact with `public/index.html` and every changed file from `public/` at the same published paths, with `capabilities` omitted.
4. Write `deckId` on `topics/<topicId>` (with `updatedAt`), then `deck: {status: "ready", deckId, session}` on the brief.
5. On any failure, write `deck: {status: "failed", error, session}` with one sentence saying what stopped it. Never leave a half-registered deck on main.

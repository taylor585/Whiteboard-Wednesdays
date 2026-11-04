# Publish jobs: what the Claude Code session does

Taylor pastes Drive links on **Publish** and presses **Generate Variety Pack**.
The app saves `jobs/<id>` in its own artifact database (https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea) and starts a Claude Code session in the cloud by itself, through Taylor's Claude Code Remote connector (3 November 2026).
That session's first message is `Run Publish job <id>`; after Taylor's picks, **Continue** starts another with `Continue Publish job <id>`.
If the connector is refused, Taylor sends the same line in a chat. Either way, follow this file exactly.

## The job document

- `title`, `brief`: what the video is about, in Taylor's words.
- `sources`: Drive links, each `{url, driveId, role: "main" | "reel"}`; exactly one main recording (landscape, 32:9 or 16:9; the house recording is 3840x1080, screen plus camera) and up to five phone reel recordings (upright, 9:16 once the rotation flag is applied). The app refuses folders, Docs links, duplicates and more than six links before a job is saved.
- `topicId`: the saved topic this video belongs to, or null if Taylor did not link one.
- `startedAt`: when Taylor pressed Generate. `session: {id, url, step, requestedAt, startedAt}`: when the app asked for the session and when it opened. Do not change these.
- `skills`: the skill chosen for each job in Settings. Use **exactly these skills**, by these names, with the Skill tool:
  - `publishEdit` (default `suby-shots-with-katana` since 4 November 2026): the edit and its **Suby Shots - Variety Pack**.
  - `publishThumbs` (for example `thumbnail-tracker`): thumbnails.
  - `publishPosts` (for example `performance-poster`): titles, descriptions and posts.
  If a field is missing, use the default from `public/settings.js`. Never swap in a different skill or recreate one from memory.
- `status`: `queued` → `starting` → `running` → `pack` → `finishing` → `final`. `failed` with `error` if it cannot finish. The app sets `starting` and `finishing` itself, only after the session has opened.
- `stages`: the progress list the Publish screen shows: `[{name, detail, state: "wait" | "run" | "done" | "failed", startedAt, endedAt}]`. Write it as you go; never write a stage you have not done.
- **Stage times are real.** Take `startedAt` from `date -u +%Y-%m-%dT%H:%M:%SZ` at the moment the stage starts, and `endedAt` the same way at the moment it ends. Never round, estimate or backfill a time, and never write a time from before this session opened.
- The Publish screen shows "Claude Code has not reported back" when a job stays on `starting` for 10 minutes, or on `running` or `finishing` with no new stage time for 90 minutes. Start or end a stage at least that often; split a long render into stages if you need to.
- **Taylor can stop a job.** His Stop button writes `status: "failed"`, `error: "Stopped by Taylor"`. Re-read the job before each stage; if it says that, stop at once and write nothing more.

Write to the job with ArtifactData, pinned to the version you read (`if_version`). Never touch other jobs, topics, creator notes or settings.

## Run Publish job <id>

1. Read `jobs/<id>`. Set `status: "running"` and the first stage.
2. Download each source from Drive: `curl -L "https://drive.usercontent.google.com/download?id=<driveId>&export=download&confirm=t" -o <file>` into the scratchpad. Check it is a video with `ffprobe`. If a file will not download, fail the job with "File <n> is not shared as Anyone with the link."
3. Invoke the `publishEdit` skill with the Skill tool and follow it as written, with these answers so it never waits on a question the app has already answered:
   - **Brand:** the Pecuna Factorem house brand from CLAUDE.md (white, ink #1C1A17, gold #8B6002, highlight #F6DF8C, Caveat, Instrument Sans, IBM Plex Mono, the official coin), unless the job has a `brand` field. Say on the pack which brand was used.
   - **What the video is about:** `title` and `brief`.
   - Its master rules still hold: never an AI voice, short-form never cut from the YouTube video.
4. Build the skill's **Suby Shots - Variety Pack** exactly as the skill does in a chat (its `build.py` checks, the exact name, `capabilities: {db: {}}`), and publish it as its own private artifact.
   Thumbnail and post options come from `publishThumbs` and `publishPosts` and go on the same pack when the skill's pack has a place for them.
5. Write `packUrl` (the pack's claude.ai link), `status: "pack"` and the finished stages to the job. The Publish screen then shows **Open the Variety Pack** and Continue. The session's work ends here.

## Continue Publish job <id>

1. Read `jobs/<id>` and its `packUrl`. Read the pack's `decisions` collection with ArtifactData (the skill's own step "Decide").
   If `decisions` is empty, fail the job (`status: "failed"`, `failedStage: "Read the picks"`, `error: "No picks found on the Variety Pack yet. Make your picks there, then press Continue again."`) and stop. Never build a final from designs Taylor has not approved. The Publish screen keeps Open the Variety Pack and Continue on a failed job that has a `packUrl`.
2. If decisions ask for changes, run the skill's redo round on the **same pack URL**, set `status: "pack"` again and stop.
3. Otherwise set `status: "finishing"`, build the finals with the same skills, upload them to Drive, and write `finals: [{platform, label, url, detail}]` and `status: "final"`.
4. Nothing is ever posted. Post all stays off until the platform connections exist.

## If something fails

Write `status: "failed"`, `error` (one sentence Taylor can act on), `failedStage` (the stage's name) and that stage's `state: "failed"` with its real `endedAt`. Do not leave a job on `running`. The Publish screen shows the error and the stage, and frees Start a new video.

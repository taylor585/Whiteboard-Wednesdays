# Publish jobs: what the Claude Code session does

Taylor pastes Drive links on **Publish** and presses **Generate Variety Pack**.
The app saves `jobs/<id>` in its own artifact database (https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea) and starts a Claude Code session in the cloud by itself, through Taylor's Claude Code Remote connector (3 November 2026).
That session's first message is `Run Publish job <id>`; after Taylor's picks, **Continue** starts another with `Continue Publish job <id>`.
If the connector is refused, Taylor sends the same line in a chat. Either way, follow this file exactly.

## The job document

- `title`, `brief`: what the video is about, in Taylor's words.
- `sources`: Drive links, each `{url, driveId, role: "main" | "reel"}`; exactly one main (16:9), up to five reels (9:16).
- `skills`: the skill chosen for each job in Settings. Use **exactly these skills**, by these names, with the Skill tool:
  - `publishEdit` (for example `suby-shots-master-poster`): the edit and its **Suby Shots - Variety Pack**.
  - `publishThumbs` (for example `thumbnail-tracker`): thumbnails.
  - `publishPosts` (for example `performance-poster`): titles, descriptions and posts.
  If a field is missing, use the default from `public/settings.js`. Never swap in a different skill or recreate one from memory.
- `status`: `queued` → `starting` → `running` → `pack` → `finishing` → `final`. `failed` with `error` if it cannot finish.
- `stages`: the progress list the Publish screen shows: `[{name, detail, state: "wait" | "run" | "done", startedAt, endedAt}]`. Write it as you go; never write a stage you have not done.

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
2. If decisions ask for changes, run the skill's redo round on the **same pack URL**, set `status: "pack"` again and stop.
3. Otherwise set `status: "finishing"`, build the finals with the same skills, upload them to Drive, and write `finals: [{platform, label, url, detail}]` and `status: "final"`.
4. Nothing is ever posted. Post all stays off until the platform connections exist.

## If something fails

Write `status: "failed"`, `error` (one sentence Taylor can act on) and the stage that failed. Do not leave a job on `running`.

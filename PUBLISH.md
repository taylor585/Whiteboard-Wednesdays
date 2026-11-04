# Publish jobs: what the Claude Code session does

Taylor pastes one Drive folder link (or file links) on **Publish** and presses **Generate Variety Pack**.
The app saves `jobs/<id>` in its own artifact database (https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea) and starts a Claude Code session in the cloud by itself, through Taylor's Claude Code Remote connector (3 November 2026).
That session's first message is `Run Publish job <id>`; after Taylor's picks, **Continue** starts another with `Continue Publish job <id>`.
If the connector is refused, Taylor sends the same line in a chat. Either way, follow this file exactly.

## The job document

- `title`, `brief`: what the video is about, in Taylor's words. `titleBy: "taylor"` when he typed or confirmed it; null when he pasted a folder and left the title empty (it then comes from the folder name, and he confirms it on Check the files).
- `source`: `{kind: "folder", folderId, url}` when Taylor pasted one Drive folder, or `{kind: "files"}` for file links.
- `sources`: the files, each `{url, driveId, role: "main" | "reel" | "skip", roleBy, check, name, kind, decision, reason, probe, confirmedAt}`. For a folder job it starts empty and the Check the files stage fills it. For file links it starts with the role Taylor chose and `check: "pending"`. There is exactly one main recording (landscape, 32:9 or 16:9; the house recording is 3840x1080, screen plus camera). `reel` files are phone reel recordings (upright, 9:16 once the rotation flag is applied), at most five. `skip` files are left out.
- `reelTakes`: the `driveId`s of the reel recordings. They wait for the reel winners (see "Main recording and reel recordings").
- `folderName`, `checkAt`, `checkNote`, `checkedAt`: written by Check the files (the first three) and by Taylor's Confirm (`checkedAt`).
- `topicId`: the saved topic this video belongs to, or null if Taylor did not link one.
- `startedAt`: when Taylor pressed Generate. `session: {id, url, step, requestedAt, startedAt}`: when the app asked for the session and when it opened. Do not change these.
- `skills`: the skill chosen for each job in Settings. Use **exactly these skills**, by these names, with the Skill tool:
  - `publishEdit` (default `suby-shots-with-katana` since 4 November 2026): the edit and its **Suby Shots - Variety Pack**.
  - `publishThumbs` (for example `thumbnail-tracker`): thumbnails.
  - `publishPosts` (for example `performance-poster`): titles, descriptions and posts.
  If a field is missing, use the default from `public/settings.js`. Never swap in a different skill or recreate one from memory.
- `status`: `queued` → `starting` → `running` (→ `check` → `starting` → `running`) → `pack` → `finishing` → `final`. `failed` with `error` if it cannot finish. The app sets `starting` and `finishing` itself, only after the session has opened.
- `stages`: the progress list the Publish screen shows: `[{name, detail, state: "wait" | "run" | "done" | "failed", startedAt, endedAt}]`. Write it as you go; never write a stage you have not done.
- **Stage times are real.** Take `startedAt` from `date -u +%Y-%m-%dT%H:%M:%SZ` at the moment the stage starts, and `endedAt` the same way at the moment it ends. Never round, estimate or backfill a time, and never write a time from before this session opened.
- The Publish screen shows "Claude Code has not reported back" when a job stays on `starting` for 10 minutes, or on `running` or `finishing` with no new stage time for 90 minutes. Start or end a stage at least that often; split a long render into stages if you need to.
- **Taylor can stop a job.** His Stop button writes `status: "failed"`, `error: "Stopped by Taylor"`. Re-read the job before each stage; if it says that, stop at once and write nothing more.

Write to the job with ArtifactData, pinned to the version you read (`if_version`). Never touch other jobs, topics, creator notes or settings.

## Main recording and reel recordings (master rule 4)

- Only the one source with `role: "main"` goes to the `publishEdit` skill as the recording for YouTube and LinkedIn. Its kind is `youtube-recording`, or Taylor confirmed it on Check the files.
- Never use a `reel` file as the main, and never give a reel file to the YouTube or LinkedIn edit.
- Never cut a reel, Short or Instagram or Facebook video from the main recording. The only material from it that may reach a reel is the skill's own silent, face-free screen-share tool.
- Reel recordings (`reelTakes`) are used only after Taylor picks the reel winners. Before one is used as a reel's face or voice, it must pass the skill's `youtube_guard check-media` (and `check-words` after transcription).
- `skip` files are never downloaded or used.

## Check the files (the first stage of every Run)

This stage only reads a few MB of each file. It never downloads a full file and never starts the edit.

1. Skip this stage when every source has `confirmedAt` (Taylor pressed Confirm and continue). Go straight to Run step 2.
2. **Folder job** (`source.kind: "folder"`, `sources` empty): run
   `python3 -I scripts/classify-video.py --drive-folder <folderId> > check.json`.
   It lists the folder from `https://drive.google.com/embeddedfolderview?id=<folderId>` (no key) and classifies every file.
   - Copy its `sources` to the job, each with `check: "done"`, and `folderName`.
   - Its roles are a proposal only. Exactly one landscape recording with sound, 5 minutes or longer, becomes `main`. Phone recordings become `reel`. Everything else is `skip`. When several files could be the main, none is chosen and each is `ask`.
   - If the folder cannot be listed, fail the job: "The folder is not shared as Anyone with the link, or it is empty."
3. **File links** (`source.kind: "files"`): for each source run
   `python3 -I scripts/classify-video.py --drive <driveId> --role <role> --json`.
   Write its `kind`, `decision`, `reason` (the reasons after the first, joined with "; "), `probe` (`width`, `height` after rotation, `rotation`, `band`, `seconds`, `audio`) and `check: "done"`.
4. Carry on to Run step 2 only when all of these hold:
   - every file is `accept`;
   - there is exactly one `main` and it is a `youtube-recording`;
   - every `reel` is a `phone-recording`, and there are at most five;
   - `titleBy` is `"taylor"`.
5. Otherwise stop here. Write `status: "check"`, `checkAt` (the real time), a one-sentence `checkNote` saying what Taylor must decide (for example "Two files could be the main recording: choose one."), the finished stage, and end the session.
   The Publish screen then shows each file's real shape, length and reason, the title from the folder name matched to his booked topic, and a role per file. Taylor presses **Confirm and continue**, which starts a fresh session with `Run Publish job <id>`.

## Run Publish job <id>

1. Read `jobs/<id>`. Set `status: "running"` and the first stage. Run **Check the files** above; stop there if it says so.
2. Download the main recording only (`role: "main"`) from Drive: `curl -L "https://drive.usercontent.google.com/download?id=<driveId>&export=download&confirm=t" -o <file>` into the scratchpad. Check it is a video with `ffprobe`. Do not download `reel` or `skip` files in this run. If a file will not download, fail the job with "File <n> is not shared as Anyone with the link."
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

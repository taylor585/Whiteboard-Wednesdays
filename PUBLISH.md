# Publish jobs: what the Claude Code session does

Taylor pastes one Drive folder link (or file links) on **Publish** and presses **Generate Variety Pack**.
The app saves `jobs/<id>` in its own artifact database (https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea) and starts a Claude Code session in the cloud by itself, through Taylor's Claude Code Remote connector (3 November 2026).
That session's first message is `Run Publish job <id>`. Every later session starts the same way, by itself, when Taylor presses a button at a stop, and its line names the stop it continues from:

| Taylor presses | Line | The session |
|---|---|---|
| Continue (after his Variety Pack picks) | `Continue Publish job <id> from pack` | builds the pilot, stops on `pilot` (or runs a redo round and stops on `pack`) |
| Approve the pilot, or Change something | `Continue Publish job <id> from pilot` | renders the YouTube master and the LinkedIn cut and stops on `review` (or changes the pilot and stops on `pilot`) |
| Approve both, or Change something | `Continue Publish job <id> from review` | makes the thumbnails and posts and stops on `posts` (or on `ask` when the booking link or the buyer is missing), or makes the changes and stops on `review` again |
| Continue on `ask` (after adding the booking link or the buyer) | `Continue Publish job <id> from review` | makes the thumbnails and posts from the approved cuts and stops on `posts` |

Taylor's picks on `posts` start nothing: he picks one thumbnail and one post per platform, presses **Ready to post**, and the app sets `final` itself. Posting stays by hand (Taylor's decision 8).

`Continue Publish job <id>` with no stop named (jobs from before 5 November 2026) means `from pack`.
Each session is new and runs in a new container: it starts by restoring the **work set** (below), never by transcribing or planning again.
If the connector is refused, Taylor sends the same line in a chat. Either way, follow this file exactly.

## The job document

- `title`, `brief`: what the video is about, in Taylor's words. `titleBy: "taylor"` when he typed or confirmed it; null when he pasted a folder and left the title empty (it then comes from the folder name, and he confirms it on Check the files).
- `source`: `{kind: "folder", folderId, url}` when Taylor pasted one Drive folder, or `{kind: "files"}` for file links.
- `sources`: the files, each `{url, driveId, role: "main" | "reel" | "skip", part, roleBy, check, name, kind, decision, reason, probe, confirmedAt}`. `part` (1..n) is only on the parts of a main recorded in parts (see "A main recording in parts"); a single main has none. For a folder job it starts empty and the Check the files stage fills it. For file links it starts with the role Taylor chose and `check: "pending"`. There is exactly one main recording (landscape, 32:9 or 16:9; the house recording is 3840x1080, screen plus camera): one file, or its parts. `reel` files are phone reel recordings (upright, 9:16 once the rotation flag is applied), at most five. `skip` files are left out.
- `reelTakes`: the `driveId`s of the reel recordings. They wait for the reel winners (see "Main recording and reel recordings").
- `folderName`, `checkAt`, `checkNote`, `checkedAt`: written by Check the files (the first three) and by Taylor's Confirm (`checkedAt`).
- `topicId`: the saved topic this video belongs to, or null if Taylor did not link one.
- `startedAt`: when Taylor pressed Generate. `session: {id, url, step, requestedAt, startedAt}`: when the app asked for the session and when it opened. Do not change these.
- `skills`: the skill chosen for each job in Settings. Use **exactly these skills**, by these names, with the Skill tool:
  - `publishEdit` (default `suby-shots-with-katana` since 4 November 2026): the edit and its Variety Pack. The pack's page name is whatever that skill's `scripts/variety-pack/build.py` writes: **Katana Kutz - Variety Pack** for With Katana 5.0, **Suby Shots - Variety Pack** for Master Poster. Below, "the pack" means that page.
  - `publishThumbs` (for example `thumbnail-tracker`): thumbnails.
  - `publishPosts` (for example `performance-poster`): titles, descriptions and posts.
  If a field is missing, use the default from `public/settings.js`. Never swap in a different skill or recreate one from memory.
- `status`: `queued` → `starting` → `running` (→ `check` → `starting` → `running`) (→ `found`) → `pack` → `finishing` → `pilot` → `finishing` → `review` → `finishing` (→ `ask` → `finishing`) → `posts` → `final`. `failed` with `error` if it cannot finish. The app sets `starting` and `finishing` itself, only after the session has opened; `session.step` then says which stop it continues from (`finals` is from the pack, then `pilot`, then `review`).
- The stops after the pack (Phase 5, 4 November 2026; Taylor's decision 2: keep the pilot stop, then approve the YouTube master and the LinkedIn cut together, in one stop):
  - `work: {url, archive, manifest, files: [{path, bytes}], bytes, stage, savedAt}`: the saved work set (see "The work set"). Written by the session only.
  - `reviewUrl`: the job's private review page, a claude.ai artifact link. One per job, made at the pilot and updated in place after that.
  - `pilot: {url, seconds, round, renderedAt, detail}`: written when the pilot is ready. `url` is the review page.
  - `cuts: {url, round, renderedAt, master: {label, seconds, detail, url?}, linkedin: {label, seconds, detail, url?}}`: written when the master and the LinkedIn cut are ready.
  - `approvals: {pilot, review}`: Taylor's answer at each stop, written by the app together with the session it starts: `{decision: "approved" | "changes", note, round, at}`. The session reads it and never changes it. An answer is current when its `at` is later than the `renderedAt` it answers.
  - `finalNote`: one sentence on the finished job, shown above `finals`.
- Thumbnails and posts (Phase 7, 4 November 2026; Taylor's decisions 7 and 8):
  - `buyer` (`"A"` wants AI built, `"B"` buys paid ads, or null), `buyerBy` (`"topic"` or `"taylor"`) and `bookingLink` (the https link saved once in Settings as `settings/links`): written by the app with **Approve both** and with Continue on `ask`. The buyer comes from the topic's `buyer`, and Taylor can change it for this video. The session reads these three and never changes them.
  - `ask: {missing: ["booking" | "buyer"], note, at}`: written by the session when it stops on `ask` (see "Continue from review").
  - `pack: {note, platforms: [{key: "youtube" | "linkedin", label, postLabel, note, thumbnails: [{id, label, tag, size, url, file}], posts: [{title, body, firstComment, check, checker: {fails, warns, chars}}]}]}`: written by the session on `posts`. The app's PB-A blocks read exactly this.
  - `picks: {"<key>.thumb": <thumbnail id>, "<key>.post": "v1" | "v2"}`, `readyAt`, `youtubeUrl`: written by the app only. `youtubeUrl` is the video's link once Taylor has posted it by hand; the app puts it into the LinkedIn first comment.
- Earlier work (Phase 3, 4 November 2026):
  - `existing: [{url, title, kind, round, decisions, why, createdAt}]` and `foundNote`: written by **Look for earlier work** when it stops on `found`. `kind` is `variety`, `katana` or `reels`.
  - `existingSeen`: links Taylor was already shown in the app and chose to start fresh over (pack links, or `jobs/<id>`). Ignore these when looking.
  - `skipExisting: true`: Taylor pressed Start fresh anyway on `found`. Skip Look for earlier work.
  - `reusedFrom: {url, title, pack?, at}`: Taylor pressed Use this pack, so `packUrl` is that earlier pack and nothing is rebuilt.
  - `packRecord`: the run record of the pack this job published (see Run step 7).
- `stages`: the progress list the Publish screen shows: `[{name, detail, state: "wait" | "run" | "done" | "failed", startedAt, endedAt}]`. Write it as you go; never write a stage you have not done.
- **Stage times are real.** Take `startedAt` from `date -u +%Y-%m-%dT%H:%M:%SZ` at the moment the stage starts, and `endedAt` the same way at the moment it ends. Never round, estimate or backfill a time, and never write a time from before this session opened.
- The Publish screen shows "Claude Code has not reported back" when a job stays on `starting` for 10 minutes, or on `running` or `finishing` with no new stage time for 90 minutes. Start or end a stage at least that often; split a long render into stages if you need to.
- **Taylor can stop a job.** His Stop button writes `status: "failed"`, `error: "Stopped by Taylor"`. Re-read the job before each stage; if it says that, stop at once and write nothing more.

Write to the job with ArtifactData, pinned to the version you read (`if_version`). Never touch other jobs, topics, creator notes or settings.

## The packs index (`packs/<id>`)

One document per review pack ever published for Taylor's videos, in the app's database, so a recording is never packed twice. The id is the pack's artifact id (the last part of its claude.ai link).

`{url, title, kind: "variety" | "katana" | "reels", skill, round, driveIds, folderId, seconds, topicId, jobId, decisions, createdAt, updatedAt, by: "session" | "backfill"}`

- `title` is the video's name as the pack shows it; `driveIds` the main recording's Drive file ids (every part, in part order); `seconds` its measured length (the joined length for a main in parts) (null when not measured); `decisions` the collection the pack saves picks in (`decisions` for a Variety Pack, `katana` for a Katana moments page, `winners` or `picks` for reel pages, null when the page saves only in the browser).
- The app reads it for its free check before Generate. Sessions add a document for every pack they publish (Run step 7), and for an earlier pack they find that is missing (Look for earlier work). Add documents only: never change or delete another pack's document, and never touch any pack's `decisions`.

## Main recording and reel recordings (master rule 4)

- Only the one source with `role: "main"` goes to the `publishEdit` skill as the recording for YouTube and LinkedIn. Its kind is `youtube-recording`, or Taylor confirmed it on Check the files.
- Never use a `reel` file as the main, and never give a reel file to the YouTube or LinkedIn edit.
- Never cut a reel, Short or Instagram or Facebook video from the main recording. The only material from it that may reach a reel is the skill's own silent, face-free screen-share tool (on Path B, the B-roll over Taylor's phone take: master rule 4's only exception, Taylor's decision 9).
- Reel recordings (`reelTakes`) are used only after Taylor picks the reel winners. Before one is used as a reel's face or voice, it must pass the skill's `youtube_guard check-media` (and `check-words` after transcription).
- `skip` files are never downloaded or used.

## A main recording in parts (6 November 2026)

Taylor sometimes records the main video in several parts (for example "Top 50 - Part 1.mp4", "Part 2", "Part 3", all 3840x1080 with sound). They are **one** main recording:
- On the job, every part is a source with `role: "main"` and `part` 1..n, the order they are joined (Taylor can reorder or leave out a part on Check the files). A job with one main has no `part` and nothing below changes for it.
- Wherever this file says "the main recording", "the main `driveId`" or `role: "main"`, read: every part, joined in `part` order into one file. Never give a single part to any skill.
- **Join before anything else** (Run step 3, and every later session that downloads the main recording):
  1. Download every part (the same `curl` line, one file each, `part1.mp4` … `partN.mp4`) and `ffprobe` each: video codec, width, height, pixel format, frame rate and time base; audio codec, sample rate and channels.
  2. If every part's streams match, join without re-encoding:
     `for f in part*.mp4; do printf "file '%s'\n" "$PWD/$f"; done > parts.txt` (in part order), then
     `ffmpeg -hide_banner -f concat -safe 0 -i parts.txt -map 0:v:0 -map 0:a:0 -c copy -movflags +faststart main.mp4`.
  3. If any stream differs, re-encode once to part 1's settings: `ffmpeg -i part1.mp4 … -i partN.mp4 -filter_complex "[0:v:0][0:a:0]…[N-1:v:0][N-1:a:0]concat=n=N:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 16 -preset medium -pix_fmt yuv420p -r <part 1 frame rate> -c:a aac -b:a 192k -ar 48000 -movflags +faststart main.mp4`. Parts of different picture sizes never get here: Check the files refuses them.
  4. Check the joined file: it has one video and one audio stream, its size is part 1's, and its length equals the sum of the parts' lengths (within 0.5 s plus 0.1 s per part). Otherwise fail the job: "The parts of the main recording did not join cleanly (joined <x> s, parts <y> s)."
  5. From then on `main.mp4` is the main recording everywhere: transcript, map and plan times, the guard's `register-source`, the pack, the pilot, the master and the LinkedIn cut are all on the joined timeline. Name it in the stage detail ("3 parts joined: 21:17").
- **Records use every part:** `packs/<id>` `driveIds` lists every part id in order and `seconds` is the joined length; the work-set manifest's `source` is `{driveId (part 1), driveIds, bytes (all parts), seconds (joined)}`; Look for earlier work and the work set treat any part id as this recording.
- The joined file is never saved (it is as large as the parts): a later session downloads the parts and joins them again, which takes a minute or two.

## Check the files (the first stage of every Run)

This stage only reads a few MB of each file. It never downloads a full file and never starts the edit.

1. Skip this stage when every source has `confirmedAt` (Taylor pressed Confirm and continue). Go straight to Run step 2.
2. **Folder job** (`source.kind: "folder"`, `sources` empty): run
   `python3 -I scripts/classify-video.py --drive-folder <folderId> > check.json`.
   It lists the folder from `https://drive.google.com/embeddedfolderview?id=<folderId>` (no key) and classifies every file.
   - Copy its `sources` to the job, each with `check: "done"`, and `folderName`.
   - Its roles are a proposal only. Exactly one landscape recording with sound, 5 minutes or longer, becomes `main`, or (6 November 2026) several landscape recordings with sound whose names carry part numbers ("Part 1", "Pt 2", "- 3", "(2)", "take 2"; the words before the number may differ slightly, such as Make and Create) and that share one picture size become one `main` in parts, with `part` 1..n in number order, judged on their total length, and `accept`. Its `main` is `{parts: [driveId in part order], seconds}`. Phone recordings become `reel`. Everything else is `skip`. When several files could be the main, or the parts are unclear (a missing or repeated number, mixed sizes, a copy of another part, an unnumbered recording beside them, names that differ), none is chosen and each is `ask`.
   - If the folder cannot be listed, fail the job: "The folder is not shared as Anyone with the link, or it is empty."
3. **File links** (`source.kind: "files"`): for each source run
   `python3 -I scripts/classify-video.py --drive <driveId> --role <role> --json`.
   When several sources have `role: "main"` (a main in parts, with `part` numbers), check them together instead, in `part` order:
   `python3 -I scripts/classify-video.py --main-parts <part 1 driveId>,<part 2 driveId>,…`, which judges each part on the total length and asks when the parts are not one size or one is a copy of another. Copy each part's `kind`, `decision`, `reason` and `probe`, and keep Taylor's `part`.
   Write its `kind`, `decision`, `reason` (the reasons after the first, joined with "; "), `probe` (`width`, `height` after rotation, `rotation`, `band`, `seconds`, `audio`) and `check: "done"`.
   The kind is the file's real shape, whatever role it was pasted with: Taylor often pastes the phone take first, so it arrives as `role: "main"` (for example IMG_3094.MOV, 1920x1080 HEVC with rotation -90, shows upright 1080x1920, is a `phone-recording`; the main 1V9L7Iojg27yDidtlCyUNmCjZTHW412AS, 3840x1080, 38:13, is a `youtube-recording`). Keep Taylor's role on the job and let the mismatch stop on `check`: the Check the files screen offers each file the role its kind gives it (a `youtube-recording` is the main, a `phone-recording` a reel), so one Confirm sets both and starts Path B.
4. Carry on to Run step 2 only when all of these hold:
   - every file is `accept`;
   - there is exactly one main recording and it is a `youtube-recording`: one source with `role: "main"`, or its parts, each a `youtube-recording` with `part` numbers running 1 to n with no gap or repeat, all one picture size;
   - every `reel` is a `phone-recording`, and there are at most five;
   - `titleBy` is `"taylor"`;
   - there is no `reel` file (6 November 2026, Taylor's decision 10). A phone take beside the main recording always stops here once, even when nothing else is unclear, because Taylor's **Confirm and continue** is what starts its reels (Path B, see "Reels jobs"). Say so in the `checkNote`, for example "Your phone take IMG_3097.MOV will be cut into reels: confirm the files."
5. Otherwise stop here. Write `status: "check"`, `checkAt` (the real time), a one-sentence `checkNote` saying what Taylor must decide (for example "Two files could be the main recording: choose one."), the finished stage, and end the session.
   The Publish screen then shows each file's real shape, length and reason, the title from the folder name matched to his booked topic, and a role per file. Taylor presses **Confirm and continue**, which starts a fresh session with `Run Publish job <id>`.
   When the confirmed files hold one or more phone takes (`role: "reel"`, `kind: "phone-recording"`) beside the main recording, the same press also creates the Path B reel job `reels/<id>` (`auto: true`, `jobId` this job) and starts its own session with `Run Reels job <id>` (see "Reels jobs", "Path B"). This job is never written for it. If the connector refuses the Video session, the reel job waits on `queued` and starts with this job's next session (Try again), or from Start now on the Reels lane.

## Look for earlier work (the second stage of every Run, before any download)

The "Thinking With AI" job of 3 November rebuilt a pack for a recording that already had one from a chat (*How to think*, 41 approvals, master and LinkedIn cut built). This stage stops that. It only reads: it never publishes, and never writes to another artifact or its `decisions`.

1. Skip this stage when `skipExisting` is true, or when the job already has `packUrl` (Taylor chose Use this pack: see Run step 2).
2. Read the `packs` collection and the other `jobs` (ArtifactData `list`, `query.limit: 1000`). Leave out anything in `existingSeen`, failed jobs with no `packUrl`, and this job.
3. A pack or job is **the same recording** when any of these holds:
   - its `driveIds` (or a job's `sources[].driveId`) include this job's main `driveId` (any part's, for a main in parts), or its `folderId` is this job's `source.folderId`;
   - its `seconds` is within 2 s of the main recording's `probe.seconds` (the parts' total, for a main in parts) and it shares a topic (`topicId`) or two or more title words with this job's `title`, `folderName` or topic title.
   A pack on the **same topic** with a different recording (a re-record) is not a match: note it in the stage detail and carry on.
4. Then list Taylor's artifacts with the Artifact tool (`action: "list"`, `scope: "mine"`, `limit: 200`, following `page_token`). Take the ones titled `Suby Shots - Variety Pack`, `Katana Kutz - Variety Pack` or `Katana Kutz Variety Pack`, or whose title ends `Reel Highlights` or `Reel Options`, that are not already in `packs`. Read each with `action: "read"` and `path: "index.html"`: the page is saved to a file, so pull out its `<title>`, eyebrow, lede and footer with a short script instead of reading the whole page into the conversation. It is the same recording when the eyebrow or lede names this job's title, folder name or topic, or the recording length it states matches (for example "38-minute", "30:35").
5. For each match that is a Variety Pack (or a Katana moments page), count its picks: ArtifactData `list` on its `decisions` (or `katana`) collection with that artifact's `url`. Read only.
6. **No match:** finish the stage ("No earlier pack for this recording") and carry on.
7. **A match:** add a `packs` document for each matched pack that was not in the index (`by: "session"`), then write `status: "found"`, `existing` (newest first), a one-sentence `foundNote` (for example "This recording already has a Variety Pack from a chat with 41 approvals; its master and LinkedIn cut are built."), the finished stage, and end the session. Nothing is downloaded.
   Reel pages alone (`kind: "reels"`) do not stop the run: list them in the stage detail for the reels lane, and carry on.
   The Publish screen shows each one with **Open it**, **Use this pack for this job** (sets `packUrl` and `status: "pack"`; no session) and **Start fresh anyway** (sets `skipExisting` and starts a new `Run Publish job <id>`).

## The work set (Phase 5, 4 November 2026)

Every session runs in a new container, so nothing on disk survives it. The first session saves the small working files the later stages need, and every later session restores them first. That is what stops a Continue from downloading checks, transcribing, mapping and planning again (the 3 November job lost all of it: audit bug 8).

**Where it lives: on the job's Variety Pack page, as two published files.** The pack is already a private artifact that the session publishes, Taylor owns, and nobody else sees.
- `work/work.tar.gz`: one gzipped tar of the files below, at their paths relative to the job folder (`jobs/<job>/…`) and the skill's working copy (`src/v3/…`, `.suby/…`). Published with `contentType: "application/gzip"`, so a read saves it to a file and it never enters the conversation.
- `work/manifest.json`: `{job, savedAt, stage, source: {driveId, driveIds, bytes, seconds}, files: [{path, bytes, sha256}]}` (`driveIds` every part in order, `seconds` the joined length; for a single main, `driveIds` is just its id). Small enough to read inline.

**Limits, checked before every save:** a published binary file may be 15 MB and a text file 16 MB; one artifact version may hold 511 files and 256 MB in all. Keep `work.tar.gz` under 14 MB (a 40-minute job is about 1 to 2 MB: the transcript is about 150 KB before compression). Before publishing, list the pack's files (`action: "list"`, `scope: "files"`, `url: packUrl`) and add up the sizes: if the pack plus the work set would pass 250 MB, publish the work set to the job's review page instead (the same two paths) and set `work.url` to that page. Never put the work set in the repository (no new folders), on Drive, or in the app's database (it holds up to 25,000 small documents for the screens; a transcript and a plan are working files, not records).

**What goes in it** (text and data only; no video, audio or images):
- the transcript with word timestamps (`words.json`, `[w, s, e]`) and its sentences (`sentences.tsv`) when made;
- the map and the beat plan: `src/v3/episode.ts` (`CROPS`, `SECTIONS`, `CHAPTERS`, `BEATS`), `src/v3/corrections.ts`, `plan-export.json`, and any story, Blender (`shot.json`) and Katana (`cut.json`) specs the plan uses;
- the pack data: `pack/pack.json`, `pack/families.json`, the brand profile (`brand.json`) and the job's `packRecord`;
- the guard data for this recording: the registry `scripts/youtube_guard.py` keeps (`.suby/youtube-registry.json`, or `SUBI_YT_REGISTRY`), with this recording's fingerprint and speech, so `check-media` and `check-words` on later reel takes know it (master rule 4);
- the file check (`check.json`) and the main recording's probe;
- later stages add theirs: the pilot's sound cues, the assembly list, the LinkedIn `rough.json`, `linkedin-plan.json` and `edl.json`, and the QA reports.

**Saving it** (at the end of Run, and again at the end of every later session that changed any of it):
1. `tar -czf work.tar.gz <files>` and write `manifest.json` with each file's size and `sha256sum`.
2. Publish to the pack with `url: packUrl`, `file_path` set to the pack page itself, unchanged (in a later session, read it first with `action: "read"`, `path: "index.html"`, which saves it to a file, and publish that file), and only the two work files in `files`. Omit `capabilities` so the pack keeps its `db` and Taylor's decisions; label `Work set: <stage>`. Nothing on the page changes for Taylor.
3. Write `work` to the job (pinned to the version you read).

**Restoring it** (the first stage of every Continue, named "Restore the saved work"):
1. Read both files in one call: `action: "read"`, `url: work.url`, `paths: ["work/manifest.json", "work/work.tar.gz"]`. Check every file's `sha256` after `tar -xzf`, then put each back at its path in the job folder and the skill's working copy (set `SUBI_YT_REGISTRY` to the restored registry).
2. Do not print the transcript or the plan into the conversation: read only the parts a step needs (`jq`, `head`, a short script). A fresh session should start well under 60 k tokens.
3. If `work` is missing (a job from before 5 November 2026, or a pack Taylor reused from a chat), make the set once: download, transcribe and map as Run would, then save it before anything else, so it is never made twice. If a file fails its check, say so in the stage detail and remake only that file.

**What is not saved, and has to be made again** (machine time, not Taylor's plan usage, as long as the session waits with one Monitor):
| Stage | Made again in | Why |
|---|---|---|
| The main recording (download, about 30 s) | every session that renders: from pack, from pilot, from review with changes | 500 MB to 1 GB: far over the 15 MB file and 256 MB version limits |
| Base layer (`build_base.py`: `base.mp4`, `cam_full.mp4`, push clips) and the chrome stills | the same sessions, from the saved plan | gigabytes of video, rebuilt in minutes from the recording and the plan |
| Beat clips (`render-episode.ts beats`) | from pack (the pilot's beats only) and from pilot (every beat, the pilot's again) | renders are resumable inside one container only |
| The sound mix (`mix-episode.wav`) and the assembled master | from pilot, and from review with changes (the whole master again) | a 38-minute master is about 1 GB; the mix about 400 MB |
| The LinkedIn cut | from pilot, and from review when the changes touch it | cut from the assembled master's picture and mix, which are not kept |

Never made again: the file check, the transcript, the map, the beat plan, the Variety Pack and its media, and the guard registration.

## Run Publish job <id>

1. Read `jobs/<id>`. Set `status: "running"` and the first stage. Run **Check the files** above; stop there if it says so.
2. If the job already has `packUrl` and `reusedFrom` (Taylor chose Use this pack), nothing is built: write `status: "pack"` and the finished stages, and end. Otherwise run **Look for earlier work** above; stop there if it finds a match.
3. Download the main recording only (`role: "main"`) from Drive: `curl -L "https://drive.usercontent.google.com/download?id=<driveId>&export=download&confirm=t" -o <file>` into the scratchpad. Check it is a video with `ffprobe`. A main in parts: download every part and join them in `part` order first, exactly as "A main recording in parts" says; the joined file is the main recording from here on. Do not download `reel` or `skip` files in this run. If a file will not download, fail the job with "File <n> is not shared as Anyone with the link."
4. **Proven or new, from every earlier pack.** Before planning the pack, read the `decisions` of every `variety` pack in `packs` (and the `katana` picks of every `katana` page) with ArtifactData, read only. This is the record of what Taylor has seen; the skill's `references/style-library.md` in the synced copy is behind it.
   - A design whose library id (or the same design under an older id, such as `fs-list-tickets` for `list-tickets` or `end-wipe` for `tr-end-wipe`) was `approved` in any earlier pack is proven: tag it `APPROVED BEFORE`. A Katana concept picked on a Katana page is proven too (`punch` is `word-punch`).
   - A design shown before and never approved is not fresh: do not tag it `NEW`. Tag `NEW` only designs Taylor has never been shown.
   - Count the half proven, half fresh split on these tags.
5. Invoke the `publishEdit` skill with the Skill tool and follow it as written, with these answers so it never waits on a question the app has already answered:
   - **Brand:** the Pecuna Factorem house brand from CLAUDE.md (white, ink #1C1A17, gold #8B6002, highlight #F6DF8C, Caveat, Instrument Sans, IBM Plex Mono, the official coin), unless the job has a `brand` field.
     Say it once, at the end of the lede, in exactly this form, with the fonts copied from `pack.json` `brand.fonts` in their order: "Brand: the Pecuna Factorem house brand (Caveat, Instrument Sans, IBM Plex Mono), because the job set no brand of its own." Never name a font the page does not use (the 3 November pack named Fraunces while its page used Caveat).
   - **What the video is about:** `title` and `brief`.
   - Its master rules still hold: never an AI voice, short-form never cut from the YouTube video, and all three motion engines in every pack (master rule 8: Katana, Blender, AI motion graphics).
   - **Ask nothing about scope, and make the whole pack a chat would make.** Taylor is not watching. There is no time limit, and render time is never a reason to plan fewer moments. Plan story B-roll and Blender moments by the skill's own rules (a strong process, journey or numbers line; at most one Blender shot per 2 to 3 minutes; 45 s between full-frame takeovers), and Katana moments by `references/katana-framework.md` (two candidates each: one approved concept, one fresh). A 30 to 40 minute recording normally earns 2 or more Blender moments, 1 or 2 stories and 2 or 3 Katana moments, each with its candidates. The chat packs had 67 and 69 assets; the 3 November automatic pack had 45, one Blender moment and no story.
   - **Waiting on renders: one Monitor, not repeated checks.** Start each long render (base layer, clip batches, Blender previews) in the background and wait with the Monitor tool on an until-loop that ends on success or failure, for example `until [ -f <out>/done ] || grep -qE "Error|Traceback|Killed" <log>; do sleep 5; done`. Never poll with repeated status commands or sleeps: every extra turn re-reads the whole conversation and uses Taylor's plan usage for nothing. Start or end a stage at least every 90 minutes so the app does not show the job as stuck.
6. Build the pack exactly as the skill does in a chat (`build.py --families` with every check passing, the exact name it writes, `capabilities: {db: {}}`, `icon: "palette"`, label `Round 1`), and publish it as its own private artifact. Before publishing, check these, which `build.py` does not:
   - **Headings** are the ones in the skill's `references/variety-pack.md` §5, word for word, plus "Katana Kutz" for the `katana` section: "Captions (style C)", "Short phrases", "Short lists", "Other screen overlays", "Full-screen motion graphics", "Camera moves", "Transitions", "Story B-roll", "Katana Kutz", "Blender: B-roll and explanations", "Presenter and chrome", "Icons", "Sound design". The presenter section includes the bubble and the chapter ribbon whenever the plan has screen moments.
   - **Ids** are the library's own, exactly, so decisions line up across videos: asset ids from `references/style-library.md` (for example `title-stack`, `title-typewriter`, `list-tickets`, `tr-end-wipe`, never `fs-title-stack` or `end-wipe`), Blender `concept` names from `references/blender-framework.md` (`objects-on-the-word`, not `bl-objects-on-the-word`), and Katana `concept` names from build.py's list (`word-punch`, `stretch-morph`, `interface-story`, `fly-through`, `camera-language`).
   - **Caption cards** show the style C caption layer only, never another design under it (the 3 November pack showed a lower third on a caption card after a render was re-pointed).
   - **Accuracy:** read every section intro and every card's `use` against its clips: the moment, the time stamp and the count must be right, and every sentence must make sense on its own. Stories and Blender cards show the whole shot, with a 9:16 still.
   - **Phone playback.** The skill's template plays clips from their file links, which iPhone Safari may not play on this host (it needs byte-range video). In the built pack HTML, replace the media line
     `` : `<video src="${m.src}" ${m.tall ? 'class="tall"' : ''} muted loop playsinline preload="metadata" controls aria-label="${a.title}"></video>`).join('')}</div>`; ``
     with
     `` : `<video data-src="${m.src}" ${m.tall ? 'class="tall"' : ''} muted loop playsinline webkit-playsinline preload="none" controls aria-label="${a.title}"></video>`).join('')}</div>`; ``
     and replace the two lines after `// play clips only while visible` (the `const io = …` line and the `if (!matchMedia(…` line) with the loader from the 3 November chat pack (https://claude.ai/artifact/5bjmJN27WirTQ7X46hRxxM):
     ```js
       // Phones (iOS Safari) need byte-range video, which this host may not serve: each clip is fetched whole and played from memory.
       const load = v => { if (v.dataset.loaded) return v.dataset.loaded === '1' ? Promise.resolve() : v._p; v.dataset.loaded = 'loading';
         return v._p = fetch(v.dataset.src).then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); })
           .then(b => { v.src = URL.createObjectURL(b.type ? b : new Blob([b], {type: 'video/mp4'})); v.dataset.loaded = '1'; })
           .catch(() => { v.src = v.dataset.src; v.dataset.loaded = '1'; }); };
       const auto = !matchMedia('(prefers-reduced-motion: reduce)').matches;
       const io = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { load(v).then(() => { if (auto) v.play().catch(() => {}); }); } else v.pause(); }), {rootMargin: '300px 0px', threshold: 0.01});
       document.querySelectorAll('video').forEach(v => { io.observe(v); v.addEventListener('play', () => { if (v.dataset.loaded !== '1') { v.pause(); load(v).then(() => v.play().catch(() => {})); } }); });
     ```
     Add `html,body{overflow-x:clip}` to the end of the page's style block. Then open the page at 390 px and 1280 px (Playwright on the built file is enough) and check that `document.documentElement.scrollWidth` equals `clientWidth`, and that no clip uses `src=` in the media line any more.
   **Thumbnails and posts are not on the pack.** The skill's pack has no section for them, in a chat or here. `publishThumbs` and `publishPosts` run later, in Continue. Do not write a stage or a pack line that suggests otherwise.
7. **Pre-tick what Taylor approved before (Taylor, 4 November 2026: he decides only the new designs, and still presses Continue).** Straight after publishing, write one `decisions/<assetId>` document on the **new** pack for every asset tagged `APPROVED BEFORE`, in one ArtifactData `batch` with the new pack's `url`: `{status: "approved", note: "Approved before on <earlier pack's video>, <date>. Untick it if you do not want it here.", at: <presetAt>, preset: true}`, all with the same `presetAt` (the real time). Never pre-tick a `NEW` design or a caption card, and never write to an earlier pack.
8. Write to the job: `packUrl` (the pack's claude.ai link), `status: "pack"`, the finished stages, and `packRecord: {date, round, preticked, fresh, presetAt, sections: {<section id>: [{id, tag}]}}` (`preticked` and `fresh` are counts). This is the run record the skill would keep in `notes/variety-pack/runs/`, which this session cannot write.
   Add `packs/<pack id>` (`kind: "variety"`, the job's `title`, `skill`, `round`, the main `driveIds` (every part, in order), `folderId`, `seconds`, `topicId`, `jobId`, `decisions: "decisions"`, `by: "session"`). The Publish screen then shows **Open the Variety Pack**, the number pre-ticked, and Continue.
9. **Save the work set** (see "The work set") with `stage: "pack"`, as its own stage, before the session ends. The session's work ends here.

## Continue Publish job <id> from pack

1. Read `jobs/<id>` and its `packUrl`. Run **Restore the saved work** (see "The work set").
2. Read the pack's `decisions` collection with ArtifactData (the skill's own step "Decide").
   A decision is Taylor's own when it has no `preset`, or its `at` differs from `packRecord.presetAt` (he clicked or wrote a note). A pre-tick he left alone still counts as approved: he saw it and pressed Continue.
   If the job has `reusedFrom` and its sources are not all `check: "done"`, run **Check the files** first (it reads a few MB of each file); stop there if it says so.
   If `decisions` is empty, or none of them is Taylor's own, fail the job (`status: "failed"`, `failedStage: "Read the picks"`, `error: "No picks found on the Variety Pack yet. Make your picks there, then press Continue again."`) and stop. Never build from designs Taylor has not approved. The Publish screen keeps Open the Variety Pack and Continue on a failed job that has a `packUrl`.
3. If decisions ask for changes, run the skill's redo round on the **same pack URL**, set `status: "pack"` again and stop:
   - rebuild `pack.json` from the restored work set (or, if it is missing, from the live pack's `<script id="data">` block, with every asset id unchanged);
   - render only what the decisions ask for, run `build.py --redo`, apply the phone playback patch again (Run step 6), and publish with `url: packUrl`, label `Round <n>`;
   - send only new or changed media in `files` (files left out are kept, the work set included); never publish a new artifact for a redo, and never change or delete a decision;
   - update `packRecord` (round, new ids and tags) and that pack's own `packs` document (`round`, `updatedAt`), and save the work set again.
   Wait on renders with Monitor, as in Run step 5.
4. **The pilot.** Otherwise lock the beats to the approved styles (the skill's Part 1B step 7, with its rotation rules), then follow the skill's Part 2 from the restored plan: `check-plan.mts`, `export-plan.mts`, download the main recording only (Run step 3), chrome stills, base layer, review stills, the pilot's beat clips, `render-v3.ts` and `sfx_v3.py`. The pilot is the first 60 to 90 seconds (the skill's own pilot; its QA must pass).
5. **The review page.** Make a 720p review copy of the pilot under 14 MB and publish the job's private review page, once per job, as the skill delivers files (`references/quality-playbooks.md` §11: the file, its SHA-256, a save button through `capabilities: {downloads: true}`; parts of 14 MB when a file is larger, none starting with `<`; videos fetched whole and played from memory, as the pack's phone loader does). Title it `<title> - Review`, label `Pilot round <n>`, `icon: "video"`. Nothing goes to Drive.
6. Save the work set (`stage: "pilot"`: the locked plan, `plan-export.json`, the sound cues). Write `reviewUrl`, `pilot: {url: reviewUrl, seconds, round, renderedAt, detail}` (`renderedAt` the real time), the finished stages, and `status: "pilot"`. The session ends here. The Publish screen shows **Watch the pilot**, **Approve the pilot** and **Change something**.

## Continue Publish job <id> from pilot

1. Read `jobs/<id>` and `approvals.pilot`. Run **Restore the saved work**.
2. If `approvals.pilot` is missing or older than `pilot.renderedAt`, fail the job (`failedStage: "Read your answer"`, `error: "No answer on the pilot yet. Approve it or ask for changes on Publish."`).
3. **Changes** (`decision: "changes"`): apply `note` to the plan (beats, styles, crops or timing; only designs Taylor approved on the pack), re-render the pilot as in "from pack" steps 4 and 5, and publish it to the **same** review page (`url: reviewUrl`, label `Pilot round <n+1>`). Save the work set, write `pilot` (`round` + 1, new `renderedAt`) and `status: "pilot"`, and stop.
4. **Approved:** render the whole YouTube master from the restored plan (the skill's Part 2: base layer, every beat clip, the approved stories, Blender and Katana shots inserted, `sfx_episode.py`, `assemble.py`, and the full QA, which must all pass), then the LinkedIn cut (Part 3A: the only cut of the YouTube video, master rule 4). Start or end a stage at least every 90 minutes, and wait on each render with one Monitor.
5. Publish review copies of both to the same review page (`url: reviewUrl`, label `Master and LinkedIn round <n>`): the LinkedIn cut at 1080p when it fits, the master as a 720p review copy, both in 14 MB parts, together under 230 MB. Full-quality delivery to Drive is phase 6 and is not in this file yet: never upload anywhere else.
6. Save the work set (`stage: "review"`: the assembly list, the LinkedIn plan and `edl.json`, the QA reports). Write `cuts: {url: reviewUrl, round, renderedAt, master: {label, seconds, detail}, linkedin: {label, seconds, detail}}`, the finished stages, and `status: "review"`. The session ends here. The Publish screen shows both, **Approve both** and **Change something**.

## Continue Publish job <id> from review

1. Read `jobs/<id>` and `approvals.review`. Run **Restore the saved work**. If the answer is missing or older than `cuts.renderedAt`, fail the job as in "from pilot" step 2.
2. **Changes:** apply `note` (it says which video and where), re-render what it touches (the whole master when the master changes, because renders are not kept; the LinkedIn cut when it changes or its source moved), re-run the QA, publish the review copies to the same review page (label `Master and LinkedIn round <n+1>`), save the work set, write `cuts` (`round` + 1) and `status: "review"`, and stop.
3. **Approved:** the finished files, then the thumbnails and the posts. Full-quality delivery to Drive (Taylor's decision 3) is phase 6 and is not in this file yet: do not re-render and do not upload anywhere else. Write `finals` with the review page for each cut (`{platform: "youtube" | "linkedin", label, url: reviewUrl, detail: "Approved review copy on your private review page"}`), then carry on with **Thumbnails and posts** below.
4. Nothing is ever posted. Post all stays off until the platform connections exist.

## Thumbnails and posts (Phase 7, after Approve both)

This runs in the same session as "from review" step 3, and again when Taylor presses Continue on `ask` (the same line: `Continue Publish job <id> from review`; `approvals.review` is still the current approval, so do not fail on it). Restore the saved work first, as always.

**1. Check the inputs first (stage "Check the post details"), before anything is made.**
- `buyer` must be `"A"` or `"B"`.
- `bookingLink` must be an `https://` link with a real domain, and must not contain `[`, `]`, `{`, `}`, `<`, `>` or a space.
- If either is missing or wrong, stop: write `status: "ask"`, `ask: {missing, note, at}` (the note says, in one sentence, what to add and where, for example "Add your booking link in Settings, then press Continue."), the finished stage, and end the session. Nothing is rendered and nothing is written to `pack`. Never write a post with `[BOOKING LINK]` and never guess a link or a buyer.

**2. Thumbnails (stage "Thumbnails"), with the `publishThumbs` skill (Thumbnail Tracker 3.2).** Invoke it with the Skill tool and follow its "Create thumbnails" section:
- **Objects only** (its master rule 6): never a photo of Taylor taken from a video, no frames, stills or reel grabs. A face is used only when the job has `phonePhoto` (a photo Taylor took on his phone and gave for this job; the app does not ask for one yet), and only through `prep_face.py --phone-photo`. Without one, build to `references/design/objects-only-standard.md` from the nearest spec in `examples/objects-only-2026-11/`.
- **Five per round** (its variety rule for rounds of 4 or more): three light grounds and two dark, varied type, case and mark, each with a line of 4 words or fewer that adds to its title. `variety.py check` must show 0 FAIL and `build_hero.py` no unexplained `WARNING:`. Look at every image, and at the 168 px strip, before using it.
- **Sizes:** the five at 1280×720 for YouTube, and the same five at 1920×1080 (`--size 1920x1080`) as LinkedIn video covers. Name them `<n>-YouTube-thumbnail-1280x720.jpg` and `<n>-LinkedIn-video-cover-1920x1080.jpg`.
- **Where they go (Taylor's decision 3: thumbnails on the private download page):** publish them to the job's review page (`url: reviewUrl`, the page file read first and republished unchanged, only the ten images in `files` under `thumbs/`, label `Thumbnails round <n>`). Omit `capabilities` so the page keeps them. For each image, `url` is its address on that page as a `scope: "files"` listing reports it, and `file` the same link (the app shows the image when the browser can load it, and a Full size link when it cannot).

**3. Posts (stage "Posts"), with the `publishPosts` skill (Performance Poster 1.2.1).** Invoke it with the Skill tool and follow its "Full set" section, for YouTube and LinkedIn only (the reels have their own lane):
- **The brief** (`brief.txt`, its `KEY: value` format): `TITLE` from the skill's Titles step (3 titles, `check_post.py title`), `BUYER` from the job, `VIDEO TEACHES`, `PROOF` from the restored transcript (`words.json` and `sentences.tsv`), `DURATION` the approved master's length (`cuts.master.seconds`), `CLIENTS`, and `LINKS: contact https://pecunafactorem.com/contact · booking <bookingLink>`.
- **Chapters are real, from the final cut.** Take each chapter's start from the approved master's timeline in the restored assembly list (the master as assembled, after every cut and insert), never from the raw recording's times and never estimated. `0:00` first, at least 3, ascending, 10 seconds apart or more, the last before `DURATION`. No `X:XX`.
- **Two variations per platform**, on different hooks:
  - YouTube: `title` (from the Titles step) and `body`, the description in the house structure (the pinned WhatsApp line exactly, hook, summary, the book-a-call line with `bookingLink`, what you'll learn, chapters, how we can help, links, 2 or 3 registry hashtags).
  - LinkedIn: `body`, a native-video post for the LinkedIn cut (hook inside the fold, CTA 04 with `bookingLink` as the last line, 0 to 2 registry hashtags), and `firstComment` with CTA 05's wording and `[YOUTUBE LINK]`. That is the only placeholder allowed anywhere, because the link exists only after Taylor posts the video: the app asks him for it and fills it in before he copies the comment.
- **Checked by the skill's own checker.** Save each variation as a file and run `python3 <skill-dir>/scripts/check_post.py youtube|linkedin <file> --brief brief.txt --transcript <transcript> --json` (with `--title` for YouTube and `--duration` from the brief). Fix every FAIL and re-run; a variation with a FAIL is never written. Read every WARN and fix it, except `Placeholders left to fill` for `[YOUTUBE LINK]` in the LinkedIn first comment.
- **No placeholders.** Before writing, test every `title`, `body` and `firstComment` against the skill's `placeholder_regex` (in `references/limits.json`). Any match other than `[YOUTUBE LINK]` in a LinkedIn `firstComment` means the post is not finished: fix it. If it cannot be fixed, fail the job (`failedStage: "Posts"`). The app refuses to copy a variation that still has one.
- `check`: one line for Taylor, from the checker (for example "PASS · 1,412 characters · hook 96 · 2 hashtags · 0 WARN"); `checker: {fails, warns, chars}`.
- Log the hooks and hashtags with the skill's `headline_log.py` and `hashtag_log.py` in its working copy, and add both log files to the work set.

**4. Write the job (pinned to the version you read):** `pack: {note: "Five thumbnails and two checked posts per platform", platforms: [youtube, linkedin]}` in the shape listed under "The job document" (`postLabel` "Title and description" for YouTube, "Post" for LinkedIn; thumbnail `id`s unique within a platform), `finals` (as in step 3 of "from review"), `finalNote: "Approved. Pick a thumbnail and a post for each platform; full-quality delivery comes in the next update. Nothing was posted."`, the finished stages, and `status: "posts"`. Save the work set (`stage: "posts"`: the brief, the posts, the checker reports, the thumbnail specs). The session ends here.

**5. Taylor's picks start nothing.** On `posts` the Publish screen shows the five thumbnails and two variations per platform; he picks one of each, copies each text with its Copy button, and presses **Ready to post**, which sets `status: "final"` and `readyAt`. No session runs for that, and no file changes. A later session never changes `picks`.

## If something fails

Write `status: "failed"`, `error` (one sentence Taylor can act on), `failedStage` (the stage's name) and that stage's `state: "failed"` with its real `endedAt`. Do not leave a job on `running`. The Publish screen shows the error and the stage, and frees Start a new video.

## Reels jobs (Phases 8a and 8b, 4 November 2026; Path B, 6 November 2026)

**Two paths, chosen from the files, never asked (Taylor's decision 11, 6 November 2026).** The reel job's `path` says which:
- **Path A** (`path: "A"`, and every reel job from before 6 November 2026, which has no `path`): only the main recording, in one file or in parts. The ideas-first reels below: the session suggests six reel scripts for Taylor to record on his phone, in the skill's own Reel highlight pack format (each a hook from frame 1, three highlights with the value given to the end user, a close, 60 s or less at reel pace, why it works and its B-roll plan); Taylor picks two and records them, then the reels are built from his takes.
- **Path B** (`path: "B"`): the main recording **and** one or more phone takes, files Check the files classified as `phone-recording` (`scripts/classify-video.py`) and Taylor kept as `reel`. No highlight ideas, no script and no second recording: the session cuts reel options straight from the take(s), Taylor keeps the ones he wants, and the same Music and Ready to post steps follow (decision 9). See "Path B" below.
- A phone take with no main recording is refused (Check the files will not confirm it, and the Reels lane refuses a phone file as a source): Path B needs the main recording for its screen-share B-roll and for the guard.
The classifier's folder JSON carries the same answer as `reels: {path, takes, why}`.

**Where a reel job comes from.**
- Both paths start by themselves (decision 10: one Drive folder link runs end to end; Path A since 7 November 2026, Taylor: "when I paste only the YouTube recording, the app should suggest which reel scripts I should record on my phone"). When Taylor confirms Check the files on a Video job, the app creates the reel job (`auto: true`, `jobId`, the title he confirmed, `offsetS: null`) and starts its session with `Run Reels job <id>`: Path B when the files hold a phone take, Path A when the main recording is alone. If the Video session was refused, the reel job waits on `queued` and starts with the Video job's next session. A Video job confirmed before 7 November 2026 with no reel job shows **Suggest reel scripts to record** under it, which does the same.
- Taylor can also open **Publish → Reels** (`#/publish/reels`), choose a Video job ("Use this video's main recording") or paste one Drive file or folder link, give the title word for word (and, optionally, the YouTube trim in seconds), and press **Generate Reel highlight pack** (Path A) or **Generate reel options** (a Video job with a phone take: Path B). A pasted file is the main recording alone (Path A). A pasted folder is listed by the session, which decides the path from it (`path: null` until then).
The app saves `reels/<id>` in the same artifact database and starts a session with `Run Reels job <id>`, the same way Generate starts one on Video. If the connector is refused, Taylor sends that line in a chat.

**One session per lane, not one for both (decided 6 November 2026, Taylor's decision 4: keep plan usage low).** The Path B reel job runs in its own session, started by the same Confirm press, rather than inside the Video session. Every turn of a session re-reads its whole conversation, so one session doing both would carry the reel cut, its renders and checks through every later Variety Pack turn (and the pack's planning through every reel turn), and the Variety Pack would wait behind the reel renders. Two sessions each start small (well under 60 k tokens) and run side by side. What they share costs machine time, not plan usage: the main recording is downloaded and joined in each (about a minute), and the reel session restores the Video job's transcript and guard registry from its work set when it has been saved, or makes them once itself and keeps them in its own work set.

A reel job is its own document, never fields on a Video job: the two lanes run at different times, and separate documents mean neither overwrites the other. **Never write `jobs/<id>` from a reel job.** Read the Video job (`jobId`) only. The Video lane finds its reel job from `reels/<id>.jobId`.

Use exactly the skills on the document, with the Skill tool:
- `reelsEdit` (default `suby-shots-with-katana`, 5.0): its reel run: step 1 (the Reel highlight pack, master rule 9) in Run, steps 3 to 8 in Continue from recordings, and steps 10 and 11 at the finish.
- `reelsCopy` (default `finishing-touches-copy-and-scripts`): the fluency pass on every script.
- `reelsPosts` (default `performance-poster`): the reel captions, at the finish.
If a field is missing, use the default from `public/settings.js`. Never swap in a different skill or recreate one from memory.

Its master rules hold: never an AI voice (rule 5); reels are 60 s or less (rule 6); **short-form is never cut from the YouTube video** (rule 4). In a reel job the recording is read **only for its words and times**: it is transcribed and the highlights point at its sections, but nothing is cut, rendered or exported from it. The reels themselves are recorded fresh by Taylor on his phone after he picks his winners. The only material from the main recording that may ever reach a reel is the skill's own silent, face-free screen share, made after he has recorded.

**Music is Taylor's choice per reel (his decision 6, 4 November 2026), and it overrides the skill's master rule 7 for app jobs.** A winner with `music: false` is finished with no music: his voice and the house sound effects only. A winner with `music: true` gets one track from his Drive music folder (`1K_jgiT6VkyIgSHE7_aTnqnRhw_S-8SxH`, the skill's `LIBRARY`), the one he picks, or none if he switches it off. Never another music source. The 4:5 post takes the reel's choice (the skill's "same" pick).

### The reels document (`reels/<id>`)

One writer per field. Write with ArtifactData, pinned to the version you read (`if_version`). A document may be up to 256 KiB, so the whole pack (about 20 to 40 KB) lives on it.

| Field | Written by | What it is |
|---|---|---|
| `id`, `createdAt`, `startedAt`, `updatedAt` | app (`updatedAt` both) | |
| `jobId` | app | the Video job it came from, or null |
| `topicId` | app | the saved topic, or null |
| `title`, `titleBy: "taylor"` | app | the title, word for word. It governs the pack |
| `path`, `pathWhy`, `pathBy: "app" \| "session"`, `pathAt` | app (the session only when the app left `path` null: a pasted folder) | `"A"` or `"B"` (see "Two paths" above), and the one line the Reels lane shows ("You added a phone recording, so reels are cut straight from it.") |
| `takes: [{driveId, url, name, kind, decision, probe}]` | app, from the Video job's confirmed phone takes (the session for a pasted folder) | Path B only: the phone takes the reels are cut from |
| `auto: true` | app | Path B made by Confirm and continue on a Video job |
| `source` | app | `{kind: "job", jobId, driveId, url, fromJob: true}` (that job's main recording; for a main in parts also `driveIds` and `urls`, every part in `part` order, and `seconds`, their total, with `driveId` part 1), `{kind: "file", driveId, url}` or `{kind: "folder", folderId, url}` |
| `offsetS` | app | the YouTube trim in seconds, or null |
| `skills` | app | `{reelsEdit, reelsCopy, reelsPosts}`, copied from Settings at Generate |
| `existingSeen`, `skipExisting` | app | as on Video jobs: earlier reel work Taylor was shown and chose to start fresh over |
| `status` | both, see below | |
| `session: {id, url, step: "pack" \| "recordings" \| "music", requestedAt, startedAt}` | app | |
| `stages: [{name, detail, state, startedAt, endedAt}]` | session | real times only, as on Video jobs |
| `error`, `failedStage` | session (the app writes `error: "Stopped by Taylor"` on Stop, and clears both on Try again) | |
| `existing: [{title, url | reelsId, why, createdAt}]`, `foundNote` | session | on `found` |
| `recordingSeconds`, `check` | session | the main recording's measured length and its file check |
| `pack` | session | the highlight pack, below |
| `winners: {"<ideaId>": {music: true | false, at}}`, `winnersSavedAt` | app | Taylor's two winners, and whether each gets music (Taylor's decision 6: off means no music) |
| `takeLinks: [{driveId, url, at}]`, `takeFolders: [{folderId, url, at}]` | app | phone takes Taylor pasted: file links, or folders for the session to list. The app refuses the main recording, any file it already knows is landscape, silent or an output, Docs links and duplicates |
| `takesFound: [{driveId, name, url, folderId, kind, decision, reason, probe}]`, `foldersListed: [folderId]` | session | every file in a listed folder (and every pasted link), classified by `scripts/classify-video.py` |
| `recordings: [{winnerId, driveId, url, name, from: "video" \| "folder" \| "link", probe, by: "taylor", at}]` | app | Taylor's one-tap match: the take for each winner. One take per winner, never one take for two winners |
| `checks: {"<winnerId>": {driveId, state: "ok" \| "failed", shape, seconds, voice, guard: "pass" \| "blocked", note, at}}`, `checkNote` | session | the check of each matched take before anything is cut, and one sentence when a take is refused |
| `reviewUrl`, `work` | session | the reel job's private review page (one per reel job) and its saved work set |
| `built: [{id: "A", winnerId, seconds, music, preview, still}]` | session | the built reels without music: `preview` is the no-music review copy on the review page, `music` the winner's tick. On Path B `{id, optionId, seconds, music, preview, still}`, one per kept option, `music` from `keep` |
| `options` | session | Path B: the reel options cut from the take(s), below |
| `keep: {"<option id>": {music: true \| false, at}}`, `keepSavedAt` | app | Path B: the options Taylor kept, each with its Add music switch (off means no music), saved together with the session that finishes them |
| `music: {folder, syncedAt, tracks: [{n, title, folder, seconds, url}], proposals: {"A": [n, …]}, note}` | session | the synced music library and up to three proposed tracks per reel with music |
| `musicPicks: {"A": {track: n \| null, off: true \| false, by: "taylor", at}}` | app | Taylor's track for each reel with music, or `off: true` for no music |
| `finals: [{reelId, kind: "reel" \| "post" \| "cover", label, url, detail, image?}]`, `captions: [{reelId, text, check}]`, `finalNote` | session | the finished files on the review page and the checked captions |

`status`: `queued` → `starting` (app, once the session opened) → `running` (session) (→ `found`) → `pack` (session) → `recording` (app, on Save winners with exactly `pack.winnersToPick` picked) → `building` (app, once the "from recordings" session opened) → `music` (session, when a winner has music) → `finishing` (app, once the "from music" session opened) → `final` (session). With no music on any winner, the session goes from `building` straight to `final`. A session that refuses a take, or lists a folder for Taylor to match, writes `recording` again. `failed` with `error` if it cannot finish. Taylor's **Change winners** sets `pack` again (app), only while no take is matched. The session never writes `winners`, `takeLinks`, `takeFolders`, `recordings` or `musicPicks`; the app never writes `pack`, `takesFound`, `checks`, `built`, `music`, `finals`, `captions` or `stages`.

Path B `status`: `queued` → `starting` (app) → `running` (session) (→ `found`) → `options` (session, the reel options written) → `finishing` (app, once the "from options" session opened) → `music` (session, when a kept reel has music) → `finishing` (app, once "from music" opened) → `final` (session). With no music on any kept reel, the "from options" session goes straight to `final`. `failed` with `error` as on Path A. The session never writes `keep`, `keepSavedAt`, `takes` (except for a pasted folder) or `musicPicks`; the app never writes `options`.

`session: {id, url, step: "pack" | "recordings" | "options" | "music", requestedAt, startedAt}`: `step` is the stop the session continues from. Each session adds its own stages to `stages` (never removes earlier ones); the Reels screen shows a later session's stages from its `requestedAt`.

`pack` (version 2 since 7 November 2026: the reel scripts Taylor records on Path A):
```text
{version: 2, skill: "suby-shots-with-katana", builtWith: "reels.py highlights", checkedAt,
 ideaCount: 6, highlightsPer: 3, winnersToPick: 2, maxSeconds: 60, wpm: 160,
 durationS,                         the recording's length in seconds, for the map
 timesIn: "recording" | "youtube",  "youtube" only when offsetS was applied
 ideas: [{id, n, name, angle, why, seconds, words, hook, close,
          highlights: [{head, say, value, t0, t1, yt0, yt1, lines: [{t, text}], still: null,
                        broll: {kind: "screen-share", what, silent: true, face: false}}],
          katana:   [{words, concept}],   1 or 2: an approved concept on the script's own words
          blender:  [{on, concept}],      0 or 1: only where a concept needs one
          graphics: [{kind, on}]}]}       the house motion graphics, one at a time
```
These are exactly the fields of the skill's `highlights.json` (`reels.py highlights` with no arguments prints it), plus what the app needs to show the script whole:
- `t0`/`t1` are seconds; `yt0`/`yt1` the same times as the screen shows them ("18:38"); `lines` the exact source lines with their times, as `reels.py highlights` groups them (its `_hl_lines`, with its fixes).
- `value` is the text after "Value given to the end user:". The words Taylor says are `hook`, then each highlight's `say`, then `close`, in that order: the hook is on screen from the first frame.
- `seconds` and `words`: the spoken length at reel pace, as `reels.py highlights` prints it (160 words a minute, 60 s or less).
- `why`: one or two sentences on why this script works, for someone who has never seen the video: the framework step it uses (§0B: the title as a contrast, meet them where they are, bust the belief, show it, close on the title) and what the viewer can do with it. No claim stronger than the video shows.
- The B-roll plan (the skill's reel run steps 5 and 6, and master rule 8), made after Taylor records but planned here: each highlight's `broll` is the silent, face-free screen share of its own `t0`/`t1` (master rule 4's one exception), with `what` saying what the screen shows there in a few words. Prefer sections whose screen moves and shows what is said; never one whose screen shows a client's name or private text (choose another section). `katana` uses the five approved concepts (`word-punch`, `stretch-morph`, `interface-story`, `fly-through`, `camera-language`) on 2 to 4 of the script's own words; `blender` and `graphics` say where a Blender shot or a motion graphic (odometer, bars, checklist, chips, flow, quote, stat, word pop) goes.
The app shows a pack only when it has exactly `ideaCount` ideas, each with `highlightsPer` highlights, every one with `say`, `value` and `t0 < t1`, and every script 60 s or less at `wpm` (it counts the words itself). A version 2 pack also needs `why` on every idea, a `broll` on every highlight with `what`, `silent: true` and `face: false`, and at least one `katana` shot with `words` and `concept`. It never repairs a pack. Packs written before 7 November 2026 have no `version` and show as before, without why and the B-roll plan.

### Run Reels job <id>

1. Read `reels/<id>`. Set `status: "running"` and the first stage, **Check the recording**.
2. Find the main recording, and refuse anything else:
   - `source.kind: "job"`: read `jobs/<jobId>` (read only). Its source with `role: "main"` must have this `driveId`; for a main in parts, its `role: "main"` sources in `part` order must be exactly `source.driveIds`. Use it as is (Check the files has already passed on it).
   - `source.kind: "file"`: `python3 -I scripts/classify-video.py --drive <driveId> --role main --json`. It must be a `youtube-recording` with `accept`. A phone recording, a finished reel or post, or a LinkedIn cut is never a source: fail with one sentence, for example "That file is a phone reel recording; paste the main recording instead."
   - `source.kind: "folder"`: `python3 -I scripts/classify-video.py --drive-folder <folderId>`. Take its proposed `main` (one file, or its parts in order, as "A main recording in parts" says). No `main`, or one it asks about, fails the job ("The folder has no main recording." or "The folder has two main recordings: paste the one you want.").
   Write `check` and `recordingSeconds` (the joined length for a main in parts), and finish the stage. Whenever a reel session downloads the main recording, a main in parts is downloaded and joined in order first (Video's Run step 3). In a folder, also write every phone recording you saw (and every other file except the main) to `takesFound` with its `folderId`, and the folder to `foldersListed`: these are Taylor's takes later, offered once he has picked his winners.
3. **Look for earlier work** (skip when `skipExisting` is true): read the other `reels` documents and the `packs` index (`kind: "reels"`), and list Taylor's artifacts whose titles end `Reel Highlights` (as Video's step 4 does). It is the same recording when the `driveId`, folder or Video job matches, or the length is within 2 s and the topic or two title words match. Leave out anything in `existingSeen`. On a match, write `existing` (`reelsId` for a reel job, `url` for a page), a one-sentence `foundNote`, the finished stage and `status: "found"`, and end. Nothing is downloaded.
4. **The words and times.** If the Video job's saved work set has the transcript (`jobs/<jobId>.work`), restore `words.json` and `sentences.tsv` from it as "The work set" says (read only: never write the Video job or its pack). Otherwise download the main recording (Video's Run step 3) and transcribe it with the skill's `scripts/transcribe.py`. This is the only use of the recording.
5. **The pack** (stage **Draft six reels**, then **Finishing Touches pass**, then **Check the pack**): invoke `reelsEdit` with the Skill tool and run its reel run **step 1 only**, as written (`references/instagram-framework.md` §0B: its rules, its reel script framework and the lines Taylor rejected), with the title on the document word for word, `offsetS` as the pack's `offset`, and `reelsCopy` for the fluency pass on every hook, highlight line and close (its `flow_check.py` on each script). Write each idea's `why` and its B-roll plan (`broll` per highlight, `katana`, `blender`, `graphics`) into `highlights.json` beside the skill's own fields. Run `reels.py highlights <highlights.json> <words.json> <out>`. If it refuses the pack, fix the drafts and run it again. Never write a pack it refused. Build `pack` from that same `highlights.json` (the source lines and lengths exactly as the checker made them) as version 2. Do **not** publish the skill's own highlights page: Taylor picks in the app (decisions 4 and 6), and the app is the one page for this video.
6. Write `pack` (above), the finished stages, and `status: "pack"`. Wait on long steps with one Monitor, as on Video. **Stop here.** Never read `winners`, never ask Taylor to record, and never cut, build, render or pick music.

### Path B: reels cut straight from the phone take (Taylor's decisions 9 and 10, 6 November 2026)

`Run Reels job <id>` on a document with `path: "B"`, or a pasted folder (`path: null`) that turns out to hold a phone take. Use `reelsEdit` (default `suby-shots-with-katana`) with the Skill tool, exactly as its reel run builds a reel, with these differences: **no highlight pack, no script, no second recording.** Never an AI voice, not even as a stand-in or a preview (rule 5). **Nothing short is cut from the YouTube recording: the only material from it in a reel is silent, face-free screen share** (master rule 4's one exception). Re-read the document before each stage and stop at once on `error: "Stopped by Taylor"`. Stage times are real (`date -u`), as on Video jobs, and a stage starts or ends at least every 90 minutes.

1. Read `reels/<id>`. Set `status: "running"` and stage **Check the recording**. Find the main recording as in "Run Reels job" step 2 (for `source.kind: "job"`, read `jobs/<jobId>` only). For a pasted folder, run `python3 -I scripts/classify-video.py --drive-folder <folderId>`: its `reels` says the path. Write `path`, `pathWhy` ("You added a phone recording, so reels are cut straight from it."), `pathBy: "session"`, `pathAt` and `takes` only when the document has `path: null`; with `path: "A"` carry on with "Run Reels job" step 3 instead. No main recording fails the job ("The folder has no main recording: a phone take alone cannot make reels.").
2. **Look for earlier work** as in "Run Reels job" step 3 (a `reels` document or a reel page for the same take or the same main recording). On a match stop on `found`.
3. **Restore or make the work set** (stage **Restore the saved work**): the reel job's own (`work`), else nothing. Then **the guard** exactly as "The guard" below: restore the Video job's registry from `jobs/<jobId>.work` (read only) or register the main recording yourself (download every part and join them first: "A main recording in parts").
4. **Check the takes** (stage **Check the takes**). For each take in `takes`: download it, then refuse it with one sentence in `checks[<driveId>].note` when it is the main recording or any output (`youtube-recording`, `finished-reel`, `linkedin-cut`), is not upright 9:16 after rotation, has no sound, or fails `youtube_guard.py check-media <take> --purpose reel` (exit 4). Transcribe each take that passed with the skill's `scripts/transcribe.py` and run `youtube_guard.py check-words <words.json> --purpose reel`. Write `checks` (keyed by the take's `driveId`: `{driveId, state, shape, seconds, voice, guard, note, at}`). If no take passed, fail the job ("youtube_guard blocked IMG_3097.MOV: …" or the reason) and stop. Never work around a block.
5. **Find the best sections** (stage **Find the best sections**). From each take's transcript pick the strongest self-contained runs, each **60 s or less**, each opening on its hook in the first frame (the first spoken words are the hook, no lead-in), cuts between sentences only: `reels.py cut <take> <words.json> <job> <id> "s-e,…"`. Usually 2 to 4 options from a 3-minute take; one per strong section, never padding. Never pass the main recording to `reels.py cut`.
6. **B-roll from the main recording** (stage **Screen-share B-roll**). For each moment where the take talks about something shown in the main recording, find that moment in the main recording's transcript (restored from the Video work set, or transcribed once and saved in the reel work set) and cut only the skill's silent, face-free screen share of it (`reels.py prep` or `screenshare.py`: the screen half of the 3840x1080 frame, never the camera half, never its audio), 1 to 15 s per clip. Record each as `{at, seconds, src0, src1, yt0, yt1, what, silent: true, face: false}`.
7. **Captions, Katana and Blender** (stages **Katana and Blender shots**, **Render**, **Sound and QA**), as the skill's reel run does: style C captions, the Katana and Blender shots its rules earn, `reel_render.ts final-stills` (look at the sheet), `final`, `reels.py mix` without music (Taylor's voice to −14 LUFS, the house effects), `reels.py qa`. Then `youtube_guard.py check-media <reel> --purpose reel` on every finished option: an option it blocks is dropped, never shown.
8. **The reels Variety Pack** (stage **Publish the options**). Make the reel job's review page (`<title> - Reels`, see below) and publish each option's no-music copy to it as `reels/<id>-option.mp4` (under 14 MB, 720 × 1280) with a 9:16 still, with `capabilities: {downloads: true}`. Taylor picks in the app: do not publish the skill's own reel board. Write `reviewUrl` and `options`:
   ```text
   {skill, builtWith: "reels.py options", checkedAt, maxSeconds: 60, note,
    takes: [{driveId, name, seconds, guard: "pass"}],
    reels: [{id: "A", name, hook, why, seconds, take: <take driveId>, cuts: [{t0, t1}],
             broll: [{at, seconds, src0, src1, yt0, yt1, what, silent: true, face: false}],
             katana: [{at, concept}], blender: [{at, concept}], captions: "style C",
             preview: <its address on the review page>, still, guard: "pass"}]}
   ```
   The app refuses the whole set (and shows Make the options again) unless every option has a name, a hook, `0 < seconds <= 60`, a `take` in `takes`, `cuts`, an https `preview`, `guard: "pass"`, and every B-roll item `silent: true`, `face: false` with `src0 < src1`. It never repairs options.
9. Save the work set (the takes' transcripts, the cut lists, each option's `plan.json`, the Katana and Blender specs, the QA reports, the guard registry), write the finished stages and `status: "options"`, and end. Taylor keeps the options he wants (any number, one or more), each with an **Add music** switch (off means no music, decision 6), and presses **Finish the reels I kept**, which saves `keep` and `keepSavedAt` with the session it starts.

### Continue Reels job <id> from options (Path B)

1. Read `reels/<id>`. It must be on `finishing` (or `options` when the line came from a chat: set `finishing`) with `keepSavedAt` and at least one `keep`. Otherwise fail ("Keep one or more reels, then press Finish."). Restore the saved work.
2. Write `built`: one entry per kept option, in option order, `{id: <option id>, optionId, seconds, music: keep[id].music, preview, still}`. Options not kept are never finished.
3. A kept reel with `music: true`: run "Continue Reels job from recordings" step 7 (the music library, up to three proposals each) and stop on `music`. Taylor picks there and **Finish my reels** sends `Continue Reels job <id> from music`, which carries on exactly as on Path A.
4. No kept reel has music: carry on with **Finish** below in this session, then end on `final`.

### Every later reel session: the work set and the guard

The reel job has its own work set, saved as on Video jobs ("The work set"), on the reel job's own private review page: `reviewUrl`, a private artifact titled `<title> - Reels`, `icon: "video"`, made once per reel job by the first session that needs it and updated in place after that (never a new page per round, never the app). It holds `work/work.tar.gz` and `work/manifest.json`: the winners' scripts (`job notes`), each take's `words.json` and `sentences.tsv`, the cut lists, the `plan.json` of each reel, the Katana and Blender specs, the music `library.json`, the QA reports and the guard registry. Restore it first in every later session (stage **Restore the saved work**), check every `sha256`, and save it again before the session ends.

**The guard (master rule 4, collision C6).** Before any take is used, the guard must know this week's YouTube recording:
- If the reel job came from a Video job with a saved work set (`jobs/<jobId>.work`), read that work set (read only: never write the Video job or its pack) and restore only its guard registry (`.suby/youtube-registry.json`); set `SUBI_YT_REGISTRY` to it.
- Otherwise (a pasted link, or a Video job with no work set), download the main recording once, then the skill's own `python3 <skill-dir>/scripts/youtube_guard.py register-source <recording> --label "<title>"` and `register-words <words.json> --label "<title>"` with its transcript (restore `words.json` from the reel work set, or transcribe it once), and save the registry in the reel work set.
- Never skip this. If the registry cannot be made, fail the job ("The YouTube recording could not be registered with the guard, so no take was used.").

### Continue Reels job <id> from recordings

Taylor records his two winners on his phone (front camera, upright, his own words), puts the takes in Drive and taps the take for each winner on Your recordings, then presses **Build my reels**. The app saves `recordings` and starts this line. If he sent it in a chat, the document is on `recording`: set `building` yourself.

1. Read `reels/<id>`. It must have `winnersSavedAt`, `winners` (exactly `pack.winnersToPick`) and be on `building` (or `recording`). Restore the saved work if `work` exists. Start stage **Check the takes**.
2. **List and check, a few MB each.** For each folder in `takeFolders` not in `foldersListed`: `python3 -I scripts/classify-video.py --drive-folder <folderId>`; add every file to `takesFound` with its `folderId`, and the folder to `foldersListed`. For each `takeLinks` file not in `takesFound`: `python3 -I scripts/classify-video.py --drive <driveId> --role reel --json`, and add it.
3. If a winner has no take in `recordings` (Taylor pressed **List my folder**), stop: write `takesFound`, `foldersListed`, `checkNote` ("Your folder is listed: tap the take for each winner, then Build my reels."), the finished stage and `status: "recording"`. Nothing is downloaded.
4. **Each matched take, before anything is cut.** Refuse, with one sentence in `checks[winnerId].note`, any take that:
   - is the main recording, or any file the guard knows as a YouTube recording or output (`kind` `youtube-recording`, `finished-reel`, `linkedin-cut`): "This is the YouTube recording. Reels are never cut from it: record this reel on your phone.";
   - is not upright 9:16 after rotation (`probe.band` not `tall`): "This take is landscape. Record it upright with the front camera.";
   - has no sound: "This take has no sound. A reel needs your own voice.";
   - fails the skill's `python3 <skill-dir>/scripts/youtube_guard.py check-media <take> --purpose reel` (exit 4): "youtube_guard blocked <name>: it is a copy of the YouTube video.".
   Then download each take that passed and transcribe it with the skill's `scripts/transcribe.py`, and run `youtube_guard.py check-words <its words.json> --purpose reel`: a take that re-reads the YouTube video word for word is refused ("youtube_guard blocked <name>: its words match the YouTube recording. Record this reel again in your own words."). Write `checks` for every winner (`state`, `shape`, `seconds`, `voice`, `guard`). If any take was refused, write `checkNote`, the stage as done and `status: "recording"`, save the work set, and end: Taylor matches another take and presses Build again. Never work around a block (no renaming, re-encoding, trimming or retyping).
5. **Build** (stage names as you go: **Cut**, **B-roll from your highlights**, **Katana and Blender shots**, **Render**, **Sound and QA**). Invoke `reelsEdit` with the Skill tool and run its reel run steps 2 to 8 exactly as written, from each winner's script and its take:
   - save the winning scripts with their value lines to the job notes (step 2);
   - `reels.py cut <take> <words.json> <job> <id> "s-e,…"`: hook and close kept, cuts between sentences only, 60 s maximum. Never pass the main recording to `reels.py cut`.
   - B-roll: only the skill's silent, face-free screen share of each highlight's `t0`/`t1` (`reels.py prep`, or `screenshare.py`), which needs the main recording: download it (Video's Run step 3) for this and nothing else. Never its audio, never a frame of the talking head, 1 to 15 s per clip.
   - Katana and Blender shots, the plan, `reel_render.ts final-stills` (look at the sheet), `final`, `reels.py mix` without music (Taylor's voice to −14 LUFS, the house effects), `reels.py qa`. His voice is always his own recording: never an AI voice, not even as a stand-in or a preview.
   - Run `youtube_guard.py check-media <reel> --purpose reel` on each finished reel too.
   One reel per winner. Make no extra reels from leftover material unless Taylor asks in a chat.
6. **Review copies.** Make the reel job's review page (see above) and publish each reel's no-music copy to it under `reels/<A>-preview.mp4` (under 14 MB, 720 × 1280 is enough), with the page's save button (`capabilities: {downloads: true}`). Write `built` (`preview` is the review page link, `music` the winner's tick), `reviewUrl`.
7. **Music, only when a winner has `music: true`** (stage **Music library**): list Taylor's Drive music folder with the Google Drive connector (`search_files` in folder `1K_jgiT6VkyIgSHE7_aTnqnRhw_S-8SxH`), run `reels.py library sync`, and propose up to three tracks per reel with music (tempo and mood fit the reel; one line each as `why`). Write `music` (`tracks` with each track's Drive link as `url`, `proposals`), save the work set, write the finished stages and `status: "music"`, and end. Do not publish the skill's own reel board: Taylor picks in the app. If the folder cannot be listed, write `music: {tracks: [], note: "…"}` and `status: "music"` all the same: the app lets him switch music off or press Try again, which sends "from music".
8. **No winner has music:** carry on in this session with **Finish** below (no music anywhere), then end on `final`.

### Continue Reels job <id> from music

1. Read `reels/<id>`. It must be on `finishing` (or `music` when the line came from a chat: set `finishing`). Restore the saved work.
2. If `music.tracks` is empty, sync the library first (step 7 above). If it still fails, fail the job ("Claude Code could not list your music folder. Check it is shared as Anyone with the link."). If Taylor has not picked yet, write `music` and `status: "music"` and end.
3. Every reel in `built` with `music: true` needs `musicPicks[id]`: a `track` that is in `music.tracks`, or `off: true`. Otherwise fail ("Choose the music for Reel A, or switch it off."). Never choose a track for him.
4. Carry on with **Finish**.

### Finish (both paths)

For each built reel, on either path (stages **Music**, **Cover and 4:5 post**, **Captions**, **Upload to your review page**):
1. Music: with a track, `reels.py mix … --music <track from the folder>` then `reels.py qa … --without <the no-music mix>`. With no music (`music: false` on the winner, or `off: true`), keep the no-music mix and run `reels.py qa` on it. Never another music source.
2. `reels.py cover <final.mp4> <cover.jpg>` (the hook frame at 1.6 s); the 4:5 post with the same choice: `reels.py feed <that mix> <post.mp4>` (1080 × 1350).
3. The caption with `reelsPosts` (Performance Poster): hook line, 2 or 3 lines, "Full video on YouTube, link in bio.", 3 to 5 registry hashtags, never a client name; run its checker and fix every FAIL. No placeholder: the app refuses to copy a caption that still has one.
4. Publish the 9:16 reel, the 4:5 post and the cover to the reel job's review page (`url: reviewUrl`, the page read first and republished unchanged, only these files in `files` under `reels/`, `capabilities: {downloads: true}`; 14 MB parts as Video's review page does). Full-quality delivery to Drive is Phase 6 and not built: never upload anywhere else.
5. Write `finals` (`reelId`, `kind`, `label` "9:16 reel", "4:5 post" or "Cover", `url` the file's address on the review page, `detail` its size and length), `captions` (`check: "pass"`), `finalNote` ("Both reels are on your private review page. Nothing was posted."), the finished stages and `status: "final"`. Save the work set. Nothing is ever posted: Taylor posts by hand (decision 8), and Post all stays off.

### If a reel job fails

Write `status: "failed"`, `error` (one sentence Taylor can act on), `failedStage` and that stage's `state: "failed"` with its real `endedAt`. Do not leave a reel job on `running`, `building` or `finishing`. The Reels screen shows the error and **Try again**, which restarts the line of the session that failed (`session.step`): `Run Reels job <id>`, `… from recordings`, `… from options` (Path B) or `… from music`. If a valid `pack` was already written, Taylor can still pick from it; after the winners, his takes and music picks are kept. Taylor's **Stop this job** writes `error: "Stopped by Taylor"`: re-read the document before each stage and stop at once if it says so.

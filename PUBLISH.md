# Publish jobs: what the Claude Code session does

Taylor pastes one Drive folder link (or file links) on **Publish** and presses **Generate Variety Pack**.
The app saves `jobs/<id>` in its own artifact database (https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea) and starts a Claude Code session in the cloud by itself, through Taylor's Claude Code Remote connector (3 November 2026).
That session's first message is `Run Publish job <id>`. Every later session starts the same way, by itself, when Taylor presses a button at a stop, and its line names the stop it continues from:

| Taylor presses | Line | The session |
|---|---|---|
| Continue (after his Variety Pack picks) | `Continue Publish job <id> from pack` | builds the pilot, stops on `pilot` (or runs a redo round and stops on `pack`) |
| Approve the pilot, or Change something | `Continue Publish job <id> from pilot` | renders the YouTube master and the LinkedIn cut and stops on `review` (or changes the pilot and stops on `pilot`) |
| Approve both, or Change something | `Continue Publish job <id> from review` | finishes the job (`final`), or makes the changes and stops on `review` again |

`Continue Publish job <id>` with no stop named (jobs from before 5 November 2026) means `from pack`.
Each session is new and runs in a new container: it starts by restoring the **work set** (below), never by transcribing or planning again.
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
  - `publishEdit` (default `suby-shots-with-katana` since 4 November 2026): the edit and its Variety Pack. The pack's page name is whatever that skill's `scripts/variety-pack/build.py` writes: **Katana Kutz - Variety Pack** for With Katana 5.0, **Suby Shots - Variety Pack** for Master Poster. Below, "the pack" means that page.
  - `publishThumbs` (for example `thumbnail-tracker`): thumbnails.
  - `publishPosts` (for example `performance-poster`): titles, descriptions and posts.
  If a field is missing, use the default from `public/settings.js`. Never swap in a different skill or recreate one from memory.
- `status`: `queued` → `starting` → `running` (→ `check` → `starting` → `running`) (→ `found`) → `pack` → `finishing` → `pilot` → `finishing` → `review` → `finishing` → `final`. `failed` with `error` if it cannot finish. The app sets `starting` and `finishing` itself, only after the session has opened; `session.step` then says which stop it continues from (`finals` is from the pack, then `pilot`, then `review`).
- The stops after the pack (Phase 5, 4 November 2026; Taylor's decision 2: keep the pilot stop, then approve the YouTube master and the LinkedIn cut together, in one stop):
  - `work: {url, archive, manifest, files: [{path, bytes}], bytes, stage, savedAt}`: the saved work set (see "The work set"). Written by the session only.
  - `reviewUrl`: the job's private review page, a claude.ai artifact link. One per job, made at the pilot and updated in place after that.
  - `pilot: {url, seconds, round, renderedAt, detail}`: written when the pilot is ready. `url` is the review page.
  - `cuts: {url, round, renderedAt, master: {label, seconds, detail, url?}, linkedin: {label, seconds, detail, url?}}`: written when the master and the LinkedIn cut are ready.
  - `approvals: {pilot, review}`: Taylor's answer at each stop, written by the app together with the session it starts: `{decision: "approved" | "changes", note, round, at}`. The session reads it and never changes it. An answer is current when its `at` is later than the `renderedAt` it answers.
  - `finalNote`: one sentence on the finished job, shown above `finals`.
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

- `title` is the video's name as the pack shows it; `driveIds` the main recording's Drive file ids; `seconds` its measured length (null when not measured); `decisions` the collection the pack saves picks in (`decisions` for a Variety Pack, `katana` for a Katana moments page, `winners` or `picks` for reel pages, null when the page saves only in the browser).
- The app reads it for its free check before Generate. Sessions add a document for every pack they publish (Run step 7), and for an earlier pack they find that is missing (Look for earlier work). Add documents only: never change or delete another pack's document, and never touch any pack's `decisions`.

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

## Look for earlier work (the second stage of every Run, before any download)

The "Thinking With AI" job of 3 November rebuilt a pack for a recording that already had one from a chat (*How to think*, 41 approvals, master and LinkedIn cut built). This stage stops that. It only reads: it never publishes, and never writes to another artifact or its `decisions`.

1. Skip this stage when `skipExisting` is true, or when the job already has `packUrl` (Taylor chose Use this pack: see Run step 2).
2. Read the `packs` collection and the other `jobs` (ArtifactData `list`, `query.limit: 1000`). Leave out anything in `existingSeen`, failed jobs with no `packUrl`, and this job.
3. A pack or job is **the same recording** when any of these holds:
   - its `driveIds` (or a job's `sources[].driveId`) include this job's main `driveId`, or its `folderId` is this job's `source.folderId`;
   - its `seconds` is within 2 s of the main recording's `probe.seconds` and it shares a topic (`topicId`) or two or more title words with this job's `title`, `folderName` or topic title.
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
- `work/manifest.json`: `{job, savedAt, stage, source: {driveId, bytes, seconds}, files: [{path, bytes, sha256}]}`. Small enough to read inline.

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
3. Download the main recording only (`role: "main"`) from Drive: `curl -L "https://drive.usercontent.google.com/download?id=<driveId>&export=download&confirm=t" -o <file>` into the scratchpad. Check it is a video with `ffprobe`. Do not download `reel` or `skip` files in this run. If a file will not download, fail the job with "File <n> is not shared as Anyone with the link."
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
   Add `packs/<pack id>` (`kind: "variety"`, the job's `title`, `skill`, `round`, the main `driveIds`, `folderId`, `seconds`, `topicId`, `jobId`, `decisions: "decisions"`, `by: "session"`). The Publish screen then shows **Open the Variety Pack**, the number pre-ticked, and Continue.
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
3. **Approved:** the finished files. Full-quality delivery (the master and LinkedIn cut to Drive, Taylor's decision 3) is phase 6, and thumbnails and posts (`publishThumbs`, `publishPosts`) are phase 7; neither is in this file yet. Until they are, do not re-render and do not upload anything: write `finals` with the review page for each cut (`{platform: "youtube" | "linkedin", label, url: reviewUrl, detail: "Approved review copy on your private review page"}`), `finalNote: "Approved. Full-quality delivery and the thumbnails and posts come in the next updates; nothing was posted."`, and `status: "final"`.
4. Nothing is ever posted. Post all stays off until the platform connections exist.

## If something fails

Write `status: "failed"`, `error` (one sentence Taylor can act on), `failedStage` (the stage's name) and that stage's `state: "failed"` with its real `endedAt`. Do not leave a job on `running`. The Publish screen shows the error and the stage, and frees Start a new video.

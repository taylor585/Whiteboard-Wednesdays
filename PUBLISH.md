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
  - `publishEdit` (default `suby-shots-with-katana` since 4 November 2026): the edit and its Variety Pack. The pack's page name is whatever that skill's `scripts/variety-pack/build.py` writes: **Katana Kutz - Variety Pack** for With Katana 5.0, **Suby Shots - Variety Pack** for Master Poster. Below, "the pack" means that page.
  - `publishThumbs` (for example `thumbnail-tracker`): thumbnails.
  - `publishPosts` (for example `performance-poster`): titles, descriptions and posts.
  If a field is missing, use the default from `public/settings.js`. Never swap in a different skill or recreate one from memory.
- `status`: `queued` → `starting` → `running` (→ `check` → `starting` → `running`) (→ `found`) → `pack` → `finishing` → `final`. `failed` with `error` if it cannot finish. The app sets `starting` and `finishing` itself, only after the session has opened.
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
   Add `packs/<pack id>` (`kind: "variety"`, the job's `title`, `skill`, `round`, the main `driveIds`, `folderId`, `seconds`, `topicId`, `jobId`, `decisions: "decisions"`, `by: "session"`). The Publish screen then shows **Open the Variety Pack**, the number pre-ticked, and Continue. The session's work ends here.

## Continue Publish job <id>

1. Read `jobs/<id>` and its `packUrl`. Read the pack's `decisions` collection with ArtifactData (the skill's own step "Decide").
   A decision is Taylor's own when it has no `preset`, or its `at` differs from `packRecord.presetAt` (he clicked or wrote a note). A pre-tick he left alone still counts as approved: he saw it and pressed Continue.
   If the job has `reusedFrom` and its sources are not all `check: "done"`, run **Check the files** first (it reads a few MB of each file); stop there if it says so.
   If `decisions` is empty, or none of them is Taylor's own, fail the job (`status: "failed"`, `failedStage: "Read the picks"`, `error: "No picks found on the Variety Pack yet. Make your picks there, then press Continue again."`) and stop. Never build a final from designs Taylor has not approved. The Publish screen keeps Open the Variety Pack and Continue on a failed job that has a `packUrl`.
2. If decisions ask for changes, run the skill's redo round on the **same pack URL**, set `status: "pack"` again and stop. This is a new session, so the first session's file path is gone:
   - read the live pack (`action: "read"` with `url: packUrl`), and rebuild `pack.json` from its `<script id="data">` block with every asset id unchanged;
   - render only what the decisions ask for, run `build.py --redo`, apply the phone playback patch again (Run step 6), and publish with `url: packUrl`, label `Round <n>`;
   - send only new or changed media in `files` (files left out are kept); never publish a new artifact for a redo, and never change or delete a decision;
   - update `packRecord` (round, new ids and tags) and that pack's own `packs` document (`round`, `updatedAt`).
   Wait on renders with Monitor, as in Run step 5.
3. Otherwise set `status: "finishing"`, build the finals with the same skills, upload them to Drive, and write `finals: [{platform, label, url, detail}]` and `status: "final"`.
4. Nothing is ever posted. Post all stays off until the platform connections exist.

## If something fails

Write `status: "failed"`, `error` (one sentence Taylor can act on), `failedStage` (the stage's name) and that stage's `state: "failed"` with its real `endedAt`. Do not leave a job on `running`. The Publish screen shows the error and the stage, and frees Start a new video.

---
name: whiteboard-wednesday-output
description: 'Whiteboard Wednesday Output. Once a video is finished (YouTube video, LinkedIn video, 4x5 post, Instagram reel that also goes to Facebook, the winning YouTube and LinkedIn thumbnails and all the post copy), put every file into the Google Drive folder "Output To CODEX" with fixed names so Codex can find and post them. Folder work only: no artifact, no app change, no posting. Use when Taylor says the outputs are finished, "send it to Codex", "Whiteboard Wednesday Output", "put the finals in the Codex folder", or names a finished video to hand over.'
---

# Whiteboard Wednesday Output

One job: copy one finished video's outputs into **Output To CODEX** in Google Drive, every file named so Codex can find it from the video title alone.

This skill never creates an artifact, never changes the Whiteboard Wednesdays app, never posts and never edits a video, thumbnail or text. It only places finished files and writes one Post Copy document.

## The folder (fixed, set by Taylor on 14 November 2026; renamed from "Output for CODEX" the same day, same ID)

| Folder | Drive ID | Link |
|---|---|---|
| Output To CODEX (inside the main Whiteboard Wednesdays folder) | `1VneU3aGiwJ3dX7akYjjspnVXuXw03Y2t` | https://drive.google.com/drive/folders/1VneU3aGiwJ3dX7akYjjspnVXuXw03Y2t |
| Post Copy | `1gKimsHJbaaalQVj6BzbR1OS08tmCJ9ic` | https://drive.google.com/drive/folders/1gKimsHJbaaalQVj6BzbR1OS08tmCJ9ic |
| Post Videos | `1Um3RjVrYlnfMYl8heH5AQv_POsiEy5OV` | https://drive.google.com/drive/folders/1Um3RjVrYlnfMYl8heH5AQv_POsiEy5OV |
| Post Thumbnail | `1zfb0oOWA_cK8dSpqradxNO6e_DOfgyqN` | https://drive.google.com/drive/folders/1zfb0oOWA_cK8dSpqradxNO6e_DOfgyqN |
| Setup (Codex's setup prompt and this process; never put outputs here) | `1jmJauazJHYD027DTF03H2t6vej-lnD4J` | https://drive.google.com/drive/folders/1jmJauazJHYD027DTF03H2t6vej-lnD4J |

The IDs are also in `references/folders.json`. Never create a second "Output To CODEX", never make a folder per video, never rename or move these folders. Codex checks this folder every day at 18:00 UK time (`Output to CODEX.md`, `Setup/`). Files sit flat in the three subfolders; the video title in each name is what groups them.

## Master rules (Taylor, 14 November 2026)

`<T>` is the video title (see "The title" below).

**1. Post Videos** — the platform is always in the name:

| File | Name |
|---|---|
| YouTube video (1080p master) | `<T> - YouTube.mp4` |
| LinkedIn video (LinkedIn cut) | `<T> - LinkedIn.mp4` |
| Instagram reel (also Facebook) | `<T> - Instagram and Facebook - Reel.mp4` |
| 4x5 post (also Facebook) | `<T> - Instagram and Facebook - 4x5.mp4` |

The reel and the 4x5 both go to Instagram and Facebook, so each keeps Taylor's `<T> - Instagram and Facebook` and adds `- Reel` or `- 4x5`; without it the two files would have the same name and Codex could not tell them apart. When a job has two reels (two winners), they are `- Reel 1` and `- Reel 2`, and the 4x5 posts `- 4x5 1` and `- 4x5 2`, numbered in the job's reel order. Use the file's own extension (`.mp4`, `.mov`) in lower case.

**2. Post Thumbnail** — the name says which video it belongs to, never what is on the image. LinkedIn and YouTube only:

| File | Name |
|---|---|
| Winning YouTube thumbnail (1280 × 720) | `<T> - Thumbnail - YouTube.jpg` |
| Winning LinkedIn thumbnail (1920 × 1080) | `<T> - Thumbnail - LinkedIn.jpg` |

No Instagram, Facebook, X, A/B spare or reel cover thumbnails go here.

**3. Post Copy** — one Google Doc per video, named `<T> - Post Copy`, with the video title inside it. The document, top to bottom, with these headings word for word:

1. Heading 1: the video title, exactly as written (not made file-safe).
2. **Winning thumbnails** — which file is the YouTube winner and which the LinkedIn winner (file name, thumbnail number, Drive link).
3. **LinkedIn post** — the picked LinkedIn post, then its first comment under the small heading "First comment" when the job has one.
4. **YouTube description** — the YouTube title on the first line as "Title: …", then the picked description.
5. **Instagram and Facebook copy - 4x5 post** — the 4x5 post caption.
6. **Instagram and Facebook copy - Reel** — the reel caption (`- Reel 1`, `- Reel 2` when there are two).

Every heading that carries 4x5 or reel copy starts with "Instagram and Facebook copy", as Taylor asked. `scripts/output.py doc` builds this document so the order and wording never drift.

## The title

`<T>` is the title Taylor locked for the video, word for word: the topic's title in the `topics` collection, else the job's `title`. Never shorten, retitle or fix spelling. Only characters that break a file path for Codex are changed in file names, by `scripts/output.py names`: `/` and `\` become `-`, `:` becomes ` -`, and `* ? " < > |` are removed; spaces are tidied. The document's Heading 1 keeps the exact title.

## The winning thumbnails

The skill must name the winning thumbnail for YouTube and the winning thumbnail for LinkedIn. Find them in this order, and say in the reply which source you used:

1. **The Publish job** (`jobs/<id>` in the app's artifact database, read with ArtifactData on https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea): `picks["thumbs.youtube"]` and `picks["thumbs.linkedin"]` (ids like `t7`). The files are in `pack.thumbFinals.files[]` with that `id`: YouTube the `size` "1280×720", LinkedIn the "1920×1080". Use `drive.driveId` when present.
2. **Taylor's words**: "YouTube winner is 7, LinkedIn is 12", or files he drops in the chat or names in Drive.
3. **Neither**: do not guess. Ask Taylor once: "Which thumbnail won for YouTube, and which for LinkedIn?" Place everything else meanwhile and leave the "Winning thumbnails" section saying "Not picked yet" for the missing one.

LinkedIn defaults to the same design as YouTube only when the job says so (`thumbs.linkedin` equals `thumbs.youtube`); still upload its 1920 × 1080 size under the LinkedIn name.

## Steps

1. **Find the video.** From Taylor's message: a job id, a title, or the files. With a title, read the `topics` collection and the `jobs` and `reels` collections and match it (similar titles and misheard spellings count; confirm with Taylor if two match). Write down `<T>`.
2. **Gather the sources** (only finished files: status `final`, never a review copy, never a draft round):
   - YouTube master and LinkedIn cut: the job's full-quality Drive files (`full` / `finals[].drive`); a 720p review copy does not count.
   - Reel(s) and 4x5 post(s): the reel job's `finals` with `kind` `reel` and `post` and their `drive`.
   - Thumbnails: as in "The winning thumbnails".
   - Copy: the job's picked posts (`picks["linkedin.post"]`, `picks["youtube.post"]` against `pack.platforms[]`), the reel job's `captions` (`kind` `reel` and `post`).
   - Taylor may instead give Drive links or local files; use those.
   If a finished file is missing, say which one and carry on with the rest. Never render or edit to fill a gap.
3. **Names.** Run `python3 -I <skill-dir>/scripts/output.py names "<T>" --reels <n>` and use exactly the names it prints.
4. **Check for an earlier run.** List each subfolder (`search_files` with `parentId = '<folder id>'`). If a file with the same name is already there, it is the same video: ask Taylor before replacing it. To replace, move the old one to the Drive trash (`trash_file`, recoverable), never delete it for good, then place the new one. Never leave two files with the same name.
5. **Place the videos and thumbnails.**
   - File already on Drive: `copy_file` with `fileId` the source, `parentId` the subfolder ID, `title` the exact name. The original stays where it was.
   - Local file: `create_file` with `parentId`, `title`, `contentMimeType` (`video/mp4`, `image/jpeg`, `image/png`), `disableConversionToGoogleType: true`, and `base64Content` as a file reference `sha256:<hash>:<absolute path>` (`shasum -a 256 <file>`). If a video is too large for that route, use Composio's Google Drive upload instead; if neither works, tell Taylor which file to drag into Post Videos and the exact name to give it.
6. **Write the Post Copy document, always last.** Codex treats a video as ready only once its Post Copy document exists and every file is in place, so never write the document before the videos and thumbnails are placed. Put the copy into a JSON file in the scratchpad in the shape of `examples/copy.example.json`, run `python3 -I <skill-dir>/scripts/output.py doc <copy.json> > <out.html>`, then `create_file` into Post Copy with `title` `<T> - Post Copy`, `contentMimeType` `text/html` and `textContent` the HTML (Drive turns it into a Google Doc with real headings). Put the two thumbnails' Drive links into the JSON after step 5 so the document links to the placed files.
7. **Check.** List the three subfolders again, save the listing as JSON (`[{"title": …, "folder": "Post Videos"}, …]`) and run `python3 -I <skill-dir>/scripts/output.py check "<T>" <listing.json> --reels <n>`. It must print `PASS`. Fix any `FAIL` line (wrong name, missing file, duplicate, file in the wrong folder) and run it again.
8. **Report** in a few plain lines: the video title, each file placed with its name, where each came from, which thumbnails won and from where, anything missing, and the folder link. Nothing is posted.

## Rules for Codex to reach the files

- One flat level: Codex looks in a subfolder and filters by `<T> - `. No per-video folders.
- Names start with the exact title, then ` - `, then the platform. Nothing else in front.
- One file per name. The check fails on duplicates.
- Native Google Doc for the copy, so Codex can export it as text or Markdown; headings are real headings, not bold lines.
- Never put links to review pages, artifacts or YouTube in place of a file.

## Files

- `Output to CODEX.md` — the whole process in plain words, for Taylor and for Codex.
- `Setup/Codex daily automation prompt.md` — the prompt Taylor gives Codex to build the daily 18:00 check.
- `references/folders.json` — the folder IDs and links.
- `scripts/output.py` — `names`, `doc` and `check`; standard library only.
- `examples/copy.example.json` — the shape of the copy JSON.
- `tests/test_output.py` — `python3 -I -m unittest discover -s <skill-dir>/tests`.

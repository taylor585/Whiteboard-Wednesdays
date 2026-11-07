# Platform sizes and rules

Checked 12–13 October 2026. **These are third-party consensus figures.** Neither Google's nor LinkedIn's own help pages were reachable from the build environment, so re-check them if a platform rejects a file.

| Where | Size | Format and limit | Rules | Confidence |
|---|---|---|---|---|
| YouTube custom thumbnail | 1280×720 (16:9); minimum width 640 | JPG/PNG, under 2MB | Up to 3 for Test & Compare. YouTube's duration badge covers the bottom-right (about x 1150–1270, y 660–710 on 1280×720). | High: every source agrees. Some guides say YouTube now accepts larger files (4K, up to 50MB); that was not confirmed, so 1280×720 under 2MB stays the safe default. |
| LinkedIn native video cover | 1920×1080 (must match the video's 16:9) | JPG/PNG, under 2MB (one source says 4MB) | The play button sits dead centre, so keep the key words off the centre. Same design as YouTube, rendered with `scale: 1.5`. | Medium: guides vary between 1280×720 and 1920×1080, all 16:9 |
| LinkedIn image post (teaser) | 1080×1350 (4:5 portrait) | JPG | Takes the most room in the mobile feed. Re-lay out the design (`canvas`), add a "NEW VIDEO · N MIN" chip, keep the bottom ~150px calm. | Medium |
| LinkedIn link preview | 1200×627 (about 1.91:1) | built by LinkedIn | Made automatically from the YouTube thumbnail when you share the link, so there's nothing to upload. It crops about 24px off the top and bottom of a 16:9 image, so keep text more than 30px from those edges. Check with a resize to 1200×675 cropped to 627. | Medium |
| LinkedIn native video itself | 3 s – 10 min (15 min desktop per older help pages), up to 5GB | — | For longer videos, post a 1–3 minute cut natively and point to YouTube. | Medium |

**Which LinkedIn file to use:**
- uploading the video to LinkedIn → the 1920×1080 cover;
- sharing the YouTube link → no upload (the preview is automatic);
- an image post with the link underneath → the 1080×1350.

**Sources consulted:** TechSmith, postfa.st, Shotkit (YouTube); Pippit/CapCut, Prolific Studio, Lilach Bullock (LinkedIn).

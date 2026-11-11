# Assets and images

Every image in a deck must explain something. The approved standard is real material first, shown large, with generated images used only when they make a concrete scene or concept clearer.

## Order of preference

1. **The real source, rendered.** Pages of the actual report rendered with `pdftoppm` at about 300 dpi for zooms, or 220 dpi for crops. Highlights come from the PDF's own coordinates.
2. **Retained finished assets.** The approved ad, landing page, phone view, email and vision board. Show them as themselves, in their client's branding.
3. **Crops and details of those assets**, labelled as details: for example the phone from the ad in the mechanism slide.
4. **Generated images**, through the `llm-image-creator` skill with the actual image tool, when no real asset can show the scene. Inspect every output.
5. **Editable diagrams and charts** (SVG or HTML) for real relationships and exact data. Never a generated picture of a chart.

When the user asked for generated images, do not substitute generic diagrams for them. Photographs, generated scenes, close-ups and concrete metaphors are welcome wherever they explain the point. Supply approved reference images to the generator when available. Never generate a new logo, and never reproduce another creator's trademarked presentation branding; a reference creator informs storytelling only.

If no image-generation tool is available, build from 1 to 3 and 5, and say plainly that no new image was made. Never present a reused asset as new.

## The worked example's assets (`examples/cadre-crew/`)

| File | What it is | Size | Where it is used |
| --- | --- | --- | --- |
| `ww-report.pdf` | ICP-Research-Radar for Cadre Crew, 154 pages | 1.3 MB | Live report slide, quote proof, highlights, page renders |
| `report-p13-300dpi.png` | Page 13 at 300 dpi, 64-colour palette | 2483 × 3512 | Zoom into the source |
| `red008-p13-220dpi.png` | Crop of the RED-008 row, page 13, 220 dpi | 1062 × 282 | Calibration opening |
| `ww-ad.png` | Finished Cadre Crew static ad (illustrative, not launched) | 1122 × 1402 | Creative, annotations, feed, path, 200px check |
| `ww-landing.png` | Landing page hero prototype | 1100 × 630 | Tap the page, path, landing slides |
| `ww-mobile.png` | Recomposed phone landing view | 390 × 720 | Desktop and phone pair |
| `../../assets/ww-coin.svg` | Official Pecuna Factorem coin, vector | 240 × 240 | Deck header, library, logo proof |

Commands to recreate the renders:

```bash
pdftoppm -f 13 -l 13 -r 300 -png ww-report.pdf page      # zoom page
pdftoppm -f 13 -l 13 -r 220 -png ww-report.pdf crop      # then crop (640,160)-(1702,442)
```

## Handling rules

- **Name assets uniquely per deck.** Never overwrite another deck's image or a shared font because the filenames match.
- **Embed once.** In a deck spec, put each image in `assets` and reference it as `{{KEY}}`; the builder embeds it once and reuses it.
- **Keep provenance.** Know where every image came from: the report page, the client asset, or the generator and its prompt.
- **Alt text says what is in the image**, including any words on it (an ad's headline, subhead and button).
- **Show client creative in the client's brand.** The deck brand never recolours a client's ad.
- **No fakes.** No invented report pages, customer screenshots, chat messages, dashboards, logos, testimonials or results. A mock-up (the feed) uses neutral placeholders and is labelled as a mock-up.

## Designing a generated image

Write its teaching job before generating it:

| Decision | Required answer |
| --- | --- |
| Message | What the image must make understandable |
| Evidence | Which source or confirmed fact justifies the scene |
| Subject and action | Who or what is visible, doing what |
| Composition | One focal point, reading direction and clear space for text |
| Brand | Palette, approved asset placement and type treatment |
| Format | Actual slide or ad dimensions and safe areas |
| Overlay | The exact approved words, not "add a headline" |
| Rejection tests | Misleading implication, wrong detail, poor legibility, irrelevant decoration |

Prompt pattern:

> Create [format and aspect ratio] for [audience]. It must communicate [single takeaway] through [specific subject and action]. Use [approved palette], [lighting and material treatment] and [composition]. Keep [named area] clear for [purpose]. Include the exact text [approved overlay] with [hierarchy and contrast]. Do not add statistics, testimonials, interface labels, logos or text not provided. Preserve [reference details].

For an ad, let the image model set the headline when that is the chosen workflow, then place the exact official logo as a separate overlay. Never paste a tiny program-made headline onto a large photo and call it finished. A static with only a button and no designed headline is not a finished ad.

## Checking every image

- Spelling of every word on it.
- Legible at 200px wide: the thumbnail check.
- Physically plausible, and relevant to the slide's idea.
- Contrast and cropping at desktop and phone sizes.
- The logo is the real file, crisp, uncropped.

Regenerate or edit specific defects. Keep on-image copy short, usually three to seven words, without losing the meaning. Show the finished image in the deck and to the user; never deliver prompts instead of images unless prompts were asked for.

## Documents and boards

- The live PDF loads lazily when its slide is revealed, scrolls inside a wide frame (never stretched to fill a widescreen canvas), and always has a separate "Open PDF separately" link.
- A vision board is a working board with play, pause, replay and scene selection. A screenshot of a board is not a demonstration. It unloads when its slide is hidden.
- Keep downloadable documents under the same private access as the deck. A private site does not make a public PDF link private.

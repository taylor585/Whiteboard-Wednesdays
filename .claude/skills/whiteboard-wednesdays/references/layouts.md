# Layout catalogue

Every slide `kind` the approved viewer (`viewer/whiteboard.css`) can lay out, plus the three trial layouts. The live paid ads deck uses every viewer layout; its slide IDs are given so the real thing can be inspected. Devices (`d-*`) are in `device-library.md`.

Shared behaviour for every layout:
- Each part is one reveal group: fade and rise 16px over 200ms.
- On screens up to 640px the parts stack in source order, and unrevealed parts take no space.
- Reduced motion shows everything at once.

## Contents

Viewer layouts: opening, split, stack, journey, creative, copy, techniques, headlines, landing, objections, evidence, document, email, survey, andromeda. Trial layouts (in the example deck spec's CSS): t-open, t-transform, t-flow. Then: choosing a layout.

---

## opening

- **Looks like:** two columns. The first part spans two rows on the left, and the second part sits in a tinted panel.
- **Use for:** the opening promise: a lead sentence and the questions the deck answers, then the input, then the takeaway.
- **Reveals:** `[1,2,3]`: questions, input card, statement.
- **Live example:** `opening`, "The buyer comes first."

## split

- **Looks like:** the first part is tall on the left (two rows) and two parts stack on the right.
- **Use for:** one strong object (source sheet, logo proof, investment list) with two supporting reveals beside it.
- **Reveals:** `[1,2,3]`.
- **Live examples:** `research` (source sheet, branch list, statement), `image-checks` (logo proof, process, 200px check), `investment`.

## stack

- **Looks like:** the first part runs full width across the top, and the rest share two columns underneath.
- **Use for:** a rail or headline relationship across the top, then two consequences.
- **Reveals:** `[1,2,3]`.
- **Live examples:** `research-method` (rail: discussion, finding, decision), `booking`.

## journey

- **Looks like:** three equal columns, each with a 3px gold top border. Images inside are contained, at most 270px high (a mini ad at most 160px wide).
- **Use for:** three stages, three assets or three questions read left to right.
- **Reveals:** one column per reveal, `[1,2,3]`.
- **Live examples:** `campaign` (Paid ad, Landing page, Email), `copy-diagnosis`, `qualification-method`, `email-method`, `video-method`, `production`.
- **Note:** `video-method` and `production` sit back to back in the live deck; that predates the variety rule. For new work, alternate with `d-path`, `t-flow` or `stack`.

## creative

- **Looks like:** source quote top left and adapted headline bottom left, joined by an automatic downward connector that draws in. The finished asset is on a tinted stage on the right, spanning both rows (ad up to 340px).
- **Use for:** source to adaptation to finished asset.
- **Reveals:** `[1,2,3]`: quote with marks, adapted headline, finished asset.
- **Live examples:** `creative` ("Their words become the idea."), `image-method`.
- **Stronger variant:** `t-transform` shows the asset larger with a word mapping.

## copy

- **Looks like:** the source spans two rows on the left; the right-hand parts carry a 2px gold left border.
- **Use for:** source quote, then the finished copy, then the call to action.
- **Reveals:** `[1,2,3]`.
- **Live example:** `ad-copy`.

## techniques

- **Looks like:** full-width rows on a 44px number, name and explanation, and example grid, with hairlines between rows. Rows can share reveal groups.
- **Use for:** a named list where each item has an applied example (the seven Breakthrough Advertising techniques).
- **Reveals:** `[1,1,1,2,2,3,3]`, revealing in clusters so seven items arrive in three beats.
- **Live example:** `copy-techniques`.

## headlines

- **Looks like:** full-width rows of label (220px), headline and explanation.
- **Use for:** alternatives compared on the same terms (selected headline versus two hypotheses).
- **Reveals:** `[1,2,3]`.
- **Live example:** `headlines`.

## landing

- **Looks like:** evidence tall on the left; a framed page or device pair on the right, then a mechanism rail or checklist.
- **Use for:** research to page, design gates, or a script beside its source.
- **Reveals:** `[1,2,3]`.
- **Live examples:**
  - `landing` (research objections, page prototype, mechanism rail)
  - `design-gate` (desktop and phone pair, checklist, app states)
  - `video` (source, script, storyboard strip)

## objections

- **Looks like:** two columns of numbered items (number, evidence reference, 30px question, answer).
- **Use for:** an ordered decision path where each step answers a researched objection.
- **Reveals:** `[1,1,2,2,3]`: pairs, then the last.
- **Live example:** `objection-path`.

## evidence

- **Looks like:** a two-column grid with wide gaps; each part is a category label, a quote at 30px and its reference.
- **Use for:** fears, desires, motivators and real-life language side by side.
- **Reveals:** `[1,1,2,3]`: fear and desire together, then motivator, then the real quote.
- **Live example:** `evidence` ("Find the words that matter.").

## document

- **Looks like:** a full-width bar (label plus a separate-document link), then a lazy-loaded frame at 65% of the viewport height (at least 450px for a PDF, 530px for a board).
- **Use for:** the live report PDF, scrollable inside the slide, or a working vision board.
- **Reveals:** `[1]`. The frame loads only when revealed and unloads when hidden.
- **Live examples:** `live-report` ("The live ICP-Research-Radar document"), `vision-board`.

## email

- **Looks like:** a source ribbon with yellow marks, then the full email on a tint panel: sender label, 40px subject, and body in two reading columns that become one on phones.
- **Use for:** a complete, readable email with its source visible.
- **Reveals:** `[1,2]`: ribbon, then email.
- **Live example:** `email` ("Return to their concern.").

## survey

- **Looks like:** question number buttons, a fieldset of options in two columns, and a route result with a gold left border.
- **Use for:** the working qualification demo. It needs the exact mount markup in `library-and-publishing.md`.
- **Reveals:** `[1]`.
- **Live example:** `survey` ("How We Eliminate Tyre Kickers").

## andromeda

- **Looks like:** one column holding flow boxes (gold bottom border, the focused one tinted) joined by SVG arrows. Below that, a seven-column data table that becomes labelled cards on phones, a callout with a gold left border, and two-column metric panels.
- **Use for:** a system explanation with real or clearly labelled illustrative data. In presentation mode on wide screens it compacts so a dense table fits.
- **Reveals:** `[1,2,3]`.
- **Live examples:** `andromeda`, `uneven-delivery`, `test-the-message`.

---

## t-open (trial)

- **Looks like:** one column: lead and questions, then the actual report row as an image with highlights from PDF coordinates, then the statement. On phones the crop zooms to the quote column (inner width 208%).
- **Use for:** an opening that proves buyer language exists before any claim about it.
- **Reveals:** `[1,2,3]`.
- **Example:** `examples/cadre-crew/trial-calibration.cjs`, `trial-opening`.

## t-transform (trial)

- **Looks like:** source quote top left, then a word mapping (source words, arrow, adapted words), with the finished asset large on the right (up to 430px), entered by a drawn arrow. It stacks at 900px and below.
- **Use for:** the hardest evidence-density slide in a calibration.
- **Reveals:** `[1,2,3]`.
- **Example:** `trial-transformation`.

## t-flow (trial)

- **Looks like:** four columns: a cropped image of the moment, then three numbered steps, each entered by its own drawn arrow, then a full-width statement. Two columns at 900px, one on phones.
- **Use for:** a mechanism revealed one owner or step at a time.
- **Reveals:** `[1,2,3,4,5]`.
- **Example:** `trial-mechanism`.

---

## Choosing a layout

1. Write the slide's single takeaway first (`story-structure.md`).
2. Ask what the audience must see to believe it: a real artefact, a source, a sequence, a comparison or a number.
3. Pick the layout or device that shows that thing largest and soonest.
4. Check the neighbours: no two consecutive slides with the same `kind`.
5. Group reveals by meaning, not by DOM order. Items that must be compared arrive together; a consequence arrives after its cause.
6. A new layout is allowed only with its own scoped CSS, phone rule, reduced-motion behaviour and a browser test.

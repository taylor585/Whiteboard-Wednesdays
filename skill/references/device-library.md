# Visual device library

Eight tested devices for Whiteboard Wednesdays decks. Styles are in `scripts/device-kit.css`, and the runtime for counts and hotspots is in `scripts/device-kit.js`. Each device is a slide `kind`. The kit reads the viewer's `.part.revealed` state with CSS `:has()`, so no viewer change is needed. Reveal numbers below are reveal groups, in order.

Every device keeps its complete content visible in the reading view and under reduced motion. Every device must pass the hard evidence rule before it is shown.

The reference slides are in the device library trial. Its spec, `trial-devices.cjs`, is in the Whiteboard Wednesdays project root. Build it from there with `node skill/scripts/build-trial.cjs trial-devices.cjs`, or with the installed skill's `scripts/build-trial.cjs`.

## Contents

1. Animated counts (`d-counts`)
2. Quote wall (`d-wall`)
3. Zoom into the source (`d-zoom`)
4. Words that morph (`d-morph`)
5. Marker annotations (`d-annot`)
6. In-feed preview (`d-feed`)
7. Tap the page (`d-tap`)
8. Path animation (`d-path`)
9. Choosing and combining devices
10. Variations

---

## 1. Animated counts (`d-counts`)

- **Job:** make the depth behind a claim felt before any single quote appears.
- **Use when:** opening a research-led deck, or before an argument that rests on volume of evidence. **Avoid when:** the figures are estimates, vanity metrics or not in a source you have opened.
- **Evidence rule:** every number is real and shows its source page underneath. Never round up, combine figures from different scopes, or add a performance metric that was not supplied. Add "not a population study" or the equivalent when the evidence is qualitative.
- **Markup:** one part per figure, up to four on a row.
  ```html
  <div class="d-count"><b class="d-num" data-count="222">222</b><p>Reddit comments reviewed</p><small>Report p. 5</small></div>
  ```
  The final value is in the markup, so the reading view, reduced motion and a failed script all show the true number.
- **Reveal pattern:** one figure per reveal, in the order that tells the story (reviewed, then selected, then sources, then pages).
- **Motion:** counts up from zero over 800ms with an ease-out when its part is revealed. With reduced motion it shows the final value at once.
- **Phone:** two columns.
- **Tests:** after the first reveal, the first `.d-num` text equals its `data-count`. Reduced motion shows final values.
- **Reference:** `device-counts`, "The depth behind one line."

## 2. Quote wall (`d-wall`)

- **Job:** show breadth before focus, so the chosen quote is visibly one of many real voices, not cherry-picked out of sight.
- **Use when:** you are about to build an argument on one quotation. **Avoid when:** you have fewer than about six verified quotes, or the quotes are not from the same evidence set.
- **Evidence rule:** every quote verbatim, verified with `verifyQuotes`, with its ID and source. Label public discussion as public discussion, never as testimonials. Highlight marks are allowed only on the picked quote, only on words it contains.
- **Markup:** part 1 is the wall; exactly one figure has `.is-pick`.
  ```html
  <div class="d-wall-grid">
    <figure class="d-q" style="--r:-0.7deg"><blockquote>“…exact quote…”</blockquote><figcaption>RED-001 · r/MedSpa</figcaption></figure>
    <figure class="d-q is-pick" style="--r:0deg"><blockquote>“… <mark>no answer</mark> …”</blockquote><figcaption>RED-008 · r/MedSpa</figcaption></figure>
  </div>
  ```
- **Reveal pattern:** 1, the wall. 2, the others fade to 16% opacity and the pick lifts forward with a clean surround; its highlights appear. Part 2 carries a caption that separates the exact quote from your reading of it. 3, the takeaway.
- **Motion:** 300ms fade and scale.
- **Phone:** two columns; the pick scales only slightly so it never overflows.
- **Tests:** after reveal 2, a non-picked quote has opacity 0.16 and the pick has a transform.
- **Reference:** `device-wall`, "Ten quotes. One scene."

## 3. Zoom into the source (`d-zoom`)

- **Job:** prove a quotation is real by showing the whole page first, then moving in to the exact line.
- **Use when:** the slide's claim depends on a specific quotation from a long document. **Avoid when:** the page is not available as a real render, or the surrounding page changes the meaning and cannot be shown.
- **Evidence rule:** use the actual page image, rendered with `pdftoppm` at about 300 dpi. Place highlights with `findHighlights` from the PDF's own word coordinates, never by hand. Show the page number and total pages.
- **Markup:** part 1 is the frame. Its inline style comes from `zoomVars(pageWidth/pageHeight, region)`, where `region` is the target as page fractions `{x0,x1,y0,y1}`.
  ```html
  <figure class="d-frame" style="--zw:…;--zl:…;--zto:…;--pzw:…;--pzl:…;--pzto:…">
    <div class="d-page"><img src="page.png" alt="…"><svg viewBox="0 0 595.92 842.88"><rect class="d-hl" style="--d:0ms" x="…" y="…" width="…" height="…"/></svg></div>
  </figure>
  ```
- **Reveal pattern:** 1, the whole page in context. 2, the camera moves to the region and the highlights sweep in; part 2 carries the quote as text with its ID. 3, the takeaway.
- **Motion:** 600ms camera move, then 320ms highlight sweeps staggered by 140ms. Reduced motion shows the zoomed page and highlights with no movement.
- **Phone:** taller frame (height/width 0.86, versus 0.72 on desktop). `zoomVars` calculates both, and pins a short region near the top so no blank band shows.
- **Tests:** transform is `none` after reveal 1 and set after reveal 2. Inspect the highlight position on the rendered screenshot at 1280 and 390px.
- **Reference:** `device-zoom`, "One line from 154 pages."

## 4. Words that morph (`d-morph`)

- **Job:** show exactly how a buyer's words became a headline: what was kept, what was dropped and what was added.
- **Use when:** presenting adapted copy that came from a quotation. **Avoid when:** the headline shares no words with the source; use a source-and-asset slide instead.
- **Evidence rule:** kept words must exist in the verified quote. Added words are marked as ours with the dashed accent and a legend. The headline is labelled as authored copy.
- **Markup:** part 1 wraps every word of the exact quote in `span.d-keep` or `span.d-drop`. Part 3 builds the headline from letters, with the full headline in `aria-label` so screen readers read words, not letters.
  ```html
  <blockquote class="d-quote"><span class="d-drop">“someone</span> … <span class="d-keep">no answer</span> …</blockquote>
  <p class="d-head hand" aria-label="No answer. Next clinic?"><span aria-hidden="true"><span class="k"><span class="d-l" style="--i:0">N</span>…</span> <span class="a">…</span></span></p>
  <p class="d-legend"><span class="k">Kept from the quote</span> <span class="a">Added by us</span></p>
  ```
- **Reveal pattern:** 1, the exact quote. 2, dropped words strike through and fade, and kept words highlight. 3, the headline builds letter by letter.
- **Motion:** 300ms strike; letters rise 260ms each, 35ms apart. `white-space:nowrap` on each word group stops a word breaking across lines on phones.
- **Phone:** the headline drops to 50px.
- **Tests:** after reveal 2, a dropped word has `line-through` and a kept word does not.
- **Reference:** `device-morph`, "Keep their words. Add one."

## 5. Marker annotations (`d-annot`)

- **Job:** explain a finished asset's decisions one at a time, drawn on the asset itself like a marker on a whiteboard.
- **Use when:** teaching why an ad, page or email works. **Avoid when:** you would be annotating qualities the asset does not have, or the asset is too small to mark clearly.
- **Evidence rule:** annotate only what the asset actually does. Every note reuses approved wording or cites its source. The client's branding stays untouched under the marks.
- **Markup:** part 1 is the asset with an SVG in the image's pixel space. Each mark is `g.d-a.d-aN` with paths that have `pathLength="1"`; a white halo path under a gold ink path keeps them visible on any colour. Parts 2 onward are `.d-note` entries numbered to match. The kit supports up to eight marks.
  ```html
  <figure class="d-ad"><img src="ad.png" width="1122" height="1402" alt="…"><svg viewBox="0 0 1122 1402"><g class="d-a d-a1"><path class="halo" pathLength="1" d="…"/><path class="ink" pathLength="1" d="…"/><g class="badge"><circle …/><text …>1</text></g></g></svg></figure>
  ```
- **Reveal pattern:** 1, the clean asset. Then each reveal draws one mark and shows its note.
- **Motion:** each stroke draws in 420ms. Reduced motion shows strokes complete.
- **Phone:** the asset stacks above the notes; numbers keep the link.
- **Placement:** keep loops and arrows clear of the letters they point at. Check the screenshot, because a stroke through a headline reads as a defect.
- **Tests:** after each reveal, mark N is visible and mark N+1 is not.
- **Reference:** `device-annotate`, "Every mark has a reason."

## 6. In-feed preview (`d-feed`)

- **Job:** show a paid-social asset at the size and context a buyer meets it.
- **Use when:** presenting a static or video for a feed. **Avoid when:** the asset is not for a feed, or you would need to imitate a specific platform's interface.
- **Evidence rule:** neutral grey placeholder posts only: no invented brands, names, captions, likes or comments. The ad post uses the client's real name and approved primary text. Label it "Illustrative mock-up, not a platform interface."
- **Markup:** a phone frame holding `.d-feed-inner` with a placeholder post, the ad post and a placeholder post. Set `--feed-shift` (default `-252px`) if the first placeholder's height changes.
- **Reveal pattern:** 1, the feed with the ad below the fold. 2, the feed scrolls the ad into view. 3, a 200px thumbnail check.
- **Motion:** 700ms scroll. Reduced motion shows the scrolled position.
- **Phone:** the frame is at most 336px wide and fits a 375px screen.
- **Tests:** after reveal 2, `.d-feed-inner` has a transform.
- **Reference:** `device-feed`, "See it where they scroll."

## 7. Tap the page (`d-tap`)

- **Job:** connect each section of a page or app screen to the buyer question it answers.
- **Use when:** explaining landing page structure, objection order or app states. **Avoid when:** the mapping would be guesswork; say what is not yet mapped instead.
- **Evidence rule:** each hotspot cites its objection, evidence ID and page. Call the order a proposed attention path, never measured eye tracking.
- **Markup:** hotspots are real buttons, positioned in percent of the image. They carry their content as data attributes, so `device-kit.js` needs no deck data.
  ```html
  <div class="d-tapwrap"><div class="d-tap-img"><img src="landing.png" alt="…">
    <button class="d-hot" type="button" style="left:44%;top:35%" aria-pressed="false" aria-label="1: Headline" data-label="Headline" data-h="The buyer’s own moment" data-p="…" data-s="RED-008 · report p. 13">1</button>
  </div><div class="d-tap-panel" aria-live="polite">…prompt…</div></div>
  ```
- **Reveal pattern:** 1, the page and numbered hotspots; tapping one fills the panel. 2, the designed reading order and its caveat.
- **Behaviour:** buttons never advance the slide, because the viewer ignores clicks on buttons.
- **Placement:** hotspots are 44px for touch, so put them in clear space beside the element, never over its words. Check at 390px, where the image is smallest.
- **Phone:** the panel stacks under the image.
- **Tests:** every hotspot fills the panel and sets `aria-pressed`. The slide's progress is unchanged after tapping them all.
- **Reference:** `device-tap`, "Tap the page. See why."

## 8. Path animation (`d-path`)

- **Job:** follow one buyer from asset to asset, so the campaign reads as a journey rather than three separate pictures.
- **Use when:** presenting a campaign path such as `Paid ad`, `Landing page`, `Email`. **Avoid when:** the assets are unrelated; one marker should not imply a sequence that does not exist.
- **Evidence rule:** use the real assets and the approved path labels. Label illustrative campaigns.
- **Markup:** one part per asset. Every part after the first starts with a wire:
  ```html
  <div class="d-wire" aria-hidden="true"><svg class="t-link" …></svg><span class="d-dot"></span></div>
  ```
- **Reveal pattern:** one asset per reveal; the marker travels the wire into each new asset.
- **Motion:** about 700ms travel, after a 120ms delay. Reduced motion hides the marker; the arrows remain.
- **Phone:** stacked, with wires rotated to point down.
- **Tests:** after reveal 2, a `d-travel` animation is running.
- **Reference:** `device-path`, "Give each asset a job."

## 9. Choosing and combining devices

- Pick the device by the slide's single takeaway, not for novelty. If no device teaches it better than a plain image and headline, use the plain slide.
- No two consecutive slides use the same `kind`, and a deck of three or more slides uses at least three. `build-trial.cjs` enforces both. List deliberate exceptions in the spec's `repeatAllowed`, with the reason in the slide map.
- A reliable evidence-led order is counts, wall, zoom, morph, annotations, feed, tap, path. See `story-structure.md`.
- Approved motion exceptions to the 200ms baseline are listed in `motion-and-reveals.md`. Do not stretch other motion.
- New devices follow the same pattern: scoped `.parts.d-*` styles, reveal state read with `:has()`, final content in the markup, a reduced-motion rule, a phone rule, an evidence rule and a test in `scripts/verify-trial.cjs`.

## 10. Variations

The same device can carry different content shapes. These keep a deck varied without inventing new code. Each still obeys its evidence rule.

| Device | Variations |
| --- | --- |
| Animated counts | Two to four figures; a single large figure with its caveat; before and after figures from the same source and scope (never mixed scopes) |
| Quote wall | Three columns of six quotes on a narrower theme; one wall per ICP; pick two quotes to contrast (two `.is-pick` cards need a wider surround and a phone test) |
| Zoom into the source | Zoom to a table row, a chart label or a definition; a two-stop sequence on two slides (page, then section, then line) with a different device between them; zoom into a screenshot the user supplied, labelled as theirs |
| Words that morph | Morph into an email subject line, a landing page headline or a hook; show two candidate headlines from the same quote, each marked as authored |
| Marker annotations | Annotate a landing page, an email or a report page; circle plus arrow for one detail; underline sets for copy rhythm; up to eight marks |
| In-feed preview | Story format (taller screen, adjust `--feed-shift`); two ads in one feed to compare thumb-stop clarity; the same ad at 200px beside the feed |
| Tap the page | Tap an email to map paragraphs to persuasion techniques; tap an app screen to show state handling; tap a report page to map findings to assets |
| Path animation | Two-step or four-step paths; a branching path for qualified versus nurture; the same buyer across ad, page, survey and email |

When a variation needs new CSS, scope it to the deck's own spec CSS, add a phone rule and a reduced-motion rule, and test it.


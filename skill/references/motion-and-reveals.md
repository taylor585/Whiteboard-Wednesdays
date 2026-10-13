# Motion, reveals and zoom

Motion in Whiteboard Wednesdays has one job: show the next idea at the moment the presenter says it. Short, quiet movement reads as confident. Long or decorative movement reads as a template.

## Reveal choreography

- Every part has an explicit reveal group in `reveals`, one number per part, starting at 1 and contiguous. Parts that must be compared share a group.
- Common patterns:
  - context, mechanism, outcome (top to bottom)
  - source, adaptation, finished asset (left to right)
  - question, evidence, answer
  - a list in clusters, such as `[1,1,1,2,2,3,3]` for seven techniques in three beats
- Pick the pattern that teaches the slide; do not apply one layout mechanically to every slide.
- A click or tap on empty slide space reveals the next group, then moves to the next slide after the last group.
- Buttons, links, form fields, selected text, embedded documents and demonstrations never advance the slide. Interactive device parts are therefore real buttons.
- Back reverses one reveal (and plays the motion backwards), or returns to the previous slide. Replay resets the slide; chapter selection jumps to a named slide.
- Keys: Right arrow or Space to reveal, Left arrow to go back, Escape to leave full screen. Tab-strip arrow keys never move slides.

## Timing

The baseline is about **200ms** for a reveal: a fade in while rising 16px. Connector arrows draw in over 200 to 260ms. Most motion is this.

Approved exceptions, each because the movement itself carries meaning:

| Motion | Duration | Why longer |
| --- | --- | --- |
| Zoom into the source (camera move) | 600ms, ease `cubic-bezier(.6,0,.2,1)` | The audience must see where on the page the line is |
| Highlight sweep after the zoom | 320ms each, 140ms apart, starting 620ms in | Draws the eye along the exact words in reading order |
| In-feed scroll | 700ms | Reads as a thumb scroll |
| Count-up | 800ms, ease out | Long enough to register scale, short enough not to wait |
| Morphing headline letters | 260ms each, 35ms apart | Builds the headline as if written |
| Strike-through of dropped words | 300ms | Shows what was cut |
| Marker strokes | 420ms per mark | Like a pen stroke |
| Path marker | about 700ms after a 120ms delay | Follows the connector into the next asset |
| Quote wall lift | 300ms | Fade the crowd, lift one voice |

Do not lengthen other motion to match these. No motion loops, bounces or plays by itself; everything is triggered by a reveal.

## Zooming in and zooming out

Zoom is the most powerful move in the set, so it has rules.

**When to zoom in:**
- To prove a quotation is real: from the whole page to the one line (`d-zoom`).
- To make a detail readable that would otherwise be too small: a page row, a form field, a line of an ad.
- During a recording, to point at something without changing the slide: use Spotlight instead of a zoom (`recording-tools.md`).

**How:**
1. **Establish wide first.** Reveal 1 always shows the whole page or asset, with its label ("REPORT PAGE 13 OF 154"), so the audience knows where they are.
2. **Zoom to an identifiable target.** The target is a region in page fractions `{x0,x1,y0,y1}`. `zoomVars` in `scripts/source-tools.cjs` scales it to fill the frame width, then centres it, or pins it near the top when it is short. On phones the frame is taller (height/width 0.86 against 0.72 on desktop), and the geometry is calculated separately.
3. **Land the highlight after the camera stops.** The sweeps start at 620ms so the eye arrives before the words light up.
4. **Hold while it is discussed**, with the quote also set as text beside it (reveal 2), so it reads at any size.
5. **Zoom out by going Back.** The same 600ms transition plays in reverse, returning to the whole page. Moving to the next slide is the other way out.

**Limits:**
- Render pages at about 300 dpi so a zoom never enlarges past the image's real resolution. If the text goes soft, zoom less.
- One zoom per idea, and never two consecutive zoom slides.
- Never zoom into an invented or retyped page; only the real render.
- Reduced motion shows the zoomed state with highlights immediately.

**Other ways to zoom in without a camera:**
- **Crop to the column on phones:** show only the quote column of a wide report row (calibration slide 1). This keeps text readable instead of scaling a whole row down.
- **Show the asset larger:** a finished ad at up to 430px beats a thumbnail. Use the 200px check deliberately, as a separate test.
- **Detail crop:** a crop of the real asset to its subject (the phone from the ad in `t-flow`), labelled as a detail.

**Zoom in post-production:** Subi Shots adds speech-timed zooms to a recorded Whiteboard Wednesday. The cue list from Record cues gives it the reveal times (`subi-shots-handoff.md`).

## Connectors and highlights

- Connectors are inline SVG with `pathLength` or dash-offset drawing, anchored to their boxes by layout so they cannot drift. On phones horizontal arrows rotate to point down. Never use mismatched text glyphs or arrows disconnected from their boxes, and never generate precise interface arrows with an image model.
- Highlights are `<mark>` on text, or SVG rectangles from `findHighlights` on page images. Both use `#F6DF8C`. A highlight never covers a word that is not in the source.

## Full screen and presenting

- "Present full screen" hides the site header, tabs and help line, and keeps a visible "Exit full screen" control. Slide changes stay in full screen. Exiting keeps the slide and reveal position.
- Where native full screen is not available, a full-window mode is used, and the page says so.
- Recording tools stay visible in full screen because they live in the control bar.

## Reduced motion and the reading view

- With reduced motion, every part shows at once. There are no transitions, sweeps, travelling markers or letter builds, and counts show their final value.
- The complete reading view shows every slide with every reveal open, plus sources and notes, in order. It opens inside the page.
- Required content is never hidden behind motion only.

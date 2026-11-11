# Visual language: why it looks premium

The approved Whiteboard Wednesdays look is a clean white board, one gold accent and a teacher's handwriting, with real evidence placed on it. The quality comes from restraint and precision, not decoration. Every rule below exists in `viewer/whiteboard.css` and the device kit; this file explains the reasons so new slides keep the same standard.

## The ten habits behind the quality

1. **One idea per reveal.** Each click adds one thing to understand. If a reveal needs a paragraph of explanation, it is two reveals or a presenter note.
2. **White space is the frame.** Slides sit on plain white with generous gaps: 24px between rows and 48px between columns, 32 to 64px on device slides. Nothing is crammed to fit a ratio; long content scrolls.
3. **Handwriting leads, body type proves.** Caveat is for titles, statements, numbers and the odd hand-drawn label. Evidence, emails and explanations are in Instrument Sans so they stay readable. Mixing them in the other direction looks amateur.
4. **A single gold accent, used as structure.** Gold marks things that belong together: the rule under every title, the 3px top border on journey columns, the 2px left border on quotes and copy, the numbers, the connectors. It is never a fill colour for large areas.
5. **Evidence sits on the board, not in a box.** Quotations are set directly on the background in large bold italic or Caveat, inside quotation marks, with yellow highlight on only the exact words used. White cards around quotes were rejected.
6. **Real artefacts, shown big enough to read.** The finished ad, the landing page, the email and the actual report page appear as themselves, large: the ad up to 430px wide, the email full width in two columns. A thumbnail used to hide weak work is a defect.
7. **Objects feel placed by hand.** Paper cards have slightly uneven corners (2px 7px 3px 5px) and a soft offset shadow; the source sheet is turned by one degree. This is the whiteboard character, so keep it subtle: never more than about 2 degrees.
8. **Quiet metadata.** Section labels, sources and page references are small uppercase mono text in the muted colour. They are present for honesty but never compete with the idea.
9. **Lines that connect.** Arrows are SVG strokes with clear start and end points that draw in as their reveal appears. Text arrows (→) are used only inside rails, where they sit in gold between handwritten words.
10. **Phone first in the final check.** Every slide is read at 375px before it is called finished. Columns stack in story order, hidden reveals take no space, and headings shrink to 44px rather than the whole slide shrinking.

## The parts of every slide

| Element | Treatment | Purpose |
| --- | --- | --- |
| Section label | Mono, 11px, uppercase, muted, letter-spaced | Where we are, e.g. `03 / THE FINISHED STATIC` |
| Title (`h2`) | Heading font, clamp 40 to 68px, weight 600, then a 128 × 4px gold rule with rounded ends | Three to five words carrying the one idea |
| Parts | Two-column grid by default; each part is one reveal group | The content, revealed in order |
| Source line | 12px muted body text under the slide | What the audience is looking at and where it came from |
| Controls | Back, Replay, progress, Next | Presenter navigation; never part of the content |

## Recurring building blocks

| Block | Class | Look | Use it for |
| --- | --- | --- | --- |
| Lead sentence | `.lead` | 24px body text, at most 550px wide | One sentence of context |
| Statement | `.hand.statement` | 40px Caveat | The takeaway, said as a teacher would write it |
| Paper card | `.paper` | White card, hairline border, uneven corners, offset shadow | A single defined object: "The input", "The decision" |
| Source sheet | `.source-sheet` | 2px ink border, rotated −1°, Caveat 40px | A named document placed on the board |
| Rail | `.rail` (`.compact`) | Tinted strip, Caveat words with gold arrows | A short three-step sequence on one line |
| Branch list | `.branch-list` | Gold left border, 2 × 2 grid of Caveat items with small explanations | One source branching into several uses |
| Quote | `blockquote` | Caveat 600, 36px, or bold italic body at phone size | Exact words, with `<mark>` on the words used |
| Highlight | `mark` | `#F6DF8C`, dark ink, wraps cleanly across lines | Exact source words only |
| Tinted stage | `.creative-stage`, `.browser-object`, `.email-full` | 7% gold tint panel | Holds a finished artefact so it reads as an object |
| Spec rows | `.spec-lines` | Label above a bold value, hairline between rows | A creative brief or settings |
| Number | `.number` | Caveat 32px in gold | Ordered steps and technique numbers |
| Chips | `.app-states` | Mono 12px on tint | Short states or tags |

## Variations in how information is displayed

The same content can be shown in several honest ways. Choose by the idea, and change form from slide to slide:

| The idea is… | Show it as | Layout or device |
| --- | --- | --- |
| A single takeaway | Large statement with one supporting line | `opening`, `split` |
| Depth or scale of research | Real figures counting up | `d-counts` |
| Many voices, then one | Quote wall lifting the pick | `d-wall` |
| A quote is real | Whole page, then zoom to the line | `d-zoom` |
| Where words came from | Source left, adaptation and finished asset right | `creative`, `t-transform` |
| What was kept and added | Morphing words | `d-morph` |
| Why an asset works | Marker strokes on the asset | `d-annot` |
| How it looks to a buyer | Phone feed, 200px check | `d-feed` |
| A process or path | Three columns with gold tops, or a rail | `journey`, `t-flow`, `d-path` |
| A ranked or ordered set | Numbered rows | `techniques`, `objections` |
| Alternatives | Label, option, explanation per row | `headlines` |
| A long artefact | Full-width readable panel | `email`, `document` |
| A decision tool | The working survey | `survey` |
| Data | An editable table that becomes labelled cards on phones | `andromeda` |

## What breaks the look

- Grey boxes, drop-shadowed cards everywhere, or a second accent colour.
- Handwriting for paragraphs, emails or table text.
- Highlighting whole sentences, or highlighting words that are not in the quote.
- A big decorative image that does not explain anything.
- Text arrows floating between boxes instead of drawn connectors.
- Shrinking a desktop slide onto a phone instead of stacking it.
- Motion longer than the idea needs (see `motion-and-reveals.md`).

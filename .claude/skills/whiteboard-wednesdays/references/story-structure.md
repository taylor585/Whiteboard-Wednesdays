# Story structure

Build the story before the artwork. A Whiteboard Wednesdays deck teaches one useful idea at a time; the structure decides whether it reads as a presentation or as a document pasted onto slides.

## Start from the requested outcome

| Mode | Work | Do not do |
| --- | --- | --- |
| New presentation | Brand question, source analysis, slide map, three-slide calibration, full approved deck, QA | Generate the full deck before calibration approval |
| Calibration or device trial | Self-contained trial outside the static build, shown privately, then stop for approval | Register, publish or overwrite the live deck |
| Targeted revision | Inspect current source and rendered output, change the requested area, run regressions | Rewrite unrelated slides or reopen approved choices |
| Publish to library | Validate the selected deck, update its register entry, publish when authorised | Create another site for the deck |
| Explain or plan | Show the requested explanation or plan | Change a site or install a skill without a request |
| Skill file only | Deliver the requested skill file or package | Publish a presentation or change the site |

Establish the audience, the decision the deck should support, the sources, the brand, the destination, any slide limit and how far publishing is authorised. Ask only for material choices or missing evidence; never make the user repeat a brand pack or supply screenshots a browser can obtain.

## The slide map

Write this first, as working notes, not audience content:

| Field | Example |
| --- | --- |
| Stable slide ID | `creative` |
| Takeaway | Their own words become the advert's idea |
| Device or layout | `creative` (or `t-transform`, `d-morph`) |
| Source | RED-008, p. 13 |
| Reveal order | quote, adapted headline, finished ad |
| Presenter note | What to say; what is illustrative |
| Asset dependency | `ww-ad.png` |
| Variety check | Differs from the slides either side |

For each slide answer: what will the viewer understand here that they did not before? If the answer is "another list", redesign it around a relationship, example, contrast or consequence.

## Three visual forms

1. One large, relevant image with a short headline.
2. Three to five words carrying one clear idea.
3. One simple chart, relationship or sequence whose meaning is obvious.

The three-to-five-word rule governs headlines, not the artefacts inside slides. Never cut an email to three sentences, strip necessary evidence, or turn a 60-second script into a slogan to satisfy it. Show full examples in readable panels, scrolling or following slides.

Use the smallest effective number of slides. Honour a stated limit (for example 12). When the user allows more slides to show assets and methods properly, that later instruction wins. The 29-slide reference deck is not a target.

## Variety rule

No two consecutive slides use the same `kind`, and a deck of three or more slides uses at least three different kinds. Variety holds attention; repetition reads as a template. Record a deliberate exception in the slide map and in the spec's `repeatAllowed`; the build enforces the rest.

## A story order that works

For an evidence-led process deck, this order moves from proof to persuasion without repeating a device:

1. **Depth:** animated counts of the research behind the deck.
2. **Breadth:** a quote wall of many real voices.
3. **Focus:** zoom into the source, from the whole page to one line.
4. **Transformation:** words that morph into the headline.
5. **Asset:** marker annotations on the finished creative.
6. **Context:** in-feed preview at real size.
7. **Reasoning:** tap the page to connect sections to objections.
8. **Journey:** path animation across ad, page and email.

It is a starting point, not a template.

## Research-to-asset storytelling

For a process demonstration, unless the user's story differs:

1. Introduce the source research and why it informs decisions.
2. Show the live report and key evidence.
3. Show the campaign path labelled `Paid ad`, `Landing page`, `Email`. Never revert to the rejected labels "recognition, explanation, follow-up".
4. Show each asset with its source evidence on the left and the finished output on the right.
5. Immediately follow each asset with a slide explaining the skill and decisions that produced it. Add a second method slide only for a substantive mechanism.
6. Repeat for the remaining assets. Put qualification before the nurture email when the story includes the survey.

The Cadre paid ads deck is the reference implementation, not the subject of every deck. For training, strategy or product decks, keep the method and choose examples relevant to that topic. Do not insert ICP research, advertising or qualification material unless the brief needs it.

## Five simplicity passes

Run each as a separate pass over the slide map, then again over the rendered slides:

1. **Meaning:** state the single takeaway in plain English. Remove competing claims and unexplained terms.
2. **Structure:** reduce simultaneous items. Move secondary explanation to notes or the next reveal without deleting required substance.
3. **Visual:** replace an explanatory paragraph with the real asset, one image, the smallest useful diagram or the device that shows it. Remove decorative boxes and redundant labels.
4. **Sequence:** reveal only what is needed now: source, then transformation, then output or consequence. Every reveal has a reason. Check the variety rule against neighbours.
5. **Audience:** read it as a first-time viewer at phone size. Shorten the headline, enlarge the key evidence, and confirm no context, caveat or requested point was lost.

Record what was simplified and what was deliberately kept.

## Three-slide calibration gate

Before building a new full deck, or taking a materially new direction, build three representative slides:

1. The main visual promise or opening concept.
2. A source-to-finished-asset slide with the hardest realistic evidence density.
3. A sequential explanation showing the intended reveal and motion behaviour.

- Use the confirmed brand and real or clearly labelled illustrative content.
- Build it as a trial with `scripts/build-trial.cjs` and verify it with `scripts/verify-trial.cjs` at all four widths.
- Show it privately, explain the three choices briefly, then wait for approval and capture corrections before expanding.
- A small targeted revision to an approved design needs no new calibration.
- Existing approval covers the approved design, not arbitrary new designs. Show desktop and phone layouts of the calibration, not only a large static canvas.
- For the paid ads deck the approved whiteboard treatment is the baseline. Older "Quiet Authority" explorations are not permission to restore a rejected design.

The worked calibration is `examples/cadre-crew/trial-calibration.cjs`, built at `examples/cadre-crew/output/whiteboard-trial-calibration.html`.

# Layouts: what each one is for, with a rendered example

The renderer has 13 layouts plus `scene`, 14 in all. Each one below has its purpose, the evidence behind it, and a rendered example in `assets/layouts/<name>.jpg`. Look at the image before choosing. `assets/layouts/_index.png` shows them all at once. The working spec for each is in `examples/sample-spec.json` (same id). The fields are in `references/design/spec.md`.

To pick a layout, use the decision tree in `references/frameworks/thumbnail-framework.md` §3. The rule is: pick from the promise of the video, not its format.

| Layout | Use it for | What's in the frame | Evidence | Example |
|---|---|---|---|---|
| `verdict` | News, launches, comparisons, takes | Sentence-case verdict with a full stop, a big hero tile, rivals crossed out, optional burst or pedestal | Nick's clean era (median 66.5K, the highest of his eras) | `assets/layouts/verdict.jpg` |
| `equation` | Tool stacks, integrations, "X + Y does Z" | 2–3 tiles with + / = / → operators and a line | Nick's clean era | `assets/layouts/equation.jpg` |
| `command` | One feature, skill, command or prompt | A macOS-style window with a slash command, chips, face, arrow | Nick's "/routines"-style hits | `assets/layouts/command.jpg` |
| `proof` | Money, results, case studies, benchmarks | Stripe notifications, a payments table, benchmark bars, a revenue chart or a ranked card, plus a lowercase line | Nick's proof screens 6–10.7× | `assets/layouts/proof.jpg` |
| `syllabus` | Full courses, long guides | A whiteboard or terminal with a numbered outline, a system doodle, a tag like "4 HOURS" | Nick's courses 27.4×, 35.6×; course median 172K vs 25K | `assets/layouts/syllabus.jpg` |
| `marker` | Opinion, warnings, "truth" videos | A big hand-lettered line, face, an optional hero object or step chain | "AUTOMATION: THE UGLY TRUTH." 26.4× | `assets/layouts/marker.jpg` |
| `versus` | Collaborations, guests, client results | Two faces, a result pill, a handwritten label | Riley's duo median 9.9× (n=5) | `assets/layouts/versus.jpg` |
| `social` | Hot takes, myths, answering a question | A tweet or comment card with the hook in 2–5 words | Sabri's tweet card 15.5× | `assets/layouts/social.jpg` |
| `trend` | Predictions, career or market shifts | A hockey-stick curve, stages, a "you are here" marker | Nick's "A Reset is Coming.." 4.72× | `assets/layouts/trend.jpg` |
| `repo` | Testing a tool, repo or app | A GitHub-style header with stars, face peeking up | Nick 9.22× | `assets/layouts/repo.jpg` |
| `caption` | Authority advice, contrarian commands, "learn X fast" | Centred face, condensed white caps across the bottom, one word in a red box, a handwritten proof label | Sabri latest n=7, median 3.77× | `assets/layouts/caption.jpg` |
| `split` | Transformations, before/after, cheap vs premium | Face centred between two states, one label per side, red = before, green = after; optional grid or donut | Sabri n=4, all ≥1.43× | `assets/layouts/split.jpg` |
| `quote` | A real customer or buyer quote is the hook | A pinned quote card with one phrase in red, an optional missed-call mark, a circled face | Used on the ICP video (round 1) | `assets/layouts/quote.jpg` |
| `scene` | No presenter photo; one object can act out the promise | Free placement: lens, doc, card, bubble, head, sticky, chip, glow, pin, string; light or dark | The D1 case study (`references/design/scene-design.md`) | `assets/layouts/scene.jpg` |

**House layouts give recognition, not lift.** Riley's desk anchor (n=10, median 1.25×) appeared on hits and misses alike. A recognisable house style is fine, but the line and the topic still decide the result. Rotate layouts so the feed doesn't go stale: Nick's 62 near-identical template thumbnails had a median of 15K.

**Layouts the renderer can't draw:**
- Sabri's staged storefront: a real photo composite.
- 3D mascots and photoreal scenes.

Write an image-model prompt with `references/design/image-prompts.md`, and composite the result with `bg_image`.

# The thumbnail framework

This is the method for making a thumbnail, start to finish. It also says what makes a thumbnail good, and why. Every step points to its evidence: the original 320-thumbnail Nick Saraev study (`references/research/nick-thumbnail-audit.md`), the 150-video research on Nick Saraev, Sabri Suby and Riley Brown (`references/research/overview.md`, `references/research/creators.md`), and our own "Read their mind" case study (`references/design/scene-design.md`).

The pieces this framework uses:
- The ten elements: `references/design/playbook.md` §2.
- Layout details and examples: `references/design/layouts.md`.
- Renderer fields: `references/design/spec.md`.

**Evidence levels used below:**
- **Measured:** a median outlier ratio from the research, with n.
- **Observed:** a pattern seen on the winners, without a controlled comparison.
- **House rule:** our own design standard or the user's brand rule. It isn't proven on views.

## Contents
1. What makes a good thumbnail (the short answer)
2. The 10-step method
3. Choosing the layout (decision tree)
4. The thumbnail line
5. Face, objects and proof
6. Colour, light and contrast
7. Checks before anything is shown
8. The thumbnail scorecard (0–100)
9. What each expert's winners look like
10. What failed, and what's worn out
11. After publishing

## 1. What makes a good thumbnail

A good thumbnail does six things at once:

1. **It carries one idea,** readable at phone size (168px wide).
   - Thumbnails with no line were the weakest group on all three channels: pooled median 0.47×, n=10 (measured).
2. **The line adds to the title** (a verdict, proof or emotion) rather than repeating it.
   - This was the pattern on Sabri's hits: "The trick", "DON'T ASK. MAKE THEM BUY.", "$100 MILLION" (observed).
   - Repeating the title wasn't fatal on Nick's or Riley's channels, so this is a strong preference, not a law.
3. **One hero object is recognisable in under a second:** a logo, money, a chart, a report, a lens. Products are the characters on all three channels (observed).
4. **It shows real proof when there is any.** A "Succeeded" payments table did 10.7×, "You Are Hired!" 6.05× and repo stars 9.2× (Nick, observed). Sabri's proof labels did 2.79× vs 0.69× without (measured, one channel).
5. **The brightest, highest-contrast point is the hero** (house rule, from the D1 case study).
6. **It looks different from the channel's last few uploads** (observed; era medians are raw views, confounded by channel growth and topic). Nick's 62 near-identical template thumbnails had a median of 15K views, against 66.5K for his varied clean era.

## 2. The 10-step method

1. **Find the promise and the hero.**
   - Write the video's one promise in under 8 words.
   - Pick the hero object that *acts out* what the video does, not one that merely illustrates the topic.
   - Example: a lens over a report means "we find their exact words". A head with a thought bubble only says "psychology" (case study, `references/design/scene-design.md` §1).
2. **Write 3–5 lines** (section 4). Tag each one's angle. Keep the 2–4 that add the most to the title.
3. **Pair each line with a title** (`references/frameworks/headline-framework.md`). The pair must work together: the title gives the facts, the thumbnail gives the verdict, proof or emotion.
4. **Choose a layout for each line** (section 3). Use different layouts across the set, so testing them teaches something.
5. **Decide face or no face.**
   - With a photo: `scripts/prep_face.py`, a pose matched to the emotion (section 5).
   - Without a photo: a `scene` (`references/design/scene-design.md`).
6. **Set colour and light** (section 6): the brand accent, light or dark ground, the pop recipe if it's flat.
7. **Render** with `node scripts/render.cjs spec.json out/`, or `scripts/package.py` for a full batch.
8. **Check every image** before showing anything (section 7). Fix and re-render; one or two rounds is normal.
9. **Score the set** (section 8). Recommend an A/B pair from different layouts.
10. **Make every size from the approved design** (`references/platforms.md`):
    - YouTube 1280×720;
    - LinkedIn video cover 1920×1080 (`scale: 1.5`);
    - LinkedIn 4:5 post 1080×1350 (re-laid out);
    - the link-preview crop check.

    Label every file with its platform and size.

## 3. Choosing the layout (decision tree)

Go down the list and take the first match. If two fit, render both.

| If the video is… | Layout | Evidence |
|---|---|---|
| A full course (about 1 hour or more) | `syllabus` (whiteboard or terminal outline + face) | Nick's course cards and syllabi: 27.4× and 35.6× (observed); his full courses' median was 172K vs 25K for everything else (measured) |
| No presenter photo available | `scene` (one hero object + up to 2 supporting) | D1 case study (house rule) |
| A real result: money, client win, benchmark | `proof` (stripe, payments, bars, chart, card) | Nick's proof-screen hits 6–10.7× (observed) |
| Testing a tool, repo or launch | `repo` or `command` | Nick's repo header at 9.2× (observed) |
| A verdict or opinion on a tool or trend | `verdict` (hero tile, rival crossed out) or `marker` | Nick's "AUTOMATION: THE UGLY TRUTH." at 26.4× (observed) |
| Authority advice or "learn X fast" | `caption` (centred face, condensed caps, a red-boxed word, proof label) | Sabri latest n=7, median 3.77× (measured) |
| A transformation or comparison | `split` (before/after) | Sabri n=4, all ≥1.43× (measured) |
| A secret or exposé of how something works | staged scene (finger to lips + storefront) via `bg_image`, or `scene` redacted dossier | Sabri's brainwash hits, median 9.04× (observed) |
| A myth, hot take or answered question | `social` (tweet or comment card) | Sabri's tweet card at 15.5× (observed) |
| A collaboration or challenge with someone | `versus` (two faces) | Riley's duo median 9.9×, n=5 (observed) |
| A real customer or buyer quote is the hook | `quote` | used on the ICP video |
| A prediction or career/market shift | `trend` | Nick's "A Reset is Coming.." at 4.72× (observed) |
| Two tools combining | `equation` | Nick's clean era (observed) |

Pick from the promise of the video, not its format.

## 4. The thumbnail line

- **2–5 words.** Six or more means two ideas, so cut one. The median on Nick's top 20 was 3.5 words; Riley's was 4.
- **Pick one angle:**
  - verdict ("not even close.");
  - warning ("Don't fall for this.");
  - secret ("The trick");
  - proof ("just copy this.");
  - promise ("Fire your media buyer.");
  - curiosity ("It watches everything.").
- **End statements with a full stop:** it reads as certainty. Use a question only when the question is the hook ("$5K retainers?").
- **Mark one word:** underline, accent box or strike. Never more than one mark.
- **Numbers:** specific beats round ($12,937 > $13K) unless round is the point ($1M).
- **Take lines from the speaker's own words.** "Read their mind." came from Taylor saying "This person has just read my mind." in the video.
- **The line must not repeat the title** (Taylor's brand rule), and it must be true to the video.

## 5. Face, objects and proof

**Face:**
- About a third of the frame, usually on the right, eyes in the upper third, looking into the lens.
- Reuse a few poses:
  - hand on chin: sceptical or thinking;
  - finger to lips: a secret (Sabri's storefront hits);
  - warm smile: courses and wins;
  - looking up at text: repo layouts.
- Wide-eyed shock faces were dropped by Nick.
- A real photo is the single biggest quality upgrade. Without one, use a placeholder that names the pose to shoot, or a `scene`.
- Only use the user's own photo, or one they have rights to.

**Objects:**
- Glossy 3D app tiles and logos act as the characters. A fight shows the rival crossed out; an equation shows A + B.
- A recurring mascot or villain gives a character people remember (Nick's crying red crab).
- Logos show the topic. They must never imply an endorsement that doesn't exist.

**Proof:**
- Only real figures, the user's own or public ones.
- Oddly exact numbers feel real.
- Blurring one detail adds believability and curiosity.
- Use illustrative curves only for mock-ups, and label them as illustrative.
- Never invent results, testimonials or posts.

## 6. Colour, light and contrast

- **One accent colour, one mark, one arrow.** A hand-drawn arrow ties the line to the object.
- **Light vs dark.**
  - Light or cream grounds stood out in Nick's dark niche: his clean era had the highest median, 66.5K.
  - A dark ground stands out in a light feed: Taylor's D1 pick.
  - Choose the opposite of the user's last 5 uploads and of the niche around them. When unsure, A/B test light against dark.
- **The pop recipe** (`references/design/scene-design.md` §2):
  - near-black ground (not pure #000);
  - one light pool behind the hero;
  - a vignette;
  - light the hero (bright ring, halo, warm fill);
  - dim the evidence;
  - bright accent only;
  - cream text.
- **Deep brand colours vanish on black,** so swap to the bright tint (gold #8B6002 → #CB8E03).
- **Red means the problem and green means the fix** (Taylor's brand rule, and Sabri's red/green brain split).

## 7. Checks before anything is shown

Look at every rendered image and at `_feed-preview.png`:

- [ ] The line reads at 168px wide. If it doesn't, cut words; don't shrink the font.
- [ ] The squint test: one shape survives. The greyscale test: contrast survives.
- [ ] Nothing important sits in YouTube's timestamp corner (bottom-right, about x 1150–1270, y 660–710).
- [ ] On the LinkedIn 1920×1080 cover, the key words aren't dead centre, where the play button sits.
- [ ] Text, arrows and objects don't collide, and every arrow points at something.
- [ ] No empty dead zones.
- [ ] The renderer printed no logo `WARNING` lines.
- [ ] Proof is real and the line is true to the video.
- [ ] It looks different from the last 5 uploads in the feed preview.
- [ ] For a stricter check, run `scripts/audit.py` (distinctiveness ≥ about 0.3 vs the feed).

## 8. The thumbnail scorecard (0–100)

**This is a house heuristic for ranking a batch. It does not predict views.** The weights follow the evidence levels above.

| Check | Points |
|---|---|
| Has a 2–5 word line that adds to the title | 20 |
| One idea, one hero recognisable in under a second | 15 |
| Readable at 168px (line and hero) | 15 |
| The layout fits the video's promise (decision tree) | 10 |
| Real proof shown (or none needed) | 10 |
| The brightest point is the hero; one accent | 10 |
| Distinct from the last 5 uploads and the niche feed | 10 |
| Face with a matching pose, or a scene that acts out the promise | 5 |
| Timestamp corner and play-button zone clear | 5 |

Subtract 30 for invented proof, 20 for a line that repeats the title word for word (Taylor's rule), and 10 for a worn-out style (section 10).

## 9. What each expert's winners look like

Look at the contact sheets before designing in a creator's style:
- `assets/research/top-hits-nick.jpg`
- `assets/research/top-hits-sabri.jpg`
- `assets/research/top-hits-riley.jpg`

**Nick Saraev:**
- Syllabus and course cards (27.4×, 35.6×).
- Proof screens with a lowercase line and an arrow (6–10.7×).
- Lowercase verdicts with a full stop: "AI ruined me." (6.62×), "it's mostly hype." (6.03×).
- Marker "THE UGLY TRUTH." (26.4×).
- A face on 19 of his top 20, with a median of 3.5 words.

**Sabri Suby:**
- The caption bar (latest median 3.77×).
- The before/after split (all ≥1.43×).
- The staged "secret" storefront (median 9.04×).
- A tweet card (15.5×).
- A face on all of his top 8, 0–5 words, and every line adds to the title.

**Riley Brown:**
- Duo faces (median 9.9×).
- A solo face on the right with a headline on the left (9.2×).
- A lowercase line with one orange-pill word (14.77×).
- Dark backgrounds on 17 of his top 20.
- His current desk anchor and dashboard spread are his lowest two (2.8×, 2.6×).

The full detail is in `references/research/creators.md`.

## 10. What failed, and what's worn out

- **No line** (pooled 0.47×). Screenshots only, with no face or framing.
- **Generic text with no object** ("DON'T DO THIS", "$10K?").
- **Two competing ideas in one frame.**
- **A template repeated for months.** Nick's Make.com starry template: 62 videos, median 15K.
- **ALL-CAPS two-tone templates** were Nick's weakest designed era. Shock faces were dropped.
- **Internal or ops topics** (hiring, delegation) flopped whatever the design: a topic problem, not a design problem.
- **The topic carries the video, not the template.** Seen in audit mode on Liam Ottley's channel (12 Oct 2026, n=1 each):
  - his 328K video won mainly because it was part of his long-course series;
  - his near-copy of Nick's "A Reset is Coming" curve (306K for Nick) came in below his usual views.

  Copying a winning layout doesn't copy the win.
- **Worn out by topic, not layout:** Sabri's luxury-brand storefront exposé (a recent near-copy opened at 0.65×). Reuse the layout on a fresh topic.

## 11. After publishing

Log what was published in `examples/packaging-log.csv` and follow `references/learning-loop.md`:
- check click-through at 48 hours against the channel average;
- swap to the B thumbnail, or run Test & Compare (up to 3), if it's below average;
- keep the same title while testing the thumbnail.

The user's own results always beat these rules.

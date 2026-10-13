# From research to trending topics

How the research turns into a topic, an angle, a title and a format. This is the reasoning between the raw scan and the pick sheet.

## 1. The core idea

A Trending Topic sits where **what we really did** (Lane A) meets **what our audience is clicking on now** (Lane B), framed with **what the packaging research says wins** (`research-findings.md` §1). All three, or it is not a pick.

```
Lane A work signal ──┐
                     ├──► candidate ──► angle ──► format ──► title + thumbnail line ──► brief
Lane B hot theme ────┘        ▲
                     packaging laws (what wins)
```

## 2. Step by step

1. **List work signals** (`chat-research.md`): what we built, the proof, whether it can be demoed, whether it is confidential.
2. **List themes** (`creator-research.md`): name, heat, the best upload, the angle creators took, and what nobody showed.
3. **Match.** A candidate is one work signal plus the theme it answers. Evergreen proof with no theme can still be a candidate, but it scores low on heat.
4. **Find the gap.** Look at how creators covered the theme. They usually explain, react or test a tool. Our angle is almost always: *a real system used on real client work, shown working, with the honest limits.*
5. **Pick the format** from the packaging laws (section 3).
6. **Score** with `scoring.md` and apply the hard gates.
7. **Write the pick** (`pick-output.md`), including title options from `headlines.md`.

## 3. Applying the packaging laws to topic choice

| Law | What it means for choosing and framing a topic |
|---|---|
| Stakes beat demos (5) | Frame the topic around a gain or a risk to the viewer: "10x your output", "stop losing leads". A plain tour of a tool is weak. |
| "I tested" is portable (7) | If we ran it on real work, say so. Our live examples are tests. |
| Long courses win (4) | A topic that can become a complete 2-hour course is a candidate for a course later; a 30-minute brief is not titled a course. |
| Fear works about the viewer's path (6) | Frame risk around the viewer's work ("why your AI work drifts"), never "don't use this new model". |
| Formulas wear out (10) | Check the formula the creators are using this fortnight. If several just used it, take a different one from `headlines.md` §3. |
| News raises the floor (11) | A launch theme only becomes our topic if we used the launch for real (Lane A). Then one launch, one verdict. |
| Search and browse (1) | The topic must have a searchable noun ("AI harness", "Meta ads", "Claude Code") as well as a hook. |
| Time-box on money skills (3) | Marketing, sales and ads topics can take a time-box; self-help and niche tools cannot. |
| Proof on the thumbnail (14) | Prefer topics where we can show a real result on screen (a passing checker, a real number). |

## 4. Reading heat honestly

- **Hot theme + strong Lane A proof:** top pick.
- **Hot theme + no Lane A proof:** market-only. List it with what we would need to build or run first. Do it this week, and it qualifies next week (funnel hacking in W42 is the example).
- **Warm theme + strong proof + clear gap:** good pick; often the best angle because creators have not saturated it.
- **Competitor just covered it:** still a pick if our angle differs. Put the competitor video in the brief's "Angle check" and change the framing (Nick's harness explainer → our live client harness).
- **Off-niche viral theme:** ignore unless it maps to Pecuna Factorem's buyers.

## 5. Worked example: how W42's harness topic was chosen

| Step | What happened |
|---|---|
| Work signal | Harness Chassis Builder (No Schedules) updated in the window; a real 9-agent test run on a client app; this session's own brief and checker |
| Theme | AI harnesses / agentic workflows: Nick Saraev "AI Harness, Explained" (53.7k, 0.6×, 5 days old); David Ondrej "Software Factories" (40k in under a day); Vercel CEO agentic workflow (137k, 2.01×) |
| Gap | Creators explained the idea. Nobody showed a business harness running on client work, refusing to finish until the checks pass |
| Format | Stakes (law 5) + proof (law 14): multiplier title, live demo, checker on screen |
| Title | "How AI Harnesses Can 10x Your Quality and Output" (stakes/multiplier; searchable noun "AI harnesses"; 48 characters) |
| Score | 44/50 (proof 5, heat 4, angle 4, demo 5, fit 4, fresh 4) |
| Risk | The test-agent story is a client app with sensitive user data: anonymise. The "10x" must be backed by real numbers in Act 3 |

## 6. Turning a pick into a brief

Once Taylor chooses, build the brief with `brief-format.md`. The research feeds three places:
- **READ BEFORE YOU RECORD, "Angle check":** the competitor videos from the scan and how ours differs.
- **PACKAGING:** the A/B titles, thumbnail lines and description, from `headlines.md` and `descriptions.md`.
- **Act 3 and Verify first:** any number or claim the research cannot back stays blank or flagged.

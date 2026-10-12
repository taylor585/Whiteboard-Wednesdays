# Trending Topic Brief: the format

One brief per video. Taylor reads it before the camera goes on, knows exactly what to say, draw and show, then records straight through. Every heading below appears in every brief, word for word, in this order. `scripts/check_brief.py` enforces it.

The gold example is `examples/harness-brief.md`. Read it before writing a new brief.

---

## Fill rules

1. Label the acts exactly: **ACT 1: THE PROBLEM**, **ACT 2: THE SYSTEM**, **ACT 3: THE PROOF**.
2. **Reverse-engineer from the source, line by line.** Read the skill or system in full. For every rule, ask "what goes wrong without this?" That answer becomes an Act 1 problem, and the rule becomes its Act 2 fix. Number the problems P1, P2 and so on.
3. Write Act 1 in the viewer's words (what they see), not ours. Group the problems into 3 to 6 named characters (for example The Interrupter, The Drifter, The Goldfish).
4. Act 2 follows the order things happen in a real run, not the order of the source document.
5. Every Act 2 segment answers **"Why should people care?"** in the viewer's terms: time, money, quality or stress.
6. Every Act 2 segment has an **"In 5 to 10 words"** line. Count the words. Plain English, no jargon. This is what Taylor says out loud and writes on the board.
7. Every Act 2 segment has **"When to use it"** and **"When not to use it"**. Take the "not" from the source wherever it gives one; honesty builds trust.
8. Every Act 1 problem is crossed off by at least one Act 2 segment, and every segment crosses off at least one problem. Ranges such as "P19 to P26" are fine.
9. Act 3 numbers are blanks for the presenter. Never invent figures.
10. Flag anything that must be verified before saying it on camera: sources, claims, client names, competitor videos on the same topic.
11. British English. No em dashes or double dashes in prose.

---

## Template

Copy this skeleton and fill every field.

```markdown
# TRENDING TOPICS: [video title]

SOURCE: [skill or system name, version, path]
FORMAT: Trending Topic Brief (references/brief-format.md)

# AT A GLANCE

**PROMISE:** [one line: what the viewer walks away able to do]

**TOTAL LENGTH:** [about N minutes]

| Section | Job | Length |
|---|---|---|
| Cold open | Show the payoff first | 0:45 |
| ACT 1: THE PROBLEM | [n] failure characters the viewer recognises | [min] |
| The turn | [bridge in a few words] | 1 min |
| ACT 2: THE SYSTEM | [n] segments in run order, crossing off every problem | [min] |
| ACT 3: THE PROOF | [payoff equation], with real numbers | 2 min |
| Close | CTA and next video | 1 min |

---

# READ BEFORE YOU RECORD

- **Hook:** [the opening line, short]
- **Act 1 characters (stick these up first):** [names]
- **Act 2 one-liners, in order:** [every "In 5 to 10 words" line, in segment order]
- **Have open before you press record:** [files, tabs, terminals, demos]
- **Bring:** [numbers, stories only the presenter has]
- **Angle check:** [competitor videos on this topic from the scan, and how ours differs]
- **Verify first:** [claims and sources to check]

---

# COLD OPEN (about 45 seconds)

**HOOK:** "[one or two sentences]"

**SHOW:** [the payoff on screen]

---

# ACT 1: THE PROBLEM ([the world without the system])

Every problem below was reverse-engineered from a specific line in the source. The "Fixed by" column names the rule that solves it; Act 2 shows each fix.

## Character 1: [name] ([one-line description])

| # | What you see | Why it happens | Fixed by |
|---|---|---|---|
| P1 | [viewer's words] | [root cause] | [source rule, quoted or named] |

[repeat for 3 to 6 characters]

## Bonus problems (one line each, use if time allows)

- P[n]: [problem]. Fixed by [rule].

---

# THE TURN (about 1 minute)

**SAY:** "[the one-sentence bridge from problems to system]"

**DRAW:** [the system in one line]

**QUOTE:** "[one line from the source]"

---

# ACT 2: THE SYSTEM ([how it solves every problem, in run order])

## SEGMENT 1: [name]

**IN 5 TO 10 WORDS:** [counted, plain English]

**WHY SHOULD PEOPLE CARE?:** [benefit to the viewer in time, money, quality or stress]

**WHEN TO USE IT:** [situations]

**WHEN NOT TO USE IT:** [situations, from the source where possible]

**PROBLEMS IT SOLVES:** [P-numbers]

**SAY:** [the two or three sentences that matter]

**QUOTE FROM THE SOURCE:** "[one exact line, read on camera]"

**DRAW:** [what goes on the whiteboard]

**DEMO:** [what is on screen, or "none"]

**CROSS OFF:** [which Act 1 problems get a red line]

[repeat for every segment]

---

# ACT 3: THE PROOF

**DRAW:** [payoff equation or before/after]

**NUMBERS (presenter fills in):**
- Before: ______
- After: ______

**RECAP:** every Act 1 character crossed out.

---

# CLOSE

**CTA:** [what viewers get or do]

**NEXT VIDEO:** [the next brief in this week's pack]

---

# PREP CHECKLIST

- [ ] [files, demos, stories, numbers]
- [ ] Verify before quoting on camera: [items]
```

---

## The whiteboard device (every video)

In Act 1, stick up one card per character with its problems listed underneath. In Act 2, draw a red line through each problem as the system fixes it. In Act 3, every card is crossed out. That visual is the payoff.

## Writing the "In 5 to 10 words" lines

- Say what it does, not what it is called: "A script, not the AI, decides when it's finished." beats "The constraints done-gate."
- One idea per line. If it needs "and" twice, split the segment.
- Read the full set in order in READ BEFORE YOU RECORD. Together they should tell the whole story of the video.

## When the source is not a skill

The format also fits a process, a tool, a campaign or a client result. Reverse-engineer the same way: list what the process does step by step, ask what breaks without each step, and turn the answers into Act 1. If the source is only market interest with no work of ours behind it, stop: the topic fails the scoring gate (references/scoring.md).

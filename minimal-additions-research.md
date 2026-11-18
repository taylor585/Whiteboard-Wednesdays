# Minimal additions: research dossier

Collected 18 November 2026 for the "Minimal additions" video (booked for Wednesday 16 December 2026) and the future `minimal-additions` skill. Quotes marked **checked** were confirmed word for word on the live page in a second, separate pass on 18 November 2026. The rest were copied by the first research pass and have not been checked again.

## The idea (Taylor's words, 18 November 2026)

When a skill is upgraded, add minimally. The AI gives the exact proposed addition, word for word and down to the letter, made minimal for the outcome, before anything is presented or changed. Two tests: use as few words as humanly possible; think carefully about where it goes so it makes the skill better.

## 1. What length to aim for

| Figure | Source |
|---|---|
| "Keep the `SKILL.md` body under 500 lines for optimal performance." **checked** | Anthropic, Skill authoring best practices, "Token budgets". https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices |
| Instructions level: "Under 5k tokens"; metadata "~100 tokens per Skill" | Anthropic, Agent Skills overview, "How Skills work". https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview |
| "target under 200 lines per CLAUDE.md file. Longer files consume more context and reduce adherence." **checked** | Claude Code docs, Memory. https://code.claude.com/docs/en/memory |
| Median of Anthropic's 19 public SKILL.md files: 147 lines (about 1,384 words); range 32 to 616; 18 of 19 under 500; 10 of 19 at 150 or fewer | Our own count of github.com/anthropics/skills at commit e4bb5d9, 18 Nov 2026 |
| "Write minimal instructions: Create just enough content to address the gaps and pass evaluations." | Anthropic, best practices, "Build evaluations first" |
| "< 300 lines is best, and shorter is even better"; the author's root file is "less than sixty lines" | HumanLayer, Writing a good CLAUDE.md, 25 Nov 2025 (practitioner, not research). https://www.humanlayer.dev/blog/writing-a-good-claude-md |

**Rule of thumb (ours):** aim for about 150 lines, never over 500 lines (about 5k tokens).

## 2. What counts as bloated

- Over 500 lines in SKILL.md (Anthropic's ceiling).
- Anything Claude already knows: "Default assumption: Claude is already very smart." / "Only add context Claude doesn't already have." **checked** (best practices, "Concise is key").
- Anthropic's test: "Does this paragraph justify its token cost?" **checked**
- Anthropic's worked example: "Good example: Concise (approximately 50 tokens)" against "Bad example: Too verbose (approximately 150 tokens)", the same "Extract PDF text" instruction. **checked**
- "The context window is a public good." **checked**
- "every line is a recurring token cost" (Claude Code skills docs; only partly checked).
- Emphasis piling: "piling on emphasis mostly makes Claude over-apply the rule." and "If the line is getting lost in a long file, the file needs to be shorter." (Claude Code best practices, not checked again). https://code.claude.com/docs/en/best-practices

## 3. The tipping point where the model stops reading well

| Finding | Source |
|---|---|
| "even the best frontier models only achieve 68% accuracy at the max density of 500 instructions" **checked**. o3 (high): 97.8% at 250 instructions, 62.8% at 500 (Table 3). Reasoning models hold near-perfect through 100 to 250 instructions. "Models overwhelmingly err toward omission errors" (§4.8). | IFScale, Jaroslawicz et al., Distyl AI, July 2025. https://arxiv.org/abs/2507.11538 |
| Reasoning degrades "even on input length of 3000 tokens"; average accuracy 0.92 to 0.68 | Same Task, More Tokens, Levy, Jacoby and Goldberg, ACL 2024. https://arxiv.org/abs/2402.14848 |
| "At 32K, for instance, 11 models drop below 50% of their strong short-length baselines." (13 models, all claiming 128K or more) | NoLiMa, Modarressi et al., ICML 2025. https://arxiv.org/abs/2502.05167 |
| Only half of 17 models claiming 32K or more hold up at 32K | RULER, Hsieh et al., NVIDIA, COLM 2024. https://arxiv.org/abs/2404.06654 |
| "Even a single distractor reduces performance relative to the baseline (needle only)" **checked** (18 models) | Chroma, Context Rot, July 2025. https://www.trychroma.com/research/context-rot |
| LLMs have an "attention budget"; "n² pairwise relationships for n tokens"; aim for "the smallest possible set of high-signal tokens" | Anthropic, Effective context engineering for AI agents, 29 Sep 2025. https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents |

## 4. Where to place an addition

- U-shaped recall: best at the start and end, worst in the middle; GPT-3.5-Turbo drops by more than 20% when the answer sits mid-context. Lost in the Middle, Liu et al., TACL 2024. https://arxiv.org/abs/2307.03172
- Primacy: models favour earlier instructions, peaking around 150 to 200 instructions; past 300 failure is uniform. IFScale §4.6.
- Practical rule (ours): put a must-follow addition at the top or inside the exact step it governs; replace an old line before adding a new one; never tack a section on the end of a long middle.

## 5. Left out (unverified)

- HumanLayer's "~150-200 instructions" is the author's reading, not a measurement; IFScale's 100 to 250 is used instead.
- No source gives a "words per addition" figure.

## 6. Notes for the skill (not written yet)

The proposal the skill should return before any edit: the outcome; where (step and line); the exact words to add; anything removed or replaced; words added and the skill's length before and after. Nothing is applied until Taylor approves it.

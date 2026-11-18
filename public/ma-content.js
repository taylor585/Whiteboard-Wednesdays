/* Minimal Additions (id: minimal-additions). 10 slides. Pecuna Factorem brand, confirmed by Taylor on 18 November 2026; all 10 slides
   built at once at Taylor's request (no three-slide trial). Sources: minimal-additions-research.md (18 November 2026). Quotations
   are word for word and were checked on the source pages on 18 November 2026; illustrative material is labelled. CSS only (ma.css). */
window.WW={
 "slides": [
  {
   "id": "cold-open",
   "title": "Good work. Then the upgrade.",
   "section": "00 / Cold open",
   "kind": "ma-break",
   "parts": [
    "<div class=\"ma-file\"><div class=\"micro\">SKILL.md · before</div><b class=\"ma-n\">180</b><span class=\"ma-unit\">lines</span><ul><li>Does the job</li><li>One clear voice</li><li>Steps in order</li></ul></div>",
    "<div class=\"ma-ask\"><svg class=\"ma-arrow\" viewBox=\"0 0 60 20\" aria-hidden=\"true\"><path d=\"M2 10H54M46 3l8 7-8 7\"/></svg><p>“Upgrade the skill.”</p><svg class=\"ma-arrow\" viewBox=\"0 0 60 20\" aria-hidden=\"true\"><path d=\"M2 10H54M46 3l8 7-8 7\"/></svg></div>",
    "<div class=\"ma-file ma-bloat\"><div class=\"micro\">SKILL.md · after</div><b class=\"ma-n\">640</b><span class=\"ma-unit\">lines</span><ul><li><s>Does the job</s> New rules contradict old ones</li><li><s>One clear voice</s> Three new sections</li><li><s>Steps in order</s> The key step is buried</li></ul></div>",
    "<p class=\"statement ma-punch\">And all hell breaks loose.<small>Illustrative line counts.</small></p>"
   ],
   "source": "Illustrative: a typical skill before and after an unchecked upgrade. Line counts are an example, not a measured skill.",
   "note": "Hook, about 30 seconds. Click 1: the skill that works. SAY: “We do good work. The skill does exactly what we want.” Click 2: “Then I ask the AI to upgrade it.” Click 3: “And it comes back three times the size. New rules fighting old rules. The one step that mattered, buried.” Click 4: “All hell breaks loose. So here’s the fix.”",
   "reveals": [
    1,
    2,
    3,
    4
   ]
  },
  {
   "id": "the-rule",
   "title": "Minimal additions",
   "section": "01 / The idea",
   "kind": "ma-rule",
   "parts": [
    "<div class=\"ma-law\"><span class=\"ma-num\">1</span><p>Add <mark>as few words</mark> as humanly possible.</p></div>",
    "<div class=\"ma-law\"><span class=\"ma-num\">2</span><p>Put them <mark>exactly where</mark> they make the skill better.</p></div>",
    "<div class=\"ma-gate\"><div class=\"micro\">Before anything changes</div><p>The AI shows me every word it wants to add, word for word, down to the letter. I read it. I approve it. Then it goes in.</p></div>"
   ],
   "source": "The Minimal additions method: Taylor, 18 November 2026.",
   "note": "Two rules and one gate. SAY: “Minimal additions. Rule one: as few words as humanly possible. Rule two: think hard about where it goes. And the gate: before anything changes, it shows me the exact words, down to the letter.”",
   "reveals": [
    1,
    2,
    3
   ]
  },
  {
   "id": "public-good",
   "title": "Every word costs attention",
   "section": "02 / Why it matters",
   "kind": "ma-quotes",
   "parts": [
    "<figure class=\"ma-q\"><blockquote>The context window is a public good.</blockquote><figcaption>Anthropic, Skill authoring best practices, “Concise is key”</figcaption></figure>",
    "<figure class=\"ma-q\"><blockquote>Default assumption: Claude is already very smart. Only add context Claude doesn’t already have.</blockquote><figcaption>Anthropic, Skill authoring best practices, “Concise is key”</figcaption></figure>",
    "<figure class=\"ma-q\"><blockquote>Longer files consume more context and reduce adherence.</blockquote><figcaption>Claude Code docs, “How Claude remembers your project”</figcaption></figure>",
    "<div class=\"ma-weigh\"><div class=\"micro\">Anthropic’s own example: the same instruction twice</div><div class=\"ma-bar\"><span>Concise</span><i style=\"--w:33%\"></i><b>approximately 50 tokens</b></div><div class=\"ma-bar ma-bar-bad\"><span>Too verbose</span><i style=\"--w:100%\"></i><b>approximately 150 tokens</b></div><p>Same job. <mark>Three times the cost.</mark></p></div>"
   ],
   "source": "Quotations word for word: platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices (“Concise is key”, including the “Extract PDF text” good and bad examples) and code.claude.com/docs/en/memory, checked 18 November 2026.",
   "note": "Quote wall. Read each one slowly. Then the bars: “Anthropic’s own docs show the same instruction written two ways. Fifty tokens, or a hundred and fifty. Same result. Three times the cost, on every single run.” The test question from the same page: “Does this paragraph justify its token cost?”",
   "reveals": [
    1,
    2,
    3,
    4
   ]
  },
  {
   "id": "context-rot",
   "title": "More words, worse answers",
   "section": "03 / The tipping points",
   "kind": "ma-curve",
   "parts": [
    "<figure class=\"ma-chart\"><svg viewBox=\"0 0 400 220\" role=\"img\" aria-label=\"Average reasoning accuracy falls from 0.92 on short inputs to 0.68 at about 3,000 tokens\"><path class=\"ma-axis\" d=\"M40 10V190H390\"/><path class=\"ma-draw\" pathLength=\"1\" d=\"M60 41L360 129\"/><circle cx=\"60\" cy=\"41\" r=\"6\"/><circle cx=\"360\" cy=\"129\" r=\"6\"/><text x=\"70\" y=\"32\">0.92</text><text x=\"360\" y=\"155\" text-anchor=\"middle\">0.68</text><text x=\"44\" y=\"210\">Short input</text><text x=\"390\" y=\"210\" text-anchor=\"end\">About 3,000 tokens</text></svg><figcaption>Average accuracy across the models tested. Two real points, joined by a line.</figcaption></figure>",
    "<div class=\"ma-stat\"><b class=\"ma-count\" style=\"--to:11\"><span class=\"ma-sr\">11</span></b><span class=\"ma-of\">of 13</span><p>long-context models fall below <mark>half</mark> their short-input score at 32K tokens.</p><small>NoLiMa, Adobe Research, ICML 2025</small></div>",
    "<figure class=\"ma-q\"><blockquote>Even a single distractor reduces performance relative to the baseline (needle only)</blockquote><figcaption>Chroma, Context Rot, July 2025: 18 models tested</figcaption></figure>"
   ],
   "source": "Same Task, More Tokens (Levy, Jacoby and Goldberg, ACL 2024): reasoning degrades “even on input length of 3000 tokens”, average accuracy 0.92 to 0.68. NoLiMa (Modarressi et al., ICML 2025): “At 32K, for instance, 11 models drop below 50% of their strong short-length baselines.” Chroma Context Rot report, 14 July 2025.",
   "note": "The line draws itself. SAY: “Researchers padded the same question with extra words. At about three thousand tokens, roughly the size of a long skill, accuracy fell from 92 to 68 per cent.” Click 2: “At 32 thousand, 11 of 13 models fell below half their score.” Click 3: “And one line that’s nearly right, but wrong, is enough to hurt.” That is what a loose addition is.",
   "reveals": [
    1,
    2,
    3
   ]
  },
  {
   "id": "rule-count",
   "title": "How many rules can it hold?",
   "section": "03 / The tipping points",
   "kind": "ma-bars",
   "parts": [
    "<div class=\"ma-col\"><div class=\"ma-tube\"><i style=\"--h:97.8%\"></i></div><b>97.8%</b><span>250 instructions</span></div>",
    "<div class=\"ma-col ma-col-low\"><div class=\"ma-tube\"><i style=\"--h:62.8%\"></i></div><b>62.8%</b><span>500 instructions</span></div>",
    "<div class=\"ma-side\"><div class=\"micro\">The bars: o3 (high), one of the 20 models</div><figure class=\"ma-q\"><blockquote>even the best frontier models only achieve 68% accuracy at the max density of 500 instructions</blockquote><figcaption>IFScale, Distyl AI, July 2025: 20 models tested</figcaption></figure><p class=\"ma-plain\">And when it fails, it fails quietly: models <mark>leave rules out</mark>. They don’t warn you.</p></div>"
   ],
   "source": "IFScale (Jaroslawicz et al., arXiv 2507.11538, July 2025): o3 (high) 97.8% at 250 and 62.8% at 500 instructions (Table 3); reasoning models near-perfect through 100 to 250 instructions (§4.3); “Models overwhelmingly err toward omission errors” (§4.8).",
   "note": "Bars rise. SAY: “Give the best model 250 rules and it follows almost all of them. Double it to 500 and it drops to 63 per cent.” Click 3: “And it doesn’t tell you. It just leaves rules out.” Every addition is another rule on the pile.",
   "reveals": [
    1,
    2,
    3
   ]
  },
  {
   "id": "lost-middle",
   "title": "The middle gets lost",
   "section": "04 / Placement",
   "kind": "ma-ushape",
   "parts": [
    "<figure class=\"ma-chart\"><svg viewBox=\"0 0 400 220\" role=\"img\" aria-label=\"A U-shaped curve: recall is highest at the start and the end of the input and lowest in the middle\"><path class=\"ma-axis\" d=\"M40 10V190H390\"/><path class=\"ma-draw\" pathLength=\"1\" d=\"M60 30C150 175 250 175 360 50\"/><rect class=\"ma-zone\" x=\"150\" y=\"120\" width=\"110\" height=\"70\"/><text x=\"52\" y=\"210\">Start</text><text x=\"182\" y=\"210\">Middle</text><text x=\"345\" y=\"210\">End</text></svg><figcaption>The shape of the finding, not plotted data.</figcaption></figure>",
    "<div class=\"ma-stat\"><div class=\"micro\">More than</div><b class=\"ma-count\" style=\"--to:20\"><span class=\"ma-sr\">20</span></b><span class=\"ma-of\">%</span><p>drop for GPT-3.5-Turbo when the answer sits <mark>in the middle</mark> of what it reads.</p><small>Lost in the Middle, Liu et al., TACL 2024</small></div>",
    "<div class=\"ma-gate\"><div class=\"micro\">So place it</div><p>At the top, or inside the exact step it governs. Replace an old line before you add a new one. Never tack a new section on the end of a long middle.</p></div>"
   ],
   "source": "Lost in the Middle (Liu et al., TACL 2024, arXiv 2307.03172): “performance is often highest when relevant information occurs at the beginning or end of the input context”; GPT-3.5-Turbo multi-document QA can drop by more than 20%. IFScale §4.6: models favour earlier instructions. The placement rule is ours.",
   "note": "Rule two is about where. SAY: “Models read the start and the end best. The middle sags. If the AI bolts your new rule onto the middle of a long file, that’s exactly where it gets lost.” Click 3: the placement rule.",
   "reveals": [
    1,
    2,
    3
   ]
  },
  {
   "id": "how-long",
   "title": "How long should a skill be?",
   "section": "05 / The numbers",
   "kind": "ma-measure",
   "parts": [
    "<div class=\"ma-rule-wrap\"><div class=\"ma-ruler\" role=\"img\" aria-label=\"A ruler from 0 to 600 lines with marks at 147, 200 and 500 lines\"><i class=\"ma-bad\" style=\"--x:83.3%\"></i><span class=\"ma-mark\" style=\"--x:24.5%\"><b>147</b>Median of Anthropic’s 19 public skills</span><span class=\"ma-mark ma-mark-low\" style=\"--x:33.3%\"><b>200</b>Anthropic’s CLAUDE.md target</span><span class=\"ma-mark ma-mark-red\" style=\"--x:83.3%\"><b>500</b>Anthropic’s SKILL.md ceiling</span></div><div class=\"ma-scale\"><span>0</span><span>100</span><span>200</span><span>300</span><span>400</span><span>500</span><span>600 lines</span></div></div>",
    "<div class=\"ma-gate\"><div class=\"micro\">Bloated means</div><p>Over 500 lines. Anything Claude already knows. Any line that doesn’t fix a failure you’ve actually seen.</p></div>",
    "<div class=\"ma-thumb\"><div class=\"micro\">Our rule of thumb</div><p class=\"statement\">Aim for <mark>about 150 lines</mark>. Never pass 500.</p><small>500 lines is roughly Anthropic’s “Under 5k tokens”. 18 of Anthropic’s 19 public skills are under 500.</small></div>"
   ],
   "source": "Anthropic best practices: “Keep the SKILL.md body under 500 lines for optimal performance.” Agent Skills overview: instructions “Under 5k tokens”. Claude Code memory docs: “target under 200 lines per CLAUDE.md file”. Median 147 lines: our count of the 19 SKILL.md files in github.com/anthropics/skills, 18 November 2026 (range 32 to 616). 150 is our rule of thumb.",
   "note": "The direct answer to “how long?”. SAY: “Anthropic’s own ceiling is 500 lines. Their own skills? The middle one is 147. So aim for about 150 and never go past 500.” Click 2: what bloated means. Click 3: the rule of thumb.",
   "reveals": [
    1,
    2,
    3
   ]
  },
  {
   "id": "method",
   "title": "The Minimal additions method",
   "section": "06 / The method",
   "kind": "ma-steps",
   "parts": [
    "<div class=\"ma-step\"><span class=\"ma-num\">1</span><h3>Name the one outcome</h3><p>What should the skill do that it doesn’t do now?</p></div>",
    "<div class=\"ma-step\"><span class=\"ma-num\">2</span><h3>Draft the exact words</h3><p>Word for word, down to the letter. No summaries.</p></div>",
    "<div class=\"ma-step\"><span class=\"ma-num\">3</span><h3>Cut until it breaks</h3><p>Ask of every sentence: <q>Does this paragraph justify its token cost?</q></p></div>",
    "<div class=\"ma-step\"><span class=\"ma-num\">4</span><h3>Choose the place</h3><p>The top, or inside the step it governs. Replace before you add.</p></div>",
    "<div class=\"ma-step ma-step-gate\"><span class=\"ma-num\">5</span><h3>Show, approve, apply</h3><p>Nothing changes until I’ve read it.</p></div>"
   ],
   "source": "Step 3’s question is word for word from Anthropic’s Skill authoring best practices, “Concise is key”. The method: Taylor, 18 November 2026.",
   "note": "Five steps, one per click. Lean on step 3: “Write it, then cut. Keep cutting until removing one more word would break it.” And step 5 is the whole point: “It doesn’t touch the skill until I’ve read every word.”",
   "reveals": [
    1,
    2,
    3,
    4,
    5
   ]
  },
  {
   "id": "forager",
   "title": "One request, two proposals",
   "section": "07 / Example",
   "kind": "ma-diff",
   "parts": [
    "<div class=\"ma-req\"><div class=\"micro\">The request · Facebook forager skill</div><p>“Add five more group searches and a new group-searching framework.”</p></div>",
    "<div class=\"ma-prop ma-prop-bad\"><div class=\"ma-ph\"><b>Proposal A</b><span>a new section of about 400 words · tacked on the end</span></div><pre>## Comprehensive Group Discovery Framework v2.0\n<span class=\"ma-hl\">Facebook groups are online communities where people with shared interests gather to discuss topics…</span>\n<span class=\"ma-hl\">IMPORTANT: ALWAYS search ALL groups CAREFULLY.</span>\n<span class=\"ma-hl\">Step 2 (updated): First, search the core groups…</span></pre><ul class=\"ma-notes\"><li>Claude already knows this</li><li>Shouting makes it over-apply</li><li>Repeats Step 2</li></ul></div>",
    "<div class=\"ma-prop ma-prop-good\"><div class=\"ma-ph\"><b>Proposal B</b><span>34 words · inside Step 2</span></div><pre>Step 2. Search groups\nSearch the core groups.\n<ins>Then search these five groups: [Group 6], [Group 7], [Group 8], [Group 9], [Group 10]. In every group: sort by New, read the last 7 days, and keep only posts asking for a recommendation.</ins></pre></div>",
    "<p class=\"statement ma-punch\">Same outcome. <mark>A tenth of the words.</mark> In the step it governs.</p>"
   ],
   "source": "Illustrative example: the request is the one Taylor described on 18 November 2026; both proposals and the group names are made up to show the method.",
   "note": "The before and after. Click 2: read Proposal A’s marked lines and the margin notes. Click 3: “Here’s the minimal version. 34 words, in the step that already does the searching.” Click 4: the verdict.",
   "reveals": [
    1,
    2,
    3,
    4
   ]
  },
  {
   "id": "close",
   "title": "Add less. Place it well.",
   "section": "08 / Close",
   "kind": "ma-close",
   "parts": [
    "<div class=\"ma-card\"><div class=\"micro\">Ask for this before any skill upgrade</div><dl><dt>Outcome</dt><dd>The one thing it will do better</dd><dt>Where</dt><dd>The step and line it goes in</dd><dt>Add</dt><dd>The exact words, down to the letter</dd><dt>Remove</dt><dd>Anything it replaces</dd><dt>Size</dt><dd>Words added · lines before and after</dd></dl></div>",
    "<div class=\"ma-next\"><div class=\"micro\">Coming next</div><p class=\"statement\">The Minimal additions skill.</p><p>It writes this card for you, every time.</p></div>"
   ],
   "source": "The proposal card: the Minimal additions method, Taylor, 18 November 2026.",
   "note": "Close, about 40 seconds. SAY: “Next time you upgrade a skill, ask for this card first. The outcome, where it goes, the exact words, what it replaces and how big the skill gets. Add less. Place it well.” Click 2: tease the Minimal additions skill.",
   "reveals": [
    1,
    2
   ]
  }
 ]
};

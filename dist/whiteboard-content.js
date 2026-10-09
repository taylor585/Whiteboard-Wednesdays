window.WW={
  "slides": [
    {
      "id": "andromeda",
      "title": "Match first. Rank next.",
      "section": "00 / Why testing matters",
      "kind": "andromeda",
      "parts": [
        "<p class=\"lead\">Andromeda helps Meta find relevant ads for each person.</p><div class=\"and-flow\"><div><small>THE POOL</small><h3>Millions of ads</h3></div><svg viewBox=\"0 0 60 24\" aria-hidden=\"true\"><path d=\"M2 12 H54 M44 3 L54 12 L44 21\"/></svg><div class=\"and-focus\"><small>ANDROMEDA</small><h3>A relevant shortlist</h3></div></div>",
        "<div class=\"and-flow\"><div><small>THEN</small><h3>Ranking + auction</h3><p>Predicted outcomes, bid and ad quality.</p></div><svg viewBox=\"0 0 60 24\" aria-hidden=\"true\"><path d=\"M2 12 H54 M44 3 L54 12 L44 21\"/></svg><div><small>THE DELIVERY</small><h3>An ad for this person</h3></div></div>",
        "<p class=\"hand statement\">Delivery is personalised.<br>It is not an equal test.</p>"
      ],
      "reveals": [
        1,
        2,
        3
      ],
      "source": "Source: Meta Engineering, 2 December 2024. Simplified system diagram; no fixed two-ad rule.",
      "note": "Andromeda performs retrieval, not the whole allocation process. Meta describes millions of candidates being reduced to a relevant shortlist, followed by ranking. Do not say CTR alone selects winners. Source: https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/"
    },
    {
      "id": "uneven-delivery",
      "title": "Two ads take the spend.",
      "section": "00 / A fictional delivery snapshot",
      "kind": "andromeda",
      "parts": [
        "<div class=\"and-legend\"><span><svg viewBox=\"0 0 60 24\" aria-hidden=\"true\"><path d=\"M2 12 H54 M44 3 L54 12 L44 21\"/></svg> Most delivery: Angles 6 + 5</span><span>Invented figures · one video-ad example</span></div><div class=\"and-table\" role=\"table\" aria-label=\"Fictional seven-ad delivery example\"><div class=\"and-row and-header\" role=\"row\"><span role=\"columnheader\">Ad angle</span><span role=\"columnheader\">Amount spent</span><span role=\"columnheader\">Impressions</span><span role=\"columnheader\">CTR (all)</span><span role=\"columnheader\">Unique link CTR</span><span role=\"columnheader\">CPM</span><span role=\"columnheader\">ThruPlays</span></div><div class=\"and-row and-pushed\" role=\"row\"><span role=\"cell\" data-label=\"Ad angle\">Angle 6 <svg viewBox=\"0 0 60 24\" aria-hidden=\"true\"><path d=\"M2 12 H54 M44 3 L54 12 L44 21\"/></svg></span><span role=\"cell\" data-label=\"Amount spent\">£700.00</span><span role=\"cell\" data-label=\"Impressions\">50,000</span><span role=\"cell\" data-label=\"CTR (all)\">4.00%</span><span role=\"cell\" data-label=\"Unique link CTR\">1.80%</span><span role=\"cell\" data-label=\"CPM\">£14.00</span><span role=\"cell\" data-label=\"ThruPlays\">12,000</span></div><div class=\"and-row and-pushed\" role=\"row\"><span role=\"cell\" data-label=\"Ad angle\">Angle 5 <svg viewBox=\"0 0 60 24\" aria-hidden=\"true\"><path d=\"M2 12 H54 M44 3 L54 12 L44 21\"/></svg></span><span role=\"cell\" data-label=\"Amount spent\">£548.00</span><span role=\"cell\" data-label=\"Impressions\">40,000</span><span role=\"cell\" data-label=\"CTR (all)\">3.50%</span><span role=\"cell\" data-label=\"Unique link CTR\">1.60%</span><span role=\"cell\" data-label=\"CPM\">£13.70</span><span role=\"cell\" data-label=\"ThruPlays\">8,800</span></div><div class=\"and-row \" role=\"row\"><span role=\"cell\" data-label=\"Ad angle\">Angle 7</span><span role=\"cell\" data-label=\"Amount spent\">£27.43</span><span role=\"cell\" data-label=\"Impressions\">1,400</span><span role=\"cell\" data-label=\"CTR (all)\">2.50%</span><span role=\"cell\" data-label=\"Unique link CTR\">1.04%</span><span role=\"cell\" data-label=\"CPM\">£19.59</span><span role=\"cell\" data-label=\"ThruPlays\">210</span></div><div class=\"and-row \" role=\"row\"><span role=\"cell\" data-label=\"Ad angle\">Angle 4</span><span role=\"cell\" data-label=\"Amount spent\">£17.43</span><span role=\"cell\" data-label=\"Impressions\">650</span><span role=\"cell\" data-label=\"CTR (all)\">2.46%</span><span role=\"cell\" data-label=\"Unique link CTR\">1.17%</span><span role=\"cell\" data-label=\"CPM\">£26.82</span><span role=\"cell\" data-label=\"ThruPlays\">90</span></div><div class=\"and-row \" role=\"row\"><span role=\"cell\" data-label=\"Ad angle\">Angle 3</span><span role=\"cell\" data-label=\"Amount spent\">£9.72</span><span role=\"cell\" data-label=\"Impressions\">120</span><span role=\"cell\" data-label=\"CTR (all)\">3.33%</span><span role=\"cell\" data-label=\"Unique link CTR\">1.82%</span><span role=\"cell\" data-label=\"CPM\">£81.00</span><span role=\"cell\" data-label=\"ThruPlays\">18</span></div><div class=\"and-row and-candidate\" role=\"row\"><span role=\"cell\" data-label=\"Ad angle\">Angle 2</span><span role=\"cell\" data-label=\"Amount spent\">£6.38</span><span role=\"cell\" data-label=\"Impressions\">83</span><span role=\"cell\" data-label=\"CTR (all)\">4.82%</span><span role=\"cell\" data-label=\"Unique link CTR\">3.75%</span><span role=\"cell\" data-label=\"CPM\">£76.87</span><span role=\"cell\" data-label=\"ThruPlays\">15</span></div><div class=\"and-row and-candidate\" role=\"row\"><span role=\"cell\" data-label=\"Ad angle\">Angle 1</span><span role=\"cell\" data-label=\"Amount spent\">£3.21</span><span role=\"cell\" data-label=\"Impressions\">54</span><span role=\"cell\" data-label=\"CTR (all)\">5.56%</span><span role=\"cell\" data-label=\"Unique link CTR\">4.00%</span><span role=\"cell\" data-label=\"CPM\">£59.44</span><span role=\"cell\" data-label=\"ThruPlays\">11</span></div></div>",
        "<div class=\"and-callout\"><b>95% of spend. Two angles.</b><span>The bottom two reached only 83 and 54 impressions. What have we really learned?</span></div>",
        "<p class=\"hand statement\">Potential winners can stay hidden.</p><p>Highlighted lower rows are candidates for a fair test, not proven winners.</p>"
      ],
      "reveals": [
        1,
        2,
        3
      ],
      "source": "Illustrative figures, not account results. CPM = spend ÷ impressions × 1,000. Tiny samples are deliberately exaggerated.",
      "note": "All rows are fictional video ads from the same example period. Arrow markers show delivery concentration, not an explanation of Meta’s internal scores. CTR (all) uses all clicks / impressions; unique link CTR uses unique link clickers / reach. Underlying reach: 45000, 36000, 1250, 600, 110, 80, 50. Unique link clickers: 810, 576, 13, 7, 2, 3, 2. All clicks: 2000, 1400, 35, 16, 4, 4, 3. ThruPlay counts are not comparable without exposure and video context. Extreme low-impression CPMs are intentional arithmetic, not typical benchmarks. No conversion outcomes have been supplied."
    },
    {
      "id": "test-the-message",
      "title": "Spend is not the verdict.",
      "section": "00 / Find the message that converts",
      "kind": "andromeda",
      "parts": [
        "<div class=\"and-metrics\"><div><h3>Attention</h3><p><b>CTR (all)</b><br>Clicks of any kind.</p><p><b>ThruPlays</b><br>Video watched to the end, or at least 15 seconds for longer videos.</p></div><div><h3>Traffic + cost</h3><p><b>Unique link CTR</b><br>People who clicked a link ÷ people reached.</p><p><b>CPM</b><br>Cost of 1,000 impressions.</p></div></div>",
        "<div class=\"and-callout\"><b>Useful clues. Incomplete evidence.</b><span>Strong click rates and cheap exposure can be encouraging. They do not establish qualified leads or sales.</span></div>",
        "<p class=\"hand statement\">Give different messages a fair test.</p><p>Judge qualified outcomes against the campaign objective. A broadly clickable hook may miss the buyers you need.</p><p><b>Start with the buyer.</b> That is why our process begins with research.</p>"
      ],
      "reveals": [
        1,
        2,
        3
      ],
      "source": "Interpret metrics together, against the chosen objective. This example cannot identify a winning ad.",
      "note": "Do not assert that most accounts hide their best ad: this example illustrates a possibility, not its frequency. More ThruPlays can simply reflect more delivery; lower CPM can buy lower-value exposure. Unique link CTR and CTR (all) have different denominators. Identify winners using adequate evidence on the desired business outcome; no invented conversion proof. Transition to the original opening, The buyer comes first."
    },
    {
      "id": "opening",
      "section": "Our paid ads process",
      "title": "The buyer comes first.",
      "parts": [
        "<p class=\"lead\">Our unique paid ads process starts before we write an advert.</p><p class=\"hand statement\">What are they afraid of?<br>What do they actually want?</p>",
        "<div class=\"paper\"><div class=\"micro\">THE INPUT</div><h3>Their own words</h3><p>Fears, desires, objections and the moments that make people act.</p></div>",
        "<div class=\"hand statement\">A campaign they recognise.</div><p>Research informs the argument. Specialist skills turn it into the assets.</p>"
      ],
      "note": "Cadre Crew campaign walkthrough. Illustrative examples, not client-approved or launched advertising.",
      "kind": "opening",
      "reveals": [
        1,
        2,
        3
      ]
    },
    {
      "id": "research",
      "section": "01 / ICP-Research-Radar",
      "title": "Research shapes every asset.",
      "parts": [
        "<div class=\"source-sheet hand\">ICP-Research-Radar<small>Cadre Crew · 2 September 2026</small></div><p>One report. A shared understanding of the buyer.</p>",
        "<div class=\"branch-list\"><span>Paid ad <small>The moment they recognise</small></span><span>Landing page <small>The explanation they need</small></span><span>Email <small>The question still unanswered</small></span><span>Video <small>The process made visible</small></span></div>",
        "<p class=\"hand statement\">Different assets. The same customer truth.</p>"
      ],
      "note": "154 pages · 90 selected quote records. Selected qualitative evidence, not a population study.",
      "kind": "split",
      "reveals": [
        1,
        2,
        3
      ]
    },
    {
      "id": "live-report",
      "section": "01 / Inspect the evidence",
      "title": "The live ICP-Research-Radar document",
      "parts": [
        "<div class=\"document-bar\"><span class=\"micro\">CADRE CREW / COMPLETE REPORT</span><a href=\"ww-report.pdf\" target=\"_blank\" rel=\"noopener\">Open PDF separately ↗</a></div><iframe class=\"document-frame\" data-src=\"ww-report.pdf#view=FitH\" title=\"Scrollable Cadre Crew ICP research report\"></iframe>"
      ],
      "note": "Scroll inside the document. Use the separate PDF link if your browser cannot display PDFs inline.",
      "kind": "document",
      "reveals": [
        1
      ]
    },
    {
      "id": "evidence",
      "section": "01 / Four useful lenses",
      "title": "Find the words that matter.",
      "parts": [
        "<div class=\"micro\">FEAR</div><blockquote>“Fear of bleeding money due to missed calls and losing clients to competitors.”</blockquote><small>RED-008 · p. 8 · Report finding</small>",
        "<div class=\"micro\">DESIRE</div><blockquote>“Desire for a solution to handle peak hours and repetitive questions without hiring full-time.”</blockquote><small>RED-008 · p. 9 · Report finding</small>",
        "<div class=\"micro\">MOTIVATOR</div><blockquote>“Desire for fast support, free data migration, and month-to-month contracts.”</blockquote><small>RED-002 · p. 9 · Report finding</small>",
        "<div class=\"micro\">REAL-LIFE LANGUAGE</div><blockquote>“i know exactly how many clients we're losing to this. someone googles medspa, tries calling, no answer, books at the place next door instead.”</blockquote><small>RED-008 · p. 13 · Public discussion quote</small>"
      ],
      "note": "Report findings are analysis, not verbatim customer speech. Buyer wants are not automatically service promises.",
      "kind": "evidence",
      "reveals": [
        1,
        1,
        2,
        3
      ]
    },
    {
      "id": "research-method",
      "section": "01 / The research skill",
      "title": "Trace the argument backwards.",
      "parts": [
        "<div class=\"rail\"><b>Original discussion</b><span>→</span><b>Recorded finding</b><span>→</span><b>Creative decision</b></div>",
        "<div class=\"hand statement\">“no answer”</div><p>Keep the source, page and meaning.</p><small>RED-008 · p. 13</small>",
        "<div class=\"paper\"><div class=\"micro\">THE DECISION</div><h3>Make the missed call visible</h3><p>A phone in the advert. A clear owner on the page. A service explanation in the email.</p></div>"
      ],
      "note": "Taylor reports two years of development, hundreds of refinements and thousands of pounds invested in the research skill.",
      "kind": "stack",
      "reveals": [
        1,
        2,
        3
      ]
    },
    {
      "id": "campaign",
      "section": "02 / Campaign planning",
      "title": "Give each asset a job.",
      "parts": [
        "<div class=\"micro\">01 / PAID AD</div><h3>No answer. Next clinic?</h3><p>Make the lost-booking consequence recognisable.</p><img class=\"mini-ad\" src=\"ww-ad.png\" alt=\"Cadre Crew advert\">",
        "<div class=\"micro\">02 / LANDING PAGE</div><h3>Who owns the next action?</h3><p>Explain AI handling, human follow-up and the clinic handoff.</p><img src=\"ww-landing.png\" alt=\"Cadre Crew landing page hero\">",
        "<div class=\"micro\">03 / EMAIL</div><h3>What still needs answering?</h3><p>Return to the source, then explain systems fit and responsibility.</p><div class=\"email-lines\">Subject: No answer. Next clinic?<br><br>A human owns what happens next.</div>"
      ],
      "note": "Common source: RED-008, p. 13. The headline is adapted copy; the source quotation remains exact.",
      "kind": "journey",
      "reveals": [
        1,
        2,
        3
      ]
    },
    {
      "id": "vision-board",
      "section": "02 / Vision Board Studio",
      "title": "The live campaign vision board",
      "parts": [
        "<div class=\"document-bar\"><span class=\"micro\">SOURCE → SCENE → NEXT DECISION</span><a href=\"ww-board.html\" target=\"_blank\" rel=\"noopener\">Open board full width ↗</a></div><iframe class=\"board-frame\" data-src=\"ww-board.html\" title=\"Animated Cadre Crew campaign vision board\"></iframe>"
      ],
      "note": "Existing proposed campaign board, preserved with its expanded email. Play, pause and inspect. It demonstrates planning, not a launched campaign.",
      "kind": "document",
      "reveals": [
        1
      ]
    },
    {
      "id": "creative",
      "section": "03 / The finished static",
      "title": "Their words become the idea.",
      "parts": [
        "<div class=\"micro\">THE EXACT SOURCE / RED-008 · P. 13</div><blockquote>“someone googles medspa, tries calling, <mark>no answer</mark>, <mark>books at the place next door instead.</mark>”</blockquote><small>Public discussion excerpt, not a client testimonial.</small>",
        "<div class=\"micro\">ADAPTED HEADLINE</div><div class=\"hand statement\">No answer.<br>Next clinic?</div>",
        "<figure class=\"creative-stage\"><img class=\"ad-image\" src=\"ww-ad.png\" alt=\"No answer. Next clinic? Cadre Crew static advert\"><figcaption>Illustrative campaign creative · LLM Image Creator</figcaption></figure>"
      ],
      "note": "The headline dramatises the source moment without claiming every missed call becomes a competitor booking.",
      "kind": "creative",
      "reveals": [
        1,
        2,
        3
      ]
    },
    {
      "id": "image-method",
      "section": "03 / LLM Image Creator",
      "title": "Design the decision first.",
      "parts": [
        "<div class=\"micro\">01 / RESEARCH</div><blockquote>“missed calls and losing clients to competitors.”</blockquote><small>RED-008 · p. 8 · Report finding excerpt</small>",
        "<div class=\"micro\">02 / CREATIVE CONTRACT</div><div class=\"spec-lines\"><span>Message <b>No answer. Next clinic?</b></span><span>Subject <b>The unanswered phone</b></span><span>Client palette <b>Blue · Ink · White</b></span><span>Composition <b>Headline first, phone second</b></span></div>",
        "<img class=\"ad-image\" src=\"ww-ad.png\" alt=\"Headline and phone creative hierarchy\"><p>The headline earns the first look. The phone makes the problem concrete.</p>"
      ],
      "note": "The prompt specifies subject, style, composition, lighting, colour and aspect ratio. The commercial hypothesis comes first.",
      "kind": "creative",
      "reveals": [
        1,
        2,
        3
      ]
    },
    {
      "id": "image-checks",
      "section": "03 / LLM Image Creator",
      "title": "The logo is never generated.",
      "parts": [
        "<div class=\"logo-proof\"><img class=\"large-logo\" src=\"ww-coin.svg\" alt=\"Original Pecuna Factorem vector coin\"><div class=\"micro\">EXACT ORIGINAL VECTOR / NOT REDRAWN</div></div>",
        "<div class=\"hand statement\">Generate → inspect → refine</div><p>Generate the scene and headline. Overlay the original client logo separately. Check spelling, hierarchy, negative space and spacing.</p>",
        "<div class=\"thumbnail-proof\"><img src=\"ww-ad.png\" width=\"200\" alt=\"Advert at 200 CSS pixel width\"><div><div class=\"micro\">200 PX CHECK</div><p>Can the headline be read at feed size?</p><small>Then check the placement crop and safe zones.</small></div></div>"
      ],
      "note": "The presentation coin stays vector. Static-image production composites the original client logo after generation.",
      "kind": "split",
      "reveals": [
        1,
        2,
        3
      ]
    },
    {
      "id": "ad-copy",
      "section": "04 / The finished ad copy",
      "title": "A consequence, then a reason.",
      "parts": [
        "<div class=\"micro\">THE EXACT SOURCE / RED-008 · P. 13</div><blockquote>“someone googles medspa, tries calling, <mark>no answer</mark>, <mark>books at the place next door instead.</mark>”</blockquote><small>Public discussion excerpt, not a client testimonial.</small>",
        "<div class=\"micro\">ILLUSTRATIVE AD COPY</div><h3>No answer. Next clinic?</h3><p>A missed ring can become somebody else’s booking.</p><p>Cadre Crew combines AI call handling with human follow-up in your CRM.</p>",
        "<p>Before you add another tool, see who owns the next action.</p><strong>Request a clinic audit</strong><small>Starts with a 30-minute discovery call.</small>"
      ],
      "note": "The audit is the next step, not a fictitious completed booking.",
      "kind": "copy",
      "reveals": [
        1,
        2,
        3
      ]
    },
    {
      "id": "copy-diagnosis",
      "section": "04 / Breakthrough Advertising Mastery",
      "title": "Diagnose before you write.",
      "parts": [
        "<div class=\"micro\">MASS DESIRE</div><h3>Cover the busy hours</h3><p>Handle peak hours and repetitive questions without hiring full-time.</p><small>RED-008 · p. 9 · Buyer desire</small>",
        "<div class=\"micro\">STATE OF AWARENESS</div><h3>What do they know?</h3><p>Unaware → problem-aware → solution-aware → product-aware → most aware.</p><small>Here, solution-aware is a working hypothesis, not a label for every visitor.</small>",
        "<div class=\"micro\">MARKET SOPHISTICATION</div><h3>What have they heard?</h3><p>Familiar software promises make a concrete explanation of ownership worth testing.</p><small>Show how it works instead of making a bigger promise.</small>"
      ],
      "note": "BAM V2 separates knowledge from scepticism. Desire, awareness and sophistication answer different questions.",
      "kind": "journey",
      "reveals": [
        1,
        2,
        3
      ]
    },
    {
      "id": "copy-techniques",
      "section": "04 / Breakthrough Advertising Mastery",
      "title": "Seven techniques. One argument.",
      "parts": [
        "<span class=\"number\">1</span><div><b>Intensification</b><small>Make the consequence concrete.</small></div><p>The booking it costs is harder to see.</p>",
        "<span class=\"number\">2</span><div><b>Identification</b><small>Recognise the working situation.</small></div><p>Your receptionist is helping the patient in front of them.</p>",
        "<span class=\"number\">3</span><div><b>Gradualization</b><small>Earn the next belief.</small></div><p>Review the gaps before choosing the fix.</p>",
        "<span class=\"number\">4</span><div><b>Redefinition</b><small>Clarify the buying question.</small></div><p>A human owns what happens next.</p>",
        "<span class=\"number\">5</span><div><b>Mechanization</b><small>Explain the actual steps.</small></div><p>Capture the enquiry → update the CRM → hand off.</p>",
        "<span class=\"number\">6</span><div><b>Concentration</b><small>Focus the comparison fairly.</small></div><p>Before another tool, decide who owns the next action.</p>",
        "<span class=\"number\">7</span><div><b>Camouflage</b><small>Use a familiar, honest format.</small></div><p>An email from the named team, never a fake reply.</p>"
      ],
      "note": "Practical applications of the skill. Intensification amplifies supported value; no technique substitutes for evidence.",
      "kind": "techniques",
      "reveals": [
        1,
        1,
        1,
        2,
        2,
        3,
        3
      ]
    },
    {
      "id": "headlines",
      "section": "04 / The headline workshop",
      "title": "Strengthen the supported idea.",
      "parts": [
        "<small>07 / Dramatise a moment</small><h3>No answer. Next clinic?</h3><p>The selected headline makes the research situation immediate.</p>",
        "<small>11 / Show the work handled</small><h3>AI answers. A human owns follow-up.</h3><p>The alternative foregrounds the operating mechanism.</p>",
        "<small>12 / Ask a useful question</small><h3>Who calls back when your front desk can’t?</h3><p>Test relevance, clarity, credibility and the promise delivered after the click.</p>"
      ],
      "note": "Three examples from the skill’s 38-method working catalogue. Practical paraphrases, not a verified verbatim list from the book. Alternatives are hypotheses, not measured winners.",
      "kind": "headlines",
      "reveals": [
        1,
        2,
        3
      ]
    },
    {
      "id": "landing",
      "section": "05 / The landing page",
      "title": "Answer the next question.",
      "parts": [
        "<div class=\"micro\">FROM THE RESEARCH</div><blockquote>“missed calls”<br>“without hiring full-time”</blockquote><small>RED-008 · pp. 8–9 · Report findings</small><div class=\"objection-mini\"><div><b>Value</b> <span>“return on investment”</span><small>RED-003 · p. 8</small></div><div><b>Systems fit</b> <span>“lack of integration”</span><small>RED-009 · p. 8</small></div><div><b>Disruption</b> <span>“Fear of data loss”</span><small>RED-004 · p. 8</small></div><div><b>Support ownership</b> <span>“poor support”</span><small>RED-002 · p. 7</small></div><div><b>Commitment</b> <span>“long-term contract”</span><small>RED-002 · p. 7</small></div></div>",
        "<div class=\"browser-object\"><div class=\"micro\">CADRE CREW / LANDING PAGE PROTOTYPE</div><img src=\"ww-landing.png\" alt=\"Landing page: AI answers the call. A human owns what happens next.\"></div>",
        "<div class=\"rail compact\"><b>AI answers</b><span>→</span><b>Operator follows through</b><span>→</span><b>Clinic handoff</b></div><p>Start with an audit of the clinic’s actual systems.</p>"
      ],
      "note": "Five selected objections, not a statistically ranked top five. Example scope depends on systems fit.",
      "kind": "landing",
      "reveals": [
        1,
        2,
        3
      ]
    },
    {
      "id": "objection-path",
      "section": "05 / Website and Funnel Design",
      "title": "The reading order is designed.",
      "parts": [
        "<span class=\"number\">1</span><div><small>RED-003 · p. 8</small><h3>What could a missed enquiry be worth?</h3><p>Review call volume, unanswered enquiries and appointment value. Build the case from the clinic’s numbers.</p></div>",
        "<span class=\"number\">2</span><div><small>RED-009 · p. 8</small><h3>Will this work with our setup?</h3><p>Check the existing CRM, booking tools and handoffs before recommending scope.</p></div>",
        "<span class=\"number\">3</span><div><small>RED-004 · p. 8</small><h3>What happens to our data?</h3><p>Map records, access, changeover checks and a fallback before any move.</p></div>",
        "<span class=\"number\">4</span><div><small>RED-002 · p. 7</small><h3>Who owns follow-up?</h3><p>Define the operator’s responsibilities and the Ops Lead’s oversight.</p></div>",
        "<span class=\"number\">5</span><div><small>RED-002 · p. 7</small><h3>What am I agreeing to?</h3><p>Review scope, fees and terms after discovery, before ongoing delivery.</p></div>"
      ],
      "note": "Proposed attention path: value → systems fit → disruption → ownership → commitment. Not measured eye tracking. Test comprehension and qualified bookings.",
      "kind": "objections",
      "reveals": [
        1,
        1,
        2,
        2,
        3
      ]
    },
    {
      "id": "design-gate",
      "section": "05 / Web, app and funnel design",
      "title": "Quality is a working gate.",
      "parts": [
        "<div class=\"device-pair\"><div class=\"desktop-preview\"><img src=\"ww-landing.png\" alt=\"Desktop landing page\"></div><div class=\"phone-preview\"><img src=\"ww-mobile.png\" alt=\"Recomposed phone landing page\"></div></div>",
        "<div class=\"micro\">QUALITY GATE APPROVED / SKILL RELEASE 7.0.0</div><div class=\"check-rows\"><p>Clear hierarchy and a demonstrating artefact.</p><p>Exact branding, readable contrast and usable controls.</p><p>Desktop and phone composed separately.</p><p>Motion explains the handoff, then stops.</p></div>",
        "<div class=\"app-states\"><span>Ready</span><span>Working</span><span>Complete</span><span>Needs attention</span></div><p>Apps also need honest loading, error, retry and recovery states.</p>"
      ],
      "note": "The skill name describes its required review process, not independent certification or proven conversion uplift.",
      "kind": "landing",
      "reveals": [
        1,
        2,
        3
      ]
    },
    {
      "id": "survey",
      "section": "06 / Qualification",
      "title": "How We Eliminate Tyre Kickers",
      "parts": [
        "<div id=\"survey-demo\"><div class=\"survey-questions\"></div><fieldset><legend></legend><div class=\"survey-options\"></div></fieldset><div class=\"route-result\" aria-live=\"polite\"></div></div>"
      ],
      "note": "Preserved draft rules, pending client approval. Report pp. 4, 6–7. No numerical threshold approved. This demonstration submits nothing.",
      "kind": "survey",
      "reveals": [
        1
      ]
    },
    {
      "id": "qualification-method",
      "section": "06 / The skills behind qualification",
      "title": "Filter fit, not patience.",
      "parts": [
        "<div class=\"micro\">ANY DQ</div><h3>No calendar</h3><p>A respectful explanation, with a way to correct the answer or return later.</p>",
        "<div class=\"micro\">NO DQ + UNCERTAIN</div><h3>Human fit check</h3><p>Resolve uncertainty before booking. No automatic nurture enrolment.</p>",
        "<div class=\"micro\">ALL FIVE PASS</div><h3>Provisional fit</h3><p>Offer the discovery calendar. Technical scope still needs checking.</p>"
      ],
      "note": "Website and Funnel Design defines the path. Breakthrough Advertising keeps the questions clear. Incomplete answers never unlock the calendar.",
      "kind": "journey",
      "reveals": [
        1,
        2,
        3
      ]
    },
    {
      "id": "email",
      "section": "07 / The complete nurture email",
      "title": "Return to their concern.",
      "parts": [
        "<div class=\"source-ribbon\"><span class=\"micro\">EXACT RESEARCH LANGUAGE / RED-008 · PP. 9, 13</span><p><mark>no answer</mark> · <mark>peak hours</mark> · <mark>without hiring full-time.</mark></p></div>",
        "<div class=\"email-full\"><div class=\"micro\">FROM: THE CADRE CREW TEAM / ILLUSTRATIVE DRAFT</div><h3>No answer. Next clinic?</h3><div class=\"email-columns\"><div><p>A missed call is easy to overlook.\nThe booking it costs is harder to see.</p><p>One public med spa discussion put it like this:</p><blockquote>“someone googles medspa, tries calling, no answer, books at the place next door instead.”</blockquote><p>Your receptionist can be helping the patient in front of them while the next one calls somewhere else.</p><p>And when the enquiry is written down in one place but the next action lives somewhere else, follow-up is easy to leave unfinished.</p><p>If the aim is to handle peak hours and repetitive questions without hiring full-time, the question is who takes responsibility after the call.</p><p>Worried about fitting this around your existing systems?\nThat belongs in the audit before any build.</p></div><div><h4>A human owns what happens next.</h4><p>Cadre Crew combines AI call handling with human follow-up and CRM operations.</p><p>The AI handles the initial enquiry and qualification.\nAn operator owns follow-up and keeps the CRM updated.\nOne Ops Lead oversees the work.</p><p>The audit also identifies where a human needs to step in, rather than assuming every enquiry should follow the same automated path.</p><p>We review your enquiry-to-booking path, including systems fit and data handoffs, so you can assess the scope before choosing the fix.</p><p><strong>Request a clinic audit</strong><br>Start with a 30-minute discovery call.</p><p>The Cadre Crew team</p></div></div></div>"
      ],
      "note": "Complete saved expanded email. Read left, then right; phone layout is a continuous column. Not sent. Identity, permission, cadence and unsubscribe configuration need approval.",
      "kind": "email",
      "reveals": [
        1,
        2
      ]
    },
    {
      "id": "email-method",
      "section": "07 / Breakthrough Advertising",
      "title": "Each paragraph earns the next.",
      "parts": [
        "<div class=\"micro\">RECOGNITION + IDENTIFICATION</div><h3>Start with their moment</h3><p>The subject returns to the same concern as the ad.</p><p>The receptionist is helping someone already. Respect the workload.</p>",
        "<div class=\"micro\">MECHANIZATION + REDEFINITION</div><h3>Make ownership visible</h3><div class=\"rail compact\"><b>AI enquiry</b><span>→</span><b>Operator follow-up</b><span>→</span><b>Ops Lead oversight</b></div><p>The argument is responsibility, not simply another tool.</p>",
        "<div class=\"micro\">GRADUALIZATION</div><h3>Ask for the right commitment</h3><p>Review systems fit and handoffs before choosing the fix.</p><strong>One invitation: request a clinic audit.</strong>"
      ],
      "note": "One organising desire, with useful new information in each paragraph.",
      "kind": "journey",
      "reveals": [
        1,
        2,
        3
      ]
    },
    {
      "id": "video",
      "section": "08 / Video concept",
      "title": "Show what the words mean.",
      "parts": [
        "<div class=\"micro\">THE EXACT SOURCE / RED-008 · P. 13</div><blockquote>“someone googles medspa, tries calling, <mark>no answer</mark>, <mark>books at the place next door instead.</mark>”</blockquote><small>Public discussion excerpt, not a client testimonial.</small>",
        "<div class=\"paper script\"><div class=\"micro\">SAVED SHORT VIDEO CONCEPT</div><p>A missed call is easy to overlook.</p><p>One public med spa discussion put it like this: “someone googles medspa, tries calling, no answer, books at the place next door instead.”</p><p>Cadre Crew combines AI call handling with human follow-up and CRM operations.</p><p>One Ops Lead oversees the work.</p><p>Request a clinic audit.</p><p>Start with a 30-minute discovery call to review your enquiry-to-booking path.</p></div>",
        "<div class=\"storyboard-strip\"><div>Unanswered phone</div><span>→</span><div>AI + human handoff</div><span>→</span><div>Audit invitation</div></div>"
      ],
      "note": "Original short concept retained unchanged. Not a finished video or a verified 60-second production script.",
      "kind": "landing",
      "reveals": [
        1,
        2,
        3
      ]
    },
    {
      "id": "video-method",
      "section": "08 / Breakthrough Advertising",
      "title": "One argument across three layers.",
      "parts": [
        "<div class=\"micro\">SPOKEN WORDS</div><h3>The missed-call consequence</h3><p>Recognisable source language, with attribution.</p>",
        "<div class=\"micro\">VISUAL ACTION</div><h3>The operating mechanism</h3><p>Call handling → human follow-up → CRM → clinic handoff.</p>",
        "<div class=\"micro\">ON-SCREEN COPY</div><h3>The same next step</h3><p>Request a clinic audit.</p>"
      ],
      "note": "No invented first-person experience. No public quotation presented as a client testimonial.",
      "kind": "journey",
      "reveals": [
        1,
        2,
        3
      ]
    },
    {
      "id": "production",
      "section": "09 / Creative production",
      "title": "Turn the argument into delivery.",
      "parts": [
        "<div class=\"micro\">SCRIPT</div><h3>The buyer argument</h3><p>Choose a supported angle and earn the next step.</p>",
        "<div class=\"micro\">VOICE + VISUALS</div><h3>A coherent scene</h3><p>Spoken delivery, on-screen words and visual continuity agree.</p>",
        "<div class=\"micro\">VIDEO + SOUND</div><h3>The finished creative</h3><p>Assemble, review and verify the actual export.</p>"
      ],
      "note": "The retained plan names Meta Maestro, UGC and ElevenLabs Flows. No final video was rendered for this example.",
      "kind": "journey",
      "reveals": [
        1,
        2,
        3
      ]
    },
    {
      "id": "booking",
      "section": "09 / Beyond the click",
      "title": "A booking is not the finish.",
      "parts": [
        "<div class=\"rail\"><b>Qualified enquiry</b><span>→</span><b>Confirmed booking</b><span>→</span><b>Prepared conversation</b></div>",
        "<h3>Before the call</h3><p>After trusted booking confirmation, the page can set expectations. Configured, permissioned email and SMS can prepare the buyer.</p>",
        "<h3>On the call</h3><p>Check fit, answer remaining questions and agree the next decision.</p><div class=\"micro\">BOOKINGS · ATTENDANCE · QUALIFIED CONVERSATIONS · SALES</div>"
      ],
      "note": "No calendar event, message, audience or automation activated. Retargeting eligibility does not guarantee an impression.",
      "kind": "stack",
      "reveals": [
        1,
        2,
        3
      ]
    },
    {
      "id": "investment",
      "section": "10 / Why the method matters",
      "title": "The advantage is accumulated.",
      "parts": [
        "<div class=\"investment hand\"><span>Two years</span><span>Hundreds of refinements</span><span>Thousands of pounds invested</span></div><small>Taylor’s reported research-skill development history.</small>",
        "<div class=\"hand statement\">Source → argument → asset → review</div><p>The value is the decisions between the steps, not a single prompt.</p>",
        "<div class=\"paper\"><div class=\"micro\">THE NEXT STANDARD</div><h3>Keep what proves useful</h3><p>Review this presentation first. Then reverse-engineer the demonstrated method into Whiteboard Wednesdays.</p></div>"
      ],
      "note": "Taylor also reports two years and thousands of pounds invested in website and funnel design. Owner-reported history, not guaranteed results. The new skill has not been built.",
      "kind": "split",
      "reveals": [
        1,
        2,
        3
      ]
    }
  ],
  "survey": {
    "title": "How We Eliminate Tyre Kickers",
    "status": "Proposed Cadre Crew screening rules, pending client approval. Presentation only.",
    "source": "sources/Cadre-Crew-ICP-Research.pdf, pages 4, 6 and 7",
    "thresholds": "No numerical enquiry or budget thresholds have been approved. Low or uncertain volume needs review. No current price is implied.",
    "questions": [
      {
        "id": "workload",
        "question": "How much enquiry work needs covering?",
        "basis": "Report pp. 4 and 6–7: recurring operational volume and low-volume qualification. Qualitative wording is newly drafted, not a quotation or approved economic threshold.",
        "options": [
          {
            "id": "daily",
            "label": "Daily, recurring workload",
            "route": "PASS"
          },
          {
            "id": "occasional",
            "label": "Occasional enquiries",
            "route": "REVIEW"
          },
          {
            "id": "none",
            "label": "No ongoing workload",
            "route": "DQ"
          },
          {
            "id": "unknown",
            "label": "Not sure yet",
            "route": "REVIEW"
          }
        ]
      },
      {
        "id": "problem",
        "question": "What is your main problem?",
        "basis": "Report pp. 4 and 6: accountable recurring missed-call, follow-up, booking, no-show and data-handoff problems.",
        "options": [
          {
            "id": "calls",
            "label": "Missed calls / follow-up",
            "route": "PASS"
          },
          {
            "id": "booking",
            "label": "No-shows / booking",
            "route": "PASS"
          },
          {
            "id": "handoffs",
            "label": "CRM admin / handoffs",
            "route": "PASS"
          },
          {
            "id": "none",
            "label": "No recurring problem",
            "route": "DQ"
          }
        ]
      },
      {
        "id": "scope",
        "question": "What support do you want?",
        "basis": "Report p. 4: managed operations, not low-cost software only. Report p. 7: replacement EMR and unverified clinical integration are poor fits. Integration uncertainty is a review gate, never an automatic integration promise.",
        "options": [
          {
            "id": "managed",
            "label": "Managed operations",
            "route": "PASS"
          },
          {
            "id": "integration",
            "label": "Integration needs checking",
            "route": "REVIEW"
          },
          {
            "id": "emr",
            "label": "Replacement clinical EMR",
            "route": "DQ"
          },
          {
            "id": "software",
            "label": "Low-cost software only",
            "route": "DQ"
          }
        ]
      },
      {
        "id": "funding",
        "question": "Can you fund setup + monthly fees?",
        "basis": "Report pp. 3–4 describes a recurring managed-service model. Willingness to fund is not proof of affordability. These draft routes do not quote current pricing. A need for a costed proposal is review, not DQ.",
        "options": [
          {
            "id": "yes",
            "label": "Yes, if the fit is right",
            "route": "PASS"
          },
          {
            "id": "proposal",
            "label": "Need a costed proposal",
            "route": "REVIEW"
          },
          {
            "id": "none",
            "label": "No ongoing budget",
            "route": "DQ"
          }
        ]
      },
      {
        "id": "authority",
        "question": "Who can approve this?",
        "basis": "Report pp. 6–7 distinguishes economic buyers from influential operators. The proposed rule allows an internal champion who can bring the approver. Unclear authority requires review. No approver access blocks the sales calendar for this enquiry, not permanent exclusion.",
        "options": [
          {
            "id": "self",
            "label": "I approve / joint decision",
            "route": "PASS"
          },
          {
            "id": "bring",
            "label": "I can bring the approver",
            "route": "PASS"
          },
          {
            "id": "unclear",
            "label": "Approval path unclear",
            "route": "REVIEW"
          },
          {
            "id": "none",
            "label": "Cannot involve approver",
            "route": "DQ"
          }
        ]
      }
    ],
    "routing": {
      "anyDQ": "No calendar access. Give a respectful fit explanation, with a way to correct an answer or return when circumstances change.",
      "noDQWithReview": "Human fit check before booking. Relevant permissioned nurture may follow, but no automatic nurture enrolment or calendar access.",
      "allPass": "Offer the discovery-call calendar. This is provisional sales fit, not accepted technical scope or a promise of results.",
      "incomplete": "Ask for missing or invalid answers. Never unlock the calendar on an incomplete survey.",
      "precedence": "Any valid DQ answer blocks booking immediately. Otherwise incomplete or invalid answers remain incomplete, then REVIEW takes precedence over PASS."
    },
    "beforeLiveUse": [
      "Client approval of every question, option and route.",
      "Agree the economics and any numerical cutoffs using actual clinic data and verified offer terms.",
      "Validate technical scope, consent, data handling, escalation and patient-experience requirements before delivery. The five questions do not establish these.",
      "A separate implementation scope for form handling, privacy information, storage, calendar gating and permitted follow-up. No live form, email, booking or automation is part of this presentation change."
    ]
  }
};

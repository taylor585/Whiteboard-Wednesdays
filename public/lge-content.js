window.WW={
  "slides": [
    {
      "id": "poor-quality",
      "title": "Too many poor-fit leads",
      "section": "01 / The problem",
      "kind": "lge-split lge-fit",
      "parts": [
        "<svg class=\"lge-icon\" viewBox=\"0 0 80 80\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"40\" cy=\"23\" r=\"12\"/><path d=\"M15 69v-7c0-15 50-15 50 0v7\"/></svg><p class=\"lge-statement\">A name is not enough.</p><p class=\"lge-lead\">A lead can still be the wrong person for your service.</p>",
        "<dl class=\"lge-fields\"><div><dt>Wrong service</dt><dd>They need something you do not provide.</dd></div><div><dt>Wrong area</dt><dd>They live outside the area you serve.</dd></div><div><dt>Missing information</dt><dd>You cannot judge whether they fit.</dd></div></dl>"
      ],
      "reveals": [
        1,
        2
      ],
      "note": "Open with the commercial problem: a contact has value only when it fits the business. No industry-wide prevalence statistic is claimed.",
      "source": "Lead Gen Engine service proposition supplied by the owner."
    },
    {
      "id": "shared-leads",
      "title": "The same lead, shared",
      "section": "01 / The problem",
      "kind": "lge-split lge-branch",
      "parts": [
        "<svg class=\"lge-sharing\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"One shared lead distributed to multiple businesses\"><g fill=\"none\" stroke=\"#D4A96A\" stroke-width=\"3\"><path d=\"M320 83V131M107 131H533M107 131V171M320 131V171M533 131V171\"/></g><rect x=\"221\" y=\"10\" width=\"198\" height=\"73\" rx=\"8\" fill=\"#EDE7DD\"/><text x=\"320\" y=\"55\" text-anchor=\"middle\">One lead</text><g fill=\"#F8F6F3\" stroke=\"#D4A96A\"><rect x=\"20\" y=\"172\" width=\"174\" height=\"90\" rx=\"8\"/><rect x=\"233\" y=\"172\" width=\"174\" height=\"90\" rx=\"8\"/><rect x=\"446\" y=\"172\" width=\"174\" height=\"90\" rx=\"8\"/></g><g text-anchor=\"middle\"><text x=\"107\" y=\"224\">Your business</text><text x=\"320\" y=\"224\">Another buyer</text><text x=\"533\" y=\"224\">Another buyer</text></g></svg>",
        "<p class=\"lge-statement\">You are competing already.</p><p class=\"lge-lead\">When a lead is shared, several businesses can be chasing the same person.</p>"
      ],
      "reveals": [
        1,
        2
      ],
      "note": "This diagram explains a shared-lead model. It is illustrative, not a claim about a named competitor.",
      "source": "Lead Gen Engine service proposition supplied by the owner."
    },
    {
      "id": "our-offer",
      "title": "Better fit. Not shared.",
      "section": "02 / Our offer",
      "kind": "lge-split lge-promise",
      "parts": [
        "<svg class=\"lge-icon\" viewBox=\"0 0 80 80\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15 42l16 16 35-37\"/></svg><p class=\"lge-statement\">Checked for your business.</p><p class=\"lge-lead\">Your service, your area and your agreed customer criteria.</p>",
        "<svg class=\"lge-icon\" viewBox=\"0 0 80 80\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"40\" cy=\"23\" r=\"12\"/><path d=\"M15 69v-7c0-15 50-15 50 0v7\"/></svg><p class=\"lge-statement\">Supplied to your business.</p><p class=\"lge-lead\">We do not share the leads we supply to you with other buyers.</p>"
      ],
      "reveals": [
        1,
        2
      ],
      "note": "Our stated offer combines business-specific selection with a commitment not to share supplied leads with other buyers. Validation does not itself establish exclusivity or guarantee sales.",
      "source": "Lead Gen Engine service proposition supplied by the owner."
    },
    {
      "id": "real-example",
      "title": "Two specialist AI agents",
      "section": "02 / The system",
      "kind": "lge-single lge-record-lines",
      "parts": [
        "<div class=\"lge-step\"><span class=\"lge-num\">01</span><div><h3>Audience Builder</h3><p>Turns a business brief into a reasoned audience strategy.</p><p class=\"lge-source-count\"><strong>58</strong> core instruction lines<br><strong>259</strong> supporting helper-code lines</p></div></div>",
        "<div class=\"lge-step\"><span class=\"lge-num\">02</span><div><h3>Validation Agent</h3><p>Checks the resulting records through a separate quality process.</p><p class=\"lge-source-count\"><strong>123</strong> core instruction lines<br><strong>18</strong> supporting helper-code lines</p></div></div>"
      ],
      "reveals": [
        1,
        2
      ],
      "note": "Two distinct responsibilities. The builder makes and verifies audience decisions. The validator evaluates the downloaded records rather than trusting the build alone. Source audit on 13 October 2026: 58 physical lines in the core builder instruction file; 259 physical lines across its three B2C reference helpers (85 + 33 + 141). The validator has 123 physical core instruction lines and an 18-line bundled helper. Counts include comments and blank lines, exclude tests, configuration, linked instruction libraries, historical implementations and the AI platform itself. These are scoped source counts, not the entire executable agent or a measure of quality. The validation helper covers one part of the wider instructed process. Reference helpers remain subordinate to current policy. No code, criteria or operating instructions are shown.",
      "source": "Installed B2C source audit, 13 October 2026. Instructions and helper code counted separately; not total platform code."
    },
    {
      "id": "journey",
      "title": "One connected decision process",
      "section": "02 / The system",
      "kind": "lge-steps lge-path",
      "parts": [
        "<div class=\"lge-step\"><span class=\"lge-num\">01</span><div><h3>Understand the business</h3><p>Read the brief and identify what success means.</p></div></div>",
        "<div class=\"lge-step\"><span class=\"lge-num\">02</span><div><h3>Build the audience</h3><p>Choose the relevant data and verify the saved configuration.</p></div></div>",
        "<div class=\"lge-step\"><span class=\"lge-num\">03</span><div><h3>Evaluate the records</h3><p>Apply the separate validation framework.</p></div></div>",
        "<div class=\"lge-step\"><span class=\"lge-num\">04</span><div><h3>Present the evidence</h3><p>Return clear outcomes for human review.</p></div></div>"
      ],
      "reveals": [
        1,
        2,
        3,
        4
      ],
      "note": "The sophistication is in carrying the business requirement through every stage, with separate checks on the configuration and the actual output. Show the progression without opening operator screens.",
      "source": "Illustrative workflow. An accepted record is not a confirmed enquiry or appointment."
    },
    {
      "id": "onboarding-start",
      "title": "The intelligence starts here",
      "section": "03 / Audience Builder",
      "kind": "lge-split lge-count-stage",
      "parts": [
        "<div class=\"lge-stat\"><strong>31</strong><h3>onboarding questions</h3><p>Across the complete form, plus an authorisation confirmation.</p></div>",
        "<div class=\"lge-stat\"><strong>6</strong><h3>guided sections</h3><p>Business, offer, location, customers, delivery and review.</p></div>",
        "<p class=\"lge-caption\">Questions vary with the answers. Some fields are optional or completed automatically.</p>"
      ],
      "reveals": [
        1,
        2,
        3
      ],
      "note": "Count verified against the live onboarding schema on 13 October 2026: 32 client fields, comprising 31 information fields and one confirmation. This is the total schema, not 31 questions every client must answer. Conditional location and customer routes change what is shown.",
      "source": "Current onboarding schema, verified 13 October 2026."
    },
    {
      "id": "customer",
      "title": "A richer business context",
      "section": "03 / Audience Builder",
      "kind": "lge-single lge-audience",
      "parts": [
        "<div class=\"lge-stat\"><strong>52</strong><h3>possible structured inputs</h3><p>32 client-side fields + 20 staff-side fields.</p></div>",
        "<div class=\"lge-criteria\"><div><b>Business context</b><span>What you sell</span></div><div><b>Customer context</b><span>Who you serve</span></div><div><b>Operational context</b><span>What you can deliver</span></div></div>",
        "<p class=\"lge-caption\">Available input capacity, not 52 mandatory answers or 52 targeting filters.</p>"
      ],
      "reveals": [
        1,
        2,
        3
      ],
      "note": "The schema provides 52 possible fields across client intake and staff context. The agent uses applicable, supplied evidence and flags missing information. Do not claim every build reads 52 populated values or that each answer becomes a targeting restriction.",
      "source": "Current onboarding schema: 32 client fields and 20 staff fields."
    },
    {
      "id": "brief-to-audience",
      "title": "A framework for decisions",
      "section": "03 / Audience Builder",
      "kind": "lge-single lge-record-lines",
      "parts": [
        "<div class=\"lge-step\"><span class=\"lge-num\">01</span><div><h3>Interpret</h3><p>Understand the service, customer and commercial objective.</p></div></div>",
        "<div class=\"lge-step\"><span class=\"lge-num\">02</span><div><h3>Compare</h3><p>Review relevant prior runs and their recorded outcomes.</p></div></div>",
        "<div class=\"lge-step\"><span class=\"lge-num\">03</span><div><h3>Select</h3><p>Choose a supported audience strategy for this brief.</p></div></div>",
        "<div class=\"lge-step\"><span class=\"lge-num\">04</span><div><h3>Verify</h3><p>Check that the platform saved the intended configuration.</p></div></div>"
      ],
      "reveals": [
        1,
        2,
        3,
        4
      ],
      "note": "This is an evidence-led decision framework. It distinguishes what the data supports from what needs human review, records the reasons for choices and preserves business constraints. It does not simply add every possible restriction.",
      "source": "Audience Builder operating instructions and separate creation run log."
    },
    {
      "id": "signals",
      "title": "A broad data toolkit",
      "section": "03 / Audience Builder",
      "kind": "lge-split lge-count-stage",
      "parts": [
        "<div class=\"lge-stat\"><strong>60</strong><h3>documented filter controls</h3><p>The recorded DataMoon interface exposes a broad configuration toolkit.</p></div>",
        "<div><h3>Relevance is the decision.</h3><p class=\"lge-lead\">The agent assesses which available controls support this particular brief.</p></div>",
        "<p class=\"lge-caption\">Catalogue recorded 15 September 2026. Available controls are rechecked when a build runs.</p>"
      ],
      "reveals": [
        1,
        2,
        3
      ],
      "note": "The retained DataMoon interface snapshot explicitly says Search 60 filters. This is a dated inventory, not a live claim about today’s exact catalogue size or a claim that 60 controls are used together. Explain the breadth of the choice without listing controls, combinations, operators or selected values.",
      "source": "Recorded DataMoon interface, 15 September 2026; Audience Builder procedure."
    },
    {
      "id": "build-export",
      "title": "Compress the manual work",
      "section": "03 / Audience Builder",
      "kind": "lge-split lge-contrast",
      "parts": [
        "<div><h3>Working manually</h3><p class=\"lge-lead\">Interpret the brief. Explore the controls. Revisit past work. Configure the audience. Recheck what was saved.</p></div>",
        "<div><h3>With the agent</h3><p class=\"lge-lead\">One coordinated workflow handles those stages and returns the decisions for review.</p></div>",
        "<p class=\"lge-caption\">Designed to reduce operator effort. End-to-end time still includes platform processing and review.</p>"
      ],
      "reveals": [
        1,
        2,
        3
      ],
      "note": "The defensible speed story is automated coordination and fewer manual hand-offs. No controlled, like-for-like agent versus human timing benchmark was found in the reviewed evidence. Do not state seconds, hours saved or a speed multiplier. A future timing comparison must measure the same brief and separate active operator time from provider processing.",
      "source": "Workflow comparison from the documented procedure; no measured timing claim."
    },
    {
      "id": "checks-1",
      "title": "The build checks itself",
      "section": "03 / Audience Builder",
      "kind": "lge-steps lge-path",
      "parts": [
        "<div class=\"lge-step\"><span class=\"lge-num\">01</span><div><h3>Inspect the plan</h3><p>Confirm the strategy matches the brief.</p></div></div>",
        "<div class=\"lge-step\"><span class=\"lge-num\">02</span><div><h3>Read back the result</h3><p>Verify the saved audience rather than assume settings persisted.</p></div></div>",
        "<div class=\"lge-step\"><span class=\"lge-num\">03</span><div><h3>Keep the evidence</h3><p>Retain the audience identity and completion record.</p></div></div>"
      ],
      "reveals": [
        1,
        2,
        3
      ],
      "note": "The creation procedure requires inspection before execution and read-back afterwards. Existing run history helps avoid accidental duplicate builds. Uncertainty is reported instead of being turned into a success claim.",
      "source": "Audience Builder verification and reconciliation procedure."
    },
    {
      "id": "checks-2",
      "title": "One real business example",
      "section": "04 / The demonstration",
      "kind": "lge-split lge-example",
      "parts": [
        "<div class=\"lge-company\"><h3>United Van Lines</h3><p class=\"lge-lead\">Residential interstate moving.</p></div>",
        "<div><h3>The demonstration brief</h3><p class=\"lge-lead\">Find a relevant consumer audience for a moving business serving the US.</p></div>"
      ],
      "reveals": [
        1,
        2
      ],
      "note": "United Van Lines is a real business used as an illustrative example. No affiliation, commission, executed audience results or company operating figures are claimed. Discuss the commercial objective without displaying the audience recipe.",
      "source": "United Van Lines service example retained from the original walkthrough. Hypothetical brief."
    },
    {
      "id": "checks-3",
      "title": "A separate quality layer",
      "section": "05 / Validation Agent",
      "kind": "lge-single lge-audience",
      "parts": [
        "<p class=\"lge-statement\">The export must earn its place.</p>",
        "<div><h3>Agent two examines the actual records.</h3><p class=\"lge-lead\">It applies a consistent validation framework to the downloaded data, separately from audience creation.</p></div>"
      ],
      "reveals": [
        1,
        2
      ],
      "note": "The validator checks what was actually downloaded. It does not accept a provider count or a saved audience setting as proof of record-level quality. The separate stage can identify differences between intended selection and the delivered file.",
      "source": "Illustrative workflow. An accepted record is not a confirmed enquiry or appointment."
    },
    {
      "id": "four-outcomes",
      "title": "Twelve checks. Every record.",
      "section": "05 / Validation Agent",
      "kind": "lge-split lge-count-stage",
      "parts": [
        "<div class=\"lge-stat\"><strong>12</strong><h3>defined validation checks</h3><p>Applied consistently across every populated source record.</p></div>",
        "<div><h3>A documented decision</h3><p class=\"lge-lead\">Each record receives an outcome supported by the available evidence.</p></div>",
        "<p class=\"lge-caption\">Checks assess the supplied data. Human qualification confirms the customer’s actual need.</p>"
      ],
      "reveals": [
        1,
        2,
        3
      ],
      "note": "The current validator defines twelve checks. We disclose the breadth and consistent coverage without publishing the checklist, thresholds, field mapping or exception rules. A pass does not independently verify identity, contactability, permission or purchase intent.",
      "source": "Current Validation Agent specification, version 3.2.0; criteria retained privately."
    },
    {
      "id": "reconcile",
      "title": "Refined against real exports",
      "section": "05 / Validation Agent",
      "kind": "lge-single lge-audience",
      "parts": [
        "<div class=\"lge-stat\"><strong>500</strong><h3>records in a historical regression</h3><p>An earlier validation policy was checked against a fixed export.</p></div>",
        "<p class=\"lge-lead\">Documented results help refine the method and test whether changes behave as intended.</p>",
        "<p class=\"lge-caption\">Historical policy test, 24 September 2026. Not a conversion study or a claim of 500 manual reviews.</p>"
      ],
      "reveals": [
        1,
        2,
        3
      ],
      "note": "The retained validation log records a frozen 500-record membership regression for an earlier policy. This supports a history of record-based testing, not predictive sales quality or validation of the current policy on that same cohort. Do not substitute the suggested 200-contact manual-review claim, which was illustrative rather than evidenced.",
      "source": "Historical validation regression recorded 24 September 2026."
    },
    {
      "id": "delivery",
      "title": "Every outcome stays visible",
      "section": "05 / Validation Agent",
      "kind": "lge-single lge-record-lines",
      "parts": [
        "<div class=\"lge-step\"><span class=\"lge-num\">01</span><div><h3>Accepted</h3><p>Records that meet the agreed framework.</p></div></div>",
        "<div class=\"lge-step\"><span class=\"lge-num\">02</span><div><h3>Set aside</h3><p>Records requiring further evidence or review.</p></div></div>",
        "<div class=\"lge-step\"><span class=\"lge-num\">03</span><div><h3>Excluded</h3><p>Records that do not meet the requirements.</p></div></div>",
        "<div class=\"lge-step\"><span class=\"lge-num\">04</span><div><h3>Reconciled</h3><p>The full input is accounted for in the final report.</p></div></div>"
      ],
      "reveals": [
        1,
        2,
        3,
        4
      ],
      "note": "The report preserves the connection between input and outcome. The private audit holds detailed reasons. The presentation shows only aggregate outcomes; do not display personal records or the internal decision recipe.",
      "source": "Illustrative workflow. An accepted record is not a confirmed enquiry or appointment."
    },
    {
      "id": "not-shared",
      "title": "One buyer. Your business.",
      "section": "06 / The business value",
      "kind": "lge-split lge-connection",
      "parts": [
        "<div class=\"lge-exclusive\"><svg class=\"lge-icon\" viewBox=\"0 0 80 80\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 8h30l15 15v49H20zM50 8v17h15M30 38h25M30 49h25M30 60h15\"/></svg><span class=\"lge-connector-line\" aria-hidden=\"true\"></span><svg class=\"lge-icon\" viewBox=\"0 0 80 80\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 35L40 9l32 26M17 30v42h46V30M33 72V49h14v23\"/></svg></div><div class=\"lge-exclusive-labels\"><b>Checked lead</b><b>Your business</b></div>",
        "<p class=\"lge-statement\">Not shared with other buyers.</p><p class=\"lge-lead\">Our offer is to supply these leads to your business without sharing them with other buyers.</p>"
      ],
      "reveals": [
        1,
        2
      ],
      "note": "Non-sharing is our supply commitment. It must be honoured through allocation and delivery practices; validation alone does not prove exclusivity. No claim that other suppliers cannot independently identify the same person.",
      "source": "Lead Gen Engine non-sharing service proposition."
    },
    {
      "id": "human-conversation",
      "title": "Your team closes the loop",
      "section": "06 / The business value",
      "kind": "lge-steps lge-path",
      "parts": [
        "<div class=\"lge-step\"><span class=\"lge-num\">01</span><div><h3>Confirm the need</h3><p>Have the real conversation.</p></div></div>",
        "<div class=\"lge-step\"><span class=\"lge-num\">02</span><div><h3>Confirm the fit</h3><p>Check whether the business can help.</p></div></div>",
        "<div class=\"lge-step\"><span class=\"lge-num\">03</span><div><h3>Agree the next step</h3><p>Move forward through the appropriate human-led process.</p></div></div>"
      ],
      "reveals": [
        1,
        2,
        3
      ],
      "note": "The agents support audience selection and data validation. Human qualification establishes the actual opportunity. Do not present a validated record as a booked appointment or a sale.",
      "source": "Illustrative workflow. An accepted record is not a confirmed enquiry or appointment."
    },
    {
      "id": "finish",
      "title": "Eight weeks of specialist development",
      "section": "06 / The business value",
      "kind": "lge-split lge-count-stage",
      "parts": [
        "<div class=\"lge-stat\"><strong>160</strong><p class=\"lge-lead\">Estimated development hours<br>across both agents.</p></div>",
        "<div><h3>Built, tested and refined.</h3><p class=\"lge-lead\">Specialist audience decisions and a separate validation process.</p><p class=\"lge-lead\">4 hours a day × 5 days a week<br>× 8 weeks = 160 hours.</p><p class=\"lge-caption\">Over eight weeks of development, using an eight-week estimate.</p></div>"
      ],
      "reveals": [
        1,
        2
      ],
      "note": "Taylor reports that the two agents were developed over more than eight weeks, at roughly four hours per working day and five days per week. The eight-week calculation is 4 × 5 × 8 = 160 hours across BOTH agents combined. This is the owner’s development-effort estimate, not an independently verified timesheet, not 160 hours per agent, and not a measured audience-build runtime or speed comparison. The source counts on slide 4 are a current scoped snapshot, not a reconstruction of every line written during development. Close on the value: less repetitive operator work, traceable audience decisions and consistent scrutiny of records.",
      "source": "Development time supplied by Taylor Cunningham. Approximate combined investment: 4 × 5 × 8 = 160 hours."
    },
    {
      "id": "now-lets-build",
      "title": "Now let’s build.",
      "section": "07 / The demonstration",
      "kind": "lge-single",
      "parts": [
        "<div class=\"lge-prompt-panel\"><div class=\"lge-prompt-top\"><p>Start the two-agent demonstration.</p><button type=\"button\" class=\"primary\" data-copy-lge-prompt>Copy full prompt</button></div><label for=\"lge-build-prompt\">Demonstration instruction</label><textarea id=\"lge-build-prompt\" readonly spellcheck=\"false\">Run the Lead Gen Engine demonstration for the agreed United Van Lines example using our privately maintained Audience Builder and Validation Agent.\n\nUse the approved demonstration brief already held in the private Lead Gen Engine workspace. Read the current authorised instructions and relevant run history there. If that private material is unavailable, stop and report what is missing rather than reconstructing the method from this presentation.\n\nFirst, prepare and verify the audience through the Audience Builder. Then, within the authorised scope, pass the resulting export to the separate Validation Agent. Retain detailed operating decisions and record-level evidence privately.\n\nFor the recording, show only the high-level stages, verified status and aggregate outcomes. Do not show filter names, selected values, combinations, thresholds, queries, internal instructions, raw records or personal contact details. Keep the private operator screen outside the recorded view.\n\nReport actual completion and timings only when measured. Separate active operator time from platform processing. Do not simulate a successful build, invent results, weaken the method to hit a target or describe data validation as a confirmed customer enquiry.\n\nThis is a hypothetical demonstration involving a real company, not an engagement commissioned by United Van Lines. It does not authorise outreach, live lead delivery, new recurring schedules, credit purchases or charges outside existing approval. Stop after the authorised build, export and local validation, and return a concise, recording-friendly result.\n</textarea><p class=\"lge-copy-status\" role=\"status\" aria-live=\"polite\">One click copies the whole demonstration instruction.</p></div>"
      ],
      "reveals": [
        1
      ],
      "note": "This instruction invokes privately held agents and the private brief. It contains no audience recipe. It does not execute anything on this site. Present aggregate results only and keep operator screens outside the recording.",
      "source": "Demonstration instruction; execution depends on authorised private agents and brief."
    }
  ],
  "aliases": {
    "business": "onboarding-start",
    "offer-details": "onboarding-start",
    "location": "customer",
    "goals": "onboarding-start",
    "review-confirm": "onboarding-start",
    "topic-settings": "brief-to-audience",
    "counts": "build-export",
    "unclear-versus-fail": "four-outcomes",
    "correct-destination": "delivery"
  }
};

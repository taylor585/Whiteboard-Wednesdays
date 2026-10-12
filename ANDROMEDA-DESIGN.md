# Andromeda opening design draft

Three new slides precede `opening`: `andromeda`, `uneven-delivery`, `test-the-message`. The original 26 slide objects and survey are unchanged. The reading view contains all 29 chapters. These three slides were integrated into the full presentation and published as Sites version 5 on 9 October 2026. See VERIFICATION.md for current release evidence and hosted-check limitations.

## Evidence and interpretation

Meta describes Andromeda as retrieval followed by later ranking. Source: https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/

No fixed rule selecting two ads based on CTR, CPM and ThruPlays was established. The seven-row example illustrates concentrated delivery and the uncertainty of tiny samples, not its frequency or causation. No conversion results or proven winners are invented. User requested Angle 7 as the seventh label.

Spend totals £1,312.17. Angles 6 and 5 receive £1,248, or 95.11%. CPMs are calculated from spend and impressions. CTR numerators and reach denominators are recorded in presenter notes. Small impression counts intentionally imply unusually high CPMs. All rows represent fictional video ads. Meta's metric help pages could not be read through the web tool; they returned login/blocked pages. Metric definitions should be rechecked before final publication.

## Five simplicity passes

- Meaning: distinguish retrieval, delivery and evidence of business success.
- Structure: three slides, each with three reveal groups; retain every requested metric.
- Visual: a two-stage diagram, seven-row table with SVG arrows, then two metric groups. Preserve exact coin and fonts.
- Sequence: explain the system, reveal delivery concentration, then explain what remains untested and bridge into buyer research.
- Audience: plain headlines; spell out metrics; turn table rows into labelled phone blocks. Preserve invented-data labels and sample-size caveats.

## Validation

Chromium with Playwright, 9 October 2026: 48 slide/reveal/viewport overflow checks passed (3 new slides × 4 states × 375/390/768/1280px). No runtime errors. Twelve full-content screenshots captured after fonts and transitions settled; desktop slides and phone table visually inspected. All original slide objects and survey compare equal to baseline; 29 unique IDs and contiguous reveal arrays validated. All dist files except paid-ad content, shared CSS with new-slide-scoped rules, and paid-ad reading view match baseline SHA-256 hashes. SKILL.md matches the supplied SHA-256.

Not performed: full existing-deck regression, hosted QA, physical Safari/iPhone testing. These draft checks are not release certification.

## Slide three revision

User approved slide one. Replaced slide three with “Meta optimises for the event.” It shows concentration around predicted events, hypothetical cancellation/refund risk, and the need for customer-quality signals. Preserved seven-row slide two and all other slides. Metric explanations retained in presenter notes.

Primary source: https://www.facebookblueprint.com/student/path/253141-conversions-api-crm-lead-quality explains CRM signals and qualified-lead optimisation. Do not claim Meta ignores all other ads until diminishing returns or restarts learning independently for each ad. Those universal mechanisms are unverified; delivery also depends on objectives, constraints and available feedback.

Revised slide: 16 Chromium reveal/viewport overflow checks passed, four screenshots captured, no runtime errors; inspected desktop and phone renders. The temporary harness printed an outdated fixed “12 screenshots” label; actual revision capture count is four. Remaining 28 slide objects and survey compare unchanged. No hosted publication or physical-device testing.

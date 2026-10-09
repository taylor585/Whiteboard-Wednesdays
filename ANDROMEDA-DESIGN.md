# Andromeda opening design draft

Three new slides precede `opening`: `andromeda`, `uneven-delivery`, `test-the-message`. The original 26 slide objects and survey are unchanged. The reading view contains all 29 chapters. This is a design draft, not a deployed release.

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

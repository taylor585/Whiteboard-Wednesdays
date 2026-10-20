# Performance Poster research

The research behind the planned **Performance Poster** skill. That skill will write YouTube descriptions, LinkedIn posts and Instagram captions.

Researched 20 October 2026. The skill itself is **not built yet**; section 6 of the PDF is its blueprint. Thumbnail Tracker is unchanged.

| File | What it is |
|---|---|
| `Performance-Poster-Research.pdf` | The report (14 pages), in sections for YouTube, LinkedIn and Instagram. It covers character limits, optimal lengths, hashtag counts, where to research hashtags, what we lift from Thumbnail Tracker, and how to build and use the skill. |
| `performance-poster-research.html` | The source the PDF is rendered from |
| `notes/youtube.md`, `notes/linkedin.md`, `notes/instagram.md` | The full research notes, with every source URL and confidence rating |
| `notes/desc_analysis.py`, `notes/desc_tables.md`, `notes/desc_rows.json` | The YouTube description analysis: 150 videos from Nick Saraev, Riley Brown and Sabri Suby |
| `fonts/` | The brand fonts, each with its licence |

## Rebuilding the PDF

Render `performance-poster-research.html` to A4 with Playwright: `page.pdf({format: 'A4', printBackground: true, preferCSSPageSize: true})`. That's the same method used for the CTA library PDF.

This folder isn't part of the public site build (`dist/`).

# Bundled fonts

The renderer (`scripts/render.cjs`) loads these files as local `@font-face` rules, so
thumbnails render with no network access. They are the exact woff2 files Google Fonts serves
to Chrome (latin and latin-ext subsets), so renders match the older Google-hosted output
(mean difference under 0.15/255 on every example; see `tests/README.md`).

- `fonts.json` is the manifest `render.cjs` reads: one entry per `@font-face` (family, style,
  weight, file, unicode-range). Several weights share one file because the files are
  variable fonts (Inter Tight, JetBrains Mono, Caveat, Fraunces, Instrument Sans).
- If a listed file is missing, `render.cjs` prints a WARNING and adds the Google Fonts
  stylesheet as a fallback (unless `THUMB_OFFLINE=1`).
- To re-download everything (files, licences, manifest): `python3 scripts/fetch_fonts.py`.

Characters outside latin/latin-ext (for example `→`) are not in these files; the browser
draws them with a system font, exactly as it did with Google Fonts.

Total: 17 font files, 556 KB.

## Files

| File | Family | Weights | Subset | Size | Licence | Source URL |
|---|---|---|---|---|---|---|
| `inter-tight-latin-ext.woff2` | Inter Tight | 700, 800, 900 | latin-ext | 87.7 KB | OFL-1.1 (`LICENSE-inter-tight.txt`) | https://fonts.gstatic.com/s/intertight/v9/NGSwv5HMAFg6IuGlBNMjxLsJ8ah8QA.woff2 |
| `inter-tight-latin.woff2` | Inter Tight | 700, 800, 900 | latin | 43.8 KB | OFL-1.1 (`LICENSE-inter-tight.txt`) | https://fonts.gstatic.com/s/intertight/v9/NGSwv5HMAFg6IuGlBNMjxLsH8ag.woff2 |
| `permanent-marker-latin.woff2` | Permanent Marker | 400 | latin | 28.9 KB | Apache-2.0 (`LICENSE-permanent-marker.txt`) | https://fonts.gstatic.com/s/permanentmarker/v16/Fh4uPib9Iyv2ucM6pGQMWimMp004La2Cfw.woff2 |
| `jetbrains-mono-latin-ext.woff2` | JetBrains Mono | 500, 700 | latin-ext | 34.9 KB | OFL-1.1 (`LICENSE-jetbrains-mono.txt`) | https://fonts.gstatic.com/l/font?kit=tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8-qwBNntkaToggR7BYXHKPx7cwg&skey=48ad01c60053c2ae&v=v24 |
| `jetbrains-mono-latin.woff2` | JetBrains Mono | 500, 700 | latin | 30.4 KB | OFL-1.1 (`LICENSE-jetbrains-mono.txt`) | https://fonts.gstatic.com/l/font?kit=tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8-qwBNntkaToggR7BYXHKPxDcwg&skey=48ad01c60053c2ae&v=v24 |
| `caveat-latin-ext.woff2` | Caveat | 600, 700 | latin-ext | 28.8 KB | OFL-1.1 (`LICENSE-caveat.txt`) | https://fonts.gstatic.com/s/caveat/v23/Wnz6HAc5bAfYB2Q7aDYYmg8.woff2 |
| `caveat-latin.woff2` | Caveat | 600, 700 | latin | 73.2 KB | OFL-1.1 (`LICENSE-caveat.txt`) | https://fonts.gstatic.com/s/caveat/v23/Wnz6HAc5bAfYB2Q7ZjYY.woff2 |
| `anton-latin-ext.woff2` | Anton | 400 | latin-ext | 30.6 KB | OFL-1.1 (`LICENSE-anton.txt`) | https://fonts.gstatic.com/s/anton/v27/1Ptgg87LROyAm3K9-C8QSw.woff2 |
| `anton-latin.woff2` | Anton | 400 | latin | 18.2 KB | OFL-1.1 (`LICENSE-anton.txt`) | https://fonts.gstatic.com/s/anton/v27/1Ptgg87LROyAm3Kz-C8.woff2 |
| `fraunces-italic-latin-ext.woff2` | Fraunces | 600 italic | latin-ext | 20.5 KB | OFL-1.1 (`LICENSE-fraunces.txt`) | https://fonts.gstatic.com/s/fraunces/v38/6NVf8FyLNQOQZAnv9ZwNjucMHVn85Ni7emAe9lKqZTnbB-gzTK0K1ChJdt9vIVYX9G37lvd9sPEKsxx664UJf1iVSs7frU92Ng.woff2 |
| `fraunces-italic-latin.woff2` | Fraunces | 600 italic | latin | 22.5 KB | OFL-1.1 (`LICENSE-fraunces.txt`) | https://fonts.gstatic.com/s/fraunces/v38/6NVf8FyLNQOQZAnv9ZwNjucMHVn85Ni7emAe9lKqZTnbB-gzTK0K1ChJdt9vIVYX9G37lvd9sPEKsxx664UJf1iVSs7RrU8.woff2 |
| `fraunces-latin-ext.woff2` | Fraunces | 600, 700 | latin-ext | 32.8 KB | OFL-1.1 (`LICENSE-fraunces.txt`) | https://fonts.gstatic.com/s/fraunces/v38/6NUu8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib14c1qv86Rg.woff2 |
| `fraunces-latin.woff2` | Fraunces | 600, 700 | latin | 35.8 KB | OFL-1.1 (`LICENSE-fraunces.txt`) | https://fonts.gstatic.com/s/fraunces/v38/6NUu8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib14c7qv8.woff2 |
| `ibm-plex-mono-latin-ext.woff2` | IBM Plex Mono | 500, 600 | latin-ext | 13.1 KB | OFL-1.1 (`LICENSE-ibm-plex-mono.txt`) | https://fonts.gstatic.com/s/ibmplexmono/v20/-F6qfjptAgt5VM-kVkqdyU8n3twJwl5FgtIU.woff2 |
| `ibm-plex-mono-latin.woff2` | IBM Plex Mono | 500, 600 | latin | 14.5 KB | OFL-1.1 (`LICENSE-ibm-plex-mono.txt`) | https://fonts.gstatic.com/s/ibmplexmono/v20/-F6qfjptAgt5VM-kVkqdyU8n3twJwlBFgg.woff2 |
| `instrument-sans-latin-ext.woff2` | Instrument Sans | 400, 500, 600 | latin-ext | 10.9 KB | OFL-1.1 (`LICENSE-instrument-sans.txt`) | https://fonts.gstatic.com/s/instrumentsans/v4/pxiTypc9vsFDm051Uf6KVwgkfoSxQ0GsQv8ToedPibnr0She1YmV.woff2 |
| `instrument-sans-latin.woff2` | Instrument Sans | 400, 500, 600 | latin | 29.4 KB | OFL-1.1 (`LICENSE-instrument-sans.txt`) | https://fonts.gstatic.com/s/instrumentsans/v4/pxiTypc9vsFDm051Uf6KVwgkfoSxQ0GsQv8ToedPibnr0SZe1Q.woff2 |

## Licences

All families are free to bundle and redistribute. Each licence text sits next to the files.

| Family | Licence | Text | Source |
|---|---|---|---|
| Inter Tight | OFL-1.1 | `LICENSE-inter-tight.txt` | https://github.com/google/fonts/blob/main/ofl/intertight/OFL.txt |
| Permanent Marker | Apache-2.0 | `LICENSE-permanent-marker.txt` | https://github.com/google/fonts/blob/main/apache/permanentmarker/LICENSE.txt |
| JetBrains Mono | OFL-1.1 | `LICENSE-jetbrains-mono.txt` | https://github.com/google/fonts/blob/main/ofl/jetbrainsmono/OFL.txt |
| Caveat | OFL-1.1 | `LICENSE-caveat.txt` | https://github.com/google/fonts/blob/main/ofl/caveat/OFL.txt |
| Anton | OFL-1.1 | `LICENSE-anton.txt` | https://github.com/google/fonts/blob/main/ofl/anton/OFL.txt |
| Fraunces | OFL-1.1 | `LICENSE-fraunces.txt` | https://github.com/google/fonts/blob/main/ofl/fraunces/OFL.txt |
| IBM Plex Mono | OFL-1.1 | `LICENSE-ibm-plex-mono.txt` | https://github.com/google/fonts/blob/main/ofl/ibmplexmono/OFL.txt |
| Instrument Sans | OFL-1.1 | `LICENSE-instrument-sans.txt` | https://github.com/google/fonts/blob/main/ofl/instrumentsans/OFL.txt |

SIL Open Font License 1.1 (OFL-1.1): the fonts may be used, bundled and redistributed,
including commercially, as long as the licence travels with them and the fonts themselves
are not sold on their own. Permanent Marker is under the Apache License 2.0.

Role in the brand profile: Fraunces (headline), Instrument Sans (body), IBM Plex Mono (label),
Caveat (handwritten notes). Inter Tight, Permanent Marker, JetBrains Mono and Anton are the
renderer's other headline fonts (`font`: sans, marker, mono, condensed).

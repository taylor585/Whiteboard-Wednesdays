#!/usr/bin/env python3
"""Build the Whiteboard Wednesdays logo (L1 "Highlighter", chosen by Taylor on 10 November 2026).

Writes public/ww-logo.svg (the header lockup: "Whiteboard" in Instrument Sans Regular above "Wednesdays" in
Instrument Sans Bold, the evidence highlight struck as a skewed marker band behind the lower half of
"Wednesdays", and PLAN · RECORD · POST in IBM Plex Mono) and public/favicon.svg (the small mark: the bold W
on the highlight band, on a white tile so it reads on dark browser tabs).
Every letter is outlined to paths from the bundled fonts, so the files need no font to render. The lockup is
drawn at the size the header shows it (1 unit = 1 CSS pixel from 641px up), with baselines and the band's
edges on whole pixels, so it stays sharp on standard-resolution screens.

Run: python3 -I scripts/build-logo.py      (needs fonttools and uharfbuzz: pip install fonttools uharfbuzz)
"""
import math
import os
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.varLib.instancer import instantiateVariableFont

PUB = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public')
INK, HIGHLIGHT, WHITE, MUTED, LINE = '#1C1A17', '#F6DF8C', '#FFFFFF', '#5C5750', '#DEDBD4'
SANS, MONO = 'ww-sans.ttf', 'ww-mono-medium.ttf'
SKEW = math.tan(math.radians(10))            # the band leans like a marker stroke: skewX(-10deg)


def n(v):
    return ('%.2f' % v).rstrip('0').rstrip('.')


def outline(font_file, text, size, x, y, tracking=0.0, weight=None):
    """Shape text with HarfBuzz (kerning on) and return (svg path data, advance width) at baseline (x, y).
    tracking is in pixels and follows every glyph, as CSS letter-spacing does; the returned width leaves the last one off."""
    path = os.path.join(PUB, font_file)
    tt = TTFont(path)
    if weight is not None:
        tt = instantiateVariableFont(tt, {'wght': weight, 'wdth': 100})
    face = hb.Face(open(path, 'rb').read())
    font = hb.Font(face)
    if weight is not None:
        font.set_variations({'wght': weight, 'wdth': 100})
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, {'kern': True, 'liga': True})
    upem, glyphs, order = tt['head'].unitsPerEm, tt.getGlyphSet(), tt.getGlyphOrder()
    scale, pen, cx = size / upem, SVGPathPen(glyphs, ntos=n), x
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        t = TransformPen(pen, (scale, 0, 0, -scale, cx + pos.x_offset * scale, y - pos.y_offset * scale))
        glyphs[order[info.codepoint]].draw(t)
        cx += pos.x_advance * scale + tracking
    return pen.getCommands(), cx - x - tracking


def band(x0, x1, top, bottom):
    """The highlight as a marker band: a parallelogram whose top edge sits to the right of its bottom edge."""
    lean = (bottom - top) * SKEW
    return f'<path d="M{n(x0)} {n(bottom)}L{n(x0 + lean)} {n(top)}H{n(x1 + lean)}L{n(x1)} {n(bottom)}z" fill="{HIGHLIGHT}"/>'


def lockup():
    # Proportions from the brand board's .l1 rules: both lines at one size with line-height 1 and -0.04em tracking,
    # "Wednesdays" 0.04em lower; the band runs from 0.12em left of the word to 0.16em right of it, 0.48em tall,
    # ending 0.12em under the baseline; the tagline is 0.4em, 0.14em tracked, 1.3 of its own size below.
    F = 22.0                                  # type size, in header pixels
    track = -0.04 * F
    pad = math.ceil(0.12 * F)                 # room for the band's left overhang; library.css pulls the image back by this
    b1 = 17.0                                 # baseline of "Whiteboard" (cap height 0.72em: the caps start 1px down)
    b2 = b1 + round(1.04 * F)                 # baseline of "Wednesdays"
    a, wa = outline(SANS, 'Whiteboard', F, pad, b1, tracking=track, weight=400)
    b, wb = outline(SANS, 'Wednesdays', F, pad, b2, tracking=track, weight=700)
    top, bottom = b2 - round(0.36 * F), b2 + round(0.12 * F)
    x0, x1 = pad - 0.12 * F, pad + wb + track + 0.16 * F
    T = 0.4 * F
    b3 = round(bottom + 1.3 * T - 0.25 * T + 0.698 * T)     # the tagline's cap height is 0.698em
    t, wt = outline(MONO, 'PLAN · RECORD · POST', T, pad + 0.3, b3, tracking=0.14 * T)
    W = math.ceil(max(x1 + (bottom - top) * SKEW, pad + wa, pad + wt) + 1)
    H = int(b3 + 2)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-labelledby="t">'
           f'<title id="t">Whiteboard Wednesdays. Plan, record, post.</title>'
           + band(x0, x1, top, bottom) +
           f'<path d="{a}" fill="{INK}"/><path d="{b}" fill="{INK}"/><path d="{t}" fill="{MUTED}"/></svg>\n')
    open(os.path.join(PUB, 'ww-logo.svg'), 'w').write(svg)
    return W, H, pad


def favicon():
    # The small mark, 16px to 64px: the bold W standing on the highlight band. The white tile and its hairline
    # keep the W readable on a dark browser tab; on white the tile disappears and the W and band stand alone.
    s, size = 48, 37.0
    _, adv = outline(SANS, 'W', size, 0, 0, weight=700)
    base = 36.0
    d, _ = outline(SANS, 'W', size, (s - adv) / 2, base, weight=700)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {s} {s}" width="{s}" height="{s}">'
           f'<title>Whiteboard Wednesdays</title>'
           f'<rect x=".75" y=".75" width="46.5" height="46.5" rx="5" fill="{WHITE}" stroke="{LINE}" stroke-width="1.5"/>'
           + band(4, 40, 24, 40) +
           f'<path d="{d}" fill="{INK}"/></svg>\n')
    open(os.path.join(PUB, 'favicon.svg'), 'w').write(svg)
    return s


if __name__ == '__main__':
    print('ww-logo.svg', lockup())
    print('favicon.svg', favicon())

#!/usr/bin/env python3
"""Build the Whiteboard Wednesdays logo (L3 "Wednesday Tile", brand upgrade of 10 November 2026).

Writes public/ww-logo.svg (the header lockup: tile, serif wordmark, PLAN · RECORD · POST) and
public/favicon.svg (the small cut for 32px and below: a heavier upright W, no letters in the band).
Every letter is outlined to paths from the bundled fonts, so the files need no font to render.

Run: python3 -I scripts/build-logo.py      (needs fonttools and uharfbuzz: pip install fonttools uharfbuzz)
"""
import os
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.varLib.instancer import instantiateVariableFont

PUB = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public')
INK, GOLD, WHITE, MUTED = '#1C1A17', '#8B6002', '#FFFFFF', '#5C5750'
# The serif's hairlines broke up on standard-resolution screens (Taylor, 10 November 2026: "pixelated"), so the
# outlined letters carry a thin same-colour stroke that thickens every hairline evenly.
BOLD = f' stroke="{INK}" stroke-width="0.45" stroke-linejoin="round"'


def outline(font_file, text, size, x, y, tracking=0.0, weight=None):
    """Shape text with HarfBuzz (kerning on) and return (svg path data, advance width) at baseline (x, y)."""
    path = os.path.join(PUB, font_file)
    tt = TTFont(path)
    if weight is not None:
        tt = instantiateVariableFont(tt, {'wght': weight})
    face = hb.Face(open(path, 'rb').read())
    font = hb.Font(face)
    if weight is not None:
        font.set_variations({'wght': weight})
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, {'kern': True, 'liga': True})
    upem, glyphs, order = tt['head'].unitsPerEm, tt.getGlyphSet(), tt.getGlyphOrder()
    scale, pen, cx = size / upem, SVGPathPen(glyphs, ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.')), x
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        t = TransformPen(pen, (scale, 0, 0, -scale, cx + pos.x_offset * scale, y - pos.y_offset * scale))
        glyphs[order[info.codepoint]].draw(t)
        cx += pos.x_advance * scale + tracking
    return pen.getCommands(), cx - x - tracking


def tile(s, w_path):
    """The Wednesday tile on an s x s square: white face, ink outline, gold band, the W."""
    k = s / 48
    r, sw = 5 * k, 2 * k
    return (f'<rect x="{sw/2:.2f}" y="{sw/2:.2f}" width="{s-sw:.2f}" height="{s-sw:.2f}" rx="{r:.2f}" fill="{WHITE}"/>'
            f'<path d="M{sw/2:.2f} {13.5*k:.2f}V{sw/2+r:.2f}a{r:.2f} {r:.2f} 0 0 1 {r:.2f} -{r:.2f}h{s-sw-2*r:.2f}a{r:.2f} {r:.2f} 0 0 1 {r:.2f} {r:.2f}V{13.5*k:.2f}z" fill="{GOLD}"/>'
            f'<rect x="{sw/2:.2f}" y="{sw/2:.2f}" width="{s-sw:.2f}" height="{s-sw:.2f}" rx="{r:.2f}" fill="none" stroke="{INK}" stroke-width="{sw:.2f}"/>'
            f'<path d="M{sw/2:.2f} {13.5*k:.2f}h{s-sw:.2f}" stroke="{INK}" stroke-width="{sw*.75:.2f}"/>' + w_path)


def lockup():
    S = 52                                   # tile and lockup height
    # the tile's W: the wordmark's own italic W, centred under the band
    d, adv = outline('ww-serif-italic.ttf', 'W', 39, 0, 0)
    wx = (S - adv) / 2 - 0.6
    d, _ = outline('ww-serif-italic.ttf', 'W', 39, wx, 45)
    x0 = S + 15
    a, wa = outline('ww-serif.ttf', 'Whiteboard', 35, x0, 29)
    b, wb = outline('ww-serif-italic.ttf', 'Wednesdays', 35, x0 + wa + 8.5, 29)
    t, wt = outline('ww-geist-mono.ttf', 'PLAN · RECORD · POST', 10, x0 + 1, 47.5, tracking=1.7, weight=500)
    W = round(x0 + wa + 8.5 + wb + 2)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {S}" width="{W}" height="{S}" role="img" aria-labelledby="t">'
           f'<title id="t">Whiteboard Wednesdays. Plan, record, post.</title>'
           + tile(S, f'<path d="{d}" fill="{INK}"{BOLD}/>') +
           f'<path d="{a}" fill="{INK}"{BOLD}/><path d="{b}" fill="{INK}"{BOLD}/><path d="{t}" fill="{MUTED}"/></svg>\n')
    open(os.path.join(PUB, 'ww-logo.svg'), 'w').write(svg)
    return W, S


def favicon():
    # 32 and below: an upright W drawn as one heavy shape (no hairlines), no letters in the band.
    w = (f'<path d="M6.2 14.6 L11.3 26 L16 17.2 L20.7 26 L25.8 14.6" fill="none" stroke="{INK}" stroke-width="3.5" stroke-linejoin="miter" stroke-miterlimit="6" stroke-linecap="butt"/>')
    s = 32
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {s} {s}" width="{s}" height="{s}">'
           f'<title>Whiteboard Wednesdays</title>'
           f'<rect x="1" y="1" width="30" height="30" rx="4" fill="{WHITE}"/>'
           f'<path d="M1 10V5a4 4 0 0 1 4 -4h22a4 4 0 0 1 4 4V10z" fill="{GOLD}"/>'
           f'<rect x="1" y="1" width="30" height="30" rx="4" fill="none" stroke="{INK}" stroke-width="2"/>'
           + w + '</svg>\n')
    open(os.path.join(PUB, 'favicon.svg'), 'w').write(svg)


if __name__ == '__main__':
    print('ww-logo.svg', lockup())
    favicon()
    print('favicon.svg 32 x 32')

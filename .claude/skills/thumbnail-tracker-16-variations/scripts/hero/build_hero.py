#!/usr/bin/env python3
"""Build objects-only thumbnails from JSON specs (the standard from 2 Nov 2026).

Usage:
  python3 build_hero.py spec.json [spec2.json ...] <out_dir> [--size 1280x720|1920x1080|1080x1350]

Spec (schemas/hero.schema.json):
{
  "id": "AI-Harnesses-A1-objects-dark",
  "studio": {"preset": "dark-red"}                       # or {"base": "#..", "light": "#..", "at": [74, 46]}
  "extra_css": ";background-color:#FBF8F1",             # optional
  "layers": [                                            # painted in order (first = furthest back)
    {"type": "logo", "logo": "claude.svg", "x": 1135, "y": 160, "size": 230, "finish": "claude-terracotta", "depth": 22, "rot": 8, "floor_shadow": false},
    {"type": "clock", "x": 890, "y": 430, "r": 160, "rot": -9, "finish": "black", "elapsed_h": 2},
    {"type": "text", "text": "2 hours.", "x": 46, "y": 205, "size": 170, "finish": "white-outline", "depth": 14},
    ...
  ],
  "layout_1080x1350": {...}                              # optional: a full spec override for the LinkedIn 4:5 post
}
Layer types: text, logo, clock, gauge, keycap, headset, handset, call_button, ledge, marker, cord,
clapperboard, phone, coin_stack, price_tag, html.
Each layer's other keys are passed straight to the matching kit function (see kit.py for the arguments).

Renders at 2x with scripts/hero/render_hero.cjs (Playwright + Chromium) and saves
<out>/<id>-YouTube-1280x720.jpg (q92). --size 1920x1080 scales the same page by 1.5; --size 1080x1350 uses
layout_1080x1350 if present, else fails with a message.
Prints WARNING lines for: more than 4 words in a text layer; any text or logo layer inside the timestamp corner.
"""
import argparse
import json
import os
import re
import subprocess
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import kit  # noqa: E402
import palettes as P  # noqa: E402

RENDER = os.path.join(HERE, 'render_hero.cjs')
TIMESTAMP = (1150, 660, 1270, 710)   # YouTube's duration badge at 1280x720


def studio_css(spec):
    s = spec.get('studio', {})
    if 'preset' in s:
        base, light, at = P.STUDIO[s['preset']]
    else:
        base, light, at = s['base'], s['light'], tuple(s.get('at', (70, 40)))
    css = kit.studio(base, light, at, floor=s.get('floor'), vignette=s.get('vignette', .55))
    return css + spec.get('extra_css', '')


def layer_html(L, warnings, sid):
    t = L['type']
    a = {k: v for k, v in L.items() if k not in ('type', 'finish', 'logo', 'text', 'preset')}
    if t == 'text':
        words = [w for w in re.split(r'\s+', L['text'].strip()) if w]
        if len(words) > 4:
            warnings.append(f'{sid}: "{L["text"]}" is {len(words)} words; the standard is 4 or fewer')
        box_x, box_y = L['x'], L['y']
        fam = P.TYPE[L.get('finish', 'white-outline')].get('family', 'Anton')
        est_w = L['size'] * len(L['text']) * (.44 if fam == 'Anton' else .62)
        anchor = L.get('anchor', 'start')
        right = box_x + (est_w / 2 if anchor == 'middle' else 0 if anchor == 'end' else est_w)
        if box_y > TIMESTAMP[1] - 10 and right > TIMESTAMP[0]:
            warnings.append(f'{sid}: text "{L["text"]}" may sit under the timestamp corner')
        fin = dict(P.TYPE[L.get('finish', 'white-outline')])
        fin.update({k: v for k, v in a.items() if k not in ('x', 'y', 'size')})
        return kit.type3d(L['text'], L['x'], L['y'], L['size'], **fin)
    if t == 'logo':
        ft, fb, sa, sb = P.LOGO[L.get('finish', 'chrome')]
        x, y, size = a.pop('x'), a.pop('y'), a.pop('size')
        if x + size / 2 > TIMESTAMP[0] and y + size / 2 > TIMESTAMP[1]:
            warnings.append(f'{sid}: logo {L["logo"]} may sit under the timestamp corner')
        return kit.logo3d(L['logo'], x, y, size, ft, fb, sa, sb, **a)
    if t == 'clock':
        fin = dict(P.CLOCK[L.get('finish', 'black')])
        x, y, r = a.pop('x'), a.pop('y'), a.pop('r')
        fin.update(a)
        return kit.alarm_clock(x, y, r, **fin)
    if t == 'gauge':
        return kit.gauge(a.pop('x'), a.pop('y'), a.pop('r'), **a)
    if t == 'keycap':
        x, y, size = a.pop('x'), a.pop('y'), a.pop('size')
        return kit.keycap(x, y, size, L['logo'], a.pop('logo_col', '#1C1A17'), **a)
    if t == 'headset':
        x, y, s = a.pop('x'), a.pop('y'), a.pop('s')
        return kit.headset(x, y, s, logo=L.get('logo'), **a)
    if t == 'handset':
        fin = dict(P.HANDSET[L.get('finish', 'black-gloss')])
        x, y, w = a.pop('x'), a.pop('y'), a.pop('w')
        fin.update(a)
        return kit.handset(x, y, w, **fin)
    if t == 'call_button':
        return kit.call_bubble(a.pop('x'), a.pop('y'), a.pop('d'), **a)
    if t == 'ledge':
        return kit.ledge(a.pop('y'), **a)
    if t == 'marker':
        return kit.marker_highlight(a.pop('x'), a.pop('y'), a.pop('w'), a.pop('h'), **a)
    if t == 'cord':
        return kit.cord(a.pop('x0'), a.pop('y0'), a.pop('x1'), a.pop('y1'), **a)
    if t == 'clapperboard':
        return kit.clapperboard(a.pop('x'), a.pop('y'), a.pop('w'), logo=L.get('logo'), **a)
    if t == 'phone':
        return kit.phone(a.pop('x'), a.pop('y'), a.pop('h'), logo=L.get('logo'), **a)
    if t == 'coin_stack':
        return kit.coin_stack(a.pop('x'), a.pop('y'), a.pop('r'), **a)
    if t == 'price_tag':
        x, y, w = a.pop('x'), a.pop('y'), a.pop('w')
        return kit.price_tag(x, y, w, L['text'], **a)
    if t == 'lightbulb':
        return kit.lightbulb(a.pop('x'), a.pop('y'), a.pop('h'), logo=L.get('logo'), **a)
    if t == 'brain':
        return kit.brain(a.pop('x'), a.pop('y'), a.pop('w'), **a)
    if t == 'speech_bubble':
        x, y, w = a.pop('x'), a.pop('y'), a.pop('w')
        return kit.speech_bubble(x, y, w, text=L.get('text', ''), logo=L.get('logo'), **a)
    if t == 'emoji':
        return kit.emoji(a.pop('x'), a.pop('y'), a.pop('size'), **a)
    if t == 'block3d':
        return kit.block3d(a.pop('x'), a.pop('y'), a.pop('w'), a.pop('h'), **a)
    if t == 'circle_mark':
        return kit.circle_mark(a.pop('x'), a.pop('y'), a.pop('rx'), a.pop('ry'), **a)
    if t == 'arrow_mark':
        return kit.arrow_mark(a.pop('x0'), a.pop('y0'), a.pop('x1'), a.pop('y1'), **a)
    if t == 'dot_grid':
        return kit.dot_grid(**a)
    if t == 'html':
        return L['html']
    raise SystemExit(f'{sid}: unknown layer type "{t}"')


def build_page(spec, warnings):
    body = ''.join(layer_html(L, warnings, spec['id']) for L in spec['layers'])
    return kit.page(body, studio_css(spec))


def render_pages(pages, out, scale=2, size=(1280, 720), suffix='YouTube-1280x720'):
    os.makedirs(out, exist_ok=True)
    pairs = []
    for name, html in pages.items():
        p = os.path.join(out, f'{name}.html')
        open(p, 'w', encoding='utf-8').write(html)
        pairs += [p, os.path.join(out, f'{name}@2x.png')]
    r = subprocess.run(['node', RENDER, '--scale', str(scale)] + pairs, capture_output=True, text=True)
    if r.returncode:
        sys.exit(r.stderr[-2000:] or 'render failed')
    outs = []
    for i in range(1, len(pairs), 2):
        o = pairs[i].replace('@2x.png', f'-{suffix}.jpg')
        Image.open(pairs[i]).convert('RGB').resize(size, Image.LANCZOS).save(o, quality=92)
        os.remove(pairs[i])
        outs.append(o)
    return outs


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('paths', nargs='+', help='spec.json files, then the output directory')
    ap.add_argument('--size', default='1280x720', choices=['1280x720', '1920x1080', '1080x1350'])
    a = ap.parse_args()
    *specs, out = a.paths
    warnings, pages = [], {}
    for sp in specs:
        spec = json.load(open(sp, encoding='utf-8'))
        if a.size == '1080x1350':
            if 'layout_1080x1350' not in spec:
                sys.exit(f'{spec["id"]}: no layout_1080x1350 in the spec; lay the 4:5 version out first')
            spec = dict(spec['layout_1080x1350'], id=spec['id'])
        pages[spec['id']] = build_page(spec, warnings)
    if a.size == '1920x1080':
        outs = render_pages(pages, out, scale=3, size=(1920, 1080), suffix='LinkedIn-video-cover-1920x1080')
    elif a.size == '1080x1350':
        outs = render_pages(pages, out, scale=2, size=(1080, 1350), suffix='LinkedIn-image-post-1080x1350')
    else:
        outs = render_pages(pages, out)
    for w in warnings:
        print('WARNING:', w)
    print('\n'.join(outs))


if __name__ == '__main__':
    main()

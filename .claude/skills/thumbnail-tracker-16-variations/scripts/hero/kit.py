"""Objects-only thumbnail kit (the standard from 2 Nov 2026, `references/design/objects-only-standard.md`).

SVG lighting (bevel + specular), extruded 3D type and logos, lit studio backdrops, and drawn hero objects
(alarm clock, gauge, keycap, headset, handset, call button, ledge, marker highlight, coiled cord).
Everything renders in Chromium through scripts/hero/render_hero.cjs; no external code or models.
Use it through scripts/hero/build_hero.py and a JSON spec (schemas/hero.schema.json); import it directly only for new objects."""
import math
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, '..', '..', 'assets', 'fonts')
LOGOS = os.path.join(HERE, '..', '..', 'assets', 'logos')
_uid = [0]


def uid(p='u'):
    _uid[0] += 1
    return f'{p}{_uid[0]}'


def logo_paths(name):
    t = open(os.path.join(LOGOS, name)).read()
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', t).group(1).split()]
    ds = re.findall(r'<path[^>]*\sd="([^"]+)"', t)
    return vb, ds


def lerp(a, b, t):
    a = [int(a[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return '#' + ''.join(f'{round(x + (y - x) * t):02x}' for x, y in zip(a, b))


# ---------- page ----------

def page(body, bg_css):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:Anton;src:url('{FONTS}/anton-latin.woff2')}}
@font-face{{font-family:Fraunces;src:url('{FONTS}/fraunces-latin.woff2');font-weight:100 900}}
@font-face{{font-family:'Inter Tight';src:url('{FONTS}/inter-tight-latin.woff2');font-weight:100 900}}
@font-face{{font-family:'Permanent Marker';src:url('{FONTS}/permanent-marker-latin.woff2')}}
@font-face{{font-family:Caveat;src:url('{FONTS}/caveat-latin.woff2');font-weight:400 700}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:1280px;height:720px;overflow:hidden;position:relative;{bg_css}}}
.a{{position:absolute}} svg{{overflow:visible}}
</style></head><body>
<svg width="0" height="0" style="position:absolute"><defs>{DEFS}</defs></svg>
{body}
<svg class="a" style="left:0;top:0;pointer-events:none" width="1280" height="720"><rect width="1280" height="720" filter="url(#grain)" opacity=".10"/></svg>
</body></html>"""


DEFS = """
<filter id="gloss" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
  <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="b"/>
  <feDiffuseLighting in="b" surfaceScale="2.6" diffuseConstant="1.0" lighting-color="#fff" result="d"><feDistantLight azimuth="235" elevation="58"/></feDiffuseLighting>
  <feSpecularLighting in="b" surfaceScale="3" specularConstant=".9" specularExponent="40" lighting-color="#fff" result="s"><feDistantLight azimuth="235" elevation="55"/></feSpecularLighting>
  <feComposite in="s" in2="SourceAlpha" operator="in" result="si"/>
  <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="1.05" k2="0" k3="0" k4="0" result="lit"/>
  <feComposite in="lit" in2="SourceAlpha" operator="in" result="lit2"/>
  <feComposite in="lit2" in2="si" operator="arithmetic" k1="0" k2="1" k3=".7" k4="0"/>
</filter>
<filter id="glossSoft" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
  <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="b"/>
  <feSpecularLighting in="b" surfaceScale="4" specularConstant=".8" specularExponent="22" lighting-color="#fff" result="s"><feDistantLight azimuth="235" elevation="55"/></feSpecularLighting>
  <feComposite in="s" in2="SourceAlpha" operator="in" result="si"/>
  <feComposite in="SourceGraphic" in2="si" operator="arithmetic" k1="0" k2="1" k3=".55" k4="0"/>
</filter>
<filter id="rim" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
  <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b"/>
  <feSpecularLighting in="b" surfaceScale="5" specularConstant="1.6" specularExponent="18" lighting-color="#fff" result="s"><feDistantLight azimuth="40" elevation="22"/></feSpecularLighting>
  <feComposite in="s" in2="SourceAlpha" operator="in" result="si"/>
  <feComposite in="SourceGraphic" in2="si" operator="arithmetic" k1="0" k2="1" k3=".9" k4="0"/>
</filter>
<filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
<filter id="blur2"><feGaussianBlur stdDeviation="2.2"/></filter>
<filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
<filter id="marker" x="-5%" y="-20%" width="110%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".035 .6" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="10" xChannelSelector="R" yChannelSelector="G"/></filter>
"""


def studio(base, light, light_xy=(70, 40), floor=None, vignette=.55):
    """Lit backdrop: radial light pool + optional floor horizon + vignette."""
    lx, ly = light_xy
    css = (f"background:radial-gradient(ellipse 55% 65% at {lx}% {ly}%,{light} 0%,{lerp(light, base, .55)} 38%,{base} 78%)")
    if floor:
        css = (f"background:radial-gradient(ellipse 120% 60% at 50% 115%,rgba(0,0,0,{vignette}) 0%,transparent 60%),"
               f"linear-gradient(180deg,transparent 0 {floor}%,rgba(0,0,0,.18) {floor}%,rgba(0,0,0,0) {floor + 14}%),"
               f"radial-gradient(ellipse 55% 65% at {lx}% {ly}%,{light} 0%,{lerp(light, base, .55)} 38%,{base} 78%)")
    return css + f";box-shadow:inset 0 0 220px rgba(0,0,0,{vignette})"


# ---------- 3D extruded type ----------

def type3d(text, x, y, size, top, bottom, side_a, side_b, depth=14, dx=.55, dy=1.0, stroke=None, stroke_w=0,
           family='Anton', weight=400, spacing=1, shadow=.55, upper=True, gloss=True, anchor='start', rim=False, rot=0):
    """Extruded type with a gradient face, bevel lighting and a soft shadow. (x, y) = baseline-left.
    rot tilts the whole line around (x, y) (the `diagonal` layout)."""
    g = uid('g')
    t = text.upper() if upper else text
    ls = f'letter-spacing:{spacing}px;'
    common = f'font-family:{family};font-weight:{weight};font-size:{size}px;{ls}'
    layers = [f'<text x="{x + depth * dx + 10}" y="{y + depth * dy + 22}" style="{common}" text-anchor="{anchor}" fill="#000" opacity="{shadow}" filter="url(#softShadow)">{t}</text>']
    for i in range(depth, 0, -1):
        c = lerp(side_a, side_b, i / depth)
        sw = f' stroke="{c}" stroke-width="{stroke_w}" stroke-linejoin="round"' if stroke else ''
        layers.append(f'<text x="{x + i * dx}" y="{y + i * dy}" style="{common}" text-anchor="{anchor}" fill="{c}"{sw}>{t}</text>')
    if stroke:
        layers.append(f'<text x="{x}" y="{y}" style="{common}" text-anchor="{anchor}" fill="{stroke}" stroke="{stroke}" stroke-width="{stroke_w}" stroke-linejoin="round">{t}</text>')
    filt = ' filter="url(#gloss)"' if gloss else ''
    layers.append(f'<linearGradient id="{g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{top}"/><stop offset="1" stop-color="{bottom}"/></linearGradient>')
    face = f'<text x="{x}" y="{y}" style="{common}" text-anchor="{anchor}" fill="url(#{g})"{filt}>{t}</text>'
    layers.append(f'<g filter="url(#rim)">{face}</g>' if rim else face)
    body = "".join(layers)
    if rot:
        body = f'<g transform="rotate({rot} {x} {y})">{body}</g>'
    return f'<svg class="a" style="left:0;top:0" width="1280" height="720">{body}</svg>'


# ---------- 3D logos ----------

def logo3d(name, cx, cy, size, face_top, face_bottom, side_a, side_b, depth=18, dx=.5, dy=.9, rot=0, glow=None,
           floor_shadow=True, plate=None, rim=False, glow_opacity=.55):
    """A logo as a thick glossy object: extruded sides, gradient face, bevel + specular, contact shadow."""
    vb, ds = logo_paths(name)
    s = size / max(vb[2], vb[3])
    path = ''.join(f'<path d="{d}"/>' for d in ds)
    g = uid('lg')
    tf = f'translate({cx - size / 2},{cy - size / 2}) rotate({rot} {size / 2} {size / 2})'
    step = max(size / 260, 1.0)
    out = []
    if floor_shadow:
        out.append(f'<ellipse cx="{cx + 10}" cy="{cy + size * .56}" rx="{size * .42}" ry="{size * .07}" fill="#000" opacity=".55" filter="url(#softShadow)"/>')
    if glow:
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{size * .62}" fill="{glow}" opacity="{glow_opacity}" filter="url(#softShadow)"/>')
        if glow_opacity > .6:
            out.append(f'<circle cx="{cx}" cy="{cy}" r="{size * .4}" fill="{lerp(glow, '#ffffff', .5)}" opacity=".5" filter="url(#softShadow)"/>')
    inner = []
    if plate:
        r = size * .5
        inner.append(f'<g transform="{tf}">')
        for i in range(depth, 0, -1):
            inner.append(f'<rect x="{i * dx * step - size * .08}" y="{i * dy * step - size * .08}" width="{size * 1.16}" height="{size * 1.16}" rx="{size * .26}" fill="{lerp(plate[2], plate[3], i / depth)}"/>')
        pg = uid('pg')
        inner.append(f'<linearGradient id="{pg}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{plate[0]}"/><stop offset="1" stop-color="{plate[1]}"/></linearGradient>')
        inner.append(f'<rect x="{-size * .08}" y="{-size * .08}" width="{size * 1.16}" height="{size * 1.16}" rx="{size * .26}" fill="url(#{pg})" filter="url(#glossSoft)"/></g>')
        depth = max(depth // 3, 3)
    inner.append(f'<g transform="{tf}">')
    for i in range(depth, 0, -1):
        inner.append(f'<g transform="translate({i * dx * step},{i * dy * step}) scale({s})" fill="{lerp(side_a, side_b, i / depth)}">{path}</g>')
    inner.append(f'<linearGradient id="{g}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="{vb[3]}"><stop offset="0" stop-color="{face_top}"/><stop offset="1" stop-color="{face_bottom}"/></linearGradient>')
    if rim:
        inner.append(f'<g filter="url(#rim)"><g filter="url(#gloss)"><g transform="scale({s})" fill="url(#{g})">{path}</g></g></g></g>')
    else:
        inner.append(f'<g filter="url(#gloss)"><g transform="scale({s})" fill="url(#{g})">{path}</g></g></g>')
    out += inner
    return f'<svg class="a" style="left:0;top:0" width="1280" height="720">{"".join(out)}</svg>'


# ---------- hero objects ----------

def alarm_clock(cx, cy, r, case_top='#2b2b2e', case_bot='#0c0c0e', metal='#d9dde3', elapsed_h=2, face='#fbf8f1',
                wedge='#e3170a', rot=-8, rim=False):
    """A twin-bell alarm clock showing hours elapsed as a red wedge from 12 o'clock."""
    g1, g2, g3, g4 = uid('c'), uid('c'), uid('c'), uid('c')
    ang = elapsed_h * 30
    a0 = -90
    a1 = a0 + ang
    rr = r * .78
    x1 = rr * math.cos(math.radians(a1))
    y1 = rr * math.sin(math.radians(a1))
    large = 1 if ang > 180 else 0
    ticks = []
    for i in range(60):
        a = math.radians(i * 6 - 90)
        L = .12 if i % 5 == 0 else .05
        w = 6 if i % 5 == 0 else 2.2
        ticks.append(f'<line x1="{rr * .98 * math.cos(a):.1f}" y1="{rr * .98 * math.sin(a):.1f}" x2="{rr * (.98 - L) * math.cos(a):.1f}" y2="{rr * (.98 - L) * math.sin(a):.1f}" stroke="#1c1a17" stroke-width="{w}" stroke-linecap="round"/>')

    def hand(deg, length, w, col):
        a = math.radians(deg - 90)
        return (f'<line x1="{-.12 * length * math.cos(a):.1f}" y1="{-.12 * length * math.sin(a):.1f}" '
                f'x2="{length * math.cos(a):.1f}" y2="{length * math.sin(a):.1f}" stroke="{col}" stroke-width="{w}" stroke-linecap="round"/>')
    bell = lambda sx: (f'<g transform="translate({sx * r * .62},{-r * .9}) rotate({sx * 28})">'
                       f'<path d="M{-r * .36},0 a{r * .36},{r * .32} 0 0 1 {r * .72},0 z" fill="url(#{g3})" filter="url(#gloss)"/>'
                       f'<rect x="{-r * .05}" y="{-r * .44}" width="{r * .1}" height="{r * .14}" rx="{r * .03}" fill="{metal}"/></g>')
    return f"""<svg class="a" style="left:0;top:0" width="1280" height="720">
<defs>
 <radialGradient id="{g1}" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="{case_top}"/><stop offset="1" stop-color="{case_bot}"/></radialGradient>
 <radialGradient id="{g2}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="{face}"/><stop offset="1" stop-color="{lerp(face, '#000000', .18)}"/></radialGradient>
 <linearGradient id="{g3}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="{metal}"/><stop offset="1" stop-color="{lerp(metal, '#000000', .55)}"/></linearGradient>
 <linearGradient id="{g4}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".75"/><stop offset=".5" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
</defs>
<ellipse cx="{cx + 14}" cy="{cy + r * 1.22}" rx="{r * 1.0}" ry="{r * .14}" fill="#000" opacity=".6" filter="url(#softShadow)"/>
<g transform="translate({cx},{cy}) rotate({rot})">
 <rect x="{-r * .78}" y="{r * .78}" width="{r * .18}" height="{r * .34}" rx="{r * .06}" transform="rotate(22 {-r * .7} {r * .8})" fill="url(#{g1})"/>
 <rect x="{r * .6}" y="{r * .78}" width="{r * .18}" height="{r * .34}" rx="{r * .06}" transform="rotate(-22 {r * .7} {r * .8})" fill="url(#{g1})"/>
 {bell(-1)}{bell(1)}
 <circle r="{r * 1.06}" fill="url(#{g1})" filter="url(#{'rim' if rim else 'gloss'})"/>
 <circle r="{r * .92}" fill="url(#{g3})" filter="url(#glossSoft)"/>
 <circle r="{r * .84}" fill="url(#{g2})"/>
 <path d="M0,0 L0,{-rr} A{rr},{rr} 0 {large} 1 {x1:.1f},{y1:.1f} Z" fill="{wedge}" opacity=".88"/>
 {''.join(ticks)}
 {hand(ang * 1, rr * .55, r * .075, '#1c1a17')}
 {hand(0, rr * .82, r * .05, '#1c1a17')}
 <circle r="{r * .07}" fill="#1c1a17"/><circle r="{r * .03}" fill="{wedge}"/>
 <ellipse cx="{-r * .2}" cy="{-r * .45}" rx="{r * .62}" ry="{r * .36}" fill="url(#{g4})" opacity=".55"/>
</g></svg>"""


def gauge(cx, cy, r, value=80, ghost=20, dark=False):
    """A speedometer-style gauge: coloured arc, ticks, a ghost needle at `ghost` and a live needle at `value`."""
    gid, mid, cap = uid('gz'), uid('gm'), uid('gc')
    start, sweep = 180, 180

    def pt(v, rad):
        a = math.radians(start + sweep * v / 100)
        return cx + rad * math.cos(a), cy + rad * math.sin(a)
    segs = []
    cols = ['#e3170a', '#f0641a', '#f7a823', '#f5d21a', '#9bd13a', '#2fb84f']
    for i, c in enumerate(cols):
        v0, v1 = i * 100 / len(cols), (i + 1) * 100 / len(cols)
        x0, y0 = pt(v0, r * .8)
        x1, y1 = pt(v1, r * .8)
        segs.append(f'<path d="M{x0:.1f},{y0:.1f} A{r * .8},{r * .8} 0 0 1 {x1:.1f},{y1:.1f}" stroke="{c}" stroke-width="{r * .16}" fill="none"/>')
    ticks = []
    for v in range(0, 101, 10):
        x0, y0 = pt(v, r * .66)
        x1, y1 = pt(v, r * .58 if v % 20 == 0 else .62 * r)
        ticks.append(f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" stroke="{"#e8e8e8" if dark else "#1c1a17"}" stroke-width="{6 if v % 20 == 0 else 3}" stroke-linecap="round"/>')

    def needle(v, col, op, w):
        x, y = pt(v, r * .74)
        a = math.radians(start + sweep * v / 100)
        px, py = -math.sin(a) * w, math.cos(a) * w
        return (f'<path d="M{cx + px:.1f},{cy + py:.1f} L{x:.1f},{y:.1f} L{cx - px:.1f},{cy - py:.1f} Z" fill="{col}" opacity="{op}"/>')
    face = '#15161a' if dark else '#fdfdfb'
    return f"""<svg class="a" style="left:0;top:0" width="1280" height="720">
<defs><radialGradient id="{gid}" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="{lerp(face, '#ffffff', .4)}"/><stop offset="1" stop-color="{lerp(face, '#000000', .12)}"/></radialGradient>
<linearGradient id="{mid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#b9bec6"/><stop offset="1" stop-color="#4c525b"/></linearGradient>
<radialGradient id="{cap}" cx=".35" cy=".3"><stop offset="0" stop-color="#555"/><stop offset="1" stop-color="#0b0b0b"/></radialGradient></defs>
<ellipse cx="{cx + 12}" cy="{cy + r * .2}" rx="{r * 1.05}" ry="{r * .16}" fill="#000" opacity=".35" filter="url(#softShadow)"/>
<path d="M{cx - r * 1.05},{cy + r * .1} A{r * 1.05},{r * 1.05} 0 0 1 {cx + r * 1.05},{cy + r * .1} Z" fill="url(#{mid})" filter="url(#gloss)"/>
<path d="M{cx - r * .96},{cy + r * .06} A{r * .96},{r * .96} 0 0 1 {cx + r * .96},{cy + r * .06} Z" fill="url(#{gid})"/>
{''.join(segs)}{''.join(ticks)}
{needle(ghost, '#8a8f98', .45, r * .035)}
{needle(value, '#111', 1, r * .045)}
<circle cx="{cx}" cy="{cy}" r="{r * .13}" fill="url(#{cap})" filter="url(#glossSoft)"/>
</svg>"""


def keycap(cx, cy, size, logo, logo_col, cap_top='#fbfbf9', cap_bot='#d9d6cf', side='#b9b4aa', rot=0, label=None,
           label_col='#1c1a17', logo_frac=.5):
    """A chunky 3D keycap (skirt + dished top) with a logo printed on it."""
    t, b, sk = uid('k'), uid('k'), uid('k')
    vb, ds = logo_paths(logo)
    ls = size * logo_frac
    sc = ls / max(vb[2], vb[3])
    path = ''.join(f'<path d="{d}"/>' for d in ds)
    lab = (f'<text x="{size / 2}" y="{size * .86}" text-anchor="middle" style="font-family:Fraunces;font-weight:800;font-size:{size * .15}px" fill="{label_col}">{label}</text>'
           if label else '')
    ly = size * (.14 if label else .25)
    return f"""<svg class="a" style="left:0;top:0" width="1280" height="720"><defs>
<linearGradient id="{t}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{cap_top}"/><stop offset="1" stop-color="{cap_bot}"/></linearGradient>
<linearGradient id="{sk}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{side}"/><stop offset="1" stop-color="{lerp(side, '#000000', .35)}"/></linearGradient></defs>
<ellipse cx="{cx + 8}" cy="{cy + size * .62}" rx="{size * .62}" ry="{size * .1}" fill="#000" opacity=".45" filter="url(#softShadow)"/>
<g transform="translate({cx - size / 2},{cy - size / 2}) rotate({rot} {size / 2} {size / 2})">
 <path d="M{-size * .06},{size * .1} Q{-size * .08},{size * 1.12} {size * .1},{size * 1.12} L{size * .9},{size * 1.12} Q{size * 1.08},{size * 1.12} {size * 1.06},{size * .1} Z" fill="url(#{sk})"/>
 <rect x="{-size * .06}" y="{-size * .02}" width="{size * 1.12}" height="{size * 1.04}" rx="{size * .2}" fill="url(#{sk})"/>
 <rect x="0" y="0" width="{size}" height="{size * .92}" rx="{size * .17}" fill="url(#{t})" filter="url(#glossSoft)"/>
 <rect x="{size * .06}" y="{size * .05}" width="{size * .88}" height="{size * .8}" rx="{size * .14}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>
 <g transform="translate({(size - ls) / 2},{ly}) scale({sc})" fill="{logo_col}">{path}</g>{lab}
</g></svg>"""


def headset(cx, cy, s, body='#16171b', pad='#2a2c33', accent='#e3170a', logo=None, rot=-10):
    """An over-ear call-centre headset with a boom mic, nobody wearing it."""
    g1, g2 = uid('h'), uid('h')
    lg = ''
    if logo:
        vb, ds = logo_paths(logo)
        ls = s * .2
        sc = ls / max(vb[2], vb[3])
        path = ''.join(f'<path d="{d}"/>' for d in ds)
        lg = f'<g transform="translate({s * .53 - ls / 2},{s * .52 - ls / 2}) scale({sc})" fill="#ffffff" opacity=".92">{path}</g>'
    return f"""<svg class="a" style="left:0;top:0" width="1280" height="720"><defs>
<linearGradient id="{g1}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{lerp(body, '#ffffff', .35)}"/><stop offset=".5" stop-color="{body}"/><stop offset="1" stop-color="#000"/></linearGradient>
<radialGradient id="{g2}" cx=".35" cy=".3"><stop offset="0" stop-color="{lerp(pad, '#ffffff', .25)}"/><stop offset="1" stop-color="{pad}"/></radialGradient></defs>
<ellipse cx="{cx + 10}" cy="{cy + s * .48}" rx="{s * .48}" ry="{s * .07}" fill="#000" opacity=".5" filter="url(#softShadow)"/>
<g transform="translate({cx - s / 2},{cy - s / 2}) rotate({rot} {s / 2} {s / 2})">
 <path d="M{s * .14},{s * .52} C{s * .1},{s * .02} {s * .9},{s * .02} {s * .86},{s * .52}" fill="none" stroke="url(#{g1})" stroke-width="{s * .075}" stroke-linecap="round" filter="url(#gloss)"/>
 <path d="M{s * .14},{s * .52} C{s * .1},{s * .02} {s * .9},{s * .02} {s * .86},{s * .52}" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="{s * .012}" transform="translate(-4,-6)"/>
 <rect x="{s * .02}" y="{s * .4}" width="{s * .22}" height="{s * .3}" rx="{s * .1}" fill="url(#{g2})" filter="url(#gloss)"/>
 <rect x="{s * .76}" y="{s * .4}" width="{s * .22}" height="{s * .3}" rx="{s * .1}" fill="url(#{g2})" filter="url(#gloss)"/>
 <rect x="{s * .08}" y="{s * .43}" width="{s * .14}" height="{s * .24}" rx="{s * .07}" fill="url(#{g1})" filter="url(#glossSoft)"/>
 <path d="M{s * .13},{s * .66} C{s * .16},{s * .9} {s * .36},{s * .96} {s * .52},{s * .9}" fill="none" stroke="url(#{g1})" stroke-width="{s * .028}" stroke-linecap="round"/>
 <rect x="{s * .48}" y="{s * .85}" width="{s * .13}" height="{s * .09}" rx="{s * .045}" fill="{accent}" filter="url(#gloss)"/>
 <g transform="translate({s * .3},{-s * .02})">{lg}</g>
</g></svg>"""


HANDSET = ('M18,4 C8,4 2,12 3,24 L6,32 C7,35 10,36 13,35 L24,31 C27,30 28,27 27,24 L24,16 C23,13 25,11 28,12 '
           'L72,12 C75,11 77,13 76,16 L73,24 C72,27 73,30 76,31 L87,35 C90,36 93,35 94,32 L97,24 C98,12 92,4 82,4 Z')


def handset(cx, cy, w, top='#2a2a2e', bot='#050506', side_a='#000000', side_b='#1a1a1d', rot=-12, depth=16):
    """A classic telephone handset, extruded and glossy."""
    g = uid('hs')
    sc = w / 100
    lay = [f'<ellipse cx="{cx + 10}" cy="{cy + w * .3}" rx="{w * .46}" ry="{w * .06}" fill="#000" opacity=".5" filter="url(#softShadow)"/>',
           f'<g transform="translate({cx - w / 2},{cy - w * .2}) rotate({rot} {w / 2} {w * .2})">']
    for i in range(depth, 0, -1):
        lay.append(f'<path transform="translate({i * .5},{i * .9}) scale({sc})" d="{HANDSET}" fill="{lerp(side_a, side_b, i / depth)}"/>')
    lay.append(f'<linearGradient id="{g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{top}"/><stop offset="1" stop-color="{bot}"/></linearGradient>')
    lay.append(f'<path transform="scale({sc})" d="{HANDSET}" fill="url(#{g})" filter="url(#gloss)"/></g>')
    return f'<svg class="a" style="left:0;top:0" width="1280" height="720">{"".join(lay)}</svg>'


def call_bubble(cx, cy, d, col='#21c35a', blur=0, rot=0):
    """A glossy round 'incoming call' button (green disc + white handset glyph)."""
    g = uid('cb')
    sc = d * .56 / 100
    f = f' filter="url(#blur{blur})"' if blur else ''
    return f"""<svg class="a" style="left:0;top:0" width="1280" height="720"><defs>
<radialGradient id="{g}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="{lerp(col, '#ffffff', .45)}"/><stop offset=".6" stop-color="{col}"/><stop offset="1" stop-color="{lerp(col, '#000000', .45)}"/></radialGradient></defs>
<g{f}><circle cx="{cx}" cy="{cy}" r="{d / 2}" fill="url(#{g})" filter="url(#gloss)"/>
<g transform="translate({cx},{cy}) rotate({135 + rot}) translate({-d * .28},{-d * .1}) scale({sc})"><path d="{HANDSET}" fill="#fff"/></g></g></svg>"""


def ledge(y, x0=0, x1=1280, top='#eceae4', front='#b7b2a8'):
    """The whiteboard tray: a lit aluminium ledge in slight perspective."""
    g1, g2 = uid('l'), uid('l')
    return f"""<svg class="a" style="left:0;top:0" width="1280" height="720"><defs>
<linearGradient id="{g1}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="{top}"/></linearGradient>
<linearGradient id="{g2}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{front}"/><stop offset="1" stop-color="{lerp(front, '#000000', .35)}"/></linearGradient></defs>
<rect x="{x0}" y="{y - 6}" width="{x1 - x0}" height="40" fill="#000" opacity=".22" filter="url(#softShadow)"/>
<path d="M{x0},{y} L{x1},{y} L{x1 - 18},{y + 30} L{x0 + 18},{y + 30} Z" fill="url(#{g1})"/>
<rect x="{x0}" y="{y + 30}" width="{x1 - x0}" height="60" fill="url(#{g2})"/>
<rect x="{x0}" y="{y + 30}" width="{x1 - x0}" height="3" fill="#fff" opacity=".7"/></svg>"""


def marker_highlight(x, y, w, h, col='#F6DF8C', op=.92):
    """A hand-drawn highlighter stroke (ragged edges, multiply)."""
    return (f'<svg class="a" style="left:0;top:0;mix-blend-mode:multiply" width="1280" height="720">'
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="{col}" opacity="{op}" filter="url(#marker)" transform="rotate(-1.2 {x} {y})"/></svg>')


def cord(x0, y0, x1, y1, col='#1C1A17', loops=14, width=7):
    """A coiled telephone cord from (x0, y0) to (x1, y1)."""
    pts = []
    for i in range(loops * 12 + 1):
        u = i / (loops * 12)
        x = x0 + (x1 - x0) * u + 16 * math.sin(u * loops * 2 * math.pi)
        y = y0 + (y1 - y0) * u + 6 * math.cos(u * loops * 2 * math.pi)
        pts.append(f'{x:.1f},{y:.1f}')
    return (f'<svg class="a" style="left:0;top:0" width="1280" height="720"><polyline points="{" ".join(pts)}" fill="none" '
            f'stroke="{col}" stroke-width="{width}" stroke-linecap="round" filter="url(#glossSoft)"/></svg>')


def _logo_g(logo, size, col, x, y):
    vb, ds = logo_paths(logo)
    sc = size / max(vb[2], vb[3])
    return f'<g transform="translate({x},{y}) scale({sc})" fill="{col}">{"".join(f"<path d=\"{d}\"/>" for d in ds)}</g>'


def clapperboard(cx, cy, w, rot=-8, open_deg=-18, logo=None, logo_col='#ffffff', stripe='#ffffff', body='#141416'):
    """A film clapperboard (motion, planning a shoot): striped hinged arm, black slate, optional logo on the slate."""
    g1, g2 = uid('cl'), uid('cl')
    h = w * .78
    arm = w * .2
    stripes = ''.join(
        f'<path d="M{i * w / 6:.1f},0 L{i * w / 6 + w / 12:.1f},0 L{i * w / 6 + w / 12 - arm * .55:.1f},{arm} L{i * w / 6 - arm * .55:.1f},{arm} Z" fill="{stripe}"/>'
        for i in range(7))
    lg = _logo_g(logo, h * .42, logo_col, w * .5 - h * .21, arm * 1.25 + h * .2) if logo else ''
    lines = ''.join(f'<rect x="{w * .07}" y="{arm * 1.25 + h * (.12 + .2 * k)}" width="{w * .2}" height="{h * .025}" rx="2" fill="#fff" opacity=".35"/>' for k in range(3))
    return f"""<svg class="a" style="left:0;top:0" width="1280" height="720"><defs>
<linearGradient id="{g1}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{lerp(body, '#ffffff', .18)}"/><stop offset="1" stop-color="{body}"/></linearGradient>
<clipPath id="{g2}"><rect x="0" y="0" width="{w}" height="{arm}" rx="6"/></clipPath></defs>
<ellipse cx="{cx + 12}" cy="{cy + h * .62}" rx="{w * .55}" ry="{w * .07}" fill="#000" opacity=".5" filter="url(#softShadow)"/>
<g transform="translate({cx - w / 2},{cy - h / 2}) rotate({rot} {w / 2} {h / 2})">
 <rect x="8" y="{arm * 1.25 + 14}" width="{w}" height="{h}" rx="14" fill="#000" opacity=".9"/>
 <rect x="0" y="{arm * 1.25}" width="{w}" height="{h}" rx="14" fill="url(#{g1})" filter="url(#gloss)"/>
 <g transform="translate(0,{arm * 1.25 + 4})"><rect x="0" y="0" width="{w}" height="{arm}" rx="6" fill="{body}"/><g clip-path="url(#{g2})">{stripes}</g></g>
 <g transform="rotate({open_deg} 0 {arm})"><rect x="0" y="0" width="{w}" height="{arm}" rx="6" fill="{body}" filter="url(#gloss)"/><g clip-path="url(#{g2})">{stripes}</g></g>
 <circle cx="{arm * .5}" cy="{arm * 1.1}" r="{arm * .22}" fill="#bfc4cc" filter="url(#glossSoft)"/>
 {lines}{lg}
</g></svg>"""


def phone(cx, cy, h, rot=-6, screen='#0f1115', logo=None, logo_col='#ffffff', progress=.62, accent='#F6DF8C'):
    """A glossy phone playing a video: play button, scrubber, optional logo on screen."""
    g1, g2 = uid('ph'), uid('ph')
    w = h * .5
    r = w * .16
    lg = _logo_g(logo, w * .34, logo_col, w * .33, h * .2) if logo else ''
    return f"""<svg class="a" style="left:0;top:0" width="1280" height="720"><defs>
<linearGradient id="{g1}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b5f66"/><stop offset=".5" stop-color="#1b1d21"/><stop offset="1" stop-color="#000"/></linearGradient>
<linearGradient id="{g2}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".22"/><stop offset=".45" stop-color="#ffffff" stop-opacity="0"/></linearGradient></defs>
<ellipse cx="{cx + 12}" cy="{cy + h * .52}" rx="{w * .6}" ry="{w * .1}" fill="#000" opacity=".5" filter="url(#softShadow)"/>
<g transform="translate({cx - w / 2},{cy - h / 2}) rotate({rot} {w / 2} {h / 2})">
 <rect x="10" y="14" width="{w}" height="{h}" rx="{r}" fill="#000" opacity=".85"/>
 <rect x="0" y="0" width="{w}" height="{h}" rx="{r}" fill="url(#{g1})" filter="url(#gloss)"/>
 <rect x="{w * .05}" y="{w * .05}" width="{w * .9}" height="{h - w * .1}" rx="{r * .8}" fill="{screen}"/>
 {lg}
 <circle cx="{w / 2}" cy="{h * .62}" r="{w * .16}" fill="#ffffff" opacity=".95" filter="url(#glossSoft)"/>
 <path d="M{w / 2 - w * .05},{h * .62 - w * .08} L{w / 2 + w * .08},{h * .62} L{w / 2 - w * .05},{h * .62 + w * .08} Z" fill="{screen}"/>
 <rect x="{w * .14}" y="{h * .82}" width="{w * .72}" height="{w * .03}" rx="3" fill="#ffffff" opacity=".3"/>
 <rect x="{w * .14}" y="{h * .82}" width="{w * .72 * progress}" height="{w * .03}" rx="3" fill="{accent}"/>
 <circle cx="{w * .14 + w * .72 * progress}" cy="{h * .82 + w * .015}" r="{w * .04}" fill="{accent}"/>
 <rect x="{w * .38}" y="{w * .075}" width="{w * .24}" height="{w * .05}" rx="{w * .025}" fill="#000"/>
 <rect x="0" y="0" width="{w}" height="{h}" rx="{r}" fill="url(#{g2})"/>
</g></svg>"""


def coin_stack(cx, cy, r, n=6, symbol='£', face='#ffe07a', edge='#b07a00', rot=0, tilt=.32):
    """A stack of gold coins (money, price), the top coin showing the currency symbol."""
    g1, g2 = uid('co'), uid('co')
    ry = r * tilt
    t = r * .2
    out = [f'<ellipse cx="{cx + 10}" cy="{cy + ry + 10}" rx="{r * 1.15}" ry="{ry * 1.1}" fill="#000" opacity=".45" filter="url(#softShadow)"/>',
           f'<defs><linearGradient id="{g1}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{lerp(edge, "#000000", .35)}"/><stop offset=".35" stop-color="{lerp(face, edge, .3)}"/><stop offset=".6" stop-color="{edge}"/><stop offset="1" stop-color="{lerp(edge, "#000000", .45)}"/></linearGradient>'
           f'<radialGradient id="{g2}" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fff6c8"/><stop offset=".55" stop-color="{face}"/><stop offset="1" stop-color="{edge}"/></radialGradient></defs>',
           f'<g transform="rotate({rot} {cx} {cy})">']
    for i in range(n):
        y = cy - i * t
        out.append(f'<path d="M{cx - r},{y} A{r},{ry} 0 0 0 {cx + r},{y} L{cx + r},{y - t} A{r},{ry} 0 0 1 {cx - r},{y - t} Z" fill="url(#{g1})"/>')
        out.append(f'<path d="M{cx - r},{y} A{r},{ry} 0 0 0 {cx + r},{y}" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="2.5"/>')
        out.append(f'<path d="M{cx - r},{y - t + 2} A{r},{ry} 0 0 0 {cx + r},{y - t + 2}" fill="none" stroke="#fff6c8" stroke-opacity=".55" stroke-width="2"/>')
        for k in range(18):
            xx = cx - r + (k + .5) * 2 * r / 18
            out.append(f'<line x1="{xx:.1f}" y1="{y - t * .1:.1f}" x2="{xx:.1f}" y2="{y - t * .9:.1f}" stroke="#000" stroke-opacity=".18" stroke-width="2"/>')
    top = cy - n * t
    out.append(f'<ellipse cx="{cx}" cy="{top}" rx="{r}" ry="{ry}" fill="url(#{g2})" filter="url(#gloss)"/>')
    out.append(f'<ellipse cx="{cx}" cy="{top}" rx="{r * .82}" ry="{ry * .82}" fill="none" stroke="{edge}" stroke-opacity=".6" stroke-width="3"/>')
    out.append(f'<g transform="translate({cx},{top}) scale(1,{tilt * 1.6})"><text x="0" y="{r * .3}" text-anchor="middle" '
               f'style="font-family:Anton;font-size:{r * .9}px" fill="{edge}" opacity=".9">{symbol}</text></g>')
    out.append('</g>')
    return f'<svg class="a" style="left:0;top:0" width="1280" height="720">{"".join(out)}</svg>'


def price_tag(cx, cy, w, text, rot=-14, face='#fff36b', edge='#b07a00', ink='#1a1100', string='#3a2a10'):
    """A 3D shop price tag with a string loop and the price printed on it."""
    g1 = uid('pt')
    h = w * .52
    shape = f'M{h * .45},0 L{w},0 L{w},{h} L{h * .45},{h} L0,{h / 2} Z'
    d = 14
    lay = [f'<ellipse cx="{cx + 14}" cy="{cy + h * .9}" rx="{w * .5}" ry="{w * .06}" fill="#000" opacity=".45" filter="url(#softShadow)"/>',
           f'<defs><linearGradient id="{g1}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{lerp(face, "#ffffff", .35)}"/><stop offset="1" stop-color="{face}"/></linearGradient></defs>',
           f'<g transform="translate({cx - w / 2},{cy - h / 2}) rotate({rot} {w / 2} {h / 2})">',
           f'<path d="M{h * .3},{h / 2} C{-w * .25},{-h * .4} {-w * .35},{h * .2} {-w * .5},{-h * .6}" fill="none" stroke="{string}" stroke-width="6" stroke-linecap="round"/>']
    for i in range(d, 0, -1):
        lay.append(f'<path transform="translate({i * .35},{i})" d="{shape}" fill="{lerp(edge, "#000000", .1 + .4 * i / d)}"/>')
    lay.append(f'<path d="{shape}" fill="url(#{g1})" filter="url(#gloss)"/>')
    lay.append(f'<circle cx="{h * .3}" cy="{h / 2}" r="{h * .09}" fill="{lerp(edge, "#000000", .4)}"/>')
    lay.append(f'<text x="{h * .45 + (w - h * .45) / 2}" y="{h * .68}" text-anchor="middle" style="font-family:Anton;font-size:{h * .5}px" fill="{ink}">{text}</text></g>')
    return f'<svg class="a" style="left:0;top:0" width="1280" height="720">{"".join(lay)}</svg>'



# ---------- 3.3: variety objects and marks ----------

def _filament(w, h):
    """A coiled tungsten filament on two support wires."""
    coil = f'M{w * .4:.1f},{h * .46:.1f} ' + ' '.join(
        f'Q{w * (.4 + .025 * (2 * k + 1)):.1f},{h * (.4 if k % 2 == 0 else .52):.1f} {w * (.4 + .05 * (k + 1)):.1f},{h * .46:.1f}' for k in range(4))
    return (f'<path d="M{w * .4},{h * .74} L{w * .4},{h * .46} M{w * .6},{h * .74} L{w * .6},{h * .46}" stroke="#8a8f98" stroke-width="{h * .012}" fill="none"/>'
            f'<path d="{coil}" fill="none" stroke="#ff9a1a" stroke-width="{h * .016}" stroke-linecap="round"/>'
            f'<path d="{coil}" fill="none" stroke="#fff6c8" stroke-width="{h * .006}" stroke-linecap="round" opacity=".9"/>')


def lightbulb(cx, cy, h, glow='#ffd84a', logo=None, logo_col='#D97757', rot=0, lit=True):
    """A glowing glass light bulb (an idea, thinking). Optional logo as the filament."""
    g1, g2, g3 = uid('lb'), uid('lb'), uid('lb')
    w = h * .62
    lg = _logo_g(logo, w * .42, logo_col, w * .29, h * .2) if logo else _filament(w, h)
    halo = (f'<circle cx="{cx}" cy="{cy - h * .14}" r="{h * .62}" fill="{glow}" opacity=".55" filter="url(#softShadow)"/>'
            f'<circle cx="{cx}" cy="{cy - h * .14}" r="{h * .36}" fill="#fffbe6" opacity=".6" filter="url(#softShadow)"/>') if lit else ''
    return f"""<svg class="a" style="left:0;top:0" width="1280" height="720"><defs>
<radialGradient id="{g1}" cx=".42" cy=".35" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="{'#fff3b0' if lit else '#e9edf2'}"/><stop offset="1" stop-color="{glow if lit else '#a9b2bd'}" stop-opacity=".9"/></radialGradient>
<linearGradient id="{g2}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6b6f76"/><stop offset=".35" stop-color="#e9ecef"/><stop offset=".6" stop-color="#9aa0a8"/><stop offset="1" stop-color="#3a3e44"/></linearGradient>
<linearGradient id="{g3}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
{halo}
<ellipse cx="{cx + 10}" cy="{cy + h * .55}" rx="{w * .45}" ry="{w * .08}" fill="#000" opacity=".4" filter="url(#softShadow)"/>
<g transform="translate({cx - w / 2},{cy - h / 2}) rotate({rot} {w / 2} {h / 2})">
 <path d="M{w * .5},0 C{w * 1.05},0 {w * 1.08},{h * .52} {w * .76},{h * .66} L{w * .72},{h * .74} L{w * .28},{h * .74} L{w * .24},{h * .66} C{-w * .08},{h * .52} {-w * .05},0 {w * .5},0 Z" fill="url(#{g1})" filter="url(#glossSoft)"/>
 {lg}
 <path d="M{w * .5},{h * .03} C{w * .2},{h * .04} {w * .1},{h * .22} {w * .14},{h * .36}" fill="none" stroke="url(#{g3})" stroke-width="{h * .04}" stroke-linecap="round"/>
 <rect x="{w * .27}" y="{h * .74}" width="{w * .46}" height="{h * .2}" rx="{h * .03}" fill="url(#{g2})" filter="url(#glossSoft)"/>
 {''.join(f'<rect x="{w * .27}" y="{h * (.78 + .045 * k)}" width="{w * .46}" height="{h * .012}" fill="#000" opacity=".3"/>' for k in range(3))}
 <path d="M{w * .38},{h * .94} L{w * .62},{h * .94} L{w * .55},{h} L{w * .45},{h} Z" fill="#2a2d33"/>
</g></svg>"""


def brain(cx, cy, w, top='#ff9ec4', bot='#d9467f', rot=0, glow=None):
    """A glossy cartoon brain (thinking), side view with folds."""
    g1 = uid('br')
    h = w * .72
    folds = [
        'M.18,.42 C.22,.3 .34,.28 .38,.36', 'M.3,.2 C.38,.14 .5,.16 .52,.26', 'M.56,.18 C.66,.12 .78,.18 .78,.3',
        'M.66,.36 C.76,.32 .88,.4 .86,.5', 'M.42,.42 C.5,.36 .6,.42 .58,.52', 'M.2,.6 C.28,.52 .4,.56 .4,.64',
        'M.5,.62 C.58,.56 .7,.6 .72,.68', 'M.12,.5 C.1,.44 .14,.38 .2,.36', 'M.8,.62 C.86,.6 .9,.56 .9,.5']
    def sc(path):
        out = []
        for tok in path.replace(',', ' ').split():
            if tok[0].isalpha():
                out.append(tok)
            else:
                out.append(tok)
        nums, res, i = [], [], 0
        parts = path.replace('M', ' M ').replace('C', ' C ').split()
        flag = 0
        for ptk in parts:
            if ptk in ('M', 'C'):
                res.append(ptk)
                continue
            x, y = ptk.split(',')
            res.append(f'{float(x) * w:.1f},{float(y) * h:.1f}')
        return ' '.join(res)
    lobes = (f'M{w * .5},{h * .06} C{w * .7},{-h * .02} {w * .98},{h * .12} {w * .97},{h * .42} C{w * 1.02},{h * .66} {w * .86},{h * .84} {w * .66},{h * .8} '
             f'C{w * .6},{h * .9} {w * .48},{h * .92} {w * .42},{h * .84} C{w * .22},{h * .9} {w * .02},{h * .76} {w * .04},{h * .52} '
             f'C{-w * .02},{h * .3} {w * .12},{h * .08} {w * .3},{h * .1} C{w * .36},{h * .04} {w * .44},{h * .04} {w * .5},{h * .06} Z')
    stem = f'M{w * .5},{h * .78} C{w * .52},{h * .9} {w * .56},{h * .98} {w * .6},{h * 1.04} L{w * .7},{h * 1.0} C{w * .66},{h * .92} {w * .64},{h * .84} {w * .64},{h * .76} Z'
    halo = f'<circle cx="{cx}" cy="{cy}" r="{w * .6}" fill="{glow}" opacity=".5" filter="url(#softShadow)"/>' if glow else ''
    return f"""<svg class="a" style="left:0;top:0" width="1280" height="720"><defs>
<linearGradient id="{g1}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{top}"/><stop offset="1" stop-color="{bot}"/></linearGradient></defs>
{halo}<ellipse cx="{cx + 12}" cy="{cy + h * .62}" rx="{w * .45}" ry="{w * .06}" fill="#000" opacity=".45" filter="url(#softShadow)"/>
<g transform="translate({cx - w / 2},{cy - h / 2}) rotate({rot} {w / 2} {h / 2})">
 <path d="{stem}" fill="{lerp(bot, '#000000', .2)}" filter="url(#gloss)"/>
 <path d="{lobes}" transform="translate(8,14)" fill="{lerp(bot, '#000000', .45)}"/>
 <path d="{lobes}" fill="url(#{g1})" filter="url(#gloss)"/>
 {''.join(f'<path d="{sc(f)}" fill="none" stroke="{lerp(bot, "#000000", .3)}" stroke-width="{w * .022}" stroke-linecap="round" opacity=".85"/>' for f in folds)}
 <path d="M{w * .5},{h * .1} C{w * .48},{h * .3} {w * .52},{h * .5} {w * .46},{h * .7}" fill="none" stroke="{lerp(bot, '#000000', .35)}" stroke-width="{w * .02}" stroke-linecap="round"/>
</g></svg>"""


def speech_bubble(cx, cy, w, text='', top='#ffffff', bot='#e6e8ec', ink='#111111', font='Anton', size=None, logo=None,
                  logo_col='#D97757', tail='left', rot=0, depth=12):
    """A chunky 3D speech bubble, optionally with words (counted as words on the image) or a logo inside."""
    g1 = uid('sb')
    h = w * .56
    tx = w * .18 if tail == 'left' else w * .82
    shape = (f'M{w * .12},0 L{w * .88},0 Q{w},0 {w},{h * .16} L{w},{h * .74} Q{w},{h * .9} {w * .88},{h * .9} '
             f'L{tx + w * .08},{h * .9} L{tx - w * .02 if tail == "left" else tx + w * .02},{h * 1.18} L{tx - w * .06},{h * .9} '
             f'L{w * .12},{h * .9} Q0,{h * .9} 0,{h * .74} L0,{h * .16} Q0,0 {w * .12},0 Z')
    lay = [f'<ellipse cx="{cx + 12}" cy="{cy + h * .75}" rx="{w * .45}" ry="{w * .05}" fill="#000" opacity=".35" filter="url(#softShadow)"/>',
           f'<defs><linearGradient id="{g1}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{top}"/><stop offset="1" stop-color="{bot}"/></linearGradient></defs>',
           f'<g transform="translate({cx - w / 2},{cy - h / 2}) rotate({rot} {w / 2} {h / 2})">']
    for i in range(depth, 0, -1):
        lay.append(f'<path transform="translate({i * .35},{i})" d="{shape}" fill="{lerp(bot, "#000000", .25 + .35 * i / depth)}"/>')
    lay.append(f'<path d="{shape}" fill="url(#{g1})" filter="url(#glossSoft)"/>')
    if logo:
        lay.append(_logo_g(logo, h * .55, logo_col, w / 2 - h * .275, h * .17))
    if text:
        fs = size or h * .42
        lay.append(f'<text x="{w / 2}" y="{h * .45 + fs * .36}" text-anchor="middle" style="font-family:\'{font}\';font-weight:900;font-size:{fs}px;letter-spacing:1px" fill="{ink}">{text}</text>')
    lay.append('</g>')
    return f'<svg class="a" style="left:0;top:0" width="1280" height="720">{"".join(lay)}</svg>'


def emoji(cx, cy, size, char='🤯', rot=0, shadow=True):
    """A colour emoji as a sticker: a white die-cut border, a soft shadow, slight tilt (Noto Color Emoji)."""
    sh = 'filter:drop-shadow(0 10px 12px rgba(0,0,0,.35))' if shadow else ''
    return (f'<div class="a" style="left:{cx - size / 2}px;top:{cy - size / 2}px;width:{size}px;height:{size}px;'
            f'font-size:{size * .82}px;line-height:{size}px;text-align:center;transform:rotate({rot}deg);'
            f'font-family:\'Noto Color Emoji\',sans-serif;{sh};-webkit-text-stroke:0">'
            f'<span style="display:inline-block;filter:drop-shadow(0 0 0 #fff) drop-shadow(4px 0 0 #fff) drop-shadow(-4px 0 0 #fff) drop-shadow(0 4px 0 #fff) drop-shadow(0 -4px 0 #fff)">{char}</span></div>')


def block3d(x, y, w, h, top='#ff4d3d', bot='#c4120a', side='#5c0400', depth=14, rot=-2):
    """A 3D colour block to sit behind one word (Cole Gordon's red box, with depth and gloss)."""
    g = uid('bk')
    lay = [f'<rect x="{x + depth * .5 + 10}" y="{y + depth + 20}" width="{w}" height="{h}" rx="10" fill="#000" opacity=".45" filter="url(#softShadow)"/>',
           f'<defs><linearGradient id="{g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{top}"/><stop offset="1" stop-color="{bot}"/></linearGradient></defs>',
           f'<g transform="rotate({rot} {x + w / 2} {y + h / 2})">']
    for i in range(depth, 0, -1):
        lay.append(f'<rect x="{x + i * .35}" y="{y + i}" width="{w}" height="{h}" rx="10" fill="{lerp(side, "#000000", .4 * i / depth)}"/>')
    lay.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="url(#{g})" filter="url(#glossSoft)"/></g>')
    return f'<svg class="a" style="left:0;top:0" width="1280" height="720">{"".join(lay)}</svg>'


def circle_mark(cx, cy, rx, ry, col='#e3170a', width=10, rot=-6):
    """A hand-drawn marker circle around a word or object (overshoots its start, like a real pen)."""
    pts = []
    for i in range(0, 380, 6):
        a = math.radians(i)
        wob = 1 + .04 * math.sin(i * .05) + (.06 if i > 340 else 0)
        pts.append(f'{cx + rx * wob * math.cos(a):.1f},{cy + ry * wob * math.sin(a):.1f}')
    return (f'<svg class="a" style="left:0;top:0" width="1280" height="720"><polyline points="{" ".join(pts)}" fill="none" '
            f'stroke="{col}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round" transform="rotate({rot} {cx} {cy})" filter="url(#marker)"/></svg>')


def arrow_mark(x0, y0, x1, y1, col='#e3170a', width=10, bend=.25, label=None, label_size=56, font='Caveat'):
    """A hand-drawn curved arrow from (x0, y0) to (x1, y1), with an optional handwritten note at its tail."""
    mx, my = (x0 + x1) / 2, (y0 + y1) / 2
    dx, dy = x1 - x0, y1 - y0
    cx, cy = mx - dy * bend, my + dx * bend
    ang = math.atan2(y1 - cy, x1 - cx)
    L = width * 3.6
    hx1, hy1 = x1 - L * math.cos(ang - .5), y1 - L * math.sin(ang - .5)
    hx2, hy2 = x1 - L * math.cos(ang + .5), y1 - L * math.sin(ang + .5)
    lab = (f'<text x="{x0}" y="{y0 - 14}" text-anchor="middle" style="font-family:{font};font-weight:700;font-size:{label_size}px" fill="{col}">{label}</text>'
           if label else '')
    return (f'<svg class="a" style="left:0;top:0" width="1280" height="720"><g filter="url(#marker)" stroke="{col}" stroke-width="{width}" fill="none" stroke-linecap="round" stroke-linejoin="round">'
            f'<path d="M{x0},{y0} Q{cx:.1f},{cy:.1f} {x1},{y1}"/><path d="M{hx1:.1f},{hy1:.1f} L{x1},{y1} L{hx2:.1f},{hy2:.1f}"/></g>{lab}</svg>')


def dot_grid(col='#1C1A17', op=.13, step=34):
    """A dot-grid paper texture over the whole frame (use on light grounds)."""
    p = uid('dg')
    return (f'<svg class="a" style="left:0;top:0" width="1280" height="720"><defs><pattern id="{p}" width="{step}" height="{step}" patternUnits="userSpaceOnUse">'
            f'<circle cx="{step / 2}" cy="{step / 2}" r="2.2" fill="{col}" opacity="{op}"/></pattern></defs><rect width="1280" height="720" fill="url(#{p})"/></svg>')

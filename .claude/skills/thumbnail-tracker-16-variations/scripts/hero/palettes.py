"""Named finishes for the objects-only standard. A spec says `"finish": "gold"` instead of six hex values.

type finishes feed kit.type3d(); logo finishes feed kit.logo3d(). The names come from the six approved thumbnails
(examples/objects-only-2026-11/): see references/design/objects-only-standard.md for where each is used.
"""

TYPE = {
    # bold set (Anton, caps, extruded)
    'white-outline': dict(top='#ffffff', bottom='#d7d7d7', side_a='#2b2b2b', side_b='#000000', stroke='#000', stroke_w=12, dx=.35, dy=1),
    'red-outline': dict(top='#ff5a45', bottom='#c90f05', side_a='#5c0400', side_b='#1a0100', stroke='#000', stroke_w=12, dx=.35, dy=1),
    'gold': dict(top='#fff36b', bottom='#f5b400', side_a='#8a5200', side_b='#2a1700', dx=.35, dy=1),
    'gold-outline': dict(top='#fff36b', bottom='#f5b400', side_a='#8a5200', side_b='#2a1700', dx=.35, dy=1, stroke='#1a1100', stroke_w=10),
    'black-sans': dict(top='#1a1a1a', bottom='#000000', side_a='#5a4500', side_b='#2a2000', dx=.35, dy=1, family='Inter Tight',
                       weight=900, spacing=-2, shadow=.35),
    'white-sans': dict(top='#ffffff', bottom='#e6e6e6', side_a='#2b2b2b', side_b='#000000', dx=.35, dy=1, family='Inter Tight',
                       weight=900, spacing=-2, stroke='#000', stroke_w=10),
    'purple-glow': dict(top='#f3e8ff', bottom='#c79bff', side_a='#3b1d6e', side_b='#0e0520', stroke='#0e0520', stroke_w=10, dx=.35, dy=1),
    'green-outline': dict(top='#b6ff7a', bottom='#2fd15a', side_a='#0b4a1c', side_b='#021a08', stroke='#000', stroke_w=12, dx=.35, dy=1),
    'marker-red': dict(top='#e3170a', bottom='#e3170a', side_a='#e3170a', side_b='#e3170a', depth=1, family='Permanent Marker',
                       upper=False, gloss=False, shadow=.15),
    'charcoal': dict(top='#2c2c2c', bottom='#050505', side_a='#9a9a9a', side_b='#5e5e5e', dx=.35, dy=1, shadow=.3),
    # on-brand set (Fraunces Black, shallow extrusion, no gloss)
    'ink-serif': dict(top='#2a2826', bottom='#0e0d0c', side_a='#bdb6a8', side_b='#cfc9bc', depth=4, dx=.6, dy=.9, family='Fraunces',
                      weight=900, spacing=-3, upper=False, gloss=False, shadow=.18),
    'red-serif': dict(top='#B3261E', bottom='#B3261E', side_a='#bdb6a8', side_b='#cfc9bc', depth=4, dx=.6, dy=.9, family='Fraunces',
                      weight=900, spacing=-3, upper=False, gloss=False, shadow=.18),
}

LOGO = {
    # (face_top, face_bottom, side_a, side_b)
    'claude-terracotta': ('#f39a74', '#c4532c', '#5e220f', '#250c04'),
    'chrome': ('#ffffff', '#8f96a1', '#3a3f47', '#0b0d10'),
    'grok-black-chrome': ('#6b7484', '#0b0d12', '#000000', '#1d212a'),
    'grok-graphite': ('#3a3f48', '#050608', '#000000', '#1d212a'),
}

STUDIO = {
    # base, light, light position (%)
    'dark-red': ('#0e0807', '#7a2412', (74, 46)),
    'dark-blue': ('#04060b', '#17345f', (72, 42)),
    'warm-white': ('#d9d3c6', '#ffffff', (62, 38)),
    'cool-grey': ('#b9bfc9', '#ffffff', (70, 30)),
    'cream-board': ('#efe9dc', '#ffffff', (40, 30)),
    # 3.3 variety grounds
    'brand-yellow': ('#e9b800', '#ffe36e', (55, 35)),
    'dark-purple': ('#08050f', '#3b1d6e', (50, 40)),
    'dark-green': ('#030a06', '#0f4a2a', (68, 42)),
    'hot-orange': ('#c2410c', '#ffb36b', (60, 35)),
    'paper-grid': ('#e9e6df', '#ffffff', (50, 40)),
    'sky': ('#7fb4ff', '#eaf4ff', (50, 20)),
}

CLOCK = {
    'black': dict(),
    'brass': dict(case_top='#f0d58a', case_bot='#8B6002', metal='#f7e9c2'),
}

HANDSET = {
    'ink': dict(top='#3a3631', bot='#1C1A17', side_a='#0c0b0a', side_b='#2e2a25'),
    'black-gloss': dict(),
}

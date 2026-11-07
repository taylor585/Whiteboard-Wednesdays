#!/usr/bin/env python3
"""Variety check for a round of objects-only specs (3.3; 16-variation rounds from 4.0).

Usage:
  python3 variety_check.py round/*.json [--history past/*.json] [--strict]

Each spec carries a "look" block: {"layout", "ground", "font", "accent", "hero", "emoji"} and a "words" string.
The limits scale with the round size n (8 layouts, 11 grounds):
FAIL  - a layout, ground or hero used more than ceil(n / 8) times (once each in a round of up to 8; twice in a 16);
      - the same layout AND ground pair twice;
      - fewer than 3 fonts or 3 accents in a round of 4+ (4 of each in a round of 12+);
      - every thumbnail has emoji, or none does, in a round of 5+; in a round of 12+, emoji on 20-50%;
      - fewer than 4 different lines (`words`) in a round of 12+;
      - a spec has no "look" block.
WARN  - a thumbnail repeats the layout AND ground of anything in --history (your last published specs);
      - the round has no wildcard (every layout is words-left or on-brand-ledge).
Exit 1 on any FAIL (with --strict, on any WARN too).
"""
import argparse
import json
import sys
from collections import Counter

CORE = {'words-left', 'on-brand-ledge'}
LAYOUTS = ['words-left', 'centre-hero', 'hero-dominant', 'words-on-object', 'versus', 'stacked-centre', 'diagonal', 'on-brand-ledge']
GROUNDS = ['dark-red', 'dark-blue', 'dark-purple', 'dark-green', 'warm-white', 'cool-grey', 'cream-board', 'brand-yellow',
           'hot-orange', 'paper-grid', 'sky']


def check(specs, history=()):
    fails, warns = [], []
    looks = []
    for s in specs:
        lk = s.get('look')
        if not lk:
            fails.append(f'{s["id"]}: no "look" block (layout, ground, font, accent, hero, emoji)')
            continue
        looks.append((s['id'], lk))
    import math
    n = len(looks)
    cap = max(1, math.ceil(n / 8))
    for key in ('layout', 'ground', 'hero'):
        c = Counter(lk.get(key) for _, lk in looks)
        for v, k in c.items():
            if k > cap:
                ids = [i for i, lk in looks if lk.get(key) == v]
                fails.append(f'{key} "{v}" is used {k} times ({", ".join(ids)}); the most for a round of {n} is {cap}')
    pairs = Counter((lk.get('layout'), lk.get('ground')) for _, lk in looks)
    for (lay, gr), k in pairs.items():
        if k > 1:
            fails.append(f'layout "{lay}" on ground "{gr}" is used {k} times; each layout + ground pair once')
    if n >= 4:
        need = 4 if n >= 12 else 3
        for key in ('font', 'accent'):
            k = len({lk.get(key) for _, lk in looks})
            if k < need:
                fails.append(f'only {k} different {key}s in the round; use at least {need}')
    if n >= 5:
        e = sum(bool(lk.get('emoji')) for _, lk in looks)
        if e in (0, n):
            fails.append('emoji on all thumbnails or on none; mix them (some with, some without)')
        elif n >= 12 and not (.2 <= e / n <= .5):
            fails.append(f'emoji on {e} of {n}; keep it between 20% and 50%')
    if n >= 12:
        lines = {s.get('words', '').strip().upper() for s in specs if s.get('look')}
        if len(lines) < 4:
            fails.append(f'only {len(lines)} different lines across {n} thumbnails; use at least 4 so the choice includes words, not just looks')
    past = {(h.get('look', {}).get('layout'), h.get('look', {}).get('ground')) for h in history}
    for i, lk in looks:
        if (lk.get('layout'), lk.get('ground')) in past:
            warns.append(f'{i}: same layout and ground as a recent published thumbnail ({lk.get("layout")}, {lk.get("ground")})')
    if looks and all(lk.get('layout') in CORE for _, lk in looks):
        warns.append('no wildcard: every thumbnail uses a core layout; add one centre-hero, versus, words-on-object, stacked-centre, hero-dominant or diagonal')
    return fails, warns


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('specs', nargs='+')
    ap.add_argument('--history', nargs='*', default=[])
    ap.add_argument('--strict', action='store_true')
    a = ap.parse_args(argv)
    load = lambda p: json.load(open(p, encoding='utf-8'))
    specs, hist = [load(p) for p in a.specs], [load(p) for p in a.history]
    fails, warns = check(specs, hist)
    rows = []
    for s in specs:
        lk = s.get('look', {})
        rows.append(f"  {s['id']:34} {lk.get('layout', '-'):16} {lk.get('ground', '-'):13} {lk.get('font', '-'):12} "
                    f"{lk.get('accent', '-'):16} {lk.get('hero', '-'):18} {'emoji' if lk.get('emoji') else ''}")
    print(f"  {'id':34} {'layout':16} {'ground':13} {'font':12} {'accent':16} {'hero':18}")
    print('\n'.join(rows))
    for f in fails:
        print('FAIL:', f)
    for w in warns:
        print('WARN:', w)
    print(f'{len(fails)} FAIL, {len(warns)} WARN')
    sys.exit(1 if fails or (a.strict and warns) else 0)


if __name__ == '__main__':
    main()

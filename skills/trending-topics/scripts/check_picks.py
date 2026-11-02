#!/usr/bin/env python3
"""The gate every pick sheet must pass before it is delivered.

Usage:
  python3 check_picks.py <pick-sheet.md> [--register video-plans/topic-register.json]
                         [--scrub <file of words, one per line>]

Checks:
  1. "**Locked in:**" line present; every locked or planned title in the register appears on the
     sheet word for word.
  2. "## Table One: Your own work" then "## Table Two: Ideas from creators", in that order.
  3. Table One: at least 1 row; every row has a score n/50 with 0 <= n <= 50.
  4. Table Two: at least 1 row; every row has a score and a YouTube URL.
  5. "**Our work researched:**" states a number of sessions; "**Creators researched:**" is present.
  6. Nothing from the scrub list (client names, private details) appears anywhere. Keep the scrub
     file in the scratchpad: it holds confidential names and must never be committed.
  7. Ends with "Pick from either table".
Prints BLOCKING lines and exits 1 on any failure.
"""
import argparse
import json
import os
import re
import sys

T1 = '## Table One: Your own work'
T2 = '## Table Two: Ideas from creators'
ROW = re.compile(r'^\|\s*([AC]\d+)\s*\|(.*)\|\s*$')
SCORE = re.compile(r'\*?\*?(\d{1,2})/50')
YT = re.compile(r'https://(www\.)?youtube\.com/watch\?v=[\w-]+|https://youtu\.be/[\w-]+')


def section(text, start, end=None):
    i = text.find(start)
    if i < 0:
        return None
    j = text.find(end, i) if end else -1
    k = text.find('\n## ', i + len(start))
    stop = j if j > i else (k if k > i else len(text))
    return text[i:stop]


def rows(block):
    return [m for m in (ROW.match(line) for line in block.splitlines()) if m]


def check(text, locked_titles=(), scrub=()):
    errs = []
    if '**Locked in:**' not in text:
        errs.append('missing "**Locked in:**" line (write "none" if nothing is locked)')
    for t in locked_titles:
        if t not in text:
            errs.append(f'locked title missing or changed: "{t}" (keep it word for word)')
    i1, i2 = text.find(T1), text.find(T2)
    if i1 < 0:
        errs.append(f'missing heading "{T1}"')
    if i2 < 0:
        errs.append(f'missing heading "{T2}"')
    if i1 >= 0 and i2 >= 0 and i2 < i1:
        errs.append('Table One must come before Table Two')
    for name, head, prefix, need_url in (('Table One', T1, 'A', False), ('Table Two', T2, 'C', True)):
        block = section(text, head)
        if block is None:
            continue
        rs = [m for m in rows(block) if m.group(1).startswith(prefix)]
        if not rs:
            errs.append(f'{name} has no rows ({prefix}1, {prefix}2...)')
        for m in rs:
            sc = SCORE.findall(m.group(2))
            if not sc or not 0 <= int(sc[-1]) <= 50:
                errs.append(f'{name} row {m.group(1)} has no score out of 50')
            if need_url and not YT.search(m.group(2)):
                errs.append(f'{name} row {m.group(1)} has no YouTube URL for its creator evidence')
    m = re.search(r'\*\*Our work researched:\*\*[\s\S]{0,300}?\d+ Claude Code sessions', text)
    if not m:
        errs.append('missing "**Our work researched:**" with "[n] Claude Code sessions"')
    if '**Creators researched:**' not in text:
        errs.append('missing "**Creators researched:**" line')
    low = text.lower()
    for w in scrub:
        if w and w.lower() in low:
            errs.append(f'confidential word on the sheet: "{w}"')
    if not text.rstrip().endswith("Pick from either table and I'll plan the week."):
        errs.append('must end with "Pick from either table and I\'ll plan the week."')
    return errs


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('sheet')
    ap.add_argument('--register', default=os.path.join('video-plans', 'topic-register.json'))
    ap.add_argument('--scrub', default=None)
    a = ap.parse_args(argv)
    text = open(a.sheet, encoding='utf-8').read()
    locked = []
    if os.path.exists(a.register):
        reg = json.load(open(a.register, encoding='utf-8'))
        locked = [t['title'] for t in reg.get('topics', []) if t.get('status') in ('locked', 'planned')]
    scrub = []
    if a.scrub:
        scrub = [w.strip() for w in open(a.scrub, encoding='utf-8') if w.strip() and not w.startswith('#')]
    errs = check(text, locked, scrub)
    for e in errs:
        print(f'BLOCKING  {e}')
    if errs:
        print(f'FAIL  {a.sheet}: {len(errs)} problem(s). Fix them and re-run.')
        return 1
    n1 = len([m for m in rows(section(text, T1) or '') if m.group(1).startswith('A')])
    n2 = len([m for m in rows(section(text, T2) or '') if m.group(1).startswith('C')])
    print(f'PASS  {a.sheet}: {len(locked)} locked, Table One {n1} rows, Table Two {n2} rows. Deliver it.')
    return 0


if __name__ == '__main__':
    sys.exit(main())

#!/usr/bin/env python3
"""The gate every pick sheet must pass before it is delivered.

Usage:
  python3 check_picks.py <pick-sheet.md> [--register video-plans/topic-register.json]
                         [--scrub <file of words, one per line>]

Checks (v5, three engines):
  1. "**Locked in:**" line present; every locked or planned title in the register appears on the
     sheet word for word.
  2. "## This week: 7 videos" with at least 7 day rows (Mon to Sun), each naming its engine row
     (T1, A2, C3...) or "locked".
  3. "## 1. Twitter engine", "## 2. My work engine", "## 3. YouTube engine", in that order.
  4. Every engine row has a score n/50 with 0 <= n <= 50. Twitter rows carry a source link
     (an x.com post or the giant's own page); YouTube rows carry a YouTube URL.
  5. "**Giants researched:**", "**Our work researched:**" (with "[n] Claude Code sessions") and
     "**Creators researched:**" are present.
  6. Nothing from the scrub list (client names, private details) appears anywhere. Keep the scrub
     file in the scratchpad: it holds confidential names and must never be committed.
  7. Ends with "Swap any of the 7 and I'll write the briefs."
Prints BLOCKING lines and exits 1 on any failure.
"""
import argparse
import json
import os
import re
import sys

WEEK = '## This week: 7 videos'
ENGINES = (('Twitter engine', '## 1. Twitter engine', 'T'),
           ('My work engine', '## 2. My work engine', 'A'),
           ('YouTube engine', '## 3. YouTube engine', 'C'))
END = "Swap any of the 7 and I'll write the briefs."
ROW = re.compile(r'^\|\s*([TAC]\d+)\s*\|(.*)\|\s*$')
DAY = re.compile(r'^\|\s*\**(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\**\b[^|]*\|(.*)\|\s*$', re.I)
LINK = re.compile(r'https?://\S+')
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
    wk = section(text, WEEK)
    if wk is None:
        errs.append(f'missing heading "{WEEK}"')
    else:
        days = [m for m in (DAY.match(l) for l in wk.splitlines()) if m]
        if len(days) < 7:
            errs.append(f'"{WEEK}" has {len(days)} day rows; it needs at least 7 (one per day)')
        for m in days:
            if not re.search(r'\b[TAC]\d+\b|locked', m.group(2), re.I):
                errs.append(f'week row "{m.group(1)}" does not name its engine row (T1, A2, C3) or "locked"')
    pos = []
    for name, head, prefix in ENGINES:
        i = text.find(head)
        if i < 0:
            errs.append(f'missing heading "{head}"')
            continue
        pos.append(i)
        rs = [m for m in rows(section(text, head)) if m.group(1).startswith(prefix)]
        if not rs:
            errs.append(f'{name} has no rows ({prefix}1, {prefix}2...)')
        for m in rs:
            sc = SCORE.findall(m.group(2))
            if not sc or not 0 <= int(sc[-1]) <= 50:
                errs.append(f'{name} row {m.group(1)} has no score out of 50')
            if prefix == 'T' and not LINK.search(m.group(2)):
                errs.append(f'{name} row {m.group(1)} has no link to the giant\'s post')
            if prefix == 'C' and not YT.search(m.group(2)):
                errs.append(f'{name} row {m.group(1)} has no YouTube URL for its creator evidence')
    if pos != sorted(pos):
        errs.append('engines must be in order: 1. Twitter engine, 2. My work engine, 3. YouTube engine')
    if '**Giants researched:**' not in text:
        errs.append('missing "**Giants researched:**" line')
    m = re.search(r'\*\*Our work researched:\*\*[\s\S]{0,300}?\d+ Claude Code sessions', text)
    if not m:
        errs.append('missing "**Our work researched:**" with "[n] Claude Code sessions"')
    if '**Creators researched:**' not in text:
        errs.append('missing "**Creators researched:**" line')
    low = text.lower()
    for w in scrub:
        if w and w.lower() in low:
            errs.append(f'confidential word on the sheet: "{w}"')
    if not text.rstrip().endswith(END):
        errs.append(f'must end with "{END}"')
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
    n = [len([m for m in rows(section(text, h) or '') if m.group(1).startswith(p)]) for _, h, p in ENGINES]
    print(f'PASS  {a.sheet}: {len(locked)} locked, 7-day plan, Twitter {n[0]}, My work {n[1]}, '
          f'YouTube {n[2]} rows. Deliver it.')
    return 0


if __name__ == '__main__':
    sys.exit(main())

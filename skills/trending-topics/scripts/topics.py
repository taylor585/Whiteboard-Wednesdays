#!/usr/bin/env python3
"""The topic register: every title Taylor locks, and what happened to it.

Usage (options go after the command):
  python3 topics.py lock "Exact Title" [--week 2026-W43] [--note "..."] [--register <file>]
  python3 topics.py status "Exact Title" planned|recorded|published|dropped [--note "..."]
  python3 topics.py rename "Working Title" "Final Title"     (keeps the topic's history)
  python3 topics.py list [--status locked,planned]
  python3 topics.py recent [--weeks 4]

Default register: video-plans/topic-register.json in the current directory (where Taylor can open
it; never commit it, the repo is public).

Why it exists:
- Locked titles are kept word for word and shown above both pick tables every run.
- Pick drops a topic only when it was planned, recorded or published in the last 4 weeks. Being
  on an earlier pick sheet is never a reason (the W43 lesson). `recent` prints exactly that list.

Titles are matched case-insensitively with spacing normalised, but stored exactly as given.
Exit code 0 on success, 1 on a usage error (unknown title, bad status).
"""
import argparse
import datetime as dt
import json
import os
import re
import sys

STATUSES = ['locked', 'planned', 'recorded', 'published', 'dropped']
BLOCKS_REPEAT = {'planned', 'recorded', 'published'}


def norm(title):
    return re.sub(r'\s+', ' ', title).strip().lower()


def iso_week(day):
    y, w, _ = day.isocalendar()
    return f'{y}-W{w:02d}'


def load(path):
    if not os.path.exists(path):
        return {'topics': []}
    with open(path, encoding='utf-8') as fh:
        return json.load(fh)


def save(path, reg):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(reg, fh, indent=2, ensure_ascii=False)
        fh.write('\n')


def find(reg, title):
    for t in reg['topics']:
        if norm(t['title']) == norm(title):
            return t
    return None


def lock(reg, title, week, note, today):
    t = find(reg, title)
    if t is None:
        t = {'title': title, 'week': week or iso_week(today), 'history': []}
        reg['topics'].append(t)
    t['status'] = 'locked'
    t['history'].append({'status': 'locked', 'date': today.isoformat(), 'note': note or ''})
    return t


def set_status(reg, title, status, note, today):
    if status not in STATUSES:
        raise ValueError(f'unknown status {status!r}; use one of {", ".join(STATUSES)}')
    t = find(reg, title)
    if t is None:
        raise KeyError(f'no topic titled {title!r}; lock it first')
    t['status'] = status
    t['history'].append({'status': status, 'date': today.isoformat(), 'note': note or ''})
    return t


def rename(reg, old, new, today):
    t = find(reg, old)
    if t is None:
        raise KeyError(f'no topic titled {old!r}')
    if find(reg, new) is not None and norm(new) != norm(old):
        raise ValueError(f'a topic titled {new!r} already exists')
    t['history'].append({'status': t['status'], 'date': today.isoformat(), 'note': f'renamed from: {t["title"]}'})
    t['title'] = new
    return t


def last_date(t, statuses):
    dates = [h['date'] for h in t['history'] if h['status'] in statuses]
    return dt.date.fromisoformat(max(dates)) if dates else None


def recent(reg, weeks, today):
    """Topics planned, recorded or published within `weeks`: the only ones Pick may leave out."""
    cutoff = today - dt.timedelta(weeks=weeks)
    out = []
    for t in reg['topics']:
        d = last_date(t, BLOCKS_REPEAT)
        if d and d >= cutoff and t['status'] != 'dropped':
            out.append(t)
    return out


def locked(reg):
    return [t for t in reg['topics'] if t['status'] in ('locked', 'planned')]


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument('--register', default=os.path.join('video-plans', 'topic-register.json'))
    common.add_argument('--today', default=None, help='YYYY-MM-DD (tests and back-dating)')
    sub = ap.add_subparsers(dest='cmd', required=True)
    p = sub.add_parser('lock', parents=[common]); p.add_argument('title'); p.add_argument('--week'); p.add_argument('--note')
    p = sub.add_parser('status', parents=[common]); p.add_argument('title'); p.add_argument('status'); p.add_argument('--note')
    p = sub.add_parser('rename', parents=[common]); p.add_argument('old'); p.add_argument('new')
    p = sub.add_parser('list', parents=[common]); p.add_argument('--status', default=None)
    p = sub.add_parser('recent', parents=[common]); p.add_argument('--weeks', type=int, default=4)
    a = ap.parse_args(argv)
    today = dt.date.fromisoformat(a.today) if a.today else dt.date.today()
    reg = load(a.register)
    try:
        if a.cmd == 'lock':
            t = lock(reg, a.title, a.week, a.note, today)
            save(a.register, reg)
            print(f'LOCKED  {t["title"]}  ({t["week"]})')
        elif a.cmd == 'status':
            t = set_status(reg, a.title, a.status, a.note, today)
            save(a.register, reg)
            print(f'{a.status.upper():9} {t["title"]}')
        elif a.cmd == 'rename':
            t = rename(reg, a.old, a.new, today)
            save(a.register, reg)
            print(f'RENAMED   {t["title"]}')
        elif a.cmd == 'list':
            want = set(a.status.split(',')) if a.status else None
            for t in reg['topics']:
                if want and t['status'] not in want:
                    continue
                print(f'{t["status"]:9} {t["week"]}  {t["title"]}')
        elif a.cmd == 'recent':
            for t in recent(reg, a.weeks, today):
                print(f'{t["status"]:9} {t["week"]}  {t["title"]}')
    except (KeyError, ValueError) as e:
        print(f'ERROR: {e}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())

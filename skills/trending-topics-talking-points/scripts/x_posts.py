#!/usr/bin/env python3
"""The Twitter engine's post table: last 10 posts per giant, dated from X status IDs.

Usage:
  python3 x_posts.py date <x status URL or ID>...
  python3 x_posts.py build <batch.json>... --giants references/giants.json --out <dir> [--today YYYY-MM-DD]

An X status ID holds the time the post was made (snowflake: (id >> 22) + 1288834974657 ms, UTC),
so dates come from the ID, not from search-result labels, which are often wrong.

build reads the posts the research agents found (a JSON list per batch; fields: giant, handle,
url, source, date, text, kind, engagement, about), drops duplicates, dates every post, keeps the
10 newest per giant and writes:
  posts.json  every kept post with its date and age in days
  posts.md    one table per giant (newest first), then coverage: posts found per giant, newest
              date, and FRESH (posts in the last 7 days) / RECENT (8 to 30) / OLD counts
A giant with no posts is listed as "nothing found", never dropped silently.
"""
import argparse
import datetime as dt
import json
import os
import re
import sys

EPOCH_MS = 1288834974657
STATUS = re.compile(r'(?:x|twitter)\.com/([A-Za-z0-9_]+)/status(?:es)?/(\d{15,20})')


def id_to_date(status_id):
    ms = (int(status_id) >> 22) + EPOCH_MS
    return dt.datetime.fromtimestamp(ms / 1000, dt.timezone.utc)


def parse(ref):
    """Return (handle, id) from a status URL, or (None, id) from a bare ID, or (None, None)."""
    m = STATUS.search(ref or '')
    if m:
        return m.group(1), m.group(2)
    if re.fullmatch(r'\d{15,20}', (ref or '').strip()):
        return None, ref.strip()
    return None, None


def date_of(post):
    _, sid = parse(post.get('url', ''))
    if sid:
        return id_to_date(sid).date(), 'id'
    if post.get('date'):
        try:
            return dt.date.fromisoformat(post['date'][:10]), 'stated'
        except ValueError:
            pass
    return None, 'none'


def band(age):
    if age is None:
        return 'UNDATED'
    if age <= 7:
        return 'FRESH'
    if age <= 30:
        return 'RECENT'
    return 'OLD'


def build(posts, giants, today, per_giant=10):
    seen, by = set(), {}
    canon = {g['name'].lower(): g['name'] for grp in ('ai', 'paid_media') for g in giants.get(grp, [])}
    for p in posts:
        p = dict(p, giant=canon.get((p.get('giant') or '?').lower(), p.get('giant') or '?'))
        key = parse(p.get('url', ''))[1] or (p.get('url') or '') + (p.get('text') or '')[:60]
        if key in seen:
            continue
        seen.add(key)
        d, how = date_of(p)
        q = dict(p)
        q['date'] = d.isoformat() if d else None
        q['dated_by'] = how
        q['age_days'] = (today - d).days if d else None
        q['band'] = band(q['age_days'])
        by.setdefault(p.get('giant', '?'), []).append(q)
    for g in by:
        by[g].sort(key=lambda q: q['date'] or '0000', reverse=True)
        by[g] = by[g][:per_giant]
    order = [(grp, g['name']) for grp in ('ai', 'paid_media') for g in giants.get(grp, [])]
    for g in by:
        if g not in [n for _, n in order]:
            order.append(('other', g))
    return by, order


def md(by, order, today):
    out = [f'# Twitter engine: last 10 posts per giant ({today.isoformat()})', '',
           'Dates come from each X post ID (UTC) where there is one. FRESH = last 7 days, '
           'RECENT = 8 to 30 days, OLD = older.', '', '## Coverage', '',
           '| Group | Giant | Posts | Newest | Fresh | Recent | Old |', '|---|---|---|---|---|---|---|']
    for grp, name in order:
        ps = by.get(name, [])
        c = {b: sum(1 for p in ps if p['band'] == b) for b in ('FRESH', 'RECENT', 'OLD')}
        newest = next((p['date'] for p in ps if p['date']), None)
        out.append(f'| {grp} | {name} | {len(ps) or "nothing found"} | {newest or "-"} | '
                   f'{c["FRESH"]} | {c["RECENT"]} | {c["OLD"]} |')
    for grp, name in order:
        ps = by.get(name, [])
        if not ps:
            continue
        out += ['', f'## {name}', '', '| Date | Band | Source | Post | Engagement | Link |',
                '|---|---|---|---|---|---|']
        for p in ps:
            text = (p.get('text') or '').replace('|', '/').replace('\n', ' ')
            if p.get('kind') == 'paraphrase':
                text = f'(paraphrase) {text}'
            out.append(f'| {p["date"] or "unknown"} | {p["band"]} | {p.get("source") or "?"} | {text} | '
                       f'{p.get("engagement") or "not shown"} | {p.get("url") or "-"} |')
    return '\n'.join(out) + '\n'


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    sub = ap.add_subparsers(dest='cmd', required=True)
    d = sub.add_parser('date')
    d.add_argument('refs', nargs='+')
    b = sub.add_parser('build')
    b.add_argument('batches', nargs='+')
    b.add_argument('--giants', required=True)
    b.add_argument('--out', required=True)
    b.add_argument('--today', default=None)
    a = ap.parse_args(argv)
    if a.cmd == 'date':
        for r in a.refs:
            h, sid = parse(r)
            print(f'{r}  ->  {id_to_date(sid).strftime("%Y-%m-%d %H:%M UTC") if sid else "no status ID"}')
        return 0
    today = dt.date.fromisoformat(a.today) if a.today else dt.date.today()
    posts = []
    for f in a.batches:
        try:
            data = json.load(open(f, encoding='utf-8'))
        except (OSError, ValueError) as e:
            print(f'WARN  {f}: {e} (skipped)')
            continue
        posts += data if isinstance(data, list) else data.get('posts', [])
    giants = json.load(open(a.giants, encoding='utf-8'))
    by, order = build(posts, giants, today)
    os.makedirs(a.out, exist_ok=True)
    json.dump({'today': today.isoformat(), 'giants': by}, open(os.path.join(a.out, 'posts.json'), 'w'), indent=1)
    open(os.path.join(a.out, 'posts.md'), 'w', encoding='utf-8').write(md(by, order, today))
    found = sum(1 for _, n in order if by.get(n))
    print(f'{sum(len(v) for v in by.values())} posts kept; {found} of {len(order)} giants found. '
          f'Wrote {a.out}/posts.md')
    return 0


if __name__ == '__main__':
    sys.exit(main())

#!/usr/bin/env python3
"""Index every Claude Code session in the window and split them into research groups (Table One).

Usage:
  python3 index_sessions.py --out <dir> [--days 30] [--exclude <session_id>] [--max-group 30]
                            [--now 2026-10-19T00:00:00Z] PAGE_FILE [PAGE_FILE ...]

PAGE_FILE is a saved `list_sessions` result (the tool saves big results to a file). Pass every page
you fetched. The JSON may be wrapped in other text; it starts at '{"ccr"' or '{"data"'.

Writes:
  <out>/sessions-30d.json      one row per session updated in the window: id, title, tag, dates,
                               repos, summary, artifacts
  <out>/groups/<name>.json     one file per research agent: sessions grouped by title tag ("(WW)")
                               or repo, big groups split into parts of at most --max-group
  <out>/index.md               counts per group, and whether more pages are needed

Prints PAGE MORE with the after_id to use when every page still had more and the oldest session
seen was created inside the window: the index is not complete until that line disappears.
"""
import argparse
import collections
import datetime as dt
import json
import os
import re
import sys

TAG = re.compile(r'^\s*\(([^)]+)\)')


def parse_page(text):
    """Return (sessions, has_more, last_id) from one saved list_sessions result."""
    for marker in ('{"ccr"', '{"data"'):
        i = text.find(marker)
        if i >= 0:
            obj, _ = json.JSONDecoder().raw_decode(text[i:])
            obj = obj.get('ccr', obj)
            return obj.get('data', []), bool(obj.get('has_more')), obj.get('last_id')
    raise ValueError('no list_sessions JSON found')


def ts(s):
    return dt.datetime.fromisoformat(s.replace('Z', '+00:00'))


def tag_of(session):
    m = TAG.match(session.get('title') or '')
    if m:
        return m.group(1).strip()
    repos = repos_of(session)
    return repos[0] if repos else 'untagged'


def repos_of(session):
    out = []
    for src in (session.get('session_context') or {}).get('sources', []) or []:
        url = (src.get('git_repository') or {}).get('url', '')
        if url:
            out.append(url.rstrip('/').split('/')[-1])
    return out


def summary_of(session):
    pts = session.get('post_turn_summary') or (session.get('external_metadata') or {}).get('post_turn_summary') or {}
    return ' | '.join(x for x in (pts.get('recent_action'), pts.get('status_detail')) if x)


def build(pages, now, days, exclude=()):
    start = now - dt.timedelta(days=days)
    seen, rows = set(), []
    oldest_created, all_more, last_id = None, True, None
    for sessions, has_more, lid in pages:
        all_more = all_more and has_more
        last_id = lid or last_id
        for s in sessions:
            created = ts(s['created_at'])
            oldest_created = created if oldest_created is None else min(oldest_created, created)
            if s['id'] in seen or s['id'] in exclude:
                continue
            seen.add(s['id'])
            if ts(s.get('updated_at') or s['created_at']) < start:
                continue
            arts = (s.get('external_metadata') or {}).get('artifacts') or []
            rows.append({'id': s['id'], 'title': s.get('title') or '', 'tag': tag_of(s),
                         'created': s['created_at'][:10], 'updated': (s.get('updated_at') or '')[:10],
                         'repos': repos_of(s), 'summary': summary_of(s),
                         'artifacts': [a.get('title') for a in arts if isinstance(a, dict) and a.get('title')][:8]})
    rows.sort(key=lambda r: r['updated'], reverse=True)
    need_more = bool(pages) and all_more and oldest_created is not None and oldest_created >= start
    return rows, (last_id if need_more else None)


def group(rows, max_group=30):
    by = collections.OrderedDict()
    for r in sorted(rows, key=lambda r: r['tag'].lower()):
        by.setdefault(r['tag'], []).append(r)
    out = collections.OrderedDict()
    for tag, rs in by.items():
        safe = re.sub(r'[^A-Za-z0-9]+', '-', tag).strip('-') or 'tag'
        if len(rs) <= max_group:
            out[safe] = rs
        else:
            for n in range(0, len(rs), max_group):
                out[f'{safe}-part{n // max_group + 1}'] = rs[n:n + max_group]
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('pages', nargs='+')
    ap.add_argument('--out', required=True)
    ap.add_argument('--days', type=int, default=30)
    ap.add_argument('--exclude', action='append', default=[], help='session id to leave out (the current one)')
    ap.add_argument('--max-group', type=int, default=30)
    ap.add_argument('--now', default=None)
    a = ap.parse_args(argv)
    now = ts(a.now) if a.now else dt.datetime.now(dt.timezone.utc)
    pages = [parse_page(open(p, encoding='utf-8').read()) for p in a.pages]
    rows, more = build(pages, now, a.days, set(a.exclude))
    groups = group(rows, a.max_group)
    os.makedirs(os.path.join(a.out, 'groups'), exist_ok=True)
    with open(os.path.join(a.out, 'sessions-30d.json'), 'w', encoding='utf-8') as fh:
        json.dump(rows, fh, indent=1, ensure_ascii=False)
    for name, rs in groups.items():
        with open(os.path.join(a.out, 'groups', f'{name}.json'), 'w', encoding='utf-8') as fh:
            json.dump(rs, fh, indent=1, ensure_ascii=False)
    L = [f'# Session index: last {a.days} days', '', f'Built {now:%Y-%m-%d %H:%M} UTC. Sessions in window: {len(rows)}.', '',
         '| Group | Sessions | Newest update |', '|---|---|---|']
    L += [f"| {n} | {len(rs)} | {max(r['updated'] for r in rs)} |" for n, rs in groups.items()]
    L += ['', f'PAGE MORE: call list_sessions with after_id={more} and re-run with that page added.' if more
          else 'Complete: the pages reach back past the start of the window.']
    with open(os.path.join(a.out, 'index.md'), 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(L) + '\n')
    print('\n'.join(L))
    return 0


if __name__ == '__main__':
    sys.exit(main())

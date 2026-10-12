#!/usr/bin/env python3
"""Scan the creator list for what is working right now (Lane B of the Trending Topics skill).

Usage:
  python3 scan_creators.py --out <dir> [--days 14] [--core-only] [--depth 30]
                           [--creators <creators.json>] [--secondary <public/creators.json>]
                           [--no-ytdlp] [--include-shorts]

For each channel it combines two public sources:
  1. The channel RSS feed (standard library only): exact publish time and exact views for the
     latest ~15 uploads, Shorts included (Shorts are flagged and left out of topics by default).
  2. Optional yt-dlp listing of the /videos tab (long-form only, --depth uploads): rounded views
     and duration, used for the outlier ratio = views / median views of the 10 uploads either side
     (same maths as thumbnail-tracker/scripts/track_channel.py).

Writes:
  <out>/scan.json  every creator, status, error and video (machine readable)
  <out>/scan.md    in-window long-form uploads ranked, top outliers, failures and caveats

Flags on each video: NEW (published inside --days), OUTLIER (ratio >= 2), HOT (top 10 by views
per day among in-window uploads, per tier). A channel that fails is logged and the run continues.
Exit code: 0 if at least one core channel was scanned, 1 if every core channel failed.
"""
import argparse
import concurrent.futures as cf
import datetime as dt
import json
import os
import re
import shutil
import statistics
import subprocess
import sys
import urllib.request
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
UA = {'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en'}
NS = {'a': 'http://www.w3.org/2005/Atom', 'yt': 'http://www.youtube.com/xml/schemas/2015',
      'media': 'http://search.yahoo.com/mrss/'}


def get(url, timeout=25):
    req = urllib.request.Request(url, headers=UA)
    return urllib.request.urlopen(req, timeout=timeout).read().decode('utf-8', 'replace')


def resolve_channel_id(handle):
    page = get(f'https://www.youtube.com/{handle}')
    m = re.search(r'"externalId":"(UC[\w-]{22})"', page)
    if not m:
        raise RuntimeError(f'could not find channel id on the {handle} page')
    return m.group(1)


def rss(channel_id):
    root = ET.fromstring(get(f'https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}'))
    out = []
    for e in root.findall('a:entry', NS):
        vid = e.findtext('yt:videoId', default='', namespaces=NS)
        link = e.find('a:link', NS)
        href = link.get('href', '') if link is not None else ''
        stats = e.find('media:group/media:community/media:statistics', NS)
        views = int(stats.get('views')) if stats is not None and stats.get('views', '').isdigit() else None
        out.append({'id': vid, 'title': e.findtext('a:title', default='', namespaces=NS),
                    'published': e.findtext('a:published', default='', namespaces=NS),
                    'views_exact': views, 'short': '/shorts/' in href})
    return out


def listing(handle, depth):
    cmd = ['yt-dlp', '--flat-playlist', '--playlist-end', str(depth), '--print',
           '%(id)s\t%(view_count)s\t%(duration)s\t%(title)s', f'https://www.youtube.com/{handle}/videos']
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    if res.returncode != 0 and not res.stdout:
        raise RuntimeError('yt-dlp: ' + res.stderr.strip()[-300:])
    rows = []
    for line in res.stdout.splitlines():
        parts = line.split('\t', 3)
        if len(parts) != 4:
            continue
        vid, v, d, t = parts
        rows.append({'id': vid, 'views': int(v) if v.isdigit() else None,
                     'duration_s': int(float(d)) if d not in ('NA', 'None', '') else None, 'title': t})
    return rows


def add_outliers(rows, window=10):
    for i, r in enumerate(rows):
        lo, hi = max(0, i - window), min(len(rows), i + window + 1)
        neigh = [x['views'] for j, x in enumerate(rows[lo:hi], lo) if j != i and x['views']]
        med = statistics.median(neigh) if neigh else None
        r['outlier'] = round(r['views'] / med, 2) if (med and r['views'] is not None) else None


def parse_time(s):
    try:
        return dt.datetime.fromisoformat(s.replace('Z', '+00:00'))
    except Exception:
        return None


def scan_one(c, days, depth, use_ytdlp, now):
    rec = {'name': c['name'], 'handle': c['handle'], 'weight': c.get('weight', 1),
           'tier': c.get('tier', 'core'), 'status': 'ok', 'errors': [], 'videos': []}
    cutoff = now - dt.timedelta(days=days)
    feed = []
    try:
        cid = c.get('channel_id') or resolve_channel_id(c['handle'])
        rec['channel_id'] = cid
        feed = rss(cid)
    except Exception as e:
        rec['errors'].append(f'rss: {e}')
    by_id = {f['id']: f for f in feed}

    rows = []
    if use_ytdlp:
        try:
            rows = listing(c['handle'], depth)
            add_outliers(rows)
        except Exception as e:
            rec['errors'].append(f'listing: {e}')

    videos = []
    for i, r in enumerate(rows):
        f = by_id.pop(r['id'], None)
        videos.append({**r, 'published': f['published'] if f else None,
                       'views_exact': f['views_exact'] if f else None, 'short': False, 'pos': i})
    for f in by_id.values():  # RSS-only items: Shorts, or everything when the listing failed
        videos.append({'id': f['id'], 'title': f['title'], 'views': f['views_exact'], 'duration_s': None,
                       'outlier': None, 'published': f['published'], 'views_exact': f['views_exact'],
                       'short': f['short'], 'pos': None})

    # Long-form listing is newest first. A video with no RSS date sits inside the window if an older
    # listed video is known to be inside it, and outside if a newer one is known to be outside it.
    listed = [v for v in videos if v['pos'] is not None]
    for v in videos:
        t = parse_time(v['published']) if v['published'] else None
        if t:
            v['in_window'] = t >= cutoff
            age_days = max((now - t).total_seconds() / 86400, 0.5)
            best = v['views_exact'] if v['views_exact'] is not None else v['views']
            v['views_per_day'] = round(best / age_days) if best is not None else None
            v['age_days'] = round(age_days, 1)
        else:
            older_in = any(parse_time(o['published']) and parse_time(o['published']) >= cutoff
                           for o in listed if o['pos'] > v['pos'])
            newer_out = any(parse_time(o['published']) and parse_time(o['published']) < cutoff
                            for o in listed if o['pos'] < v['pos'])
            v['in_window'] = True if older_in else (False if newer_out else None)
            v['views_per_day'] = None
            v['age_days'] = None
        v['url'] = f"https://www.youtube.com/{'shorts/' if v['short'] else 'watch?v='}{v['id']}"
        v['flags'] = []
        if v['in_window']:
            v['flags'].append('NEW')
        if v['outlier'] is not None and v['outlier'] >= 2:
            v['flags'].append('OUTLIER')
    rec['videos'] = videos
    if not videos:
        rec['status'] = 'failed'
    elif rec['errors']:
        rec['status'] = 'partial'
    return rec


def load_creators(path, secondary, core_only):
    with open(path, encoding='utf-8') as fh:
        core = json.load(fh)['core']
    for c in core:
        c['tier'] = 'core'
    out = list(core)
    if not core_only and secondary and os.path.exists(secondary):
        seen = {c['handle'].lower() for c in core}
        with open(secondary, encoding='utf-8') as fh:
            for c in json.load(fh).get('creators', []):
                if c['handle'].lower() not in seen:
                    out.append({'name': c['name'], 'handle': c['handle'], 'weight': 1, 'tier': 'secondary'})
    return out


def fmt(n):
    if n is None:
        return '?'
    return f'{n / 1_000_000:.1f}M' if n >= 1_000_000 else (f'{n / 1000:.1f}k' if n >= 1000 else str(n))


def write_md(recs, days, out, now, include_shorts=False):
    rows = [(r, v) for r in recs for v in r['videos'] if v['in_window'] and (include_shorts or not v['short'])]
    rows.sort(key=lambda rv: (rv[1]['views_per_day'] or 0, rv[1]['outlier'] or 0), reverse=True)
    for tier in ('core', 'secondary'):
        for r, v in [rv for rv in rows if rv[0]['tier'] == tier][:10]:
            if v['views_per_day']:
                v['flags'].append('HOT')
    L = [f'# Creator scan: last {days} days', '',
         f'Run: {now:%Y-%m-%d %H:%M} UTC. Creators scanned: {sum(r["status"] != "failed" for r in recs)}/{len(recs)}.']
    for tier, label in (('core', 'Core creators'), ('secondary', 'Secondary (app watchlist)')):
        part = [rv for rv in rows if rv[0]['tier'] == tier]
        if tier == 'secondary' and not part and not any(r['tier'] == 'secondary' for r in recs):
            continue
        L += ['', f'## {label}: in-window long-form uploads (ranked by views per day, then outlier ratio)', '',
              '| # | Creator | Title | Views | Views/day | Outlier | Age (days) | Flags | URL |',
              '|---|---|---|---|---|---|---|---|---|']
        for i, (r, v) in enumerate(part, 1):
            views = v['views_exact'] if v['views_exact'] is not None else v['views']
            L.append(f"| {i} | {r['name']} | {v['title'].replace('|', '/')} | {fmt(views)} | "
                     f"{fmt(v['views_per_day'])} | {v['outlier'] if v['outlier'] is not None else '?'} | "
                     f"{v['age_days'] if v['age_days'] is not None else '?'} | {' '.join(v['flags'])} | {v['url']} |")
        if not part:
            L.append('| - | none found | | | | | | | |')
    outl = [(r, v) for r in recs for v in r['videos'] if v['outlier'] and v['outlier'] >= 2]
    outl.sort(key=lambda rv: rv[1]['outlier'], reverse=True)
    L += ['', f'## Outliers in the latest listed uploads (ratio 2 or more, any date)', '',
          '| Creator | Title | Views | Outlier | In window | URL |', '|---|---|---|---|---|---|']
    for r, v in outl[:20]:
        L.append(f"| {r['name']} | {v['title'].replace('|', '/')} | {fmt(v['views'])} | {v['outlier']} | "
                 f"{'yes' if v['in_window'] else ('no' if v['in_window'] is False else 'unknown')} | {v['url']} |")
    fails = [r for r in recs if r['errors']]
    L += ['', '## Failures and partial scans', '']
    L += [f"- {r['name']} ({r['handle']}): {r['status']}; {'; '.join(r['errors'])}" for r in fails] or ['- none']
    L += ['', '## Caveats (say these when a number matters)', '',
          '- Listing views are rounded by YouTube (e.g. 18,000). RSS views are exact but only cover the latest ~15 uploads, Shorts included.',
          '- Views per day needs an RSS publish date, so older long-form uploads show "?".',
          '- Outlier ratio = views / median of the 10 listed uploads either side. Under 0.7 under, 0.7 to 1.4 normal, over 1.4 over, 2 or more a hit.',
          '- A topic can win on format (courses, series) or topic heat rather than packaging. Check before crediting.']
    with open(os.path.join(out, 'scan.md'), 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(L) + '\n')


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--out', required=True)
    ap.add_argument('--days', type=int, default=14)
    ap.add_argument('--depth', type=int, default=30)
    ap.add_argument('--core-only', action='store_true')
    ap.add_argument('--no-ytdlp', action='store_true')
    ap.add_argument('--include-shorts', action='store_true')
    ap.add_argument('--creators', default=os.path.join(HERE, '..', 'references', 'creators.json'))
    ap.add_argument('--secondary', default=None, help='app watchlist; default: public/creators.json in the repo if found')
    a = ap.parse_args()

    secondary = a.secondary
    if secondary is None:
        for cand in (os.path.join(HERE, '..', '..', '..', 'public', 'creators.json'),
                     os.path.join(os.getcwd(), 'public', 'creators.json')):
            if os.path.exists(cand):
                secondary = cand
                break
    use_ytdlp = not a.no_ytdlp and shutil.which('yt-dlp') is not None
    if not a.no_ytdlp and not use_ytdlp:
        print('NOTE: yt-dlp not found; RSS only (no outlier ratios). Install with: pip install yt-dlp', file=sys.stderr)

    os.makedirs(a.out, exist_ok=True)
    creators = load_creators(a.creators, secondary, a.core_only)
    now = dt.datetime.now(dt.timezone.utc)
    print(f'Scanning {len(creators)} channels ({sum(c["tier"] == "core" for c in creators)} core), last {a.days} days...', file=sys.stderr)
    with cf.ThreadPoolExecutor(max_workers=4) as ex:
        recs = list(ex.map(lambda c: scan_one(c, a.days, a.depth, use_ytdlp, now), creators))
    for r in recs:
        print(f"  {r['status']:8} {r['name']}: {sum(1 for v in r['videos'] if v['in_window'] and not v['short'])} in-window long-form"
              + (f"  ({'; '.join(r['errors'])})" if r['errors'] else ''), file=sys.stderr)
    write_md(recs, a.days, a.out, now, a.include_shorts)  # adds HOT flags, so it runs before the JSON dump
    with open(os.path.join(a.out, 'scan.json'), 'w', encoding='utf-8') as fh:
        json.dump({'run_at': now.isoformat(), 'days': a.days, 'ytdlp': use_ytdlp, 'creators': recs}, fh, indent=1)
    print(f'Wrote {a.out}/scan.json and {a.out}/scan.md', file=sys.stderr)
    core_ok = any(r['status'] != 'failed' for r in recs if r['tier'] == 'core')
    return 0 if core_ok else 1


if __name__ == '__main__':
    sys.exit(main())

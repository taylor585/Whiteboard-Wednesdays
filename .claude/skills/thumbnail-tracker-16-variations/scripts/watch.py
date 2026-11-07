#!/usr/bin/env python3
"""Watchlist: track several channels over time and surface new uploads and breakouts.

Usage:
  python3 watch.py add <@handle or channel URL> [--dir STATE] [--limit N]   add a channel (N = uploads to scan each run, default 30)
  python3 watch.py remove <@handle> [--dir STATE]
  python3 watch.py list [--dir STATE]
  python3 watch.py run [--dir STATE] [--limit 30]                 snapshot every channel, write a digest

STATE defaults to ./thumbnail-watch. It holds:
  watchlist.json                 channels being tracked
  snapshots/<handle>.jsonl       one line per video per run: {ts, id, views, title}
  thumbs/<id>.jpg                thumbnails seen so far
  digests/<YYYY-MM-DD_HHMM>/     digest.md + digest.jpg for that run (UTC timestamp)

What a run computes per video (latest N uploads per channel):
  outlier  = views / median views of the 10 uploads either side (same definition as track_channel.py)
  gained   = views gained since the previous run (needs 2+ runs)
  per_day  = views per day since publish. Publish dates come from the channel RSS feed, which only
             covers the latest ~15 uploads, so older videos have no date or per-day figure.
Flags: NEW = first seen since the previous run, or (on the first run) published in the last 7 days.
OUTLIER = ratio >= 2. TOP GAINER = biggest gain on its channel since the last run, and over 3x the
channel's median gain. View counts are rounded by YouTube and occasionally hidden (hidden = skipped).
Requires: yt-dlp, Pillow.
"""
import argparse
import datetime as dt
import json
import os
import re
import statistics
import subprocess
import sys
import urllib.request

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from track_channel import add_outliers, list_videos  # noqa: E402


def norm_handle(h):
    h = h.strip().rstrip('/')
    m = re.search(r'youtube\.com/(@[^/]+|channel/[^/]+|c/[^/]+|user/[^/]+)', h)
    if m:
        h = m.group(1)
    if not h.startswith('@') and '/' not in h:
        h = '@' + h
    return h


def channel_url(h):
    return f'https://www.youtube.com/{h}'


def resolve(handle):
    out = subprocess.run(['yt-dlp', '--flat-playlist', '--playlist-end', '1', '--print',
                          '%(playlist_channel_id)s\t%(playlist_uploader)s', channel_url(handle) + '/videos'],
                         capture_output=True, text=True)
    line = (out.stdout.strip().splitlines() or [''])[0].split('\t')
    if len(line) < 2 or not line[0].startswith('UC'):
        sys.exit(f'Could not resolve {handle}: {out.stderr[-300:]}')
    return line[0], line[1]


def rss_dates(channel_id):
    try:
        xml = urllib.request.urlopen(f'https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}', timeout=20).read().decode()
    except Exception:
        return {}
    dates = {}
    for entry in xml.split('<entry>')[1:]:
        vid = re.search(r'<yt:videoId>([^<]+)', entry)
        pub = re.search(r'<published>([^<]+)', entry)
        if vid and pub:
            dates[vid.group(1)] = dt.datetime.fromisoformat(pub.group(1))
    return dates


def load(path, default):
    return json.load(open(path)) if os.path.exists(path) else default


def last_snapshot(path):
    """Latest views per video from the most recent previous run."""
    if not os.path.exists(path):
        return {}, None
    rows = [json.loads(l) for l in open(path) if l.strip()]
    if not rows:
        return {}, None
    last_ts = max(r['ts'] for r in rows)
    seen = {}
    for r in rows:
        seen.setdefault(r['id'], r)
        if r['ts'] >= seen[r['id']]['ts']:
            seen[r['id']] = r
    return seen, last_ts


def fetch(url, path):
    if not os.path.exists(path):
        try:
            urllib.request.urlretrieve(url, path)
        except Exception:
            pass


def cmd_add(a):
    os.makedirs(a.dir, exist_ok=True)
    wl_path = os.path.join(a.dir, 'watchlist.json')
    wl = load(wl_path, {'channels': []})
    h = norm_handle(a.channel)
    if any(c['handle'].lower() == h.lower() for c in wl['channels']):
        print(f'{h} is already on the watchlist')
        return
    cid, name = resolve(h)
    wl['channels'].append({'handle': h, 'channel_id': cid, 'name': name, 'added': dt.date.today().isoformat(), 'limit': a.limit or 30})
    json.dump(wl, open(wl_path, 'w'), indent=2)
    print(f'added {name} ({h}, {cid})')


def cmd_remove(a):
    wl_path = os.path.join(a.dir, 'watchlist.json')
    wl = load(wl_path, {'channels': []})
    h = norm_handle(a.channel)
    wl['channels'] = [c for c in wl['channels'] if c['handle'].lower() != h.lower()]
    json.dump(wl, open(wl_path, 'w'), indent=2)
    print(f'removed {h}')


def cmd_list(a):
    wl = load(os.path.join(a.dir, 'watchlist.json'), {'channels': []})
    if not wl['channels']:
        print('watchlist is empty, add a channel with: watch.py add @handle')
    for c in wl['channels']:
        print(f"{c['handle']:<28} {c['name']:<30} added {c['added']}  scans latest {c.get('limit', 30)}")


def cmd_run(a):
    wl = load(os.path.join(a.dir, 'watchlist.json'), {'channels': []})
    if not wl['channels']:
        sys.exit('watchlist is empty, add a channel with: watch.py add @handle')
    now = dt.datetime.now(dt.timezone.utc)
    ts = now.isoformat(timespec='seconds')
    for d in ('snapshots', 'thumbs', 'digests'):
        os.makedirs(os.path.join(a.dir, d), exist_ok=True)
    out_dir = os.path.join(a.dir, 'digests', now.strftime('%Y-%m-%d_%H%M'))
    os.makedirs(out_dir, exist_ok=True)

    flagged, md = [], [f'# Thumbnail watch digest, {now:%Y-%m-%d %H:%M} UTC', '']
    for c in wl['channels']:
        snap_path = os.path.join(a.dir, 'snapshots', c['handle'].lstrip('@').replace('/', '_') + '.jsonl')
        prev, prev_ts = last_snapshot(snap_path)
        rows = list_videos(channel_url(c['handle']), a.limit or c.get('limit', 30), False)
        if not rows:
            md += [f"## {c['name']}", '', 'No videos returned this run.', '']
            continue
        dates = rss_dates(c['channel_id'])
        med = statistics.median([r['views'] for r in rows if r['views']] or [1])
        add_outliers(rows)
        for r in rows:
            r['outlier'] = r['outlier'] or 0
            p = prev.get(r['id'])
            pub = dates.get(r['id'])
            age = max((now - pub).total_seconds() / 86400, 0.25) if pub else None
            r['new'] = (p is None and prev_ts is not None) or (prev_ts is None and age is not None and age <= 7)
            r['gained'] = r['views'] - p['views'] if (p and r['views'] is not None and p['views'] is not None) else None
            r['published'] = pub.date().isoformat() if pub else ''
            r['per_day'] = int(r['views'] / age) if (age and r['views']) else None
            r['channel'] = c['name']
        gains = [r['gained'] for r in rows if r['gained'] is not None]
        med_gain = statistics.median(gains) if gains else 0
        top_gain = max(gains) if gains else 0
        for r in rows:
            reasons = []
            if r['new']:
                reasons.append('NEW')
            if r['outlier'] >= 2:
                reasons.append(f"x{r['outlier']} outlier")
            if r['gained'] and r['gained'] == top_gain and top_gain > 3 * max(med_gain, 1):
                reasons.append(f"+{r['gained']:,} since last run")
            r['reasons'] = reasons
        with open(snap_path, 'a') as f:
            for r in rows:
                if r['views'] is not None:
                    f.write(json.dumps({'ts': ts, 'id': r['id'], 'views': r['views'], 'title': r['title']}) + '\n')

        md += [f"## {c['name']} ({c['handle']})", '',
               f"Median views of latest {len(rows)}: {int(med):,}" + (f" · previous run {prev_ts}" if prev_ts else ' · first run (no growth data yet)'), '']
        hits = [r for r in rows if r['reasons']]
        if not hits:
            md += ['Nothing new or breaking out.', '']
        for r in sorted(hits, key=lambda r: -r['outlier']):
            extra = []
            if r['published']:
                extra.append(f"published {r['published']}")
            if r['per_day'] is not None:
                extra.append(f"{r['per_day']:,}/day")
            md.append(f"- **{r['title']}**: {r['views'] or 0:,} views, {', '.join(r['reasons'])}"
                      + (f" ({', '.join(extra)})" if extra else '') + f"  \n  https://youtu.be/{r['id']}")
            flagged.append(r)
        md.append('')

    for r in flagged:
        fetch(f"https://i.ytimg.com/vi/{r['id']}/mqdefault.jpg", os.path.join(a.dir, 'thumbs', r['id'] + '.jpg'))

    if flagged:
        cols, W, H = 4, 320, 216
        rows_n = (len(flagged) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * W, rows_n * H), 'white')
        dr = ImageDraw.Draw(sheet)
        for k, r in enumerate(flagged):
            x, y = (k % cols) * W, (k // cols) * H
            p = os.path.join(a.dir, 'thumbs', r['id'] + '.jpg')
            if os.path.exists(p):
                sheet.paste(Image.open(p).convert('RGB').resize((320, 180)), (x, y))
            dr.text((x + 3, y + 182), r['channel'][:40], fill='black')
            dr.text((x + 3, y + 198), f"{(r['views'] or 0) // 1000}K  " + ' · '.join(r['reasons'])[:48], fill='black')
        sheet.save(os.path.join(out_dir, 'digest.jpg'), quality=88)
        md.insert(2, '![digest](digest.jpg)\n')
    open(os.path.join(out_dir, 'digest.md'), 'w').write('\n'.join(md) + '\n')
    print('\n'.join(md))
    print(f'\ndigest written to {out_dir}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['add', 'remove', 'list', 'run'])
    ap.add_argument('channel', nargs='?')
    ap.add_argument('--dir', default='thumbnail-watch')
    ap.add_argument('--limit', type=int, default=0, help='uploads to scan per channel (add: stored per channel; run: overrides all)')
    a = ap.parse_args()
    if a.cmd in ('add', 'remove') and not a.channel:
        sys.exit(f'{a.cmd} needs a channel, e.g. watch.py {a.cmd} @nicksaraev')
    {'add': cmd_add, 'remove': cmd_remove, 'list': cmd_list, 'run': cmd_run}[a.cmd](a)


if __name__ == '__main__':
    main()

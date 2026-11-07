#!/usr/bin/env python3
"""Fetch full packaging dossiers (title, thumbnail, description, chapters, likes, date, opening transcript) for videos.

Usage:
  python3 fetch_videos.py <out_dir> <video id|URL> [more ids...]
  python3 fetch_videos.py <out_dir> --channel <@handle> [--latest 5] [--baseline 30] [--min-seconds 180]

With --channel, the latest uploads are listed (Shorts and anything under --min-seconds are skipped).
The newest --latest get full dossiers; all --baseline uploads get title, views, duration and outlier ratio
(views / median of the 10 uploads either side, same as track_channel.py) in baseline.tsv.

Writes, per video:  <out_dir>/<id>/dossier.json  and  <out_dir>/<id>/thumb.jpg
dossier.json fields: id, url, title, channel, published, views (exact), likes, duration_s, outlier,
  description (full text), above_fold (first 2 lines shown in search), links (real URLs, not the
  shortened display text), chapters [{t, s, title}], chapters_valid, hashtags.
Transcripts aren't available this way (the transcript endpoint rejects anonymous requests); to check how a
video opens, the user has to supply a transcript or the file (see transcribe.py).

Uses YouTube's public web endpoint youtubei/v1/next, one request a second.
yt-dlp's per-video extractor and the watch page are often bot-blocked from servers; these usually aren't.
If a request fails the field is left empty and the run continues. Requires yt-dlp (for listings) and Pillow.
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from track_channel import add_outliers, list_videos  # noqa: E402

CLIENT = {'clientName': 'WEB', 'clientVersion': '2.20260901.00.00', 'hl': 'en', 'gl': 'US'}


def post(endpoint, body):
    req = urllib.request.Request(f'https://www.youtube.com/youtubei/v1/{endpoint}?prettyPrint=false',
                                 data=json.dumps({'context': {'client': CLIENT}, **body}).encode(),
                                 headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
    for attempt in range(3):
        try:
            return json.load(urllib.request.urlopen(req, timeout=30))
        except Exception as e:
            if attempt == 2:
                print(f'  {endpoint} failed: {e}', file=sys.stderr)
                return None
            time.sleep(2 * (attempt + 1))


def walk(o, key):
    """Yield every value stored under `key` anywhere in a nested JSON object."""
    if isinstance(o, dict):
        for k, v in o.items():
            if k == key:
                yield v
            yield from walk(v, key)
    elif isinstance(o, list):
        for v in o:
            yield from walk(v, key)


def first(o, key, default=None):
    return next(walk(o, key), default)


def text_of(t):
    if not t:
        return ''
    if 'simpleText' in t:
        return t['simpleText']
    if 'runs' in t:
        return ''.join(r.get('text', '') for r in t['runs'])
    return t.get('content', '')


def real_url(u):
    if 'youtube.com/redirect' in u:
        q = urllib.parse.parse_qs(urllib.parse.urlparse(u).query).get('q')
        if q:
            return q[0]
    return u


def to_seconds(ts):
    parts = [int(p) for p in ts.split(':')]
    s = 0
    for p in parts:
        s = s * 60 + p
    return s


def parse_count(s):
    s = (s or '').replace(',', '').strip().upper()
    m = re.match(r'([\d.]+)\s*([KMB]?)', s)
    if not m:
        return None
    return int(float(m.group(1)) * {'': 1, 'K': 1e3, 'M': 1e6, 'B': 1e9}[m.group(2)])


HASHTAG = re.compile(r'(?<![\w&])#[A-Za-z]\w*')


def hashtags(text):
    """Real hashtags only (same rule as package.py's LinkedIn check): "#1", "#17" and "&#39;" don't count."""
    return sorted(set(HASHTAG.findall(text or '')))


def dossier(vid):
    d = {'id': vid, 'url': f'https://youtu.be/{vid}'}
    nxt = post('next', {'videoId': vid})
    if not nxt:
        return d
    prim = first(nxt, 'videoPrimaryInfoRenderer', {})
    d['title'] = text_of(prim.get('title'))
    d['published'] = text_of(prim.get('dateText'))
    vc = first(prim, 'viewCount', {})
    d['views'] = parse_count(text_of(first(vc, 'viewCount', {}) or {}) .split(' ')[0]) if vc else None
    owner = first(nxt, 'videoOwnerRenderer', {})
    d['channel'] = text_of(owner.get('title'))
    for f in walk(nxt, 'factoidRenderer'):
        if text_of(f.get('label')).lower().startswith('like'):
            d['likes'] = parse_count(text_of(f.get('value')))
    desc = first(nxt, 'attributedDescriptionBodyText', {}) or {}
    d['description'] = desc.get('content', '')
    links = []
    for run in desc.get('commandRuns', []) or []:
        u = first(run, 'url')
        if u:
            u = real_url(u)
            if u not in links:
                links.append(u)
    d['links'] = links
    lines = [l for l in d['description'].split('\n')]
    d['above_fold'] = '\n'.join([l for l in lines if l.strip()][:2])
    d['hashtags'] = hashtags(d['description'])
    chapters = []
    for l in lines:
        m = re.match(r'^\s*\(?((?:\d{1,2}:)?\d{1,2}:\d{2})\)?\s*[-–—|:]?\s*(.+)$', l)
        if m:
            chapters.append({'t': m.group(1), 's': to_seconds(m.group(1)), 'title': m.group(2).strip()})
    d['chapters'] = chapters
    d['chapters_valid'] = bool(chapters) and chapters[0]['s'] == 0 and len(chapters) >= 3
    return d


def save(out, d):
    vdir = os.path.join(out, d['id'])
    os.makedirs(vdir, exist_ok=True)
    for size in ('maxresdefault', 'hqdefault'):
        p = os.path.join(vdir, 'thumb.jpg')
        try:
            urllib.request.urlretrieve(f"https://i.ytimg.com/vi/{d['id']}/{size}.jpg", p)
            if os.path.getsize(p) > 3000:
                break
        except Exception:
            continue
    json.dump(d, open(os.path.join(vdir, 'dossier.json'), 'w'), indent=2, ensure_ascii=False)


def vid_of(s):
    m = re.search(r'(?:v=|youtu\.be/|shorts/)([A-Za-z0-9_-]{11})', s)
    return m.group(1) if m else s


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('ids', nargs='*')
    ap.add_argument('--channel')
    ap.add_argument('--latest', type=int, default=5)
    ap.add_argument('--baseline', type=int, default=30)
    ap.add_argument('--min-seconds', type=int, default=180)
    ap.add_argument('--all-dossiers', action='store_true', help='full dossiers for every baseline video, not just --latest')
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    meta = {}
    targets = [vid_of(x) for x in a.ids]
    if a.channel:
        h = a.channel if a.channel.startswith(('@', 'http')) else '@' + a.channel
        url = h if h.startswith('http') else f'https://www.youtube.com/{h}'
        rows = list_videos(url, a.baseline + 15, False)
        rows = [r for r in rows if r['dur'] >= a.min_seconds][:a.baseline]
        add_outliers(rows)
        with open(os.path.join(a.out, 'baseline.tsv'), 'w') as f:
            f.write('index\tid\tviews\tduration_s\toutlier\ttitle\n')
            for i, r in enumerate(rows, 1):
                f.write(f"{i}\t{r['id']}\t{'' if r['views'] is None else r['views']}\t{r['dur']}\t{'' if r['outlier'] is None else r['outlier']}\t{r['title']}\n")
        meta = {r['id']: r for r in rows}
        targets += [r['id'] for r in (rows if a.all_dossiers else rows[:a.latest])]
    for i, vid in enumerate(targets):
        print(f'[{i + 1}/{len(targets)}] {vid}')
        d = dossier(vid)
        r = meta.get(vid)
        if r:
            d['duration_s'] = r['dur']
            d['outlier'] = r['outlier']
            d['listing_views'] = r['views']
            d['baseline_index'] = list(meta).index(vid) + 1
        save(a.out, d)
        time.sleep(1)
    print(f'saved {len(targets)} dossiers to {a.out}')


if __name__ == '__main__':
    main()

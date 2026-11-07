#!/usr/bin/env python3
"""Pull every video on a YouTube channel, download thumbnails, score outliers, and build contact sheets.

Usage:
  python3 track_channel.py <channel url or @handle> <out_dir> [--limit N] [--shorts]

Writes to out_dir:
  videos.tsv        id, views, duration_s, outlier, title (upload order, newest first)
  summary.txt       median/mean views, top outliers, longform vs rest
  thumbs/<id>.jpg   320x180 thumbnails
  hq/<id>.jpg       1280x720 thumbnails for the top 12 outliers
  sheet_NN.jpg      contact sheets in upload order (#index + views on each tile)
  outliers.jpg      the 12 biggest outliers at large size
  report.html       browsable gallery of every thumbnail, sortable by upload order, views or outlier

"Outlier" = views divided by the median views of the 10 uploads either side of it.
It separates "the thumbnail/topic hit" from "the channel was simply bigger then".

Data caveats (say these to the user when they matter):
- View counts from the channel listing are rounded (e.g. 316,000), not exact.
- YouTube sometimes hides the count for a few videos in the listing. Those are kept with views = None,
  shown as "?" and left out of every median, outlier ratio and ranking.
Requires: yt-dlp, Pillow.
"""
import argparse
import concurrent.futures as cf
import os
import statistics
import subprocess
import sys
import html
import json
import urllib.request

from PIL import Image, ImageDraw


def list_videos(url, limit, shorts):
    if url.startswith('@'):
        url = f'https://www.youtube.com/{url}'
    url = url.rstrip('/')
    tab = '/shorts' if shorts else '/videos'
    if not url.endswith(tab):
        url += tab
    cmd = ['yt-dlp', '--flat-playlist', '--print', '%(id)s\t%(view_count)s\t%(duration)s\t%(title)s', url]
    if limit:
        cmd[1:1] = ['--playlist-end', str(limit)]
    out = subprocess.run(cmd, capture_output=True, text=True)
    if out.returncode != 0 and not out.stdout:
        sys.exit(f'yt-dlp failed: {out.stderr[-500:]}')
    rows = []
    for line in out.stdout.splitlines():
        parts = line.split('\t', 3)
        if len(parts) != 4:
            continue
        vid, v, d, t = parts
        rows.append({'id': vid, 'views': int(v) if v.isdigit() else None,
                     'dur': int(float(d)) if d not in ('NA', 'None', '') else 0, 'title': t})
    return rows


def add_outliers(rows, window=10):
    for i, r in enumerate(rows):
        lo, hi = max(0, i - window), min(len(rows), i + window + 1)
        neigh = [x['views'] for j, x in enumerate(rows[lo:hi], lo) if j != i and x['views']]
        med = statistics.median(neigh) if neigh else None
        r['outlier'] = round(r['views'] / med, 2) if (med and r['views'] is not None) else None


def fetch(url, path):
    if os.path.exists(path):
        return
    try:
        urllib.request.urlretrieve(url, path)
    except Exception:
        pass


def fmt_k(v):
    return '?' if v is None else f'{v // 1000}K'


def known(rows):
    return [r for r in rows if r['views'] is not None]


def sheets(rows, out, cols=4, per=24):
    W, H = 320, 198
    n_sheets = 0
    for s in range(0, len(rows), per):
        chunk = rows[s:s + per]
        r = (len(chunk) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * W, r * H), 'white')
        dr = ImageDraw.Draw(sheet)
        for k, row in enumerate(chunk):
            x, y = (k % cols) * W, (k // cols) * H
            p = os.path.join(out, 'thumbs', row['id'] + '.jpg')
            if os.path.exists(p):
                sheet.paste(Image.open(p).convert('RGB').resize((320, 180)), (x, y))
            dr.text((x + 3, y + 183), f"#{s + k + 1}  {fmt_k(row['views'])}  x{row['outlier'] if row['outlier'] is not None else '?'}", fill='black')
        n_sheets += 1
        sheet.save(os.path.join(out, f'sheet_{n_sheets:02d}.jpg'), quality=85)
    return n_sheets


def write_report(rows, out, channel):
    data = [{'i': i, 'id': r['id'], 'v': r['views'], 'o': r['outlier'], 'd': r['dur'], 't': r['title']} for i, r in enumerate(rows, 1)]
    page = """<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Thumbnail report</title><style>
:root{color-scheme:light dark;--bg:#0f0f0f;--fg:#f1f1f1;--chip:#272727;--sub:#aaa;--hot:#ffcc00;--in:#121212;--line:#333}
@media (prefers-color-scheme: light){:root{--bg:#fff;--fg:#0f0f0f;--chip:#f2f2f2;--sub:#606060;--hot:#b45309;--in:#fff;--line:#ccc}}
body{margin:0;font-family:system-ui,sans-serif;background:var(--bg);color:var(--fg)}
header{position:sticky;top:0;background:var(--bg);padding:14px 16px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;z-index:2}
h1{font-size:18px;margin:0 12px 0 0}button{background:var(--chip);color:var(--fg);border:0;border-radius:8px;padding:8px 12px;cursor:pointer;font:inherit}
button.on{background:var(--fg);color:var(--bg)}input{background:var(--in);border:1px solid var(--line);color:var(--fg);border-radius:8px;padding:8px 10px;font:inherit;min-width:0}
main{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;padding:16px}
a{color:inherit;text-decoration:none}img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:10px;display:block}
.t{font-weight:600;font-size:14px;line-height:1.3;margin:8px 0 4px}.m{color:var(--sub);font-size:13px}.hot{color:var(--hot);font-weight:700}
</style></head><body><header><h1>__CH__</h1>
<button data-k="i" class="on">Upload order</button><button data-k="v">Most views</button><button data-k="o">Biggest outliers</button>
<input id="q" placeholder="Filter titles" aria-label="Filter titles"></header><main id="g"></main>
<script>const D=__DATA__;let k='i';const g=document.getElementById('g'),q=document.getElementById('q');
function fmt(n){return n==null?'?':n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?Math.round(n/1e3)+'K':n}
function draw(){const f=q.value.toLowerCase();const rows=D.filter(r=>r.t.toLowerCase().includes(f)).sort((a,b)=>k==='i'?a.i-b.i:(b[k]??-1)-(a[k]??-1));
g.innerHTML=rows.map(r=>`<a href="https://youtu.be/${r.id}" target="_blank" rel="noopener"><img loading="lazy" src="thumbs/${r.id}.jpg" alt=""><div class="t"></div>
<div class="m">#${r.i} · ${fmt(r.v)} views · <span class="${r.o>=2?'hot':''}">x${r.o??'?'}</span></div></a>`).join('');
g.querySelectorAll('.t').forEach((el,i)=>el.textContent=rows[i].t);}
document.querySelectorAll('button').forEach(b=>b.onclick=()=>{k=b.dataset.k;document.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));draw();});
q.oninput=draw;draw();</script></body></html>"""
    page = page.replace('__CH__', html.escape(channel)).replace('__DATA__', json.dumps(data).replace('</', '<\\/'))
    open(os.path.join(out, 'report.html'), 'w').write(page)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('channel')
    ap.add_argument('out')
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--shorts', action='store_true')
    a = ap.parse_args()
    os.makedirs(os.path.join(a.out, 'thumbs'), exist_ok=True)
    os.makedirs(os.path.join(a.out, 'hq'), exist_ok=True)

    rows = list_videos(a.channel, a.limit, a.shorts)
    if not rows:
        sys.exit('No videos found. Check the handle/URL.')
    add_outliers(rows)

    with cf.ThreadPoolExecutor(16) as ex:
        for r in rows:
            ex.submit(fetch, f"https://i.ytimg.com/vi/{r['id']}/mqdefault.jpg", os.path.join(a.out, 'thumbs', r['id'] + '.jpg'))

    top = sorted(known(rows), key=lambda r: -(r['outlier'] or 0))[:12]
    with cf.ThreadPoolExecutor(8) as ex:
        for r in top:
            ex.submit(fetch, f"https://i.ytimg.com/vi/{r['id']}/maxresdefault.jpg", os.path.join(a.out, 'hq', r['id'] + '.jpg'))

    with open(os.path.join(a.out, 'videos.tsv'), 'w') as f:
        f.write('index\tid\tviews\tduration_s\toutlier\ttitle\n')
        for i, r in enumerate(rows, 1):
            f.write(f"{i}\t{r['id']}\t{'' if r['views'] is None else r['views']}\t{r['dur']}\t{'' if r['outlier'] is None else r['outlier']}\t{r['title']}\n")

    n = sheets(rows, a.out)
    write_report(rows, a.out, a.channel)

    # Big outlier sheet, 3 columns at 426x240
    W, H = 426, 262
    big = Image.new('RGB', (3 * W, 4 * H), 'white')
    dr = ImageDraw.Draw(big)
    for k, r in enumerate(top):
        p = os.path.join(a.out, 'hq', r['id'] + '.jpg')
        if not os.path.exists(p) or os.path.getsize(p) < 3000:
            p = os.path.join(a.out, 'thumbs', r['id'] + '.jpg')
        if os.path.exists(p):
            big.paste(Image.open(p).convert('RGB').resize((426, 240)), ((k % 3) * W, (k // 3) * H))
        idx = rows.index(r) + 1
        dr.text(((k % 3) * W + 3, (k // 3) * H + 244), f"#{idx} {r['views']:,} views  x{r['outlier']}", fill='black')
    big.save(os.path.join(a.out, 'outliers.jpg'), quality=88)

    views = [r['views'] for r in known(rows)] or [0]
    longf = [r['views'] for r in known(rows) if r['dur'] >= 5400]
    rest = [r['views'] for r in known(rows) if r['dur'] < 5400]
    hidden = [rows.index(r) + 1 for r in rows if r['views'] is None]
    lines = [
        f"videos: {len(rows)}",
        f"median views: {int(statistics.median(views)):,}   mean: {int(statistics.mean(views)):,}",
        f"hidden view counts (excluded from all stats): {len(hidden)}" + (f" -> #{', #'.join(map(str, hidden))}" if hidden else ''),
        "view counts are rounded by YouTube's listing (2-3 significant figures)",
        f"90min+ videos: {len(longf)} median {int(statistics.median(longf)) if longf else 0:,}   others median {int(statistics.median(rest)) if rest else 0:,}",
        f"contact sheets: {n} (sheet_01 = newest)",
        "",
        "top outliers (views vs neighbouring uploads):",
    ] + [f"  #{rows.index(r) + 1:<4} x{r['outlier']:<6} {r['views']:>10,}  {r['title']}" for r in top] + [
        "",
        "biggest by raw views:",
    ] + [f"  #{rows.index(r) + 1:<4} {r['views']:>10,}  {r['title']}" for r in sorted(known(rows), key=lambda r: -r['views'])[:12]] + [
        "",
        "weakest 10:",
    ] + [f"  #{rows.index(r) + 1:<4} {r['views']:>10,}  {r['title']}" for r in sorted(known(rows), key=lambda r: r['views'])[:10]]
    open(os.path.join(a.out, 'summary.txt'), 'w').write('\n'.join(lines) + '\n')
    print('\n'.join(lines))


if __name__ == '__main__':
    main()

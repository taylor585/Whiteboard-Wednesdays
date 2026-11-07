#!/usr/bin/env python3
"""Audit one thumbnail: feed-size tests, squint test, palette and measurable stats, optionally in a feed.

Usage:
  python3 audit.py <image path | image URL | YouTube URL | video ID> <out_dir> [--feed DIR] [--benchmark FILE]
  python3 audit.py --build-benchmark <thumbs_dir> <out.json>     (stats of a reference set, e.g. a channel's outliers)

Writes to out_dir:
  audit.png      original, phone-feed size (168px) and sidebar size (246px) at true pixels,
                 a squint (blur) test, a greyscale value test, the 5 dominant colours, and the numbers
  metrics.json   contrast, colourfulness, clutter (edge density), brightness, saturation, palette,
                 and where each sits against the benchmark range if one is given
  feed.png       (with --feed) the thumbnail placed among 11 other thumbnails on a dark YouTube-style grid,
                 plus a "distinctiveness" score: how far its colours are from the feed average.
                 If DIR is a track_channel.py thumbs/ folder and the video is in that channel, the feed is
                 the uploads published around it (what it actually competed with); otherwise a random
                 sample. The audited video itself is always excluded.
  video.json     (YouTube input) title and channel from YouTube oEmbed. View counts aren't available
                 here: run track_channel.py on the channel for views and the outlier ratio.

The numbers support the judgement; they don't replace looking. A thumbnail can hit every range and still
have nothing worth clicking. Requires Pillow (and network for URLs).
"""
import argparse
import glob
import json
import math
import os
import random
import re
import sys
import urllib.request

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageStat

BENCH_DEFAULT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'references', 'benchmarks.json')


def video_id(src):
    m = re.search(r'(?:v=|youtu\.be/|shorts/|/vi/)([A-Za-z0-9_-]{11})', src)
    if m:
        return m.group(1)
    if re.fullmatch(r'[A-Za-z0-9_-]{11}', src) and not os.path.exists(src):
        return src
    return None


def oembed(vid):
    try:
        url = f'https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v={vid}'
        d = json.load(urllib.request.urlopen(url, timeout=15))
        return {'id': vid, 'title': d.get('title'), 'channel': d.get('author_name'), 'channel_url': d.get('author_url')}
    except Exception:
        return {'id': vid}


def load_image(src, out_dir):
    vid = None
    m = re.search(r'(?:v=|youtu\.be/|shorts/|/vi/)([A-Za-z0-9_-]{11})', src)
    if m:
        vid = m.group(1)
    elif re.fullmatch(r'[A-Za-z0-9_-]{11}', src) and not os.path.exists(src):
        vid = src
    if vid:
        for size in ('maxresdefault', 'hqdefault', 'mqdefault'):
            p = os.path.join(out_dir, f'{vid}.jpg')
            try:
                urllib.request.urlretrieve(f'https://i.ytimg.com/vi/{vid}/{size}.jpg', p)
                if os.path.getsize(p) > 3000:
                    return Image.open(p).convert('RGB')
            except Exception:
                continue
        sys.exit(f'Could not download a thumbnail for {vid}')
    if src.startswith('http'):
        p = os.path.join(out_dir, 'source.jpg')
        urllib.request.urlretrieve(src, p)
        return Image.open(p).convert('RGB')
    return Image.open(src).convert('RGB')


def pixels(im):
    f = getattr(im, 'get_flattened_data', None)
    return list(f() if f else im.getdata())


def metrics(im):
    small = im.resize((320, 180))
    grey = small.convert('L')
    st = ImageStat.Stat(grey)
    brightness = st.mean[0] / 255
    contrast = st.stddev[0] / 128  # RMS contrast, ~0..1
    px = pixels(small)
    rg = [r - g for r, g, b in px]
    yb = [0.5 * (r + g) - b for r, g, b in px]
    def msd(v):
        m = sum(v) / len(v)
        return m, math.sqrt(sum((x - m) ** 2 for x in v) / len(v))
    (mrg, srg), (myb, syb) = msd(rg), msd(yb)
    colourfulness = (math.sqrt(srg ** 2 + syb ** 2) + 0.3 * math.sqrt(mrg ** 2 + myb ** 2)) / 100  # Hasler & Suesstrunk, scaled
    edges = grey.filter(ImageFilter.FIND_EDGES)
    clutter = sum(1 for v in pixels(edges) if v > 40) / (320 * 180)
    sat = ImageStat.Stat(small.convert('HSV')).mean[1] / 255
    pal = small.quantize(colors=5, method=Image.Quantize.MEDIANCUT)
    counts = sorted(pal.getcolors(), reverse=True)
    palette = pal.getpalette()[:15]
    swatches = [{'hex': '#%02x%02x%02x' % tuple(palette[i * 3:i * 3 + 3]), 'share': round(c / (320 * 180), 3)} for c, i in counts]
    hist = small.resize((64, 36)).convert('RGB').histogram()
    return {
        'brightness': round(brightness, 3), 'contrast': round(contrast, 3), 'colourfulness': round(colourfulness, 3),
        'clutter': round(clutter, 3), 'saturation': round(sat, 3), 'palette': swatches,
    }, hist


def compare(m, bench):
    out = {}
    for k in ('brightness', 'contrast', 'colourfulness', 'clutter', 'saturation'):
        b = bench.get(k)
        if not b:
            continue
        v = m[k]
        where = 'below' if v < b['p25'] else 'above' if v > b['p75'] else 'within'
        out[k] = {'value': v, 'p25': b['p25'], 'median': b['median'], 'p75': b['p75'], 'vs_benchmark': where}
    return out


def build_benchmark(thumbs_dir, out):
    vals = {k: [] for k in ('brightness', 'contrast', 'colourfulness', 'clutter', 'saturation')}
    files = sorted(glob.glob(os.path.join(thumbs_dir, '*.jpg')) + glob.glob(os.path.join(thumbs_dir, '*.png')))
    for f in files:
        m, _ = metrics(Image.open(f).convert('RGB'))
        for k in vals:
            vals[k].append(m[k])
    def q(v, p):
        v = sorted(v); i = (len(v) - 1) * p; lo = int(i)
        return round(v[lo] + (v[min(lo + 1, len(v) - 1)] - v[lo]) * (i - lo), 3)
    bench = {k: {'p25': q(v, .25), 'median': q(v, .5), 'p75': q(v, .75)} for k, v in vals.items()}
    bench['_n'] = len(files)
    bench['_source'] = os.path.abspath(thumbs_dir)
    json.dump(bench, open(out, 'w'), indent=2)
    print(json.dumps(bench, indent=2))


def _font(size=15):
    for f in ('DejaVuSans.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 'Arial.ttf', '/System/Library/Fonts/Supplemental/Arial.ttf'):
        try:
            return ImageFont.truetype(f, size)
        except OSError:
            continue
    return ImageFont.load_default()


FONT = None


def text(dr, xy, s, fill='#111'):
    global FONT
    FONT = FONT or _font()
    dr.text(xy, s, fill=fill, font=FONT)


def audit_sheet(im, m, cmp_, out):
    W, H = 1300, 760
    sheet = Image.new('RGB', (W, H), '#f4f4f2')
    dr = ImageDraw.Draw(sheet)
    sheet.paste(im.resize((640, 360)), (20, 30)); text(dr, (20, 12), 'Original (640px preview)')
    # true-size feed tests on a dark strip
    dr.rectangle((680, 30, 1280, 230), fill='#0f0f0f')
    sheet.paste(im.resize((246, 138), Image.LANCZOS), (700, 60)); text(dr, (700, 42), 'Sidebar 246px', '#ddd')
    sheet.paste(im.resize((168, 94), Image.LANCZOS), (970, 60)); text(dr, (970, 42), 'Phone feed 168px', '#ddd')
    sheet.paste(im.resize((120, 68), Image.LANCZOS), (1160, 60)); text(dr, (1160, 42), '120px', '#ddd')
    # squint + value tests
    squint = im.resize((320, 180)).filter(ImageFilter.GaussianBlur(6))
    sheet.paste(squint.resize((280, 158)), (680, 260)); text(dr, (680, 242), 'Squint test')
    sheet.paste(im.convert('L').convert('RGB').resize((280, 158)), (990, 260)); text(dr, (990, 242), 'Value (greyscale) test')
    # palette
    text(dr, (20, 410), 'Dominant colours')
    x = 20
    for s in m['palette']:
        w = max(30, int(600 * s['share']))
        dr.rectangle((x, 428, x + w, 470), fill=s['hex'])
        text(dr, (x + 2, 474), f"{s['hex']} {int(s['share'] * 100)}%")
        x += w + 6
    # numbers
    y = 520
    text(dr, (20, y - 18), 'Measured' + ('  (vs benchmark p25-p75)' if cmp_ else ''))
    for k in ('contrast', 'colourfulness', 'clutter', 'brightness', 'saturation'):
        line = f"{k:<14} {m[k]:.3f}"
        if k in cmp_:
            c = cmp_[k]
            line += f"   benchmark {c['p25']:.3f}-{c['p75']:.3f}  -> {c['vs_benchmark'].upper()}"
        text(dr, (20, y), line); y += 22
    text(dr, (680, 440), 'How to read it:')
    tips = ['contrast: higher = pops in the feed; low and greyish reads as muddy',
            'colourfulness: very low = flat/grey; very high = can look noisy',
            'clutter: share of pixels on edges; high = busy, hard to read small',
            'squint: one shape (face/hero) and the text block should still dominate',
            'value: it should still read without colour',
            'phone 168px: if the words are unreadable here, cut words, not size']
    for i, t in enumerate(tips):
        text(dr, (680, 462 + i * 22), '- ' + t)
    sheet.save(out)


def pick_feed(feed_dir, vid, im):
    files = sorted(glob.glob(os.path.join(feed_dir, '*.jpg')) + glob.glob(os.path.join(feed_dir, '*.png')))
    files = [f for f in files if not (vid and os.path.basename(f).startswith(vid))]
    # drop exact duplicates of the audited image (e.g. a local copy under another name)
    tiny = im.resize((16, 9)).convert('L').tobytes()
    files = [f for f in files if Image.open(f).convert('L').resize((16, 9)).tobytes() != tiny]
    tsv = os.path.join(os.path.dirname(os.path.abspath(feed_dir)), 'videos.tsv')
    if vid and os.path.exists(tsv):
        order = [l.split('\t')[1] for l in open(tsv).read().splitlines()[1:] if '\t' in l]
        if vid in order:
            i = order.index(vid)
            near = sorted((j for j in range(len(order)) if j != i), key=lambda j: abs(j - i))
            by_id = {os.path.basename(f).split('.')[0]: f for f in files}
            picked = [by_id[order[j]] for j in near if order[j] in by_id][:11]
            if picked:
                return picked, 'uploads published around it'
    random.seed(7)
    return random.sample(files, min(11, len(files))), 'random sample of the folder'


def feed_sheet(im, hist, feed_dir, out, vid=None):
    others, how = pick_feed(feed_dir, vid, im)
    imgs = [Image.open(f).convert('RGB') for f in others]
    pos = min(5, len(imgs))
    imgs.insert(pos, im)
    cols, w, h = 4, 300, 169
    rows = (len(imgs) + cols - 1) // cols
    S = Image.new('RGB', (cols * (w + 16) + 16, rows * (h + 16) + 16), '#0f0f0f')
    dr = ImageDraw.Draw(S)
    for k, x in enumerate(imgs):
        X, Y = 16 + (k % cols) * (w + 16), 16 + (k // cols) * (h + 16)
        S.paste(x.resize((w, h)), (X, Y))
        if k == pos:
            dr.rectangle((X - 3, Y - 3, X + w + 2, Y + h + 2), outline='#ffcc00', width=3)
    S.save(out)
    print(f'feed: {how} ({len(others)} thumbnails)')
    # distinctiveness: L1 distance between this colour histogram and the feed's mean histogram, 0..1
    hs = [x.resize((320, 180)).resize((64, 36)).histogram() for x in imgs if x is not im]
    if not hs:
        return None
    mean = [sum(col) / len(hs) for col in zip(*hs)]
    tot = sum(mean)
    return round(sum(abs(a - b) for a, b in zip(hist, mean)) / (2 * tot), 3)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src', nargs='?')
    ap.add_argument('out', nargs='?')
    ap.add_argument('--feed')
    ap.add_argument('--benchmark', default=BENCH_DEFAULT)
    ap.add_argument('--build-benchmark', nargs=2, metavar=('THUMBS_DIR', 'OUT_JSON'))
    a = ap.parse_args()
    if a.build_benchmark:
        return build_benchmark(*a.build_benchmark)
    if not a.src or not a.out:
        ap.error('need <src> <out_dir>')
    os.makedirs(a.out, exist_ok=True)
    vid = video_id(a.src)
    im = load_image(a.src, a.out)
    meta = oembed(vid) if vid else None
    if meta:
        json.dump(meta, open(os.path.join(a.out, 'video.json'), 'w'), indent=2)
    m, hist = metrics(im)
    bench = json.load(open(a.benchmark)) if a.benchmark and os.path.exists(a.benchmark) else {}
    cmp_ = compare(m, bench) if bench else {}
    audit_sheet(im, m, cmp_, os.path.join(a.out, 'audit.png'))
    result = {'video': meta, 'metrics': m, 'benchmark': {'file': a.benchmark, 'n': bench.get('_n')} if bench else None, 'vs_benchmark': cmp_}
    if a.feed:
        result['distinctiveness'] = feed_sheet(im, hist, a.feed, os.path.join(a.out, 'feed.png'), vid)
    json.dump(result, open(os.path.join(a.out, 'metrics.json'), 'w'), indent=2)
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()

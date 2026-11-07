#!/usr/bin/env python3
"""Whiteboard Wednesdays: recognise what kind of video a Publish source is (PUBLISH.md, "Check the files").

Kinds
  youtube-recording   the narrated screen recording the YouTube master is edited from (role "main")
  phone-recording     Taylor's own upright phone recording for a reel (role "reel": a reel take, used only after
                      reel winners are picked, never by the YouTube or LinkedIn edit)
  finished-reel       a finished 9:16 reel or its 4:5 Instagram post (an OUTPUT, never a source)
  linkedin-cut        the shorter 16:9 LinkedIn cut of the YouTube master (an OUTPUT, never a source)
  other               anything else: not a video, too short, silent vertical B-roll, square, 4:3 ...

Decision per file
  accept   the signals agree; the role can be set without asking
  ask      signals disagree or are missing: show Taylor the reason and let him choose (never guess silently)
  reject   it can never be a source for this job (not a video, an output, an over-length finished reel)
  fileDecision is the same answer from the file alone, without the role it was pasted with: the Check the files screen
  preselects a role only for a file whose fileDecision is accept.

Never silently wrong (classification audit, 7 November 2026): a file is classified correctly or asked.
  - only camera metadata (an iPhone/iPad model tag, Android tags, or HDR with a rotation flag) proves a phone take;
    a phone-style name, HEVC in .mov or a rotation flag alone is asked;
  - the finished-reel check runs first: the exact house reel spec with no camera metadata is an output, whatever
    its name (over 60 s, or with a length that cannot be read, it is asked);
  - a 1920x1080 30 fps house render over 15 min is a finished master export: asked;
  - a header length that does not fit the file size (fragmented MP4) is never trusted: asked;
  - a phone take recorded more than 21 days ago is asked (WW_CLASSIFY_TODAY pins today for tests);
  - a proposed take always needs Taylor's confirm (decision 10).

usage
  classify-video.py <media file> [--name N] [--folder F] [--role main|reel] [--json]
  classify-video.py --probe <ffprobe.json> --name N ...       (ffprobe -show_format -show_streams -of json)
  classify-video.py --drive <driveId> [--role R] [--json]      range-reads only the header (and tail if needed)
  classify-video.py --drive-folder <folderId> [--html F]       lists a shared folder (no key) and classifies each
                                                               file; prints the proposed sources as JSON
  classify-video.py --drive-files <id>[:role[:part]],...       file links: the same proposal as a folder (propose()),
                                                               keeping the role (and part) Taylor pasted; prints JSON
  classify-video.py --main-parts <id1>,<id2>,...               checks Drive files as the ordered parts of ONE main
                                                               recording (older jobs; --drive-files does this too)
A main recording may be made in parts (6 November 2026): landscape recordings with sound whose names carry a part
number ("Part 1", "Pt 2", "- 3", "(2)", "take 2") and that share one picture size are proposed as one main made of
ordered parts (role "main", "part" 1..n, judged on their total length). Missing or repeated numbers, mixed sizes,
copies or an unnumbered recording beside them are asked, never guessed.
A folder's JSON also carries "reels": {path: "A" | "B" | null, takes, why} (Taylor's decision 11): "B" when the main
recording has one or more accepted phone recordings beside it, "A" with the main recording alone, null with no main.
Exit codes: 0 accept (folder: nothing to ask), 3 ask (folder: Taylor must check the files), 4 reject.
Run it with python3 -I. It only reads: a few MB of each file, never a full download.
"""
import json, os, re, subprocess, sys, tempfile, urllib.request

# ---- bands (see collision-report.md, "Recognition rules") -------------------------------------------------
ASPECT = [  # (name, lo, hi) on the DISPLAYED width / height, after the rotation flag
    ('ultrawide', 2.20, 9.99),   # 32:9 = 3.556 (house 3840x1080 screen + camera), 21:9 = 2.37
    ('wide',      1.70, 2.20),   # 16:9 = 1.778
    ('landscape', 1.20, 1.70),   # 4:3 = 1.333, 3:2 = 1.5
    ('square',    0.95, 1.20),
    ('feed',      0.75, 0.95),   # 4:5 = 0.8
    ('tall',      0.50, 0.62),   # 9:16 = 0.5625
]
MIN_S = 3.0            # under this nothing is usable
REEL_MAX_S = 60.0      # master rule 6: a FINISHED reel is 60.0 s at most; a raw phone take may be longer
PHONE_TAKE_MAX_S = 600 # a raw phone take over 10 min is unusual: ask
MAIN_MIN_S = 300       # a YouTube recording under 5 min is unusual: ask
LINKEDIN_MAX_S = 900   # linkedin-framework.md: LinkedIn cuts are 3 s to 15 min, so 16:9 over 15 min is a recording
NAME_HINTS = {
    'linkedin-cut':     r'linked\s*-?in|\bli[-_ ]?cut',
    'finished-reel':    r'\bfinal\b|\bpost[-_ ]?4x5\b|\b4x5\b|\bcover\b',
    'phone-recording':  r'\breels?\b|\bshorts?\b|\btake\b|\bphone\b|\bselfie\b|^img_\d+|^pxl_|^vid_|^mov_\d+',
    'youtube-recording':r'\bmain\b|\byoutube\b|\byt\b|\bmaster\b|\bscreen\b|\bobs\b|\brecording\b',
}
FOLDER_HINTS = {
    'phone-recording':   r'reel|short|phone|vertical|9x16|insta',
    'youtube-recording': r'main|youtube|screen|recording|16x9|32x9|master',
    'linkedin-cut':      r'linkedin',
    'finished-reel':     r'final|ready|export|posted',
}
ROLE_KIND = {'main': 'youtube-recording', 'reel': 'phone-recording'}
MAX_MBPS = 250         # above this the header length cannot be right (iPhone 4K HEVC is ~50, house mains ~2-10)
TAKE_MAX_AGE_D = 21    # a phone take recorded more than 3 weeks ago is asked: it may belong to another video
NOW = os.environ.get('WW_CLASSIFY_TODAY')  # tests pin the date


def ffprobe(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', path], capture_output=True, text=True)
    if r.returncode: return {'error': (r.stderr.strip().splitlines() or ['ffprobe failed'])[-1]}
    return json.loads(r.stdout)


def drive_probe(drive_id, head=4_000_000, tail=8_000_000):
    """Probe a Drive file without downloading it: the first bytes, and (if the MP4 index is at the end) the last bytes,
    written into a sparse file of the real size so ffprobe sees the moov box at its real offset."""
    url = f'https://drive.usercontent.google.com/download?id={drive_id}&export=download&confirm=t'
    def get(rng):
        req = urllib.request.Request(url, headers={'Range': 'bytes=' + rng})
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.read(), r.headers.get('Content-Range', ''), r.headers.get('Content-Disposition', ''), r.headers.get('Content-Type', '')
    body, cr, cd, ct = get(f'0-{head - 1}')
    if 'text/html' in ct: return {'error': 'Drive returned a web page, not the file: not shared as Anyone with the link'}, None
    size = int(cr.rsplit('/', 1)[-1]) if '/' in cr else len(body)
    name = (re.search(r'filename="([^"]+)"', cd) or [None, None])[1]
    d = tempfile.mkdtemp(prefix='drv-'); p = os.path.join(d, 'probe.bin')
    with open(p, 'wb') as f: f.truncate(size); f.write(body)
    j = ffprobe(p)
    if 'error' in j and size > head:
        tb, *_ = get(f'{max(head, size - tail)}-{size - 1}')
        with open(p, 'r+b') as f: f.seek(size - len(tb)); f.write(tb)
        j = ffprobe(p)
    j.setdefault('format', {})['size'] = str(size)
    return j, name


def rotation(v):
    for sd in v.get('side_data_list') or []:
        if 'rotation' in sd: return int(round(float(sd['rotation'])))
    try: return int((v.get('tags') or {}).get('rotate', 0))
    except ValueError: return 0


def fps(v):
    try: a, b = (v.get('avg_frame_rate') or v.get('r_frame_rate') or '0/1').split('/'); return float(a) / float(b) if float(b) else 0.0
    except ValueError: return 0.0


def signals(j, name='', folder=''):
    s = {'name': name, 'folder': folder}
    if 'error' in j: s['error'] = j['error']; return s
    st = j.get('streams', []); fmt = j.get('format', {})
    vids = [x for x in st if x.get('codec_type') == 'video' and not (x.get('disposition') or {}).get('attached_pic')]
    s['audio'] = any(x.get('codec_type') == 'audio' for x in st)
    s['container'] = fmt.get('format_name', '')
    try: s['bytes'] = int(fmt.get('size') or 0)
    except (TypeError, ValueError): s['bytes'] = 0
    try: s['duration'] = float(fmt.get('duration') or (vids[0].get('duration') if vids else 0) or 0)
    except (TypeError, ValueError): s['duration'] = 0.0
    if not vids: return s
    v = vids[0]
    s['codec'] = v.get('codec_name'); s['w'], s['h'] = int(v.get('width') or 0), int(v.get('height') or 0)
    s['rotation'] = rotation(v)
    dw, dh = (s['h'], s['w']) if abs(s['rotation']) % 180 == 90 else (s['w'], s['h'])
    sar = v.get('sample_aspect_ratio') or '1:1'
    try: n, d = map(int, sar.split(':')); dw = dw * n / d if n and d else dw
    except ValueError: pass
    s['dw'], s['dh'] = round(dw), dh
    s['ratio'] = round(dw / dh, 4) if dh else 0
    s['band'] = next((b for b, lo, hi in ASPECT if lo <= s['ratio'] < hi), 'odd')
    s['fps'] = round(fps(v), 3)
    s['image'] = s['codec'] in ('png', 'mjpeg', 'bmp', 'gif', 'webp', 'tiff') and s['duration'] < 1.5
    tags = {k.lower(): str(val) for k, val in {**(fmt.get('tags') or {}), **(v.get('tags') or {})}.items()}
    s['phone'] = sorted(set(
        (['apple-tags'] if any(k.startswith('com.apple.quicktime.make') or k.startswith('com.apple.quicktime.model') for k in tags) else []) +
        (['apple-iphone'] if re.search(r'iphone|ipad', tags.get('com.apple.quicktime.model', ''), re.I) else []) +
        (['android-tags'] if any(k.startswith('com.android') for k in tags) else []) +
        (['hdr-' + v['color_transfer']] if v.get('color_transfer') in ('arib-std-b67', 'smpte2084') else []) +
        (['rotation-flag'] if s['rotation'] else []) +
        (['phone-name'] if re.match(r'(img|pxl|vid|mov)_\d', os.path.basename(name).lower()) else []) +
        (['hevc-mov'] if s['codec'] == 'hevc' and 'mov' in s['container'] and fmt.get('format_name', '').startswith('mov') and os.path.splitext(name)[1].lower() == '.mov' else [])))
    # Audit 7 Nov 2026: only camera metadata proves a phone origin. A phone-style name, HEVC in .mov or a rotation flag
    # alone can be copied onto any file (a finished reel saved as IMG_3094-reel-A.mp4 was accepted as a take).
    s['phone_strong'] = bool({'apple-iphone', 'android-tags'} & set(s['phone'])) or (
        any(x.startswith('hdr-') for x in s['phone']) and 'rotation-flag' in s['phone'])
    s['recorded'] = (tags.get('com.apple.quicktime.creationdate') or tags.get('creation_time') or '')[:10] or None
    s['fragmented'] = bool(re.search(r'iso5|iso6|dash|cmf', str((fmt.get('tags') or {}).get('compatible_brands', '')) + str((fmt.get('tags') or {}).get('major_brand', ''))))
    s['house_render'] = (s['codec'] == 'h264' and v.get('pix_fmt') == 'yuv420p' and v.get('color_range') == 'tv'
                         and v.get('color_space') == 'bt709' and abs(s['fps'] - 30) < 0.01 and not s['rotation']
                         and (s['w'], s['h']) in ((1080, 1920), (1080, 1350), (1920, 1080)))
    s['name_hints'] = name_hints(name)
    s['folder_hints'] = sorted(k for k, rx in FOLDER_HINTS.items() if folder and re.search(rx, folder.lower()))
    return s


def name_hints(name):
    base = os.path.splitext(os.path.basename(name))[0].lower().replace('_', ' ').replace('-', ' ')
    base_raw = os.path.basename(name).lower()
    return sorted(k for k, rx in NAME_HINTS.items() if re.search(rx, base) or re.search(rx, base_raw))


def classify(s, role=None, total=None):
    """Returns (kind, decision, reasons). Order: readable video -> length floor -> displayed shape -> source vs
    output fingerprints -> phone origin -> duration bands -> audio -> name/folder hints (tie-break or conflict only)
    -> the role Taylor chose. total: for one part of a main recorded in parts, the length of all its parts, which the
    landscape length bands use instead of the part's own length."""
    R = []
    def out(kind, decision, *why):
        R.extend(why)
        hints = set(s.get('name_hints', [])) | set(s.get('folder_hints', []))
        other = hints - {kind} - ({'finished-reel'} if kind == 'linkedin-cut' else set())
        if kind in ROLE_KIND.values() and other & {'youtube-recording', 'phone-recording', 'linkedin-cut', 'finished-reel'} and decision == 'accept':
            decision = 'ask'; R.append(f'name/folder says {", ".join(sorted(other))} but the picture says {kind}')
        if role and decision != 'reject':
            want = ROLE_KIND.get(role)
            if want and kind != want:
                R.append(f'chosen role "{role}" expects {want}, the file looks like {kind}')
                decision = 'reject' if kind in ('finished-reel', 'linkedin-cut', 'other') else 'ask'
        return kind, decision, R
    if s.get('error'): return out('other', 'reject', f'not readable as media ({s["error"]})')
    if 'band' not in s: return out('other', 'reject', 'no video stream (audio only)' if s.get('audio') else 'no video stream')
    if s.get('image'): return out('other', 'reject', 'a still image, not a video')
    d = s['duration']; band = s['band']; dd = total or d; R.append(f'{s["w"]}x{s["h"]} rot {s["rotation"]} -> shows {s["dw"]}x{s["dh"]} ({band}, {s["ratio"]}), {d:.1f} s, {s["codec"]}, audio {"yes" if s["audio"] else "no"}')
    # Audit 7 Nov 2026: a fragmented MP4 (OBS "Hybrid MP4", iso5/iso6 brands) reports only its first fragments' length
    # from a header read (a 6-min 1 GB recording read as 2.0 s and was rejected). A length that does not fit the size is
    # never trusted: asked, and measured after the download.
    mbps = (s.get('bytes') or 0) * 8 / d / 1e6 if d > 0 else 0
    trusted = not ((d <= 0 or mbps > MAX_MBPS or s.get('fragmented')) and s.get('bytes', 0) > 4_000_000)
    phone = bool(s['phone'])
    # The finished-output check runs first, before the length check and before any phone hint: only camera metadata
    # (phone_strong) can overrule the exact house render spec. A phone-style name on a finished reel proves nothing.
    if band == 'tall' and s['audio'] and s['house_render'] and not s['phone_strong']:
        if not trusted: return out('phone-recording', 'ask', f'exact house reel render spec, but the length in the header ({d:.1f} s) does not fit the file size ({s["bytes"] / 1e6:.0f} MB): a finished reel or a converted take? confirm')
        if d > REEL_MAX_S + 0.05: return out('phone-recording', 'ask', f'exact house reel render spec but {d:.1f} s, longer than any finished reel (60 s max): a phone take converted to H.264, or an export? confirm')
        return out('finished-reel', 'reject', 'exact 1080x1920 H.264 BT.709 TV-range 30 fps: the house finished-reel spec, an output not a source')
    if band == 'feed' and s['house_render'] and not s['phone_strong']:
        return out('finished-reel', 'reject', '1080x1350 house spec: the 4:5 Instagram post of a finished reel, an output')
    if not trusted and band in ('ultrawide', 'wide', 'landscape', 'tall'):
        k = 'phone-recording' if band == 'tall' else 'youtube-recording'
        return out(k, 'ask', f'the length in the header ({d:.1f} s) does not fit the file size ({s["bytes"] / 1e6:.0f} MB, {mbps:.0f} Mbit/s): probably a fragmented recording; Claude measures it after the download, confirm what it is')
    if d < MIN_S: return out('other', 'reject', f'{d:.1f} s is under {MIN_S:.0f} s')
    if band == 'tall':
        if not s['audio']: return out('other', 'reject', 'silent vertical clip: a B-roll option or screen-share B-roll, not a recording (reels need Taylor\'s own voice)')
        if d > PHONE_TAKE_MAX_S: return out('phone-recording', 'ask', f'{d/60:.1f} min vertical: longer than any reel take so far; confirm it is a reel recording')
        why = 'vertical with phone origin (' + ', '.join(s['phone']) + ')' if phone else 'vertical, not the house render spec'
        if not phone: return out('phone-recording', 'ask', why + '; no phone metadata, so confirm it is a fresh phone recording, not something made from the YouTube video or an AI video')
        if not s['phone_strong']: return out('phone-recording', 'ask', why + '; no camera metadata (only a phone-style name, codec or rotation), so confirm it is a fresh phone recording, not an export, a crop of the YouTube video or an AI video')
        return out('phone-recording', 'accept', why + ('; over 60 s is fine for a raw take (it is cut to 60 s)' if d > REEL_MAX_S else ''))
    if band == 'feed':
        return out('other', 'ask', '4:5 source: reels are recorded 9:16; ask what it is')
    if band == 'ultrawide':
        if dd < MAIN_MIN_S: return out('youtube-recording', 'ask', f'house 32:9-style layout but only {dd:.0f} s{" in all its parts" if total else ""}: a test take? confirm')
        if not s['audio']: return out('youtube-recording', 'ask', 'no audio track: the YouTube master needs the narration')
        return out('youtube-recording', 'accept', f'ultrawide screen + camera layout, {d/60:.1f} min')
    if band == 'wide':
        if phone: return out('other', 'ask', 'landscape phone video (' + ', '.join(s['phone']) + '): not a 9:16 reel recording and not the screen recording; ask')
        if 'linkedin-cut' in s['name_hints'] or 'linkedin-cut' in s['folder_hints']:
            return out('linkedin-cut', 'reject', 'named as the LinkedIn cut: an output of the YouTube master')
        if dd > LINKEDIN_MAX_S and s['house_render']:
            return out('youtube-recording', 'ask', f'exact 1920x1080 30 fps house render, {dd/60:.1f} min: looks like a finished YouTube master export, not the raw recording; confirm')
        if dd > LINKEDIN_MAX_S:
            if not s['audio']: return out('youtube-recording', 'ask', 'no audio track: the YouTube master needs the narration')
            return out('youtube-recording', 'accept', f'16:9 and {dd/60:.1f} min{" in all its parts" if total else ""}, longer than any LinkedIn cut (15 min max)')
        if s['house_render']: return out('linkedin-cut', 'ask', f'exact 1920x1080 30 fps house render and {d/60:.1f} min: looks like the LinkedIn cut or a finished master; confirm')
        if dd < MAIN_MIN_S: return out('youtube-recording', 'ask', f'16:9 but only {dd:.0f} s: confirm it is the main recording')
        return out('youtube-recording', 'ask', f'16:9 {dd/60:.1f} min: within LinkedIn-cut length; confirm it is the raw recording')
    if band == 'landscape':
        return out('youtube-recording', 'ask', f'{s["ratio"]}:1 landscape is not the house 32:9 or 16:9 layout; confirm')
    return out('other', 'ask', f'{band} shape ({s["ratio"]}): neither a recording nor a reel')


def job_check(files):
    """Job-level rule on a list of (kind, decision, role, key[, part]). Returns the blocking problems. Several mains are
    one main recording in parts only when every one has a part number and they run 1..n."""
    p = []
    mains = [f for f in files if f[2] == 'main']; reels = [f for f in files if f[2] == 'reel']
    if not mains: p.append('0 main videos: exactly one is required')
    elif len(mains) > 1:
        parts = sorted((f[4] if len(f) > 4 else None) or 0 for f in mains)
        if parts != list(range(1, len(mains) + 1)): p.append(f'{len(mains)} main videos: exactly one is required, or its parts numbered 1 to {len(mains)}')
    if len(reels) > 5: p.append('more than five reels')
    if any(f[0] != 'youtube-recording' for f in mains): p.append('the main video is not a YouTube recording')
    if any(f[0] != 'phone-recording' for f in reels): p.append('a reel source is not a phone recording')
    keys = [f[3] for f in files if f[3]]
    if len(keys) != len(set(keys)): p.append('the same file is listed twice')
    if any(f[1] != 'accept' for f in files): p.append('some files need Taylor to confirm')
    return p



# ---- folder intake (Phase 2, 4 November 2026) ----------------------------------------------------------------
LABEL = {'youtube-recording': 'main', 'phone-recording': 'reel'}


def list_folder(folder_id, html=None):
    """List a folder shared as Anyone with the link, with no key: Drive's embedded folder view. Returns
    (folder name, [(file id, file name)], [subfolder ids]). Subfolders are reported, never opened."""
    if html is None:
        url = 'https://drive.google.com/embeddedfolderview?id=' + folder_id
        with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60) as r:
            html = r.read().decode('utf-8', 'replace')
    import html as H
    title = re.search(r'<title>([^<]*)</title>', html)
    files, subs = [], []
    for m in re.finditer(r'<div class="flip-entry" id="entry-([\w-]+)".*?<a href="([^"]+)".*?class="flip-entry-title">([^<]*)<', html, re.S):
        fid, href, name = m.group(1), m.group(2), H.unescape(m.group(3)).strip()
        (subs if '/folders/' in href else files).append(fid if '/folders/' in href else (fid, name))
    return (H.unescape(title.group(1)).strip() if title else ''), files, subs


def probe_summary(s):
    if 'band' not in s: return {'audio': bool(s.get('audio')), 'seconds': round(s.get('duration') or 0, 1)}
    return {'width': s['dw'], 'height': s['dh'], 'storedWidth': s['w'], 'storedHeight': s['h'], 'rotation': s['rotation'],
            'band': s['band'], 'seconds': round(s['duration'], 1), 'audio': s['audio'], 'codec': s['codec'],
            **({'bytes': s['bytes']} if s.get('bytes') else {})}


WORDNUM = {w: i + 1 for i, w in enumerate('one two three four five six seven eight nine ten'.split())}
PART_RX = [  # tried in order on the lower-case base name (underscores as spaces); group 1 is the part number
    r'\b(?:part|pt)\.?\s*[-#]?\s*(\d{1,2}|' + '|'.join(WORDNUM) + r')\b',
    r'\btake\s*[-#]?\s*(\d{1,2})\b',
    r'\((\d{1,2})\)\s*$',
    r'(?:^|\s)[-\u2013\u2014]\s*(\d{1,2})\s*$',
]


def part_of(name):
    """('Top 50 - Part 2.mp4') -> (2, 'top 50'); a name with no part number -> (None, its words)."""
    low = os.path.splitext(os.path.basename(name or ''))[0].lower().replace('_', ' ')
    for rx in PART_RX:
        m = re.search(rx, low)
        if m:
            g = m.group(1); n = WORDNUM.get(g) or int(g)
            return n, re.sub(r'[\W_]+', ' ', low[:m.start()] + ' ' + low[m.end():]).strip()
    return None, re.sub(r'[\W_]+', ' ', low).strip()


def clock(sec):
    sec = int(round(sec)); return f'{sec // 3600}:{sec % 3600 // 60:02d}:{sec % 60:02d}' if sec >= 3600 else f'{sec // 60}:{sec % 60:02d}'


def _similar(a, b):
    wa, wb = set(a.split()), set(b.split())
    return not wa and not wb or (len(wa & wb) / len(wa | wb) if wa | wb else 0) >= 0.5


def _recheck(r, total):
    """A part judged as part of the whole: its name without the part number (so "take 2" is no phone hint) and the
    total length of all the parts."""
    s = r.get('_s')
    if not s: return r['decision'], r['reason']
    s2 = dict(s, name_hints=name_hints(re.sub(PART_RX[1], ' ', os.path.basename(s.get('name') or r['name']).lower())))
    k, d, why = classify(s2, total=total)
    return (d if k == 'youtube-recording' else 'ask'), '; '.join(why[1:] or why)


def check_parts(members):
    """members: the rows of one main recording in part order. Returns the problems that make it ambiguous (empty when
    they can be joined as they are) and the total length."""
    issues = []
    total = round(sum(r['probe'].get('seconds') or 0 for r in members), 1)
    sizes = {(r['probe'].get('width'), r['probe'].get('height')) for r in members}
    if len(sizes) > 1: issues.append('the parts are not all one size (' + ', '.join(f'{w}x{h}' for w, h in sorted(sizes, key=str)) + ')')
    if any(r['kind'] != 'youtube-recording' or not r['probe'].get('audio') for r in members): issues.append('every part must be a landscape recording with sound')
    seen = {}
    for r in members:
        k = (round(r['probe'].get('seconds') or 0), r['probe'].get('bytes') or r['probe'].get('seconds'))
        if k in seen: issues.append(f'"{r["name"]}" looks like a copy of "{seen[k]}" (same length and size)')
        else: seen[k] = r['name']
    if total < MAIN_MIN_S: issues.append(f'the parts add up to only {clock(total)}')
    return issues, total


def propose(rows, given_main=None):
    """rows: dicts with name, kind, decision, reason, probe (and _s, the signals). Sets role (main | reel | skip), and
    part on the parts of a main recorded in parts, and returns the job-level problems.
    The main recording is either the one landscape recording with sound, 5 minutes or longer, or (6 November 2026)
    several landscape recordings with sound named with part numbers, of one size, joined in part order. Anything
    else with more than one possible main is asked, never guessed. Phone recordings become reel takes. Outputs and
    anything else are left out.
    Audit 7 Nov 2026: a phone recording is a reel take only when its own evidence is sure (camera metadata) and it was
    recorded in the last 21 days; anything unsure has role None (Taylor chooses). Every row gets fileDecision, the
    decision from the file alone (no pasted role), which is what the Check the files screen preselects from.
    given_main: for file links, the rows Taylor pasted as the main recording's parts, in his order (2 or more). They are
    judged together as one main (parts_rows) instead of being found by name."""
    cands = [r for r in rows if r['kind'] == 'youtube-recording' and r['decision'] != 'reject' and r['probe'].get('audio')]
    for r in rows:
        r['role'] = 'reel' if r['kind'] == 'phone-recording' and r['decision'] == 'accept' else None if r['kind'] == 'phone-recording' and r['decision'] == 'ask' else 'skip'
        r.pop('part', None)
    p = []
    import datetime as _dt
    today = _dt.date.fromisoformat(NOW) if NOW else _dt.date.today()
    for r in rows:
        rec = (r.get('_s') or {}).get('recorded') or r.get('recorded')
        if r['role'] == 'reel' and rec:
            try: age = (today - _dt.date.fromisoformat(rec)).days
            except ValueError: continue
            if age > TAKE_MAX_AGE_D:
                r['role'] = None; r['decision'] = 'ask'; r['reason'] += f'; recorded {rec}, {age} days ago: is it a take for this video?'
    numbered = [(part_of(r['name']), r) for r in cands]
    parts = [(n, stem, r) for (n, stem), r in numbered if n is not None]
    if given_main:
        p += parts_rows(given_main)
        others = [r for r in cands if r not in given_main and (r['probe'].get('seconds') or 0) >= MAIN_MIN_S]
        if others:
            p.append('another landscape recording could be the main recording: Taylor chooses')
            for r in others: r['role'] = None; r['decision'] = 'ask'; r['reason'] += '; another possible main recording beside the parts Taylor gave'
    elif len(parts) >= 2:
        parts.sort(key=lambda x: (x[0], x[2]['name']))
        members = [r for _, _, r in parts]; ns = [n for n, _, _ in parts]
        issues, total = check_parts(members)
        dup = sorted({n for n in ns if ns.count(n) > 1})
        if dup: issues.append('more than one file is part ' + ', '.join(map(str, dup)))
        elif ns != list(range(1, len(ns) + 1)): issues.append('the part numbers ' + ', '.join(map(str, ns)) + ' do not run 1 to ' + str(len(ns)))
        if not all(_similar(parts[0][1], stem) for _, stem, _ in parts[1:]): issues.append('the names before the part numbers differ')
        loose = [r for (n, _), r in numbered if n is None and (r['probe'].get('seconds') or 0) >= MAIN_MIN_S]
        if loose: issues.append(', '.join(f'"{r["name"]}"' for r in loose) + ' has no part number: is it a part, or the whole recording?')
        if issues:
            p.append(f'The main recording looks like {len(members)} parts, but ' + '; '.join(issues) + ': Taylor checks the parts')
            for n, _, r in parts: r['role'] = None; r['decision'] = 'ask'; r['part'] = n; r['reason'] += f'; part {n}? ' + '; '.join(issues)
            for r in loose: r['role'] = None; r['decision'] = 'ask'; r['reason'] += '; it could be the main recording, or a part of it'
        else:
            for i, r in enumerate(members, 1):
                d, why = _recheck(r, total)
                r['role'] = 'main'; r['part'] = i; r['decision'] = d  # judged as a part of the whole
                r['reason'] = why + f'; part {i} of {len(members)} of one main recording, {clock(total)} in all'
    else:
        mains = [r for r in cands if (r['probe'].get('seconds') or 0) >= MAIN_MIN_S]
        if len(mains) == 1:
            mains[0]['role'] = 'main'
            if parts and parts[0][2] is mains[0] and parts[0][0] > 1:
                mains[0]['role'] = None; mains[0]['decision'] = 'ask'
                mains[0]['reason'] += f'; named part {parts[0][0]}, but no other part is in the folder'
                p.append('The main recording is named as a part, but its other parts are not in the folder')
        elif not mains: p.append('no main recording found: no landscape recording with sound of 5 minutes or more')
        else:
            p.append(f'{len(mains)} possible main recordings: Taylor chooses one')
            for r in mains: r['role'] = None; r['decision'] = 'ask'; r['reason'] += '; one of several possible main recordings'
    if sum(r['role'] == 'reel' for r in rows) > 5: p.append('more than five phone recordings')
    if any(r['role'] == 'reel' for r in rows): p.append('phone take(s) beside the main recording: Taylor confirms before the reels start (decision 10)')
    for r in rows:
        if r['decision'] == 'ask' and r['role'] == 'skip' and r['kind'] == 'youtube-recording': r['role'] = None
        r['fileDecision'] = r['decision']  # rows here carry no pasted role: this is the file's own decision
    if any(r['decision'] != 'accept' for r in rows): p.append('some files need Taylor to confirm')
    return p


def main_of(rows):
    """The proposed main recording: {parts: [driveId in part order], seconds: total}, or None."""
    m = sorted((r for r in rows if r.get('role') == 'main'), key=lambda r: r.get('part') or 0)
    return {'parts': [r.get('driveId') for r in m], 'seconds': round(sum(r['probe'].get('seconds') or 0 for r in m), 1)} if m else None


def reels_path(rows):
    """The reels path the folder's files decide (Taylor's decision 11, 6 November 2026), never asked of Taylor:
    "A" with only the main recording (six highlight ideas, pick two, record them), "B" with the main recording AND one
    or more phone recordings (reels cut straight from the takes), None when there is no main recording (a phone take
    alone is refused: Path B needs the main recording's screen share for its B-roll)."""
    main = main_of(rows)
    takes = [r.get('driveId') for r in rows if r.get('role') == 'reel' and r.get('kind') == 'phone-recording' and r.get('decision') == 'accept']
    if not main:
        return {'path': None, 'takes': takes, 'why': 'No main recording: a phone take alone cannot make reels' if takes else 'No main recording'}
    if takes:
        return {'path': 'B', 'takes': takes, 'why': f'{len(takes)} phone recording{"s" if len(takes) > 1 else ""} beside the main recording: reels are cut straight from {"them" if len(takes) > 1 else "it"}'}
    return {'path': 'A', 'takes': [], 'why': 'Only the main recording: six highlight ideas to pick from and record'}


def drive_row(fid, fname=None, role=None):
    try: j, dn = drive_probe(fid)
    except Exception as e: j, dn = {'error': str(e)}, None
    s = signals(j, fname or dn or fid); kind, decision, why = classify(s, role)
    own = classify(s)[1]
    return {'driveId': fid, 'fileDecision': own, 'recorded': s.get('recorded'), 'name': fname or dn or fid, 'url': f'https://drive.google.com/file/d/{fid}/view',
            'kind': kind, 'decision': decision, 'reason': '; '.join(why[1:] or why), 'probe': probe_summary(s), '_s': s}


def classify_folder(folder_id, html=None):
    name, files, subs = list_folder(folder_id, html)
    rows = [drive_row(fid, fname) for fid, fname in files]
    problems = propose(rows)
    for r in rows: r.pop('_s', None)
    if subs: problems.append(f'{len(subs)} subfolder(s) not read: put every file directly in the folder')
    return {'folderId': folder_id, 'folderName': name, 'sources': rows, 'main': main_of(rows), 'reels': reels_path(rows), 'problems': problems, 'needsCheck': bool(problems)}


def parts_rows(rows):
    """rows: one main recording's parts in Taylor's order (file links). Each is judged on the total length; returns the
    problems (empty when the parts can be joined in this order)."""
    issues, total = check_parts(rows)
    for i, r in enumerate(rows, 1):
        d, why = _recheck(r, total) if r['kind'] == 'youtube-recording' else (r['decision'], r['reason'])
        r['role'] = 'main'; r['part'] = i; r['decision'] = 'ask' if issues and d == 'accept' else d; r['fileDecision'] = r['decision']
        r['reason'] = why + f'; part {i} of {len(rows)} of one main recording, {clock(total)} in all' + ('; ' + '; '.join(issues) if issues else '')
    p = [f'The {len(rows)} parts of the main recording cannot be joined as they are: ' + '; '.join(issues)] if issues else []
    if any(r['decision'] != 'accept' for r in rows): p.append('some parts need Taylor to confirm')
    return p


SEVERITY = {'accept': 0, 'ask': 1, 'reject': 2}


def files_rows(rows, specs):
    """File links (audit 7 Nov 2026): the same proposal as a folder. rows: drive_row(..., role=None) for each pasted file;
    specs: [(driveId, pasted role or None, pasted part or None)] in Taylor's order. Each row keeps the role Taylor pasted
    (pastedRole, pastedPart), gets proposedRole from propose() (what the files themselves say), fileDecision (the file
    alone) and decision (the worse of fileDecision and the file judged against its pasted role). Returns the problems."""
    for r, (_, role, part) in zip(rows, specs): r['pastedRole'] = role; r['pastedPart'] = part
    kept = [r for r in rows if r['pastedRole'] != 'skip']   # a file Taylor left out is never proposed for anything
    # The parts Taylor numbered himself (2 or more) are one main, in his order. A file pasted as main with no part
    # number beside them (often the phone take, pasted first) is judged by its own shape like any other file.
    given = [r for r in kept if r['pastedRole'] == 'main' and r['pastedPart']]
    given = sorted(given, key=lambda r: r['pastedPart']) if len(given) >= 2 else None
    p = propose(kept, given_main=given)
    for r in rows:
        if r['pastedRole'] == 'skip': r['role'] = 'skip'; r['fileDecision'] = r['decision']
        r['proposedRole'] = r.pop('role')
        role = r['pastedRole']
        if role in ROLE_KIND and role != r['proposedRole'] and r.get('_s'):
            k, d, why = classify(r['_s'], role)   # the file judged against the role it was pasted with
            if SEVERITY[d] > SEVERITY[r['decision']]:
                r['decision'] = d; r['reason'] += '; ' + why[-1]
            if r['decision'] == 'accept':
                r['decision'] = 'ask'; r['reason'] += '; pasted as ' + role + ', but the files say ' + (r['proposedRole'] or 'Taylor must choose')
    if any(r['pastedRole'] in ROLE_KIND and r['pastedRole'] != r['proposedRole'] for r in rows):
        p.append('a file was pasted with a role its shape does not fit: Taylor confirms the roles')
    if any(r['decision'] != 'accept' for r in rows) and 'some files need Taylor to confirm' not in p:
        p.append('some files need Taylor to confirm')
    return p


def classify_files(specs):
    rows = [drive_row(fid) for fid, _, _ in specs]
    problems = files_rows(rows, specs)
    for r in rows: r.pop('_s', None)
    proposal = [dict(r, role=r['proposedRole'], decision=r['fileDecision']) for r in rows]   # what the files alone say
    return {'sources': rows, 'main': main_of(proposal), 'reels': reels_path(proposal), 'problems': problems, 'needsCheck': bool(problems)}


def parse_specs(arg):
    """'id1:main:1,id2:main:2,id3:reel,id4' -> [(id, role, part)]"""
    out = []
    for x in [x for x in re.split(r'[\s,]+', arg) if x]:
        fid, role, part = (x.split(':') + [None, None])[:3]
        out.append((fid, role if role in ('main', 'reel', 'skip') else None, int(part) if part and part.isdigit() else None))
    return out


def classify_parts(ids):
    rows = [drive_row(fid, role='main') for fid in ids]
    problems = parts_rows(rows)
    for r in rows: r.pop('_s', None)
    return {'sources': rows, 'main': main_of(rows), 'problems': problems, 'needsCheck': bool(problems)}


def main(a):
    def opt(n, default=None):
        if n not in a: return default
        i = a.index(n); v = a[i + 1]; del a[i:i + 2]; return v
    name, folder, role, probe, drive = opt('--name', ''), opt('--folder', ''), opt('--role'), opt('--probe'), opt('--drive')
    dfolder, html, mparts, dfiles = opt('--drive-folder'), opt('--html'), opt('--main-parts'), opt('--drive-files')
    as_json = '--json' in a; a = [x for x in a if x != '--json']
    if dfolder:
        r = classify_folder(dfolder, open(html, encoding='utf-8').read() if html else None)
        print(json.dumps(r, indent=1)); sys.exit(3 if r['needsCheck'] else 0)
    if dfiles:
        r = classify_files(parse_specs(dfiles))
        print(json.dumps(r, indent=1)); sys.exit(4 if any(x['decision'] == 'reject' for x in r['sources']) else 3 if r['needsCheck'] else 0)
    if mparts:
        r = classify_parts([x for x in re.split(r'[\s,]+', mparts) if x])
        print(json.dumps(r, indent=1)); sys.exit(4 if any(x['decision'] == 'reject' for x in r['sources']) else 3 if r['needsCheck'] else 0)
    if drive: j, dn = drive_probe(drive); name = name or dn or drive
    elif probe: j = json.load(open(probe))
    elif a: j = ffprobe(a[0]); name = name or os.path.basename(a[0])
    else: print(__doc__); sys.exit(2)
    s = signals(j, name, folder); kind, decision, why = classify(s, role)
    r = {'name': name, 'kind': kind, 'decision': decision, 'fileDecision': classify(s)[1], 'reasons': why, 'signals': s}
    print(json.dumps(r, indent=1) if as_json else f'{name}: {kind} / {decision}\n  ' + '\n  '.join(why))
    sys.exit({'accept': 0, 'ask': 3, 'reject': 4}[decision])


if __name__ == '__main__':
    main(sys.argv[1:])

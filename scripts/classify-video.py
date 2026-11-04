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

usage
  classify-video.py <media file> [--name N] [--folder F] [--role main|reel] [--json]
  classify-video.py --probe <ffprobe.json> --name N ...       (ffprobe -show_format -show_streams -of json)
  classify-video.py --drive <driveId> [--role R] [--json]      range-reads only the header (and tail if needed)
  classify-video.py --drive-folder <folderId> [--html F]       lists a shared folder (no key) and classifies each
                                                               file; prints the proposed sources as JSON
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
        (['android-tags'] if any(k.startswith('com.android') for k in tags) else []) +
        (['hdr-' + v['color_transfer']] if v.get('color_transfer') in ('arib-std-b67', 'smpte2084') else []) +
        (['rotation-flag'] if s['rotation'] else []) +
        (['phone-name'] if re.match(r'(img|pxl|vid|mov)_\d', os.path.basename(name).lower()) else []) +
        (['hevc-mov'] if s['codec'] == 'hevc' and 'mov' in s['container'] and fmt.get('format_name', '').startswith('mov') and os.path.splitext(name)[1].lower() == '.mov' else [])))
    s['house_render'] = (s['codec'] == 'h264' and v.get('pix_fmt') == 'yuv420p' and v.get('color_range') == 'tv'
                         and v.get('color_space') == 'bt709' and abs(s['fps'] - 30) < 0.01 and not s['rotation']
                         and (s['w'], s['h']) in ((1080, 1920), (1080, 1350), (1920, 1080)))
    base = os.path.splitext(os.path.basename(name))[0].lower().replace('_', ' ').replace('-', ' ')
    base_raw = os.path.basename(name).lower()
    s['name_hints'] = sorted(k for k, rx in NAME_HINTS.items() if re.search(rx, base) or re.search(rx, base_raw))
    s['folder_hints'] = sorted(k for k, rx in FOLDER_HINTS.items() if folder and re.search(rx, folder.lower()))
    return s


def classify(s, role=None):
    """Returns (kind, decision, reasons). Order: readable video -> length floor -> displayed shape -> source vs
    output fingerprints -> phone origin -> duration bands -> audio -> name/folder hints (tie-break or conflict only)
    -> the role Taylor chose."""
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
    d = s['duration']; band = s['band']; R.append(f'{s["w"]}x{s["h"]} rot {s["rotation"]} -> shows {s["dw"]}x{s["dh"]} ({band}, {s["ratio"]}), {d:.1f} s, {s["codec"]}, audio {"yes" if s["audio"] else "no"}')
    if d < MIN_S: return out('other', 'reject', f'{d:.1f} s is under {MIN_S:.0f} s')
    phone = bool(s['phone'])
    if band == 'tall':
        if not s['audio']: return out('other', 'reject', 'silent vertical clip: a B-roll option or screen-share B-roll, not a recording (reels need Taylor\'s own voice)')
        if s['house_render'] and not phone:
            if d > REEL_MAX_S + 0.05: return out('finished-reel', 'reject', f'finished-reel render spec but {d:.1f} s is over the 60.0 s maximum (master rule 6)')
            return out('finished-reel', 'reject', 'exact 1080x1920 H.264 BT.709 TV-range 30 fps: the house finished-reel spec, an output not a source')
        if d > PHONE_TAKE_MAX_S: return out('phone-recording', 'ask', f'{d/60:.1f} min vertical: longer than any reel take so far; confirm it is a reel recording')
        why = 'vertical with phone origin (' + ', '.join(s['phone']) + ')' if phone else 'vertical, not the house render spec'
        if not phone: return out('phone-recording', 'ask', why + '; no phone metadata, so confirm it is a fresh phone recording, not something made from the YouTube video')
        return out('phone-recording', 'accept', why + ('; over 60 s is fine for a raw take (it is cut to 60 s)' if d > REEL_MAX_S else ''))
    if band == 'feed':
        if s['house_render'] and not phone: return out('finished-reel', 'reject', '1080x1350 house spec: the 4:5 Instagram post of a finished reel, an output')
        return out('other', 'ask', '4:5 source: reels are recorded 9:16; ask what it is')
    if band == 'ultrawide':
        if d < MAIN_MIN_S: return out('youtube-recording', 'ask', f'house 32:9-style layout but only {d:.0f} s: a test take? confirm')
        if not s['audio']: return out('youtube-recording', 'ask', 'no audio track: the YouTube master needs the narration')
        return out('youtube-recording', 'accept', f'ultrawide screen + camera layout, {d/60:.1f} min')
    if band == 'wide':
        if phone: return out('other', 'ask', 'landscape phone video (' + ', '.join(s['phone']) + '): not a 9:16 reel recording and not the screen recording; ask')
        if 'linkedin-cut' in s['name_hints'] or 'linkedin-cut' in s['folder_hints']:
            return out('linkedin-cut', 'reject', 'named as the LinkedIn cut: an output of the YouTube master')
        if d > LINKEDIN_MAX_S:
            if not s['audio']: return out('youtube-recording', 'ask', 'no audio track: the YouTube master needs the narration')
            return out('youtube-recording', 'accept', f'16:9 and {d/60:.1f} min, longer than any LinkedIn cut (15 min max)')
        if s['house_render']: return out('linkedin-cut', 'ask', f'exact 1920x1080 30 fps house render and {d/60:.1f} min: looks like the LinkedIn cut or a finished master; confirm')
        if d < MAIN_MIN_S: return out('youtube-recording', 'ask', f'16:9 but only {d:.0f} s: confirm it is the main recording')
        return out('youtube-recording', 'ask', f'16:9 {d/60:.1f} min: within LinkedIn-cut length; confirm it is the raw recording')
    if band == 'landscape':
        return out('youtube-recording', 'ask', f'{s["ratio"]}:1 landscape is not the house 32:9 or 16:9 layout; confirm')
    return out('other', 'ask', f'{band} shape ({s["ratio"]}): neither a recording nor a reel')


def job_check(files):
    """Job-level rule on a list of (kind, decision, role, key). Returns the blocking problems."""
    p = []
    mains = [f for f in files if f[2] == 'main']; reels = [f for f in files if f[2] == 'reel']
    if len(mains) != 1: p.append(f'{len(mains)} main videos: exactly one is required')
    if len(reels) > 5: p.append('more than five reels')
    if mains and mains[0][0] != 'youtube-recording': p.append('the main video is not a YouTube recording')
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
            'band': s['band'], 'seconds': round(s['duration'], 1), 'audio': s['audio'], 'codec': s['codec']}


def propose(rows):
    """rows: dicts with kind, decision, probe. Sets role (main | reel | skip) and returns the job-level problems.
    Exactly one landscape recording with sound, 5 minutes or longer, becomes the main; more than one is asked, never
    guessed. Phone recordings become reel takes. Outputs and anything else are left out."""
    mains = [r for r in rows if r['kind'] == 'youtube-recording' and r['decision'] != 'reject'
             and r['probe'].get('audio') and r['probe'].get('seconds', 0) >= MAIN_MIN_S]
    for r in rows:
        r['role'] = 'reel' if r['kind'] == 'phone-recording' and r['decision'] != 'reject' else 'skip'
        if r['kind'] == 'youtube-recording' and r['decision'] != 'reject': r['role'] = 'skip'
    p = []
    if len(mains) == 1: mains[0]['role'] = 'main'
    elif not mains: p.append('no main recording found: no landscape recording with sound of 5 minutes or more')
    else:
        p.append(f'{len(mains)} possible main recordings: Taylor chooses one')
        for r in mains: r['role'] = None; r['decision'] = 'ask'; r['reason'] += '; one of several possible main recordings'
    if sum(r['role'] == 'reel' for r in rows) > 5: p.append('more than five phone recordings')
    if any(r['decision'] != 'accept' for r in rows): p.append('some files need Taylor to confirm')
    return p


def classify_folder(folder_id, html=None):
    name, files, subs = list_folder(folder_id, html)
    rows = []
    for fid, fname in files:
        try: j, dn = drive_probe(fid)
        except Exception as e: j, dn = {'error': str(e)}, None
        s = signals(j, fname or dn or fid); kind, decision, why = classify(s)
        rows.append({'driveId': fid, 'name': fname or dn or fid, 'url': f'https://drive.google.com/file/d/{fid}/view',
                     'kind': kind, 'decision': decision, 'reason': '; '.join(why[1:] or why), 'probe': probe_summary(s)})
    problems = propose(rows)
    if subs: problems.append(f'{len(subs)} subfolder(s) not read: put every file directly in the folder')
    return {'folderId': folder_id, 'folderName': name, 'sources': rows, 'problems': problems, 'needsCheck': bool(problems)}


def main(a):
    def opt(n, default=None):
        if n not in a: return default
        i = a.index(n); v = a[i + 1]; del a[i:i + 2]; return v
    name, folder, role, probe, drive = opt('--name', ''), opt('--folder', ''), opt('--role'), opt('--probe'), opt('--drive')
    dfolder, html = opt('--drive-folder'), opt('--html')
    as_json = '--json' in a; a = [x for x in a if x != '--json']
    if dfolder:
        r = classify_folder(dfolder, open(html, encoding='utf-8').read() if html else None)
        print(json.dumps(r, indent=1)); sys.exit(3 if r['needsCheck'] else 0)
    if drive: j, dn = drive_probe(drive); name = name or dn or drive
    elif probe: j = json.load(open(probe))
    elif a: j = ffprobe(a[0]); name = name or os.path.basename(a[0])
    else: print(__doc__); sys.exit(2)
    s = signals(j, name, folder); kind, decision, why = classify(s, role)
    r = {'name': name, 'kind': kind, 'decision': decision, 'reasons': why, 'signals': s}
    print(json.dumps(r, indent=1) if as_json else f'{name}: {kind} / {decision}\n  ' + '\n  '.join(why))
    sys.exit({'accept': 0, 'ask': 3, 'reject': 4}[decision])


if __name__ == '__main__':
    main(sys.argv[1:])

#!/usr/bin/env python3
"""The split-screen gate for finished reels (Taylor, 10 November 2026: "The reel needs to come out split screen").

Every finished reel is the Suby Shots - Split Screen Katana format (master rule 10): his real face from the phone take in
the bottom half (1080x960), the motion above it (Katana, Blender, story films, screen-share B-roll, web clips), a thin
seam across the middle. It opens on his full face for the hook and may punch to one full-frame shot, so the gate looks at
frames sampled across the whole reel and asks that most of them are split.

    python3 -I scripts/check-split-screen.py <reel.mp4> [--id A] [--every 1.0] [--skip-start 3.5] [--skip-end 1.5]
                                             [--min-split 0.6] [--method auto|yunet|heuristic] [--yunet <model.onnx>]
                                             [--json] [--out qa/split-screen-A.json]
    python3 -I scripts/check-split-screen.py --frames f1.png f2.png ... [--json]      (still frames, for tests)

A frame is split when:
  - it is upright (taller than wide), so the seam sits at half its height (y 960 of 1920; y 675 of the 1080x1350 4:5 post);
  - the picture breaks across that line: the rows just above and just below the seam differ far more than rows do
    elsewhere in the frame (the two panels hold different pictures, and the seam rule is drawn there);
  - a face sits wholly inside the bottom panel and no face crosses the seam or sits in the top panel.
Faces come from YuNet (the face model the edit skill already ships, scripts/broll/face_detection_yunet_2023mar.onnx, with
opencv-python-headless) when it is there, else from a plain skin-and-texture test that needs only numpy and Pillow.
The reel passes when at least --min-split (60 %) of the sampled frames between the hook and the end plate are split.
Exit 0 PASS, 1 FAIL, 2 the file could not be read.
"""
import argparse, glob, json, os, subprocess, sys

import numpy as np

SEAM_RATIO = 3.0      # the break at the seam must be this many times the frame's usual row-to-row change
SEAM_MIN = 10.0       # and at least this large on a 0-255 scale (a flat frame has no seam)
MIN_SPLIT = 0.6       # share of the sampled frames that must be split
YUNET_NAME = 'face_detection_yunet_2023mar.onnx'


# ---- reading frames ------------------------------------------------------------------------------------------------------
def probe(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration',
                          '-of', 'json', path], capture_output=True, text=True)
    if out.returncode: raise SystemExit(2)
    j = json.loads(out.stdout or '{}'); s = (j.get('streams') or [{}])[0]
    return int(s.get('width') or 0), int(s.get('height') or 0), float((j.get('format') or {}).get('duration') or 0)


def video_frames(path, every, skip_start, skip_end):
    """(t, rgb uint8 frame) every `every` seconds between the hook and the end plate."""
    w, h, dur = probe(path)
    if not w or not h: raise SystemExit(2)
    t0, t1 = min(skip_start, dur), max(min(skip_start, dur), dur - skip_end)
    if t1 - t0 < every: t0, t1 = 0.0, dur        # a very short file: look at all of it
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', f'{t0:.3f}', '-t', f'{max(0.1, t1 - t0):.3f}', '-i', path,
                          '-vf', f'fps={1 / every}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    size, i = w * h * 3, 0
    try:
        while True:
            buf = p.stdout.read(size)
            if len(buf) < size: break
            yield round(t0 + i * every, 2), np.frombuffer(buf, np.uint8).reshape(h, w, 3); i += 1
    finally:
        p.kill(); p.wait()


def image_frames(paths):
    from PIL import Image
    for i, f in enumerate(paths):
        yield os.path.basename(f), np.asarray(Image.open(f).convert('RGB'))


# ---- the seam ------------------------------------------------------------------------------------------------------------
def gray(rgb):
    return rgb[..., 0] * 0.299 + rgb[..., 1] * 0.587 + rgb[..., 2] * 0.114


def seam(rgb):
    """How sharply the picture breaks at half height, against how much rows usually change in this frame."""
    g = gray(rgb.astype(np.float32)); h = g.shape[0]; k = max(2, h // 320)           # 6 px apart on a 1920-high frame
    def brk(y):
        return float(np.median(np.abs(g[max(0, y - k)] - g[min(h - 1, y + k)])))
    mid = h // 2; win = max(2, h // 240)                                              # the seam may sit a few px off centre
    at = max(brk(y) for y in range(mid - win, mid + win + 1))
    ys = [y for y in range(k + 1, h - k - 1, max(1, h // 160)) if abs(y - mid) > h // 16]
    usual = float(np.median([max(brk(y + d) for d in range(-win, win + 1, max(1, win))) for y in ys])) if ys else 0.0
    return at, at / (usual + 1.0)


# ---- faces ---------------------------------------------------------------------------------------------------------------
class YuNet:
    def __init__(self, model):
        import cv2
        self.cv2 = cv2; self.det = cv2.FaceDetectorYN.create(model, '', (320, 320), 0.6, 0.3, 50)

    def faces(self, rgb):
        bgr = self.cv2.cvtColor(np.ascontiguousarray(rgb), self.cv2.COLOR_RGB2BGR); h, w = bgr.shape[:2]
        s = 640.0 / max(h, w); small = self.cv2.resize(bgr, (max(1, int(w * s)), max(1, int(h * s))))
        self.det.setInputSize((small.shape[1], small.shape[0])); found = self.det.detect(small)[1]
        return [] if found is None else [tuple(float(v) / s for v in f[:4]) for f in found]   # (x, y, w, h) in frame pixels


def skin_mask(rgb):
    r, g, b = (rgb[..., i].astype(np.float32) for i in range(3))
    y = 0.299 * r + 0.587 * g + 0.114 * b
    cr = (r - y) * 0.713 + 128; cb = (b - y) * 0.564 + 128
    return (cr >= 135) & (cr <= 173) & (cb >= 77) & (cb <= 127) & (y > 45) & (y < 240)


def heuristic_faces(rgb):
    """Face-like regions with no face model: skin-tone cells that also have the fine detail of a face (eyes, brows, beard,
    mouth), joined into a blob of a face's size and shape. A cream wall, flat brand fills (gold, highlight) and smooth
    gradients have skin-like colour but no detail; brand text has detail but is a thin line, not a face-shaped blob."""
    h, w = rgb.shape[:2]; c = max(1, round(min(h, w) / 135))              # about 8 px cells on a 1080-wide frame
    H, W = h // c, w // c
    if not H or not W: return []
    skin = skin_mask(rgb[:H * c, :W * c]).reshape(H, c, W, c).mean(axis=(1, 3)) > 0.5
    g = gray(rgb[:H * c, :W * c].astype(np.float32))
    # detail: the mean absolute difference of each pixel from its right and lower neighbours, per cell
    d = np.zeros_like(g); d[:-1, :-1] = np.abs(g[:-1, :-1] - g[1:, :-1]) + np.abs(g[:-1, :-1] - g[:-1, 1:])
    detail = d.reshape(H, c, W, c).mean(axis=(1, 3))
    k = (skin & (detail > 4.0)).astype(np.float32)
    # Density of detailed skin within about 72 px: a face's parts (eyes, cheeks, beard) merge into one blob, a wall stays empty.
    r = 4; p = np.pad(k, r); s = p.cumsum(0).cumsum(1); s = np.pad(s, ((1, 0), (1, 0)))
    dens = (s[2 * r + 1:, 2 * r + 1:] - s[:-2 * r - 1, 2 * r + 1:] - s[2 * r + 1:, :-2 * r - 1] + s[:-2 * r - 1, :-2 * r - 1]) / float((2 * r + 1) ** 2)
    m = dens >= 0.2
    seen = np.zeros_like(m); out = []
    for sy, sx in zip(*np.nonzero(m)):
        if seen[sy, sx]: continue
        stack, cells = [(sy, sx)], []; seen[sy, sx] = True
        while stack:
            y, x = stack.pop(); cells.append((y, x))
            for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= ny < H and 0 <= nx < W and m[ny, nx] and not seen[ny, nx]: seen[ny, nx] = True; stack.append((ny, nx))
        n = len(cells)
        if n < (H * W) * 0.01: continue                                    # too small to be his face in a half
        ys, xs = zip(*cells); y0, y1, x0, x1 = min(ys), max(ys) + 1, min(xs), max(xs) + 1
        bw, bh = x1 - x0, y1 - y0
        if not (0.45 <= bh / bw <= 3.5): continue                           # a line of text or a stripe, not a face
        if n / (bw * bh) < 0.25: continue                                   # scattered specks (gold particles)
        out.append((x0 * c, y0 * c, bw * c, bh * c))
    return out


def find_yunet(given):
    if given: return given if os.path.exists(given) else None
    env = os.environ.get('SUBI_YUNET')
    if env and os.path.exists(env): return env
    for root in (os.path.expanduser('~/.claude/skills'), '/root/.claude/skills', os.getcwd()):
        hits = glob.glob(os.path.join(root, '**', YUNET_NAME), recursive=True)
        if hits: return sorted(hits)[0]
    return None


def face_finder(method, model):
    if method in ('auto', 'yunet'):
        m = find_yunet(model)
        try:
            if m: return 'yunet', YuNet(m).faces
        except Exception:
            pass
        if method == 'yunet': raise SystemExit('YuNet asked for, but opencv-python-headless or the model is missing')
    return 'heuristic', heuristic_faces


# ---- one frame, one reel -------------------------------------------------------------------------------------------------
def judge(rgb, faces):
    h, w = rgb.shape[:2]; mid = h / 2
    if h <= w: return {'split': False, 'seam': 0.0, 'seamRatio': 0.0, 'facesBelow': 0, 'facesCrossing': 0, 'facesAbove': 0, 'why': 'not an upright frame'}
    at, ratio = seam(rgb)
    m = int(mid)
    # Each half on its own (his face may touch the seam from below), then the whole frame for a face across the middle.
    below = [f for f in faces(rgb[m:]) if f[3] >= h * 0.03]
    above = [f for f in faces(rgb[:m]) if f[3] >= h * 0.03]
    crosses = [f for f in faces(rgb) if f[1] < mid - h * 0.08 and f[1] + f[3] > mid + h * 0.08]
    has_seam = at >= SEAM_MIN and ratio >= SEAM_RATIO
    why = ('' if has_seam else 'no seam at half height') or ''
    if not below: why = (why + '; ' if why else '') + 'no face in the bottom half'
    if crosses: why = (why + '; ' if why else '') + 'a face crosses the middle (full-frame face)'
    if above: why = (why + '; ' if why else '') + 'a face in the top half'
    return {'split': bool(has_seam and below and not crosses and not above), 'seam': round(at, 1), 'seamRatio': round(ratio, 2),
            'facesBelow': len(below), 'facesCrossing': len(crosses), 'facesAbove': len(above), 'why': why}


def check(frames, faces, method, min_split=MIN_SPLIT, label=None):
    rows = [{'t': t, **judge(f, faces)} for t, f in frames]
    n, k = len(rows), sum(r['split'] for r in rows)
    ratio = k / n if n else 0.0
    ok = n > 0 and ratio >= min_split
    full = sum(r['facesCrossing'] > 0 for r in rows)
    line = (f'PASS · split screen in {k} of {n} frames checked' if ok else
            f'FAIL · split screen in only {k} of {n} frames checked' + (f' ({full} show his face full frame)' if full else '') if n else 'FAIL · no frames could be read')
    return {'reel': label, 'pass': ok, 'method': method, 'frames': n, 'split': k, 'ratio': round(ratio, 3), 'minSplit': min_split,
            'fullFrameFace': full, 'firstSplitAt': next((r['t'] for r in rows if r['split']), None), 'line': line, 'samples': rows}


def main(argv=None):
    a = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    a.add_argument('reel', nargs='?'); a.add_argument('--frames', nargs='+'); a.add_argument('--id')
    a.add_argument('--every', type=float, default=1.0); a.add_argument('--skip-start', type=float, default=3.5); a.add_argument('--skip-end', type=float, default=1.5)
    a.add_argument('--min-split', type=float, default=MIN_SPLIT); a.add_argument('--method', choices=['auto', 'yunet', 'heuristic'], default='auto')
    a.add_argument('--yunet'); a.add_argument('--json', action='store_true'); a.add_argument('--out')
    o = a.parse_args(argv)
    if not o.reel and not o.frames: a.error('give a reel file or --frames')
    method, faces = face_finder(o.method, o.yunet)
    if o.frames: r = check(list(image_frames(o.frames)), faces, method, o.min_split, o.id)
    else:
        if not os.path.exists(o.reel): print(json.dumps({'pass': False, 'line': 'FAIL · file not found'})); return 2
        r = check(list(video_frames(o.reel, o.every, o.skip_start, o.skip_end)), faces, method, o.min_split, o.id or os.path.basename(o.reel))
    if o.out:
        os.makedirs(os.path.dirname(os.path.abspath(o.out)), exist_ok=True)
        with open(o.out, 'w') as f: json.dump(r, f, indent=1)
    print(json.dumps(r) if o.json else r['line'])
    return 0 if r['pass'] else 1


if __name__ == '__main__':
    sys.exit(main())

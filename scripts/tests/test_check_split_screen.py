#!/usr/bin/env python3
"""Tests for scripts/check-split-screen.py (the split-screen gate on finished reels, PUBLISH.md "The split-screen check").

    python3 -I scripts/tests/test_check_split_screen.py

Frames are drawn here with numpy (no footage in the repository): a split reel frame (a screen share above, a face below a
seam), a full-frame face, a full-frame gold Katana frame and a 4:5 split post. The face test is the no-model fallback
(skin colour with a face's detail); sessions with opencv and the edit skill's YuNet model use that instead, and the
same frames were checked with both on 10 November 2026 (real footage: a full-frame reel FAILS, a split cut of it PASSES).
The video test needs ffmpeg and is skipped without it.
"""
import importlib.util, json, os, shutil, subprocess, sys, tempfile, unittest

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, '..', 'check-split-screen.py')
spec = importlib.util.spec_from_file_location('check_split_screen', SCRIPT)
S = importlib.util.module_from_spec(spec); spec.loader.exec_module(S)
RNG = np.random.default_rng(7)
FACES = S.heuristic_faces


def face(w, h, cx, cy, fw, fh, wall=(240, 232, 220)):
    """A head on a cream wall: a textured skin ellipse with darker eyes, brows and mouth, and a dark jumper below it."""
    img = np.empty((h, w, 3), np.float32); img[:] = wall
    img += RNG.normal(0, 1.0, img.shape)
    yy, xx = np.mgrid[0:h, 0:w]
    body = ((yy > cy + fh * 0.55) & (np.abs(xx - cx) < fw * 1.3)); img[body] = (70, 45, 35)
    head = ((xx - cx) / (fw / 2)) ** 2 + ((yy - cy) / (fh / 2)) ** 2 <= 1
    img[head] = (205, 150, 125); img[head] += RNG.normal(0, 12, (int(head.sum()), 3))
    for ex in (-0.22, 0.22):                                       # eyes and brows
        e = ((xx - (cx + ex * fw)) / (fw * 0.09)) ** 2 + ((yy - (cy - 0.08 * fh)) / (fh * 0.04)) ** 2 <= 1; img[e] = (60, 40, 35)
        b = (np.abs(xx - (cx + ex * fw)) < fw * 0.12) & (np.abs(yy - (cy - 0.17 * fh)) < fh * 0.015); img[b] = (90, 60, 45)
    mo = (np.abs(xx - cx) < fw * 0.16) & (np.abs(yy - (cy + 0.25 * fh)) < fh * 0.02); img[mo] = (120, 60, 60)
    return np.clip(img, 0, 255).astype(np.uint8)


def screen(w, h):
    """A dark screen share with light lines of text."""
    img = np.empty((h, w, 3), np.float32); img[:] = (30, 30, 34)
    for y in range(int(h * 0.12), int(h * 0.9), max(8, h // 28)):
        x1 = int(w * (0.5 + 0.4 * RNG.random()))
        img[y:y + max(3, h // 90), int(w * 0.08):x1] = (225, 225, 230)
    img += RNG.normal(0, 2, img.shape)
    return np.clip(img, 0, 255).astype(np.uint8)


def gold(w, h):
    """A full-frame Katana card: a smooth gold glow with a dark word on it (skin-like colour, no face)."""
    yy, xx = np.mgrid[0:h, 0:w]; r = np.hypot((xx - w / 2) / w, (yy - h / 2) / h)
    img = np.stack([200 - 90 * r, 150 - 90 * r, 20 + 0 * r], -1).astype(np.float32)
    img[int(h * 0.48):int(h * 0.53), int(w * 0.08):int(w * 0.92)] = (30, 26, 23)
    return np.clip(img, 0, 255).astype(np.uint8)


def split(w=1080, h=1920):
    half = h // 2; f = np.empty((h, w, 3), np.uint8)
    f[:half] = screen(w, half)
    f[half:] = face(w, h - half, w // 2, int((h - half) * 0.42), int(w * 0.36), int((h - half) * 0.5))
    f[half - 3:half + 3] = (100, 92, 80)                           # the seam rule
    return f


class Frames(unittest.TestCase):
    def test_split_frame_is_split(self):
        r = S.judge(split(), FACES)
        self.assertTrue(r['split'], r)
        self.assertGreaterEqual(r['seamRatio'], S.SEAM_RATIO)
        self.assertGreaterEqual(r['facesBelow'], 1); self.assertEqual(r['facesAbove'], 0)

    def test_split_post_4x5_is_split(self):
        r = S.judge(split(1080, 1350), FACES)
        self.assertTrue(r['split'], r)

    def test_full_frame_face_is_not_split(self):
        r = S.judge(face(1080, 1920, 540, 940, 420, 620), FACES)
        self.assertFalse(r['split'], r)
        self.assertIn('no seam', r['why'])

    def test_full_frame_gold_is_not_split_and_has_no_face(self):
        f = gold(1080, 1920)
        self.assertEqual(FACES(f), [])
        r = S.judge(f, FACES)
        self.assertFalse(r['split']); self.assertEqual(r['facesBelow'], 0)

    def test_screen_share_above_a_screen_share_is_not_split(self):
        f = split(); f[960:] = screen(1080, 960)
        r = S.judge(f, FACES)
        self.assertFalse(r['split']); self.assertIn('no face in the bottom half', r['why'])

    def test_face_in_top_half_fails(self):
        f = split(); top = f[960:].copy(); f[960:] = screen(1080, 960); f[:960] = top
        r = S.judge(f, FACES)
        self.assertFalse(r['split'], r)

    def test_landscape_frame_is_not_split(self):
        r = S.judge(screen(1920, 1080), FACES)
        self.assertFalse(r['split']); self.assertEqual(r['why'], 'not an upright frame')

    def test_wall_is_not_a_face(self):
        f = np.full((960, 1080, 3), (238, 226, 205), np.uint8)    # a warm cream wall: skin-like hue, no detail
        self.assertEqual(FACES(f), [])


class Reel(unittest.TestCase):
    def rows(self, kinds):
        make = {'split': split, 'face': lambda: face(1080, 1920, 540, 940, 420, 620), 'gold': lambda: gold(1080, 1920)}
        return [(i, make[k]()) for i, k in enumerate(kinds)]

    def test_mostly_split_passes(self):
        r = S.check(self.rows(['split'] * 7 + ['gold', 'face', 'split']), FACES, 'heuristic')
        self.assertTrue(r['pass'], r['line']); self.assertEqual(r['split'], 8); self.assertTrue(r['line'].startswith('PASS'))

    def test_full_frame_reel_fails(self):
        r = S.check(self.rows(['face', 'gold', 'face', 'face', 'gold']), FACES, 'heuristic')
        self.assertFalse(r['pass']); self.assertEqual(r['split'], 0); self.assertTrue(r['line'].startswith('FAIL'))

    def test_threshold(self):
        rows = self.rows(['split'] * 5 + ['face'] * 5)
        self.assertFalse(S.check(rows, FACES, 'heuristic')['pass'])
        self.assertTrue(S.check(rows, FACES, 'heuristic', min_split=0.5)['pass'])

    def test_no_frames_fails(self):
        r = S.check([], FACES, 'heuristic')
        self.assertFalse(r['pass']); self.assertIn('no frames', r['line'])


@unittest.skipUnless(shutil.which('ffmpeg') and shutil.which('ffprobe'), 'needs ffmpeg')
class Video(unittest.TestCase):
    def encode(self, frames, path):
        h, w = frames[0].shape[:2]
        p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{w}x{h}', '-r', '2', '-i', '-',
                              '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', path], stdin=subprocess.PIPE)
        for f in frames: p.stdin.write(np.ascontiguousarray(f).tobytes())
        p.stdin.close(); self.assertEqual(p.wait(), 0)

    def run_cli(self, path, *extra):
        out = subprocess.run([sys.executable, '-I', SCRIPT, path, '--method', 'heuristic', '--json', '--every', '0.5', '--skip-start', '1', '--skip-end', '0.5', *extra],
                             capture_output=True, text=True)
        return out.returncode, json.loads(out.stdout)

    def test_split_video_passes_and_full_frame_fails(self):
        with tempfile.TemporaryDirectory() as d:
            sp, ff = os.path.join(d, 'split.mp4'), os.path.join(d, 'full.mp4')
            hook = face(1080, 1920, 540, 940, 420, 620)
            self.encode([hook, hook] + [split() for _ in range(12)], sp)          # opens on his full face, then splits
            self.encode([face(1080, 1920, 540, 940, 420, 620) for _ in range(8)] + [gold(1080, 1920)] * 4, ff)
            code, r = self.run_cli(sp, '--out', os.path.join(d, 'qa', 'split-screen-A.json'), '--id', 'A')
            self.assertEqual(code, 0, r['line']); self.assertTrue(r['pass']); self.assertEqual(r['reel'], 'A')
            self.assertTrue(os.path.exists(os.path.join(d, 'qa', 'split-screen-A.json')))
            code, r = self.run_cli(ff)
            self.assertEqual(code, 1); self.assertFalse(r['pass'])

    def test_missing_file(self):
        out = subprocess.run([sys.executable, '-I', SCRIPT, '/nonexistent/reel.mp4', '--method', 'heuristic'], capture_output=True, text=True)
        self.assertEqual(out.returncode, 2)


if __name__ == '__main__':
    unittest.main(verbosity=1)

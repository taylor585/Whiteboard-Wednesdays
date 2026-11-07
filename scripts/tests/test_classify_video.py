#!/usr/bin/env python3
"""Regression tests for scripts/classify-video.py (classification audit, 7 November 2026).

They run from ffprobe JSON fixtures in fixtures/ (no media, no network), so they are fast and run anywhere:
    python3 -I scripts/tests/test_classify_video.py            # or: ... <path to classify-video.py>
The rule they hold the classifier to: never silently wrong. A file is either classified correctly, or asked.

Each single-file case: fixture, pasted role, expected kind, decision (judged against the pasted role), fileDecision
(the file alone), and the Check the files default the proposed publish.js would preselect ('' = Taylor chooses).
"""
import copy, json, os, sys, unittest, importlib.util

HERE = os.path.dirname(os.path.abspath(__file__)); FX = os.path.join(HERE, 'fixtures')
SCRIPT = next((a for a in sys.argv[1:] if a.endswith('.py')), os.path.join(HERE, '..', 'classify-video.py'))
sys.argv = [a for a in sys.argv if not a.endswith('.py') or a == sys.argv[0]]
os.environ['WW_CLASSIFY_TODAY'] = '2026-11-07'          # the recording-date check is measured from this day
spec = importlib.util.spec_from_file_location('classify_video', SCRIPT)
C = importlib.util.module_from_spec(spec); spec.loader.exec_module(C)
C.NOW = '2026-11-07'


def fx(name):
    with open(os.path.join(FX, name + '.json'), encoding='utf-8') as f: return json.load(f)


def row(name, fid=None, j=None, as_name=None):
    """What drive_row returns, from a fixture instead of a Drive range read."""
    s = C.signals(j or fx(name), as_name or name); kind, decision, why = C.classify(s)
    return {'driveId': fid or (as_name or name), 'fileDecision': decision, 'recorded': s.get('recorded'), 'name': as_name or name,
            'kind': kind, 'decision': decision, 'reason': '; '.join(why[1:] or why), 'probe': C.probe_summary(s), '_s': s}


def default(kind, own, role):
    """publish.js ckInit as the audit proposes it: only a file sure on its own evidence is preselected."""
    allowed = ['main', 'skip'] if kind == 'youtube-recording' else ['reel', 'skip'] if kind == 'phone-recording' else ['skip']
    if len(allowed) == 1: return 'skip'
    if own != 'accept': return ''
    return role if role in allowed else C.LABEL.get(kind, '')


SINGLE = [
    ('IMG_3094-reel-A.mp4', 'reel', 'finished-reel', 'reject', 'reject', 'skip'),       # finished reel named after its take
    ('IMG_5001.MP4', 'reel', 'phone-recording', 'ask', 'ask', ''),                       # crop of the main, phone-style name
    ('clip.mp4', 'reel', 'phone-recording', 'ask', 'ask', ''),                           # crop of the main, neutral name
    ('Untitled.mp4', 'reel', 'phone-recording', 'ask', 'ask', ''),                       # CapCut finished reel
    ('abc-option.mp4', 'reel', 'phone-recording', 'ask', 'ask', ''),                     # Path B option preview
    ('my take.mp4', 'reel', 'phone-recording', 'ask', 'ask', ''),                        # phone take converted to H.264 (90 s)
    ('export.mp4', 'main', 'youtube-recording', 'ask', 'ask', ''),                       # finished master export (guard)
    ('How To Think With AI - final.mp4', 'main', 'youtube-recording', 'ask', 'ask', ''),
    ('IMG_6004.MOV', 'reel', 'phone-recording', 'accept', 'accept', 'reel'),             # 8-min iPhone take
    ('IMG_6004.MOV', 'main', 'phone-recording', 'ask', 'accept', 'reel'),                # pasted first: still preselected reel
    ('How To Think With AI.mp4', 'reel', 'youtube-recording', 'ask', 'accept', 'main'),  # pasted second: preselected main
    ('How To Think With AI.mp4', 'main', 'youtube-recording', 'accept', 'accept', 'main'),
    ('reel source.mov', 'reel', 'phone-recording', 'accept', 'accept', 'reel'),          # Apple tags stripped, HLG + rotation kept
    ('IMG_6003.MOV', 'reel', 'other', 'reject', 'reject', 'skip'),                       # take with no audio
    ('IMG_6005.MOV', 'reel', 'other', 'reject', 'reject', 'skip'),                       # 2 s clip
    ('IMG_6001.MOV', None, 'other', 'ask', 'ask', 'skip'),                               # landscape phone, rotation 180
    ('IMG_6002.MOV', None, 'other', 'ask', 'ask', 'skip'),                               # portrait stored + rotation 90 = landscape
    ('FaceTime webcam.mov', None, 'other', 'ask', 'ask', 'skip'),
    ('feed-4x5.mp4', 'reel', 'other', 'reject', 'ask', 'skip'),                          # 4:5 clip, not house spec
    ('square.mp4', 'reel', 'other', 'reject', 'ask', 'skip'),
    ('big-hybrid.mp4', 'main', 'youtube-recording', 'ask', 'ask', ''),                   # fragmented: header length not trusted
    ('big-fragmented.mp4', 'main', 'youtube-recording', 'ask', 'ask', ''),
    ('big-faststart.mp4', 'main', 'youtube-recording', 'accept', 'accept', 'main'),
    ('big-moov-end.mp4', 'main', 'youtube-recording', 'accept', 'accept', 'main'),
    ('big.mkv', 'main', 'youtube-recording', 'accept', 'accept', 'main'),
    ('silent main.mp4', 'main', 'youtube-recording', 'ask', 'ask', ''),
    ('final final v2.mp4', 'main', 'youtube-recording', 'ask', 'ask', ''),
    ('thumb.png', 'reel', 'other', 'reject', 'reject', 'skip'),
    ('music.wav', 'reel', 'other', 'reject', 'reject', 'skip'),
    ('notes.pdf', 'reel', 'other', 'reject', 'reject', 'skip'),
]


class Single(unittest.TestCase):
    def test_cases(self):
        for f, role, kind, dec, fdec, dflt in SINGLE:
            with self.subTest(f=f, role=role):
                s = C.signals(fx(f), f); k, d, why = C.classify(s, role); own = C.classify(s)[1]
                self.assertEqual((k, d, own, default(k, own, role)), (kind, dec, fdec, dflt), '; '.join(why))

    def test_only_camera_metadata_proves_a_phone(self):
        # A phone-style name, HEVC in .mov or a rotation flag can be copied onto any file.
        s = C.signals(fx('clip.mp4'), 'IMG_9999.MOV')
        self.assertFalse(s['phone_strong']); self.assertNotEqual(C.classify(s)[1], 'accept')
        self.assertTrue(C.signals(fx('IMG_6004.MOV'), 'IMG_6004.MOV')['phone_strong'])

    def test_finished_reel_check_runs_first(self):
        # A phone-style name never rescues the exact house reel spec.
        self.assertEqual(C.classify(C.signals(fx('IMG_3094-reel-A.mp4'), 'IMG_7001.MOV'))[:2], ('finished-reel', 'reject'))
        # A house-spec reel whose header length cannot be trusted is asked, never rejected or accepted on a guess.
        j = copy.deepcopy(fx('IMG_3094-reel-A.mp4')); j['format'].setdefault('tags', {})['compatible_brands'] = 'iso6mp41'
        j['format']['size'] = str(400_000_000)
        k, d, why = C.classify(C.signals(j, 'reel.mp4'))
        self.assertEqual(d, 'ask', why)

    def test_length_sanity(self):
        k, d, why = C.classify(C.signals(fx('big-hybrid.mp4'), 'big-hybrid.mp4'))
        self.assertEqual(d, 'ask'); self.assertIn('does not fit the file size', why[-1])


class Folder(unittest.TestCase):
    def propose(self, *names):
        rows = [row(n) for n in names]; p = C.propose(rows); return rows, p

    def test_take_needs_confirm(self):
        rows, p = self.propose('How To Think With AI.mp4', 'IMG_6004.MOV')
        self.assertEqual([r['role'] for r in rows], ['main', 'reel'])
        self.assertTrue(any('Taylor confirms before the reels start' in x for x in p))
        self.assertEqual(C.reels_path(rows)['path'], 'B')

    def test_old_take_is_asked(self):
        # IMG_2001.MOV: a real iPhone take, recorded 1 September 2026, 67 days before this job.
        rows, p = self.propose('How To Think With AI.mp4', 'IMG_6004.MOV', 'IMG_2001.MOV')
        self.assertEqual(rows[2]['kind'], 'phone-recording')
        self.assertEqual((rows[2]['role'], rows[2]['decision'], rows[2]['fileDecision']), (None, 'ask', 'ask'))
        self.assertIn('days ago', rows[2]['reason'])
        self.assertEqual(rows[1]['role'], 'reel')   # this week's take is still proposed

    def test_unsure_take_is_not_a_reel(self):
        rows, p = self.propose('How To Think With AI.mp4', 'IMG_5001.MP4')
        self.assertIsNone(rows[1]['role']); self.assertEqual(rows[1]['fileDecision'], 'ask')
        self.assertEqual(C.reels_path(rows)['path'], 'A')

    def test_two_mains_file_decision_is_ask(self):
        rows, p = self.propose('How To Think With AI.mp4', 'final final v2.mp4')
        self.assertTrue(all(r['role'] is None and r['fileDecision'] == 'ask' for r in rows))

    def test_master_export_beside_main(self):
        rows, p = self.propose('How To Think With AI.mp4', 'How To Think With AI - final.mp4', 'IMG_6004.MOV')
        self.assertEqual([r['role'] for r in rows[:2]], [None, None])
        self.assertIsNone(C.main_of(rows))

    def test_finished_reel_left_out(self):
        rows, p = self.propose('How To Think With AI.mp4', 'IMG_3094-reel-A.mp4')
        self.assertEqual([r['role'] for r in rows], ['main', 'skip'])
        self.assertEqual(C.reels_path(rows)['path'], 'A')


class Files(unittest.TestCase):
    """--drive-files: file links go through the same propose() as a folder."""
    def run_files(self, specs):
        rows = [row(n, fid=n) for n, _, _ in specs]
        p = C.files_rows(rows, specs)
        return {r['name']: r for r in rows}, p

    def test_take_pasted_first(self):
        # Taylor often pastes the phone take first, so it arrives as main and the recording as reel.
        rows, p = self.run_files([('IMG_6004.MOV', 'main', None), ('How To Think With AI.mp4', 'reel', None)])
        t, m = rows['IMG_6004.MOV'], rows['How To Think With AI.mp4']
        self.assertEqual((t['proposedRole'], t['fileDecision'], t['decision']), ('reel', 'accept', 'ask'))
        self.assertEqual((m['proposedRole'], m['fileDecision'], m['decision']), ('main', 'accept', 'ask'))
        self.assertTrue(p)

    def test_clean_files(self):
        rows, p = self.run_files([('How To Think With AI.mp4', 'main', None), ('IMG_6004.MOV', 'reel', None)])
        self.assertTrue(all(r['decision'] == 'accept' for r in rows.values()))
        self.assertEqual(p, ['phone take(s) beside the main recording: Taylor confirms before the reels start (decision 10)'])

    def test_main_alone(self):
        rows, p = self.run_files([('How To Think With AI.mp4', 'main', None)])
        self.assertEqual(p, []); self.assertEqual(rows['How To Think With AI.mp4']['decision'], 'accept')

    def test_old_take_link_is_asked(self):
        j = copy.deepcopy(fx('IMG_6004.MOV')); j['format']['tags']['com.apple.quicktime.creationdate'] = '2026-08-01T10:00:00+0000'
        rows = [row('How To Think With AI.mp4', fid='m'), row('IMG_8002.MOV', fid='t', j=j, as_name='IMG_8002.MOV')]
        p = C.files_rows(rows, [('m', 'main', None), ('t', 'reel', None)])
        self.assertEqual(rows[1]['decision'], 'ask'); self.assertIn('days ago', rows[1]['reason'])

    def test_finished_reel_pasted_as_take(self):
        rows, p = self.run_files([('How To Think With AI.mp4', 'main', None), ('IMG_3094-reel-A.mp4', 'reel', None)])
        self.assertEqual(rows['IMG_3094-reel-A.mp4']['decision'], 'reject')

    def test_skip_is_left_out(self):
        rows, p = self.run_files([('How To Think With AI.mp4', 'main', None), ('final final v2.mp4', 'skip', None)])
        self.assertEqual(rows['How To Think With AI.mp4']['proposedRole'], 'main')
        self.assertEqual(rows['final final v2.mp4']['proposedRole'], 'skip')

    def test_parts_in_taylors_order(self):
        base = fx('How To Think With AI.mp4')
        def part(sec, size):
            j = copy.deepcopy(base); j['format']['duration'] = str(sec); j['format']['size'] = str(size); return j
        rows = [row('p2', fid='p2', j=part(331, 300_000_000), as_name='Recording B.mp4'),
                row('p1', fid='p1', j=part(461, 400_000_000), as_name='Recording A.mp4')]
        p = C.files_rows(rows, [('p2', 'main', 2), ('p1', 'main', 1)])
        by = {r['driveId']: r for r in rows}
        self.assertEqual((by['p1']['part'], by['p2']['part']), (1, 2))
        self.assertTrue(all(r['decision'] == 'accept' and r['proposedRole'] == 'main' for r in rows), [r['reason'] for r in rows])
        self.assertEqual(p, [])

    def test_parts_with_a_take_pasted_as_main(self):
        # The real 6 Nov shape: IMG_3097.MOV pasted first (as main, no part) beside three numbered parts.
        base = fx('How To Think With AI.mp4')
        def part(sec, size):
            j = copy.deepcopy(base); j['format']['duration'] = str(sec); j['format']['size'] = str(size); return j
        rows = [row('IMG_6004.MOV', fid='t'), row('a', fid='a', j=part(461, 400_000_000), as_name='Recording.mp4'),
                row('b', fid='b', j=part(331, 300_000_000), as_name='Recording (copy).mp4')]
        p = C.files_rows(rows, [('t', 'main', None), ('a', 'main', 1), ('b', 'main', 2)])
        by = {r['driveId']: r for r in rows}
        self.assertEqual((by['t']['proposedRole'], by['t']['decision']), ('reel', 'ask'))
        self.assertEqual([by['a']['proposedRole'], by['b']['proposedRole']], ['main', 'main'])
        self.assertEqual([by['a']['decision'], by['b']['decision']], ['accept', 'accept'])

    def test_parse_specs(self):
        self.assertEqual(C.parse_specs('a:main:1, b:main:2,c:reel,d'), [('a', 'main', 1), ('b', 'main', 2), ('c', 'reel', None), ('d', None, None)])


if __name__ == '__main__':
    unittest.main(argv=[sys.argv[0], '-v'] if '-v' in sys.argv else [sys.argv[0]])

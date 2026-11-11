#!/usr/bin/env python3
"""Tests for scripts/autopilot-pick.py (PUBLISH.md "Autopilot", Taylor 10 November 2026).

    python3 -I scripts/tests/test_autopilot_pick.py
"""
import importlib.util, json, os, subprocess, sys, tempfile, unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, '..', 'autopilot-pick.py')
spec = importlib.util.spec_from_file_location('autopilot_pick', SCRIPT)
A = importlib.util.module_from_spec(spec); spec.loader.exec_module(A)

uw = lambda s: {'width': 3840, 'height': 1080, 'band': 'ultrawide', 'seconds': s, 'audio': True}
MAIN = {'driveId': 'M1', 'name': 'Top 50 - Part 1.mp4', 'role': 'main', 'part': 1, 'kind': 'youtube-recording', 'decision': 'accept', 'recorded': '2026-11-04', 'probe': uw(460)}
MAIN2 = {**MAIN, 'driveId': 'M2', 'name': 'Top 50 - Part 2.mp4', 'part': 2, 'probe': uw(331)}
TAKE = {'driveId': 'T1', 'name': 'IMG_3097.MOV', 'role': 'reel', 'kind': 'phone-recording', 'decision': 'accept', 'probe': {'width': 1080, 'height': 1920, 'band': 'tall'}}
TOPICS = [{'id': 't-top', 'title': 'Top 50 Most Profitable Industries', 'status': 'planned', 'recordDate': '2026-11-04'},
          {'id': 't-other', 'title': 'Building Offers', 'status': 'planned', 'recordDate': '2026-11-06'}]


class Files(unittest.TestCase):
    def test_sure_of_every_file_accepts_with_schedule_title(self):
        r, c = A.pick_files({'folderName': 'top 50 final', 'sources': [MAIN, MAIN2, TAKE]}, TOPICS)
        self.assertEqual(c, 0); self.assertTrue(r['accept'])
        self.assertEqual(r['title'], 'Top 50 Most Profitable Industries'); self.assertEqual(r['topicId'], 't-top')
        self.assertEqual(r['titleFrom'], 'topic'); self.assertEqual(r['path'], 'B')
        self.assertIn('2-part main recording and 1 phone take', r['reason']); self.assertIn('the day the main recording was made', r['reason'])

    def test_title_words_when_no_recording_date(self):
        m = {**MAIN, 'recorded': None}
        r, c = A.pick_files({'folderName': 'Top 50 industries', 'sources': [{**m, 'part': None}]}, TOPICS)
        self.assertEqual(r['topicId'], 't-top'); self.assertIn('shares words', r['evidence']['topicMatch'])

    def test_folder_name_when_nothing_matches(self):
        r, c = A.pick_files({'folderName': 'Quantum knitting', 'sources': [{**MAIN, 'recorded': None, 'part': None}]}, TOPICS)
        self.assertEqual(c, 0); self.assertEqual(r['title'], 'Quantum knitting'); self.assertIsNone(r['topicId']); self.assertEqual(r['titleFrom'], 'folder')

    def test_typed_title_wins(self):
        r, _ = A.pick_files({'folderName': 'x', 'sources': [MAIN, MAIN2]}, TOPICS, 'My typed title')
        self.assertEqual(r['title'], 'My typed title'); self.assertEqual(r['titleFrom'], 'typed')

    def test_unsure_file_stops(self):
        r, c = A.pick_files({'sources': [MAIN, MAIN2, {**TAKE, 'decision': 'ask'}]}, TOPICS)
        self.assertEqual(c, 3); self.assertFalse(r['accept']); self.assertEqual(r['needsYou']['reason'], 'files')
        self.assertIn('IMG_3097.MOV', r['needsYou']['note'])

    def test_no_main_stops(self):
        r, c = A.pick_files({'sources': [TAKE]}, TOPICS)
        self.assertEqual(c, 3); self.assertIn('no main recording', r['needsYou']['note'])

    def test_parts_out_of_order_or_mixed_sizes_stop(self):
        r, c = A.pick_files({'sources': [MAIN, {**MAIN2, 'part': 3}]}, TOPICS); self.assertEqual(c, 3)
        r, c = A.pick_files({'sources': [MAIN, {**MAIN2, 'probe': {**uw(331), 'width': 1920}}]}, TOPICS); self.assertEqual(c, 3)
        self.assertIn('one size', r['needsYou']['note'])

    def test_skip_files_are_ignored(self):
        r, c = A.pick_files({'sources': [{**MAIN, 'part': None}, {'driveId': 'X', 'role': 'skip', 'decision': 'reject', 'kind': 'finished-reel'}]}, TOPICS)
        self.assertEqual(c, 0)


PACK = {'sections': [
    {'id': 'captions', 'assets': [{'id': 'caption-c', 'tag': 'APPROVED BEFORE'}]},
    {'id': 'phrases', 'assets': [{'id': 'pill', 'tag': 'APPROVED BEFORE'}, {'id': 'stamp', 'tag': 'NEW'}, {'id': 'ticker', 'tag': 'NEW'}]},
    {'id': 'katana', 'assets': [{'id': 'k1-word-punch', 'tag': 'APPROVED BEFORE'}, {'id': 'k1-fresh', 'tag': 'NEW', 'textFit': 'fail'}]},
    {'id': 'lists', 'assets': [{'id': 'list-old', 'tag': 'NOT CHOSEN before'}, {'id': 'list-tickets', 'tag': 'ROUND 2'}]}]}


class Variety(unittest.TestCase):
    def test_approves_every_passing_new_design_and_marks_it_claudes(self):
        r, c = A.pick_variety(PACK, ['ticker'], '2026-11-10T12:00:00Z')
        self.assertEqual(c, 0)
        self.assertEqual(sorted(r['approved']), ['list-tickets', 'stamp'])
        d = r['decisions']['stamp']
        self.assertEqual((d['status'], d['by'], d['autopilot'], d['at']), ('approved', 'claude', True, '2026-11-10T12:00:00Z'))
        self.assertIn('Press Change', d['note'])
        skipped = {x['id']: x['why'] for x in r['skipped']}
        self.assertEqual(skipped, {'ticker': 'failed the text-fit check', 'k1-fresh': 'failed the text-fit check', 'list-old': 'not chosen'})
        self.assertNotIn('pill', r['decisions'])          # pre-ticked already: its own document stays
        self.assertEqual(r['evidence']['proven'], 3); self.assertEqual(r['evidence']['fresh'], 2)

    def test_balance_is_reported(self):
        r, _ = A.pick_variety({'sections': [{'id': 'phrases', 'assets': [{'id': 'a', 'tag': 'NEW'}, {'id': 'b', 'tag': 'APPROVED BEFORE'}]}]})
        self.assertTrue(r['evidence']['balanced']); self.assertEqual(r['evidence']['freshShare'], 0.5)


ROUND = {'check': {'fails': 0, 'line': 'Variety: 16 thumbnails, 0 FAIL, 1 WARN'}, 'variations': [
    {'id': 't1', 'n': 1, 'ground': 'light', 'words': 'Think first', 'score': {'total': 82}},
    {'id': 't2', 'n': 2, 'ground': 'light', 'score': {'total': 90}},
    {'id': 't3', 'n': 3, 'ground': 'dark', 'score': {'total': 85}},
    {'id': 't4', 'n': 4, 'ground': 'dark', 'score': 90}]}


class Thumbs(unittest.TestCase):
    def test_highest_score_then_lowest_number_and_spare_on_other_ground(self):
        r, c = A.pick_thumbs(ROUND)
        self.assertEqual(c, 0)
        self.assertEqual(r['picks'], {'thumbs.youtube': 't2', 'thumbs.linkedin': 't2', 'thumbs.ab': 't4'})
        self.assertIn('scored highest', r['reason']); self.assertIn('A/B spare', r['reason'])

    def test_failed_variety_check_stops(self):
        r, c = A.pick_thumbs({**ROUND, 'check': {'fails': 1}}); self.assertEqual(c, 3); self.assertEqual(r['needsYou']['reason'], 'qa')

    def test_no_scores_is_an_error_not_a_guess(self):
        r, c = A.pick_thumbs({'check': {'fails': 0}, 'variations': [{'id': 't1', 'n': 1}]}); self.assertEqual(c, 2)


POSTS = {'platforms': [
    {'key': 'youtube', 'label': 'YouTube', 'thumbnails': [{'id': 't2'}], 'posts': [
        {'title': 'A', 'body': 'x', 'checker': {'fails': 0, 'warns': 1}, 'titleScore': 70},
        {'title': 'B', 'body': 'y', 'checker': {'fails': 0, 'warns': 1}, 'titleScore': 81}]},
    {'key': 'linkedin', 'label': 'LinkedIn', 'thumbnails': [{'id': 't2'}], 'posts': [
        {'body': 'Book: [BOOKING LINK]', 'firstComment': '[YOUTUBE LINK]', 'checker': {'fails': 0, 'warns': 0}},
        {'body': 'fine', 'firstComment': 'Watch: [YOUTUBE LINK]', 'checker': {'fails': 0, 'warns': 2}}]},
    {'key': 'x', 'label': 'X', 'thumbnails': [], 'posts': [
        {'kind': 'single', 'body': 'hook', 'replies': ['[YOUTUBE LINK]'], 'checker': {'fails': 0, 'warns': 0}},
        {'kind': 'thread', 'body': 'hook', 'replies': ['a', 'b', 'c', '[YOUTUBE LINK]'], 'checker': {'fails': 0, 'warns': 0}}]}]}


class Posts(unittest.TestCase):
    def test_fewest_warnings_then_title_then_v1(self):
        r, c = A.pick_posts(POSTS)
        self.assertEqual(c, 0)
        self.assertEqual(r['picks'], {'youtube.post': 'v2', 'youtube.thumb': 't2', 'linkedin.post': 'v2', 'linkedin.thumb': 't2', 'x.post': 'v1'})
        self.assertIn('Fewest checker warnings', r['reason'])
        li = {e['v']: e for e in r['evidence']['linkedin']}
        self.assertFalse(li['v1']['usable']); self.assertIn('[BOOKING LINK]', li['v1']['why'])

    def test_a_platform_with_nothing_usable_stops(self):
        bad = {'platforms': [{'key': 'x', 'posts': [{'body': 'b', 'checker': {'fails': 1}}]}]}
        r, c = A.pick_posts(bad); self.assertEqual(c, 3); self.assertEqual(r['needsYou']['reason'], 'qa')

    def test_youtube_link_only_allowed_in_comment_and_replies(self):
        r, c = A.pick_posts({'platforms': [{'key': 'youtube', 'posts': [{'title': 't', 'body': 'see [YOUTUBE LINK]', 'checker': {}}]}]})
        self.assertEqual(c, 3)


ok_split = {'pass': True, 'line': 'PASS · split screen in 40 of 50 frames checked'}
OPTS = {'maxSeconds': 60, 'reels': [
    {'id': 'A', 'seconds': 54, 'guard': 'pass', 'split': ok_split, 'score': {'total': 70}, 'broll': [{'silent': True, 'face': False}]},
    {'id': 'B', 'seconds': 52, 'guard': 'pass', 'split': {'pass': False, 'line': 'FAIL · split screen in only 0 of 50'}, 'score': {'total': 99}},
    {'id': 'C', 'seconds': 57, 'guard': 'pass', 'split': ok_split, 'score': {'total': 88}},
    {'id': 'D', 'seconds': 61, 'guard': 'pass', 'split': ok_split, 'score': {'total': 95}},
    {'id': 'E', 'seconds': 40, 'guard': 'pass', 'score': {'total': 96}}]}


class Reels(unittest.TestCase):
    def test_best_two_that_pass_the_guard_and_the_split_screen_check(self):
        r, c = A.pick_reels(OPTS, music=True)
        self.assertEqual(c, 0)
        self.assertEqual(list(r['keep']), ['C', 'A'])
        self.assertEqual(r['keep']['C'], {'music': True, 'by': 'claude'})
        self.assertEqual(r['evidence']['refused'], {'B': ['not split screen'], 'D': ['over 60 s'], 'E': ['no split-screen check']})
        self.assertIn('split-screen check', r['reason'])

    def test_music_default_off(self):
        r, _ = A.pick_reels(OPTS, music=False); self.assertFalse(r['keep']['C']['music'])

    def test_nothing_split_screen_stops(self):
        r, c = A.pick_reels({'reels': [OPTS['reels'][1]]}); self.assertEqual(c, 3); self.assertEqual(r['needsYou']['reason'], 'qa')

    def test_path_a_winners(self):
        pack = {'ideas': [{'id': 'r%d' % i, 'name': 'Reel %d' % i, 'score': {'total': s}} for i, s in enumerate([60, 90, 75, 90, 10, 20])]}
        r, c = A.pick_winners(pack, music=False)
        self.assertEqual(c, 0); self.assertEqual(list(r['winners']), ['r1', 'r3']); self.assertFalse(r['winners']['r1']['music'])

    def test_music_first_proposed_track(self):
        doc = {'built': [{'id': 'A', 'music': True}, {'id': 'C', 'music': False}, {'id': 'D', 'music': True}],
               'music': {'tracks': [{'n': 1, 'title': 'Bright Start'}, {'n': 5, 'title': 'Motion Engine'}], 'proposals': {'A': [5, 1]}}}
        r, c = A.pick_music(doc)
        self.assertEqual(r['musicPicks'], {'A': {'track': 5, 'off': False, 'by': 'claude'}, 'D': {'track': 1, 'off': False, 'by': 'claude'}})
        r, _ = A.pick_music({'built': [{'id': 'A', 'music': True}], 'music': {'tracks': []}})
        self.assertTrue(r['musicPicks']['A']['off'])


def dump(obj, path):
    with open(path, 'w') as f: json.dump(obj, f)


class Cli(unittest.TestCase):
    def test_cli_exit_codes(self):
        with tempfile.TemporaryDirectory() as d:
            p = os.path.join(d, 'o.json'); dump({'options': OPTS}, p)
            out = subprocess.run([sys.executable, '-I', SCRIPT, 'reels', p, '--music', 'off'], capture_output=True, text=True)
            self.assertEqual(out.returncode, 0); self.assertFalse(json.loads(out.stdout)['keep']['C']['music'])
            q = os.path.join(d, 'c.json'); dump({'sources': [TAKE]}, q)
            t = os.path.join(d, 't.json'); dump({x['id']: x for x in TOPICS}, t)
            out = subprocess.run([sys.executable, '-I', SCRIPT, 'files', q, '--topics', t], capture_output=True, text=True)
            self.assertEqual(out.returncode, 3)
            out = subprocess.run([sys.executable, '-I', SCRIPT, 'thumbs', os.path.join(d, 'missing.json')], capture_output=True, text=True)
            self.assertEqual(out.returncode, 2)


if __name__ == '__main__':
    unittest.main(verbosity=1)

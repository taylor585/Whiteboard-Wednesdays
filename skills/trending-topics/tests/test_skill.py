#!/usr/bin/env python3
"""Offline tests for the Trending Topics skill. Run: python3 tests/test_skill.py

Covers check_brief.py (gold example passes; each required rule fails when broken) and the pure
functions in scan_creators.py (outlier maths, window inference). No network needed.
"""
import datetime as dt
import importlib.util
import os
import subprocess
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHECK = os.path.join(ROOT, 'scripts', 'check_brief.py')
GOLD = os.path.join(ROOT, 'examples', 'harness-brief.md')


def run_check(text):
    with tempfile.NamedTemporaryFile('w', suffix='.md', delete=False, encoding='utf-8') as fh:
        fh.write(text)
        path = fh.name
    try:
        res = subprocess.run([sys.executable, CHECK, path], capture_output=True, text=True)
        return res.returncode, res.stdout + res.stderr
    finally:
        os.unlink(path)


class CheckBrief(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.gold = open(GOLD, encoding='utf-8').read()

    def test_gold_passes(self):
        code, out = run_check(self.gold)
        self.assertEqual(code, 0, out)

    def test_missing_act_heading_fails(self):
        code, out = run_check(self.gold.replace('# ACT 2: THE SYSTEM', '# THE MIDDLE BIT', 1))
        self.assertEqual(code, 1)
        self.assertIn('ACT 2: THE SYSTEM', out)

    def test_long_one_liner_fails(self):
        bad = self.gold.replace('**IN 5 TO 10 WORDS:** One page that says what must stay true.',
                                '**IN 5 TO 10 WORDS:** One single page that clearly says everything that must always stay true.', 1)
        self.assertNotEqual(bad, self.gold)
        code, out = run_check(bad)
        self.assertEqual(code, 1)
        self.assertIn('12 words', out)

    def test_uncrossed_problem_fails(self):
        bad = self.gold.replace('**PROBLEMS IT SOLVES:** P57, P39, P40', '**PROBLEMS IT SOLVES:** P39, P40', 1)
        self.assertNotEqual(bad, self.gold)
        code, out = run_check(bad)
        self.assertEqual(code, 1)
        self.assertIn('P57', out)

    def test_missing_field_fails(self):
        bad = self.gold.replace('**WHEN NOT TO USE IT:** Quick questions', '**NOT NOW:** Quick questions', 1)
        self.assertNotEqual(bad, self.gold)
        code, out = run_check(bad)
        self.assertEqual(code, 1)
        self.assertIn('WHEN NOT TO USE IT', out)

    def test_packaging_needs_three_titles(self):
        bad = self.gold.replace('| 3 | I Tested an AI Harness on a Real Client App |', '| x | I Tested an AI Harness on a Real Client App |', 1)
        self.assertNotEqual(bad, self.gold)
        code, out = run_check(bad)
        self.assertEqual(code, 1)
        self.assertIn('titles', out)

    def test_description_line1_length(self):
        bad = self.gold.replace('**LINE 1:** How we stop', '**LINE 1:** ' + 'very ' * 30 + 'How we stop', 1)
        code, out = run_check(bad)
        self.assertEqual(code, 1)
        self.assertIn('LINE 1', out)

    def test_missing_chapters_fails(self):
        bad = self.gold.replace('**CHAPTERS:** from transcript', '**CHAPTER PLAN** from transcript', 1)
        code, out = run_check(bad)
        self.assertEqual(code, 1)
        self.assertIn('CHAPTERS', out)


def load_scanner():
    spec = importlib.util.spec_from_file_location('scan_creators', os.path.join(ROOT, 'scripts', 'scan_creators.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


class Scanner(unittest.TestCase):
    def test_outlier_ratio(self):
        sc = load_scanner()
        rows = [{'views': v} for v in (100, 100, 400, 100, 100)]
        sc.add_outliers(rows)
        self.assertEqual(rows[2]['outlier'], 4.0)
        self.assertEqual(rows[0]['outlier'], 1.0)  # neighbours 100,400,100,100 -> median 100

    def test_window_inference_from_older_dated_video(self):
        sc = load_scanner()
        now = dt.datetime(2026, 10, 12, tzinfo=dt.timezone.utc)
        recent = (now - dt.timedelta(days=3)).isoformat()
        c = {'name': 'T', 'handle': '@t', 'channel_id': 'UCxxxxxxxxxxxxxxxxxxxxxx'}
        # Monkeypatch network calls.
        sc.rss = lambda cid: [{'id': 'b', 'title': 'B', 'published': recent, 'views_exact': 500, 'short': False}]
        sc.listing = lambda h, d: [{'id': 'a', 'views': 900, 'duration_s': 600, 'title': 'A'},
                                   {'id': 'b', 'views': 500, 'duration_s': 600, 'title': 'B'}]
        rec = sc.scan_one(c, 14, 30, True, now)
        a = next(v for v in rec['videos'] if v['id'] == 'a')
        self.assertTrue(a['in_window'])  # newer than a video known to be inside the window
        self.assertIn('NEW', a['flags'])

    def test_failed_channel_is_logged_not_fatal(self):
        sc = load_scanner()
        def boom(*a):
            raise RuntimeError('offline')
        sc.rss = boom
        sc.listing = boom
        rec = sc.scan_one({'name': 'T', 'handle': '@t', 'channel_id': 'UCx'}, 14, 30, True,
                          dt.datetime(2026, 10, 12, tzinfo=dt.timezone.utc))
        self.assertEqual(rec['status'], 'failed')
        self.assertEqual(len(rec['errors']), 2)


if __name__ == '__main__':
    unittest.main(verbosity=2)

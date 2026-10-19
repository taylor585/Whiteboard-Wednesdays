#!/usr/bin/env python3
"""Offline tests for the Trending Topics skill. Run: python3 tests/test_skill.py

Covers check_brief.py and check_picks.py (gold examples pass; each required rule fails when broken),
scan_creators.py (outlier maths, window inference, core winners, core-only default), the topic
register (topics.py), the session indexer (index_sessions.py) and version_check.py. No network needed.
"""
import datetime as dt
import importlib.util
import json
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

    def test_core_winners_are_breakouts_from_core_only(self):
        sc = load_scanner()
        v = lambda i, ratio, short=False: {'id': i, 'outlier': ratio, 'short': short, 'title': i}
        recs = [{'name': 'Core', 'tier': 'core', 'weight': 3,
                 'videos': [v('a', 1.2), v('b', 13.0), v('c', 1.4), v('d', 9.0, short=True)]},
                {'name': 'Sec', 'tier': 'secondary', 'weight': 1, 'videos': [v('e', 40.0)]}]
        wins = sc.core_winners(recs)
        self.assertEqual([r['name'] for r, _ in wins], ['Core'])  # the watchlist never sets a topic
        self.assertEqual([w['id'] for w in wins[0][1]], ['b', 'c'])  # 1.4x or more, long-form, best first

    def test_secondary_off_by_default(self):
        sc = load_scanner()
        with tempfile.TemporaryDirectory() as d:
            core, sec = os.path.join(d, 'core.json'), os.path.join(d, 'sec.json')
            open(core, 'w').write('{"core": [{"name": "C", "handle": "@c", "weight": 3}]}')
            open(sec, 'w').write('{"creators": [{"name": "S", "handle": "@s"}]}')
            self.assertEqual([c['name'] for c in sc.load_creators(core, sec, True)], ['C'])
            self.assertEqual([c['name'] for c in sc.load_creators(core, sec, False)], ['C', 'S'])


def load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(ROOT, 'scripts', f'{name}.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


PICKS = os.path.join(ROOT, 'examples', 'picks-two-tables.md')


class CheckPicks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cp = load('check_picks')
        cls.good = open(PICKS, encoding='utf-8').read()

    def test_example_passes(self):
        self.assertEqual(self.cp.check(self.good, ["Claude Code WILL Replace Your Video Editor (Here's Proof)"]), [])

    def test_tables_need_taylors_headings(self):
        errs = self.cp.check(self.good.replace('## Table Two: Ideas from creators', '## Creators'))
        self.assertTrue(any('Table Two' in e for e in errs), errs)

    def test_locked_title_must_be_word_for_word(self):
        errs = self.cp.check(self.good, ['Grok Voice WILL Replace Sales Reps! (Reworded)'])
        self.assertTrue(any('locked title' in e for e in errs), errs)

    def test_creator_row_needs_url(self):
        bad = self.good.replace('https://www.youtube.com/watch?v=NTmWqnPIb2s', 'Sabri video', 1)
        errs = self.cp.check(bad)
        self.assertTrue(any('C1' in e and 'URL' in e for e in errs), errs)

    def test_scrub_word_blocks(self):
        errs = self.cp.check(self.good, scrub=['Suby Shots'])
        self.assertTrue(any('confidential' in e for e in errs), errs)

    def test_research_counts_required(self):
        bad = self.good.replace('112 Claude Code sessions', 'some sessions')
        errs = self.cp.check(bad)
        self.assertTrue(any('Our work researched' in e for e in errs), errs)

    def test_must_end_with_prompt(self):
        errs = self.cp.check(self.good.rstrip() + '\n\nThanks!')
        self.assertTrue(any('Pick from either table' in e for e in errs), errs)


class TopicRegister(unittest.TestCase):
    def test_lock_status_recent(self):
        tp = load('topics')
        reg = {'topics': []}
        d = dt.date(2026, 10, 19)
        tp.lock(reg, 'Grok Voice WILL Replace Sales Reps!', '2026-W43', '', d)
        tp.lock(reg, 'Old Idea', '2026-W30', '', d - dt.timedelta(weeks=10))
        tp.set_status(reg, 'old idea', 'recorded', '', d - dt.timedelta(weeks=9))  # case-insensitive match
        tp.lock(reg, 'Harness', '2026-W42', '', d - dt.timedelta(days=7))
        tp.set_status(reg, 'Harness', 'recorded', '', d - dt.timedelta(days=2))
        self.assertEqual([t['title'] for t in tp.recent(reg, 4, d)], ['Harness'])  # only recent planned/recorded
        self.assertEqual([t['title'] for t in tp.locked(reg)], ['Grok Voice WILL Replace Sales Reps!'])
        self.assertEqual(reg['topics'][0]['title'], 'Grok Voice WILL Replace Sales Reps!')  # stored exactly
        with self.assertRaises(KeyError):
            tp.set_status(reg, 'Never locked', 'recorded', '', d)
        with self.assertRaises(ValueError):
            tp.set_status(reg, 'Harness', 'filmed', '', d)

    def test_rename_keeps_history(self):
        tp = load('topics')
        reg = {'topics': []}
        d = dt.date(2026, 10, 19)
        tp.lock(reg, "Most AI Is Hype. Here's the Only System I Still Use", '2026-W43', 'working title', d)
        tp.rename(reg, "most ai is hype. here's the only system i still use", 'I Built 20 AI Agents. Only One Survived.', d)
        t = reg['topics'][0]
        self.assertEqual(t['title'], 'I Built 20 AI Agents. Only One Survived.')
        self.assertEqual(t['status'], 'locked')
        self.assertIn('renamed from', t['history'][-1]['note'])

    def test_cli_round_trip(self):
        with tempfile.TemporaryDirectory() as tmp:
            reg = os.path.join(tmp, 'reg.json')
            run = lambda *a: subprocess.run([sys.executable, os.path.join(ROOT, 'scripts', 'topics.py'), *a,
                                             '--register', reg, '--today', '2026-10-19'], capture_output=True, text=True)
            self.assertEqual(run('lock', "Claude Code WILL Replace Your Video Editor (Here's Proof)").returncode, 0)
            out = run('list').stdout
            self.assertIn("Claude Code WILL Replace Your Video Editor (Here's Proof)", out)
            self.assertEqual(run('status', 'Missing', 'recorded').returncode, 1)


def page(sessions, has_more=True, last_id='last'):
    return 'saved result text\n' + json.dumps({'ccr': {'data': sessions, 'has_more': has_more, 'last_id': last_id}})


def sess(i, title, created, updated, repo=None):
    s = {'id': f's{i}', 'title': title, 'created_at': created, 'updated_at': updated,
         'post_turn_summary': {'recent_action': f'did {i}'}}
    if repo:
        s['session_context'] = {'sources': [{'git_repository': {'url': f'https://github.com/x/{repo}'}}]}
    return s


class IndexSessions(unittest.TestCase):
    def test_window_groups_and_paging(self):
        ix = load('index_sessions')
        now = dt.datetime(2026, 10, 19, tzinfo=dt.timezone.utc)
        p1 = ix.parse_page(page([sess(1, '(WW) Live App', '2026-10-12T00:00:00Z', '2026-10-18T00:00:00Z'),
                                 sess(2, 'No tag here', '2026-10-10T00:00:00Z', '2026-10-11T00:00:00Z', repo='outbound-caller'),
                                 sess(3, '(WW) Old', '2026-08-01T00:00:00Z', '2026-08-02T00:00:00Z'),
                                 sess(4, '(WW) Me', '2026-10-01T00:00:00Z', '2026-10-19T00:00:00Z')], True, 's4'))
        rows, more = ix.build([p1], now, 30, {'s4'})
        self.assertEqual(sorted(r['id'] for r in rows), ['s1', 's2'])  # s3 too old, s4 excluded
        self.assertIsNone(more)  # the page reached back past the window (s3 created in August)
        self.assertEqual(next(r for r in rows if r['id'] == 's2')['tag'], 'outbound-caller')  # repo when no tag
        p_recent = ix.parse_page(page([sess(5, '(PF) Site', '2026-10-15T00:00:00Z', '2026-10-16T00:00:00Z')], True, 's5'))
        _, more = ix.build([p_recent], now, 30)
        self.assertEqual(more, 's5')  # still inside the window and more pages exist: PAGE MORE

    def test_big_groups_split(self):
        ix = load('index_sessions')
        rows = [{'tag': 'NURTURE P', 'updated': '2026-10-01'} for _ in range(65)]
        g = ix.group(rows, 30)
        self.assertEqual([len(v) for v in g.values()], [30, 30, 5])


class VersionCheck(unittest.TestCase):
    def test_compare(self):
        vc = load('version_check')
        self.assertTrue(vc.compare('2.0.0', '4.0.0').startswith('OLD COPY'))
        self.assertTrue(vc.compare('4.0.0', '4.0.0').startswith('CURRENT'))
        self.assertTrue(vc.compare('4.0.0', None).startswith('NO REPO'))


if __name__ == '__main__':
    unittest.main(verbosity=2)

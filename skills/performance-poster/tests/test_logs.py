"""hashtag_log.py and the copied headline_log.py work on a temporary log."""
import csv
import io
import os
import sys
import tempfile
import unittest
from contextlib import redirect_stdout

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
import hashtag_log  # noqa: E402


def run(*argv):
    buf = io.StringIO()
    with redirect_stdout(buf):
        hashtag_log.main(list(argv))
    return buf.getvalue()


class TestHashtagLog(unittest.TestCase):
    def test_add_update_report(self):
        with tempfile.TemporaryDirectory() as d:
            log = os.path.join(d, 'h.csv')
            run('--log', log, 'add', '--video', 'A', '--platform', 'linkedin', '--tags', '#ClaudeCode #AIAgents')
            run('--log', log, 'add', '--video', 'B', '--platform', 'linkedin', '--tags', '#ClaudeCode')
            run('--log', log, 'update', '--id', '1', '--reach', '1000')
            run('--log', log, 'update', '--id', '2', '--reach', '3000')
            rows = list(csv.DictReader(open(log, encoding='utf-8')))
            self.assertEqual([r['count'] for r in rows], ['2', '1'])
            rep = hashtag_log.report(rows, 'linkedin')
            top = rep[0]
            self.assertEqual((top['tag'], top['posts'], top['median_reach']), ('#ClaudeCode', 2, 2000.0))

    def test_rejects_empty_tags(self):
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaises(SystemExit):
                run('--log', os.path.join(d, 'h.csv'), 'add', '--platform', 'instagram', '--tags', 'no tags here')

    def test_seed_log_reads(self):
        rows = hashtag_log.load(hashtag_log.DEFAULT_LOG)
        self.assertTrue(rows and rows[0]['platform'] == 'youtube')


class TestHeadlineLogCopy(unittest.TestCase):
    def test_points_at_shared_copy(self):
        import headline_log
        self.assertTrue(os.path.exists(headline_log.DEFAULT_LOG), headline_log.DEFAULT_LOG)
        self.assertIn(os.path.join('references', 'shared'), headline_log.DEFAULT_LOG)


class TestPackageFiles(unittest.TestCase):
    def test_referenced_files_exist(self):
        text = open(os.path.join(ROOT, 'SKILL.md'), encoding='utf-8').read()
        for rel in ['references/limits.json', 'references/limits.md', 'references/youtube.md', 'references/linkedin.md',
                    'references/instagram.md', 'references/hashtags/pecuna.md', 'references/brief-template.md',
                    'references/shared/house-style.md', 'references/shared/cta-library.md', 'references/shared/taylor-voice.md',
                    'scripts/check_post.py', 'scripts/hashtag_log.py', 'scripts/headline_log.py']:
            with self.subTest(rel=rel):
                self.assertTrue(os.path.exists(os.path.join(ROOT, rel)))
                self.assertIn(rel.split('/')[-1], text)


if __name__ == '__main__':
    unittest.main()

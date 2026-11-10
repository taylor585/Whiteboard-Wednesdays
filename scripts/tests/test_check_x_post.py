#!/usr/bin/env python3
"""Tests for scripts/check-x-post.py (the X post check, PUBLISH.md "The X post").

    python3 -I scripts/tests/test_check_x_post.py

No network and no media. The count vectors in fixtures/x/count-vectors.json are the same ones
scripts/tests/test_x_count.mjs runs against public/x-count.js, so the checker and the app count alike.
"""
import importlib.util, io, json, os, sys, tempfile, unittest
from contextlib import redirect_stdout

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('check_x_post', os.path.join(HERE, '..', 'check-x-post.py'))
X = importlib.util.module_from_spec(spec); spec.loader.exec_module(X)

TRANSCRIPT = """So I simply said to you, I don't know what a good question looks like.
Our questions framework, what we have gathered from the 17 transcripts.
It's called reverse prompting. Nobody can reach 100%.
We looked at four star reviews and there were ideas in there I never would have came up with."""
BRIEF = 'TITLE: How To Think With AI\nPROOF: 17 transcripts; three quick sieves (10, 5, 3, 1)\nDURATION: 38:13'
SINGLE = {'kind': 'single',
          'body': 'Most people open AI and have no idea what to ask.\n\nI told it: "I don\'t know what a good question looks like."',
          'replies': ['The full walkthrough: [YOUTUBE LINK]']}
THREAD = {'kind': 'thread', 'body': 'I started an AI session knowing nothing about the task. Here is what I did 👇',
          'replies': ['First it built a framework from 17 transcripts.', 'Then reverse prompting: it asks itself the questions.',
                      'The honest answer on certainty: nobody can reach 100%.', 'Every question in order: [YOUTUBE LINK]']}


def run(v, brief=BRIEF, transcript=TRANSCRIPT, registry=None):
    rows, s = X.check(v, brief, transcript, registry)
    return s, [t for lvl, t in rows if lvl == 'FAIL'], [t for lvl, t in rows if lvl == 'WARN']


class Count(unittest.TestCase):
    def test_vectors(self):
        with open(os.path.join(HERE, 'fixtures', 'x', 'count-vectors.json'), encoding='utf-8') as f:
            for v in json.load(f):
                self.assertEqual(X.x_len(v['text']), v['n'], v['why'])

    def test_link_is_23_whatever_its_length(self):
        self.assertEqual(X.x_len('https://a.io'), 23)
        self.assertEqual(X.x_len('https://www.youtube.com/watch?v=6t7FzrHykfA&list=PL0123456789&index=4'), 23)

    def test_280_passes_and_281_fails(self):
        ok = dict(SINGLE, body='a' * 280); over = dict(SINGLE, body='a' * 281)
        self.assertEqual(run(ok)[1], [])
        self.assertTrue(any('281 of 280' in f for f in run(over)[1]))

    def test_emoji_push_a_post_over(self):
        # 140 emoji are 280; one more character is too many, though Python sees only 141 characters.
        self.assertEqual(run(dict(SINGLE, body='👉' * 139 + 'ab'))[1], [])
        self.assertTrue(run(dict(SINGLE, body='👉' * 140 + 'a'))[1])


class Rules(unittest.TestCase):
    def test_good_single_and_thread_pass(self):
        for v in (SINGLE, THREAD):
            s, fails, warns = run(v)
            self.assertEqual(fails, []); self.assertEqual(s['fails'], 0); self.assertTrue(s['line'].startswith('PASS'))
        self.assertEqual(run(THREAD)[0]['posts'], 5)

    def test_single_needs_exactly_one_reply(self):
        self.assertTrue(run(dict(SINGLE, replies=[]))[1])
        self.assertTrue(run(dict(SINGLE, replies=['One more thought.', 'Watch: [YOUTUBE LINK]']))[1])

    def test_thread_is_four_to_six_posts(self):
        self.assertTrue(any('4 to 6' in f for f in run(dict(THREAD, replies=THREAD['replies'][2:]))[1]))
        long = dict(THREAD, replies=['Point %s.' % w for w in 'abcde'] + ['Watch: [YOUTUBE LINK]'])
        self.assertTrue(any('4 to 6' in f for f in run(long)[1]))

    def test_link_rules(self):
        self.assertTrue(any('First post has no link' in f for f in run(dict(SINGLE, body='Watch https://youtu.be/abcdefg now'))[1]))
        self.assertTrue(any('First post has no link' in f for f in run(dict(SINGLE, body='Watch [YOUTUBE LINK] now'))[1]))
        self.assertTrue(any('exactly once' in f for f in run(dict(SINGLE, replies=['The full walkthrough is on YouTube.']))[1]))
        self.assertTrue(any('No other link' in f for f in run(dict(SINGLE, replies=['[YOUTUBE LINK] or https://pecunafactorem.com/contact']))[1]))
        self.assertTrue(any('No other link' in f for f in run(dict(SINGLE, replies=['[YOUTUBE LINK] or pecunafactorem.com']))[1]))
        moved = dict(THREAD, replies=['Watch: [YOUTUBE LINK]'] + THREAD['replies'][1:])
        self.assertTrue(any('only in the last post' in f for f in run(moved)[1]))

    def test_placeholders(self):
        self.assertTrue(any('placeholder' in f for f in run(dict(SINGLE, replies=['Book: [BOOKING LINK] or watch [YOUTUBE LINK]']))[1]))

    def test_figures_must_be_in_the_brief_or_transcript(self):
        self.assertTrue(any('not found 10' in f for f in run(dict(SINGLE, body='It came back with 10 app ideas.'), brief='')[1]))
        self.assertEqual(run(dict(SINGLE, body='It read 17 transcripts and scored 100%.'))[1], [])
        self.assertEqual(run(dict(SINGLE, body='We read 4 star reviews.'))[1], [], 'a figure said as a word counts')
        self.assertTrue(run(dict(SINGLE, body='We made £4,200 in a week.'))[1])

    def test_quotes_must_be_exact(self):
        bad = dict(SINGLE, body='I asked: "how do I ask a good question?"')
        self.assertTrue(any('word for word' in f for f in run(bad)[1]))
        self.assertEqual(run(dict(SINGLE, body='He said “I don’t know what a good question looks like.”'))[1], [])
        s, fails, warns = run(bad, transcript='')
        self.assertTrue(any('not checked' in w for w in warns))

    def test_hashtags(self):
        self.assertEqual(run(dict(SINGLE, body=SINGLE['body'] + ' #AIStrategy'))[1], [])
        self.assertTrue(any('Hashtags: 2' in f for f in run(dict(SINGLE, body=SINGLE['body'] + ' #AIStrategy #ClaudeAI'))[1]))
        reg = {'aistrategy': 'USE', 'aiagency': 'AVOID'}
        self.assertEqual(run(dict(SINGLE, body='Think first. #AIStrategy'), registry=reg)[1], [])
        self.assertTrue(run(dict(SINGLE, body='Think first. #AIAgency'), registry=reg)[1])
        self.assertTrue(any('not in the hashtag registry' in w for w in run(dict(SINGLE, body='Think first. #NewTag'), registry=reg)[2]))

    def test_bait_wrong_crowd_and_opening(self):
        self.assertTrue(any('bait' in f for f in run(dict(SINGLE, body='Repost if you agree with this.'))[1]))
        self.assertTrue(any('wrong-crowd' in f for f in run(dict(SINGLE, body='How to make money with AI.'))[1]))
        self.assertTrue(any('open with @' in f for f in run(dict(SINGLE, body='@someone said this about AI.'))[1]))

    def test_repeats_and_empty(self):
        self.assertTrue(run(dict(THREAD, replies=[THREAD['body']] + THREAD['replies'][1:]))[1])
        self.assertTrue(run(dict(SINGLE, body='  '))[1])
        self.assertTrue(run({'kind': 'poll', 'body': 'x', 'replies': []})[1])

    def test_registry_loader_reads_the_skill_shape(self):
        with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8') as f:
            json.dump({'tags': {'#AIStrategy': {'status': {'youtube': 'USE', 'instagram': 'TEST'}}, '#AIAgency': {'status': {'youtube': 'AVOID', 'linkedin': 'USE'}}}}, f)
        try:
            self.assertEqual(X.load_registry(f.name), {'aistrategy': 'USE', 'aiagency': 'AVOID'})
        finally:
            os.unlink(f.name)


class CommandLine(unittest.TestCase):
    def call(self, v, *extra):
        with tempfile.TemporaryDirectory() as d:
            p = os.path.join(d, 'x.json'); t = os.path.join(d, 't.txt')
            with open(p, 'w', encoding='utf-8') as f: json.dump(v, f)
            with open(t, 'w', encoding='utf-8') as f: f.write(TRANSCRIPT)
            out = io.StringIO()
            with redirect_stdout(out):
                code = X.main([p, '--transcript', t, *extra])
            return code, out.getvalue()

    def test_exit_codes_and_json(self):
        code, out = self.call(SINGLE, '--json')
        d = json.loads(out)
        self.assertEqual((code, d['fails'], d['posts'], d['counts'][1]), (0, 0, 2, X.x_len(SINGLE['replies'][0])))
        self.assertEqual(d['chars'], max(d['counts']))
        code, out = self.call(dict(SINGLE, body='a' * 300))
        self.assertEqual(code, 1); self.assertIn('FAIL', out)
        with redirect_stdout(io.StringIO()):
            self.assertEqual(X.main(['/nonexistent/x.json']), 2)


if __name__ == '__main__':
    unittest.main(verbosity=1)

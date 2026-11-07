"""check_post.py: every number in the report's checker table is a test case, and every example passes."""
import json
import os
import subprocess
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
import check_post as cp  # noqa: E402

LIMITS = cp.load_limits()
CTA = LIMITS['youtube']['cta_line']['value']
EX = os.path.join(ROOT, 'examples')


def read(*p):
    with open(os.path.join(EX, *p), encoding='utf-8') as f:
        return f.read()


def levels(rep, check_fragment):
    return [r['level'] for r in rep.rows if check_fragment in r['check']]


def yt(hook='I built an AI harness so Claude Code runs for hours.', bullets=3, chapters=('0:00', '1:00', '2:00'),
       tags='#ClaudeCode #AIAgents #WhiteboardWednesdays', extra=''):
    parts = [CTA, hook, 'In this Whiteboard Wednesdays I show you how.', "What you'll learn:"]
    parts += [f'• Point {chr(65 + i)}' for i in range(bullets)]
    parts += ['Chapters'] + [f'{c} Part {chr(65 + i)}' for i, c in enumerate(chapters)]
    parts += ['How we can help', 'Get in touch:', 'https://pecunafactorem.com/contact', 'Pecuna Factorem: https://pecunafactorem.com']
    if extra:
        parts.append(extra)
    parts.append(tags)
    return '\n\n'.join(parts) + '\n'


BRIEF = 'TITLE: I Built an AI Harness\nKEYWORD: AI harness\nPROOF: 24 hours, 58 problems\nCLIENTS: Acme Clinics\n'


class TestLimitsFile(unittest.TestCase):
    def test_numbers_match_the_report(self):
        y, l, i = LIMITS['youtube'], LIMITS['linkedin'], LIMITS['instagram']
        self.assertEqual(y['description_max_bytes']['value'], 5000)
        self.assertEqual(y['title_max']['value'], 100)
        self.assertEqual(y['title_brand_max']['value'], 70)
        self.assertEqual(y['tags_field_max']['value'], 500)
        self.assertEqual(y['hashtags']['ignored_over'], 60)
        self.assertEqual(y['hashtags']['target'], 3)
        self.assertEqual((y['chapters']['min_count'], y['chapters']['min_gap_s']), (3, 10))
        self.assertEqual(len(y['cta_line']['value']), 108)
        self.assertEqual(l['post_max']['value'], 3000)
        self.assertEqual((l['hook_max']['value'], l['hook_max']['warn_over']), (140, 110))
        self.assertEqual(l['length_reach']['value'], [900, 1500])
        self.assertEqual(l['comment_max']['value'], 1250)
        self.assertEqual(i['caption_max']['value'], 2200)
        self.assertEqual(i['hashtags']['hard_cap'], 5)
        self.assertEqual((i['first_line_max']['reel'], i['first_line_max']['feed']), (60, 125))
        self.assertEqual(i['body_chars']['reel'], [125, 500])
        self.assertEqual(i['mentions_max']['value'], 20)
        self.assertEqual(i['safe_zone_px']['top'], 220)
        self.assertEqual(i['safe_zone_px']['bottom'], 420)

    def test_recheck_date_is_set(self):
        self.assertGreater(LIMITS['recheck_by'], LIMITS['checked'])


class TestYouTube(unittest.TestCase):
    def run_yt(self, text, brief=BRIEF, **kw):
        return cp.run('youtube', text, brief, '', LIMITS, **kw)

    def test_clean_description_passes(self):
        rep = self.run_yt(yt())
        self.assertFalse(rep.failed, [r for r in rep.rows if r['level'] == 'FAIL'])

    def test_cta_must_be_exact(self):
        rep = self.run_yt(yt().replace('👉 https', '👉https'))
        self.assertIn('FAIL', levels(rep, 'pinned WhatsApp CTA'))

    def test_bytes_not_characters(self):
        text = yt(extra='😀' * 1300)  # 1,300 characters but 5,200 bytes
        rep = self.run_yt(text)
        self.assertLess(len(text), 5000)
        self.assertIn('FAIL', levels(rep, '5,000 bytes'))

    def test_chapters(self):
        self.assertIn('FAIL', levels(self.run_yt(yt(chapters=('0:05', '1:00', '2:00'))), 'start at 0:00'))
        self.assertIn('FAIL', levels(self.run_yt(yt(chapters=('0:00', '1:00'))), 'At least 3'))
        self.assertIn('FAIL', levels(self.run_yt(yt(chapters=('0:00', '0:05', '2:00'))), '≥10 s'))
        self.assertIn('FAIL', levels(self.run_yt(yt(chapters=('0:00', '1:00', '2:00')), duration='1:30'), 'end of the video'))
        rep = self.run_yt(yt(chapters=('0:00', 'X:XX', 'X:XX')))
        self.assertIn('WARN', levels(rep, 'Chapter times to fill'))
        self.assertFalse(rep.failed)

    def test_spacing(self):
        tight = yt().replace('• Point A\n\n• Point B', '• Point A\n• Point B')
        self.assertIn('FAIL', levels(self.run_yt(tight), 'bullet'))
        tight = yt().replace('0:00 Part A\n\n1:00', '0:00 Part A\n1:00')
        self.assertIn('FAIL', levels(self.run_yt(tight), 'chapter'))

    def test_hashtags(self):
        self.assertIn('FAIL', levels(self.run_yt(yt(tags='#A1 #B2')), 'Hashtags 3–5'))
        self.assertIn('FAIL', levels(self.run_yt(yt(tags=' '.join(f'#T{i}x' for i in range(6)))), 'Hashtags 3–5'))
        self.assertIn('WARN', levels(self.run_yt(yt(tags='#Aa #Bb #Cc #Dd')), 'research target'))
        self.assertIn('FAIL', levels(self.run_yt(yt(tags=' '.join(f'#T{i}x' for i in range(61)))), 'ignored'))

    def test_keyword_and_title(self):
        self.assertIn('FAIL', levels(self.run_yt(yt(hook='Something else entirely, no keyword.')), 'Keyword'))
        self.assertIn('WARN', levels(self.run_yt(yt(hook='Here is a very long opening before we say AI harness.')), 'Keyword'))
        self.assertIn('FAIL', levels(self.run_yt(yt(), title='x' * 71), '≤70'))
        self.assertIn('FAIL', levels(self.run_yt(yt(), title='x' * 101), '≤100'))

    def test_disclosure(self):
        rep = self.run_yt(yt(extra='Tool: https://example.com/?ref=pecuna'))
        self.assertIn('FAIL', levels(rep, 'Disclosure'))
        rep = self.run_yt(yt(extra='Tool: https://example.com/?ref=pecuna (affiliate link; I may earn a commission)'))
        self.assertEqual(levels(rep, 'Disclosure'), ['PASS'])


class TestTruth(unittest.TestCase):
    def test_invented_figure_fails(self):
        rep = cp.run('youtube', yt(extra='It saved 37 hours.'), BRIEF, '', LIMITS)
        self.assertIn('FAIL', levels(rep, 'Every figure'))

    def test_figure_in_transcript_passes(self):
        rep = cp.run('youtube', yt(extra='It saved 37 hours.'), BRIEF, 'we saved 37 hours', LIMITS)
        self.assertEqual(levels(rep, 'Every figure'), ['PASS'])

    def test_spelled_number_matches_digit(self):
        rep = cp.run('youtube', yt(extra='Nine questions.'), BRIEF + 'PROOF2: 9 questions\n', '', LIMITS)
        self.assertEqual(levels(rep, 'Spelled-out'), [])

    def test_client_name_fails(self):
        rep = cp.run('youtube', yt(extra='Built for Acme Clinics.'), BRIEF, '', LIMITS)
        self.assertIn('FAIL', levels(rep, 'client names'))

    def test_placeholders_warn(self):
        rep = cp.run('youtube', yt(extra='Book: [BOOKING LINK]'), BRIEF, '', LIMITS)
        self.assertIn('WARN', levels(rep, 'Placeholders'))


def li(hook='You brief your AI agent and nothing happens for two hours.', body_len=1000, tail='Which job would you run overnight?',
       tags='#ClaudeCode #AIAgents #AIAutomation'):
    body = ('A harness fixes this. ' * 200)[:body_len]
    return f'{hook}\n\n{body}\n\n{tail}\n\n{tags}\n'


class TestLinkedIn(unittest.TestCase):
    def run_li(self, text, **kw):
        return cp.run('linkedin', text, 'TITLE: My Title\nPROOF: two hours\n', '', LIMITS, **kw)

    def test_clean_post_passes(self):
        rep = self.run_li(li())
        self.assertFalse(rep.failed, [r for r in rep.rows if r['level'] == 'FAIL'])
        self.assertEqual([r for r in rep.rows if r['level'] == 'WARN'], [])

    def test_limits(self):
        self.assertIn('FAIL', levels(self.run_li(li(body_len=3001)), '3,000'))
        self.assertIn('FAIL', levels(self.run_li(li(hook='h' * 141)), '≤140'))
        self.assertIn('WARN', levels(self.run_li(li(hook='h' * 120)), '≤110'))
        self.assertIn('WARN', levels(self.run_li(li(body_len=600)), 'Length'))
        self.assertEqual(levels(self.run_li(li(body_len=2000), goal='comments'), 'Length'), ['PASS'])

    def test_rules(self):
        self.assertIn('FAIL', levels(self.run_li(li(hook='My Title')), 'word for word'))
        self.assertIn('WARN', levels(self.run_li(li(tail='Watch it: https://youtu.be/x')), 'No link'))
        self.assertIn('FAIL', levels(self.run_li(li(tail='Comment to agree?')), 'bait'))
        self.assertIn('FAIL', levels(self.run_li(li(tags='#A1')), 'Hashtags 3–5'))
        self.assertIn('WARN', levels(self.run_li(li(tags='#Aa #Bb #Cc #Dd')), 'research target'))


def ig(first='Your AI agent crashed. Here is how it recovers.', body_len=300, cta='Full video on YouTube, link in bio.',
       tags='#WhiteboardWednesdays #ClaudeCode #AIAgents'):
    body = ('It reads its files and carries on. ' * 100)[:body_len]
    return f'{first}\n\n{body}\n\n{cta}\n\n{tags}\n'


class TestInstagram(unittest.TestCase):
    def run_ig(self, text, **kw):
        return cp.run('instagram', text, 'KEYWORD: AI agent\nPROOF: 6 files\n', '', LIMITS, **kw)

    def test_clean_caption_passes(self):
        rep = self.run_ig(ig())
        self.assertFalse(rep.failed, [r for r in rep.rows if r['level'] == 'FAIL'])

    def test_limits(self):
        self.assertIn('FAIL', levels(self.run_ig(ig(body_len=2300)), '2,200'))
        self.assertIn('FAIL', levels(self.run_ig(ig(first='A' * 61)), '≤60'))
        self.assertEqual(levels(self.run_ig(ig(first='AI agent ' + 'a' * 100), fmt='image'), '≤125'), ['PASS'])
        self.assertIn('FAIL', levels(self.run_ig(ig(tags='#Aa #Bb #Cc #Dd #Ee #Ff')), 'hard cap'))
        self.assertEqual(levels(self.run_ig(ig(tags='#Aa #Bb #Cc #Dd #Ee')), 'Hashtags 3–5'), ['PASS'])
        self.assertIn('FAIL', levels(self.run_ig(ig(tags='#AIAgents #Reels #Viral')), 'reach-bait'))
        self.assertIn('FAIL', levels(self.run_ig(ig(body_len=200) + ' '.join(f'@u{i}' for i in range(21))), '@mentions'))

    def test_one_cta(self):
        self.assertIn('FAIL', levels(self.run_ig(ig(cta='Link in bio. Comment FILES and I\'ll DM you the list.')), 'one CTA'))
        self.assertIn('FAIL', levels(self.run_ig(ig(cta='Thanks for watching.')), 'one CTA'))
        self.assertEqual(levels(self.run_ig(ig(cta="Comment FILES and I'll DM you the list.")), 'one CTA'), ['PASS'])

    def test_end_card_must_match(self):
        rep = self.run_ig(ig(cta="Comment FILES and I'll DM you the list."), end_card='link in bio')
        self.assertIn('FAIL', levels(rep, 'end card'))

    def test_alt_text_reminder(self):
        self.assertIn('WARN', levels(self.run_ig(ig(body_len=100), fmt='carousel'), 'Alt text'))
        self.assertEqual(levels(self.run_ig(ig()), 'Alt text'), [])


class TestExamples(unittest.TestCase):
    """Every worked example passes the checker (no FAIL)."""
    CASES = [
        ('youtube', 'ai-harnesses/description-final.txt', 'ai-harnesses/brief.txt', None, {}),
        ('linkedin', 'ai-harnesses/linkedin-post.txt', 'ai-harnesses/brief.txt', None, {}),
        ('youtube', 'icp-research/description-final.txt', 'icp-research/brief.txt', None, {}),
        ('youtube', 'ai-vision-boards/youtube-description.txt', 'ai-vision-boards/brief.txt', None, {}),
        ('instagram', 'ai-harnesses-reel-3/instagram-caption.txt', 'ai-harnesses-reel-3/brief.txt',
         'ai-harnesses-reel-3/transcript.txt', {'fmt': 'reel'}),
    ]

    def test_examples_pass(self):
        for platform, post, brief, transcript, kw in self.CASES:
            with self.subTest(post=post):
                rep = cp.run(platform, read(post), read(brief), read(transcript) if transcript else '', LIMITS, **kw)
                self.assertFalse(rep.failed, [r for r in rep.rows if r['level'] == 'FAIL'])

    def test_cli_exit_codes(self):
        script = os.path.join(ROOT, 'scripts', 'check_post.py')
        ok = subprocess.run([sys.executable, script, 'instagram', os.path.join(EX, 'ai-harnesses-reel-3/instagram-caption.txt'),
                             '--brief', os.path.join(EX, 'ai-harnesses-reel-3/brief.txt'), '--json'], capture_output=True, text=True)
        self.assertEqual(ok.returncode, 0, ok.stdout + ok.stderr)
        self.assertFalse(json.loads(ok.stdout)['failed'])
        bad = subprocess.run([sys.executable, script, 'youtube', os.path.join(EX, 'ai-harnesses-reel-3/instagram-caption.txt')],
                             capture_output=True, text=True)
        self.assertEqual(bad.returncode, 1)


if __name__ == '__main__':
    unittest.main()

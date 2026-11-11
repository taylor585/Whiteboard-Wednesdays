#!/usr/bin/env python3
"""Check a finished post against the platform limits and Pecuna Factorem's house rules.

Usage:
  python3 check_post.py youtube   description.txt [--brief brief.md] [--transcript t.txt] [--title "..."] [--duration 31:40]
  python3 check_post.py linkedin  post.txt        [--brief brief.md] [--transcript t.txt] [--title "..."] [--goal reach|comments]
  python3 check_post.py instagram caption.txt     [--brief brief.md] [--transcript t.txt] [--format reel|carousel|image]
                                                  [--end-card "link in bio"] [--alt alt.txt]
  add --json for machine-readable output.

Every limit comes from references/limits.json; change a rule there, not here.
Each line is PASS, WARN or FAIL. Exit code 1 if anything FAILs.

Truth check: every number in the post must appear in the brief or the transcript (digits are a FAIL, spelled-out
numbers a WARN). Timestamps, URLs and hashtags are ignored. CLIENTS: in the brief lists names that must never appear.

Brief format: plain "KEY: value" lines (see references/brief-template.md). Keys used here: TITLE, KEYWORD, PROOF,
CLIENTS, DURATION, END CARD CTA.
Stdlib only.
"""
import argparse
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
LIMITS_PATH = os.path.join(HERE, '..', 'references', 'limits.json')

WORDS = {w: str(i) for i, w in enumerate(
    'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen '
    'seventeen eighteen nineteen twenty'.split())}
WORDS.update({'thirty': '30', 'forty': '40', 'fifty': '50', 'sixty': '60', 'hundred': '100'})
SPELLED_CHECKED = [w for w in WORDS if w not in ('zero', 'one')]  # "one" is too often a pronoun


def load_limits(path=LIMITS_PATH):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def parse_brief(text):
    """KEY: value lines -> dict (keys upper-cased). Later lines without a key continue the previous value."""
    out, key = {}, None
    for line in text.splitlines():
        m = re.match(r'^\s*([A-Z][A-Z /()-]{1,30}):\s*(.*)$', line)
        if m:
            key = m.group(1).strip()
            out[key] = m.group(2).strip()
        elif key and line.strip():
            out[key] += '\n' + line.strip()
    return out


def secs(stamp):
    p = [int(x) for x in stamp.split(':')]
    return sum(v * 60 ** k for k, v in enumerate(reversed(p)))


def hashtags(text):
    return re.findall(r'(?<![\w&/])#[A-Za-z]\w*', text)


def strip_noise(text):
    """Remove URLs, hashtags, chapter timestamps and file names before looking for figures."""
    t = re.sub(r'https?://\S+', ' ', text)
    t = re.sub(r'(?<![\w&/])#\w+', ' ', t)
    t = re.sub(r'\b(?:\d+:)?\d{1,2}:\d{2}\b', ' ', t)
    t = re.sub(r'\bX:XX\b', ' ', t)
    return t


def numbers(text):
    return set(re.findall(r'\d+(?:[.,]\d+)?', strip_noise(text)))


def spelled(text):
    return {w for w in SPELLED_CHECKED if re.search(r'\b' + w + r'\b', strip_noise(text), re.I)}


class Report:
    def __init__(self, platform):
        self.platform, self.rows = platform, []

    def add(self, level, check, detail=''):
        self.rows.append({'level': level, 'check': check, 'detail': str(detail)})

    def ok(self, cond, check, detail='', fail='FAIL'):
        self.add('PASS' if cond else fail, check, detail)

    @property
    def failed(self):
        return any(r['level'] == 'FAIL' for r in self.rows)


# ---------- shared checks ----------

def truth_checks(rep, text, brief_text, transcript, brief, limits):
    source = (brief_text or '') + '\n' + (transcript or '')
    if source.strip():
        src_nums = numbers(source) | {WORDS[w] for w in spelled(source)}
        missing = sorted(n for n in numbers(text) if n not in src_nums and n.replace(',', '') not in src_nums)
        rep.ok(not missing, 'Every figure appears in the brief or transcript',
               'not found: ' + ', '.join(missing) if missing else 'all traced')
        loose = sorted(w for w in spelled(text) if WORDS[w] not in src_nums)
        if loose:
            rep.add('WARN', 'Spelled-out numbers traced', 'check these by hand: ' + ', '.join(loose))
    else:
        rep.add('WARN', 'Figures traced', 'no brief or transcript given, so figures were not checked')
    clients = [c.strip() for c in re.split(r'[,;\n]', brief.get('CLIENTS', '')) if c.strip() and c.strip().lower() not in ('none', 'n/a')]
    named = [c for c in clients if re.search(r'\b' + re.escape(c) + r'\b', text, re.I)]
    rep.ok(not named, 'No client names', 'named: ' + ', '.join(named) if named else '')
    ph = sorted(set(re.findall(limits['all']['placeholder_regex'], text)))
    if ph:
        rep.add('WARN', 'Placeholders left to fill', ', '.join(ph))
    else:
        rep.add('PASS', 'No placeholders left')


def hashtag_check(rep, tags, rule, platform):
    n = len(tags)
    dupes = sorted({t.lower() for t in tags if [x.lower() for x in tags].count(t.lower()) > 1})
    if dupes:
        rep.add('FAIL', 'Hashtags are unique', ', '.join(dupes))
    if rule.get('ignored_over') and n > rule['ignored_over']:
        rep.add('FAIL', f'{platform}: over {rule["ignored_over"]} hashtags means all are ignored', n)
        return
    if rule.get('hard_cap') and n > rule['hard_cap']:
        rep.add('FAIL', f'Hashtags within the hard cap of {rule["hard_cap"]}', n)
        return
    rep.ok(rule['min'] <= n <= rule['max'], f'Hashtags {rule["min"]}–{rule["max"]}', n)
    target = rule.get('warn_over', rule.get('target'))
    if target is not None and n > target and rule['min'] <= n <= rule['max']:
        rep.add('WARN', f'Hashtags over the research target of {target}', f'{n}: {rule.get("note", "")}'.strip())


def spacing_check(rep, lines, label, pattern):
    """Each matching line must have a blank line before and after it, apart from the section edges."""
    bad = []
    for i, line in enumerate(lines):
        if re.match(pattern, line):
            nxt = lines[i + 1] if i + 1 < len(lines) else ''
            if nxt.strip() and re.match(pattern, nxt):
                bad.append(line.strip()[:40])
    rep.ok(not bad, f'Blank line between every {label}', 'tight after: ' + ' | '.join(bad) if bad else '')


# ---------- YouTube ----------

def check_youtube(text, limits, brief, title=None, duration=None):
    L = limits['youtube']
    rep = Report('youtube')
    lines = text.rstrip('\n').split('\n')
    nbytes = len(text.encode('utf-8'))
    rep.ok(nbytes <= L['description_max_bytes']['value'], 'Description ≤5,000 bytes', f'{nbytes} bytes, {len(text)} characters')
    lo, hi = L['description_optimal_chars']['value']
    if not lo <= len(text) <= hi:
        rep.add('WARN', f'Length {lo:,}–{hi:,} characters (guide, never pad)', len(text))
    rep.ok(lines[0] == L['cta_line']['value'], 'Line 1 is the pinned WhatsApp CTA, exactly', repr(lines[0][:60]))
    rep.ok(len(lines) > 2 and lines[1] == '' and lines[2].strip(), 'Blank line after the CTA, then the hook')
    hook = lines[2] if len(lines) > 2 else ''
    kw = brief.get('KEYWORD')
    if kw:
        pos = hook.lower().find(kw.lower())
        within = L['hook_keyword_within']['value']
        if pos == -1:
            rep.add('FAIL', f'Keyword "{kw}" in the hook')
        else:
            rep.ok(pos <= within, f'Keyword "{kw}" in the first {within} characters of the hook', f'starts at {pos}', fail='WARN')
    else:
        rep.add('WARN', 'Keyword in the hook', 'no KEYWORD in the brief, so not checked')
    t = title or brief.get('TITLE')
    if t:
        rep.ok(len(t) <= L['title_max']['value'], 'Title ≤100 characters', len(t))
        rep.ok(len(t) <= L['title_brand_max']['value'], 'Title ≤70 characters (house)', len(t))
        rep.ok(not re.search(r'[<>]', t), 'Title has no < or >')
    for head in ("What you'll learn:", 'Chapters', 'How we can help'):
        rep.ok(any(l.strip() == head for l in lines), f'Section heading "{head}"', fail='WARN')
    # chapters
    stamp_re = r'^\s*((?:\d+:)?\d{1,2}:\d{2}|X:XX)\s+\S'
    stamps = [re.match(stamp_re, l).group(1) for l in lines if re.match(stamp_re, l)]
    real = [s for s in stamps if s != 'X:XX']
    if not stamps:
        rep.add('WARN', 'Chapters', 'none found; add them to every long-form video')
    else:
        rep.ok(stamps[0] == '0:00' or stamps[0] == '00:00', 'Chapters start at 0:00', stamps[0])
        rep.ok(len(stamps) >= L['chapters']['min_count'], 'At least 3 chapters', len(stamps))
        if len(real) < len(stamps):
            rep.add('WARN', 'Chapter times to fill', f'{len(stamps) - len(real)} chapters still X:XX')
        else:
            s = [secs(x) for x in real]
            gaps_ok = all(b - a >= L['chapters']['min_gap_s'] for a, b in zip(s, s[1:]))
            rep.ok(gaps_ok, 'Chapters ascending, ≥10 s apart')
            if duration:
                rep.ok(s[-1] < secs(duration), 'Last chapter before the end of the video', f'{real[-1]} vs {duration}')
        spacing_check(rep, lines, 'chapter', stamp_re)
    spacing_check(rep, lines, '"What you\'ll learn" bullet', r'^\s*[•\-*]\s')
    rep.ok(limits['all']['contact_url'] in '\n'.join(lines[1:]), 'Contact link in the closing block', fail='WARN')
    # links + disclosure
    if re.search(r'https?://\S*(?:ref=|affiliate|/aff/|via=|utm_source=partner)\S*', text, re.I):
        rep.ok(re.search(r'affiliate|commission|sponsor', text, re.I), 'Disclosure for affiliate or sponsor links')
    first_links = [l for l in lines[1:4] if re.search(r'https?://', l)]
    rep.ok(all('pecunafactorem.com' in l or '[' in l for l in first_links), 'No third-party or sponsor link near the top', fail='WARN')
    hashtag_check(rep, hashtags(text), L['hashtags'], 'YouTube')
    return rep


# ---------- LinkedIn ----------

def check_linkedin(text, limits, brief, title=None, goal='reach'):
    L = limits['linkedin']
    rep = Report('linkedin')
    rep.ok(len(text) <= L['post_max']['value'], 'Post ≤3,000 characters', len(text))
    lo, hi = L['length_comments' if goal == 'comments' else 'length_reach']['value']
    rep.ok(lo <= len(text) <= hi, f'Length {lo:,}–{hi:,} for {goal}', len(text), fail='WARN')
    hook = text.strip().split('\n')[0]
    if len(hook) > L['hook_max']['value']:
        rep.add('FAIL', 'Hook ≤140 characters (mobile fold)', len(hook))
    else:
        rep.ok(len(hook) <= L['hook_max']['warn_over'], 'Hook ≤110 characters (ideal)', len(hook), fail='WARN')
    t = title or brief.get('TITLE')
    if t:
        rep.ok(hook.strip().lower().rstrip('.') != t.strip().lower().rstrip('.'), "Hook isn't the YouTube title word for word")
    body = re.sub(r'(?m)^\s*(#\w+\s*)+$', '', text)
    links = re.findall(r'https?://\S+', body)
    rep.ok(not links, 'No link in the post body (put it in the first comment)', ', '.join(links), fail='WARN')
    bait = [p for p in L['bait_phrases'] if p in text.lower()]
    rep.ok(not bait, 'No engagement bait', ', '.join(bait))
    if re.search(r"comment\s+['\"“]?[A-Z]{2,}['\"”]?\s+and\s+I'?ll", text):
        rep.add('WARN', 'Comment-keyword CTA', 'LinkedIn demotes comment automation (Mar 2026); reply by hand if you use it')
    paras = [p.strip() for p in re.split(r'\n\s*\n', body.strip()) if p.strip()]
    rep.ok(bool(paras) and '?' in paras[-1], 'Ends on a specific question or clear CTA', paras[-1][-60:] if paras else '', fail='WARN')
    tags = hashtags(text)
    last = text.strip().split('\n')[-1]
    if tags:
        rep.ok(all(tg in last for tg in tags), 'Hashtags at the end, on their own line', fail='WARN')
        rep.ok(not hashtags(hook), 'No hashtags in the hook')
    hashtag_check(rep, tags, L['hashtags'], 'LinkedIn')
    return rep


# ---------- Instagram ----------

def check_instagram(text, limits, brief, fmt='reel', end_card=None, alt=None):
    L = limits['instagram']
    rep = Report('instagram')
    rep.ok(len(text) <= L['caption_max']['value'], 'Caption ≤2,200 characters including hashtags', len(text))
    first = text.strip().split('\n')[0]
    fl_max = L['first_line_max']['reel' if fmt == 'reel' else 'feed']
    rep.ok(len(first) <= fl_max, f'First line ≤{fl_max} characters ({fmt})', len(first))
    kw = brief.get('KEYWORD')
    if kw:
        rep.ok(kw.lower() in first.lower(), f'Keyword "{kw}" in the first line', fail='WARN')
    tags = hashtags(text)
    body = re.sub(r'(?m)^\s*(#\w+\s*)+$', '', text).strip()
    lo, hi = L['body_chars'][fmt]
    rep.ok(lo <= len(body) <= hi, f'Body {lo}–{hi} characters ({fmt})', len(body), fail='WARN')
    if fmt == 'carousel':
        words = len(body.split())
        rep.ok(words <= L['carousel_words_max']['value'], 'Carousel caption under 30 words', words, fail='WARN')
    hashtag_check(rep, tags, L['hashtags'], 'Instagram')
    banned = [t for t in tags if t.lower() in L['banned_generic_tags']]
    rep.ok(not banned, 'No generic reach-bait hashtags', ', '.join(banned))
    last = text.strip().split('\n')[-1]
    if tags:
        rep.ok(all(tg in last for tg in tags), 'Hashtags at the end of the caption (not the first comment)', fail='WARN')
    mentions = re.findall(r'(?<![\w.])@\w+', text)
    rep.ok(len(mentions) <= L['mentions_max']['value'], '≤20 @mentions', len(mentions))
    # one CTA
    after_first = '\n'.join(body.split('\n')[1:])
    found = []
    for name, pat in L['cta_patterns'].items():
        if name == 'question':
            paras = [p for p in re.split(r'\n\s*\n', after_first) if p.strip()]
            if paras and re.search(pat, paras[-1].strip()):
                found.append(name)
        elif re.search(pat, after_first, re.I if name != 'comment_dm' else 0):
            found.append(name)
    rep.ok(len(found) == 1, 'Exactly one CTA', ', '.join(found) or 'none found')
    want = end_card or brief.get('END CARD CTA')
    if want:
        rep.ok(want.lower() in text.lower(), "CTA matches the video's end card", f'end card: "{want}"')
    if fmt in ('carousel', 'image'):
        if alt is None:
            rep.add('WARN', 'Alt text', 'write custom alt text for every image or slide (≤125 characters each)')
        else:
            long = [a for a in alt if len(a) > L['alt_text_max']['value']]
            rep.ok(not long, 'Alt text ≤1,000 characters each', len(long))
    return rep


def run(platform, text, brief_text='', transcript='', limits=None, **kw):
    limits = limits or load_limits()
    brief = parse_brief(brief_text or '')
    if platform == 'youtube':
        rep = check_youtube(text, limits, brief, kw.get('title'), kw.get('duration') or brief.get('DURATION'))
    elif platform == 'linkedin':
        rep = check_linkedin(text, limits, brief, kw.get('title'), kw.get('goal') or 'reach')
    elif platform == 'instagram':
        rep = check_instagram(text, limits, brief, kw.get('fmt') or 'reel', kw.get('end_card'), kw.get('alt'))
    else:
        raise ValueError(platform)
    truth_checks(rep, text, brief_text, transcript, brief, limits)
    return rep


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('platform', choices=['youtube', 'linkedin', 'instagram'])
    ap.add_argument('file')
    ap.add_argument('--brief')
    ap.add_argument('--transcript')
    ap.add_argument('--title')
    ap.add_argument('--duration')
    ap.add_argument('--goal', choices=['reach', 'comments'])
    ap.add_argument('--format', dest='fmt', choices=['reel', 'carousel', 'image'])
    ap.add_argument('--end-card')
    ap.add_argument('--alt', help='file with one alt text per line')
    ap.add_argument('--limits', default=LIMITS_PATH)
    ap.add_argument('--json', action='store_true')
    a = ap.parse_args()
    read = lambda p: open(p, encoding='utf-8').read() if p else ''
    alt = [l for l in read(a.alt).splitlines() if l.strip()] if a.alt else None
    rep = run(a.platform, read(a.file), read(a.brief), read(a.transcript), load_limits(a.limits),
              title=a.title, duration=a.duration, goal=a.goal, fmt=a.fmt, end_card=a.end_card, alt=alt)
    if a.json:
        print(json.dumps({'platform': rep.platform, 'failed': rep.failed, 'rows': rep.rows}, indent=1, ensure_ascii=False))
    else:
        for r in rep.rows:
            print(f"{r['level']:4} | {r['check']}" + (f" | {r['detail']}" if r['detail'] else ''))
        counts = {k: sum(r['level'] == k for r in rep.rows) for k in ('PASS', 'WARN', 'FAIL')}
        print(f"{rep.platform}: {counts['PASS']} pass, {counts['WARN']} warn, {counts['FAIL']} fail")
    sys.exit(1 if rep.failed else 0)


if __name__ == '__main__':
    main()

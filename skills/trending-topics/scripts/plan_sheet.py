#!/usr/bin/env python3
"""Render the month (30 videos) or week (7 videos) sheet from a plan file, in the same format every time.

Usage:
  python3 plan_sheet.py <plan.json> --out "video-plans/<name>.md"
                        [--register video-plans/topic-register.json] [--giants references/giants.json]
                        [--scrub <scratchpad>/scrub.txt]

The plan file (written by the run, kept in the scratchpad):
{
  "kind": "month" | "week",
  "period": "Thu 12 November to Fri 11 December",
  "research": {"giants": "...", "our_work": "...", "creators": "..."},
  "left_out": "...",                       optional
  "topics": [                              30 for a month, 7 for a week, in posting order
    {"day": "Thu 12 Nov", "title": "...", "giants": ["Ethan Mollick", "Alex Albert"],
     "lane": "AI" | "Ads",                 optional: worked out from giants.json
     "evidence": "Mollick, 9 Nov: \"quote\"", "url": "https://x.com/...",
     "ours": "our version", "score": 44, "parts": "spread 5×3 · fresh 5×2 · ..."},
    {"day": "Wed 11 Nov", "title": "...", "from": "locked"}       a locked or booked title
  ],
  "work_rows": ["| A1 | ... |"], "youtube_rows": ["| C1 | ... |"],   the other two engines' table rows
  "whittled": ["one line each"], "notes": ["one line each"]
}

Writes the sheet, then runs check_picks.py on it and exits with its result.
The top table is one line per video: # · Day · Video · Giant · Lane · Score.
"""
import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import check_picks  # noqa: E402

TWITTER_HEAD = '| # | Topic (best title) | The giant(s) | Best evidence | Our version | Score |\n|---|---|---|---|---|---|'
WORK_HEAD = '| # | Topic (best title) | What we built | Status | Wow | Proof on screen | Score |\n|---|---|---|---|---|---|---|'
YT_HEAD = '| # | Topic (best title) | What the creators proved | Best evidence | Our version | Score |\n|---|---|---|---|---|---|'


def giant_label(gs):
    if not gs:
        return '-'
    return gs[0] + (f' +{len(gs) - 1}' if len(gs) > 1 else '')


def lanes_from(giants_file):
    if not giants_file or not os.path.exists(giants_file):
        return {}
    g = json.load(open(giants_file, encoding='utf-8'))
    out = {x['name']: 'AI' for x in g.get('ai', [])}
    out.update({x['name']: 'Ads' for x in g.get('paid_media', [])})
    for x in g.get('bench', []):
        out.setdefault(x['name'], 'Ads' if x.get('group') == 'paid_media' else 'AI')
    return out


def locked_block(register):
    if not register or not os.path.exists(register):
        return '**Locked in:** none'
    reg = json.load(open(register, encoding='utf-8'))
    ts = [t for t in reg.get('topics', []) if t.get('status') in ('locked', 'planned')]
    if not ts:
        return '**Locked in:** none'
    return '**Locked in:**\n' + '\n'.join(f'- "{t["title"]}" ({t["status"]})' for t in ts)


def rules(plan, giants_file=None):
    """Framework 2's mechanical rules. Returns BLOCKING messages (empty when the plan is fine)."""
    month = plan.get('kind', 'month') == 'month'
    lane_of = lanes_from(giants_file)
    ts = [t for t in plan['topics'] if t.get('from') != 'locked']
    errs = []
    if month and len(plan['topics']) < 30:
        errs.append(f'month plan has {len(plan["topics"])} days; it needs 30')
    lead, openings = {}, {}
    ads = 0
    for i, t in enumerate(ts, 1):
        if not t.get('url') or not t.get('evidence'):
            errs.append(f'T{i} has no evidence or link')
        if int(t.get('score', 0)) < 30:
            errs.append(f'T{i} scores {t.get("score")}/50: under the worthy line of 30')
        lane = t.get('lane') or next((lane_of[g] for g in t.get('giants', []) if g in lane_of), 'AI')
        ads += lane == 'Ads'
        if t.get('giants'):
            lead[t['giants'][0]] = lead.get(t['giants'][0], 0) + 1
        op = ' '.join(t['title'].lower().split()[:2])
        openings.setdefault(op, []).append(f'T{i}')
    if month:
        if ads < 10:
            errs.append(f'only {ads} paid-media videos; a month needs at least 10')
        errs += [f'{g} leads {n} videos; the most is 3' for g, n in lead.items() if n > 3]
    errs += [f'{", ".join(v)} open with the same words ("{k}")' for k, v in openings.items() if len(v) > 1]
    return errs


def render(plan, register=None, giants_file=None):
    month = plan.get('kind', 'month') == 'month'
    n = 30 if month else 7
    lane_of = lanes_from(giants_file)
    topics = plan['topics']
    t_rows, plan_rows, k = [], [], 0
    counts = {'AI': 0, 'Ads': 0}
    for t in topics:
        if t.get('from') == 'locked':
            plan_rows.append(f'| locked | {t["day"]} | {t["title"]} | - | {t.get("lane", "booked")} | - |')
            continue
        k += 1
        lane = t.get('lane') or next((lane_of[g] for g in t.get('giants', []) if g in lane_of), 'AI')
        counts[lane] = counts.get(lane, 0) + 1
        plan_rows.append(f'| T{k} | {t["day"]} | {t["title"]} | {giant_label(t.get("giants"))} | {lane} | {t["score"]} |')
        t_rows.append(f'| T{k} | {t["title"]} | {", ".join(t.get("giants", []))} | {t["evidence"]} {t["url"]} | '
                      f'{t.get("ours", "")} | **{t["score"]}/50** |')
    r = plan.get('research', {})
    head = (f'# Trending Topics: {n} videos, {plan["period"]}\n\n{locked_block(register)}\n\n'
            f'**Giants researched:** {r.get("giants", "")}\n'
            f'**Our work researched:** {r.get("our_work", "")}\n'
            f'**Creators researched:** {r.get("creators", "")}\n')
    if plan.get('left_out'):
        head += f'**Left out as already done:** {plan["left_out"]}\n'
    heading = check_picks.MONTH if month else check_picks.WEEK
    out = [head, heading, '', '| # | Day | Video | Giant | Lane | Score |', '|---|---|---|---|---|---|', *plan_rows, '',
           f'**Mix:** {counts.get("AI", 0)} AI · {counts.get("Ads", 0)} paid media'
           + (f' · {len(topics) - k} locked' if len(topics) > k else '') + '. Scores are out of 50 (Part T).']
    if plan.get('whittled'):
        out += ['', '**How the 30 were picked:**' if month else '**How the 7 were picked:**']
        out += [f'- {w}' for w in plan['whittled']]
    out += ['', '## 1. Twitter engine', '', TWITTER_HEAD, *t_rows]
    parts = [(f'T{i + 1}', t) for i, t in enumerate([t for t in topics if t.get('from') != 'locked'])]
    if any(t.get('parts') for _, t in parts):
        out += ['', '**Scores:** ' + ' · '.join(f'{tid} {t["parts"]}' for tid, t in parts if t.get('parts'))]
    out += ['', '## 2. My work engine', '', WORK_HEAD, *plan.get('work_rows', []),
            '', '## 3. YouTube engine', '', YT_HEAD, *plan.get('youtube_rows', [])]
    if plan.get('notes'):
        out += ['', '## Things we noticed', *[f'- {x}' for x in plan['notes']]]
    end = check_picks.END.replace('7', '30') if month else check_picks.END
    out += ['', end, '']
    return '\n'.join(out)


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('plan')
    ap.add_argument('--out', required=True)
    ap.add_argument('--register', default=os.path.join('video-plans', 'topic-register.json'))
    ap.add_argument('--giants', default=os.path.join(HERE, '..', 'references', 'giants.json'))
    ap.add_argument('--scrub', default=None)
    a = ap.parse_args(argv)
    plan = json.load(open(a.plan, encoding='utf-8'))
    errs = rules(plan, a.giants)
    for e in errs:
        print(f'BLOCKING  {e}')
    if errs:
        print(f'FAIL  {a.plan}: {len(errs)} problem(s) with the 30 (Framework 2). Fix the plan and re-run.')
        return 1
    text = render(plan, a.register, a.giants)
    open(a.out, 'w', encoding='utf-8').write(text)
    print(f'Wrote {a.out}')
    args = [a.out, '--register', a.register] + (['--scrub', a.scrub] if a.scrub else [])
    return check_picks.main(args)


if __name__ == '__main__':
    sys.exit(main())

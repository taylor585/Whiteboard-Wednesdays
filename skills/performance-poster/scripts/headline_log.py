#!/usr/bin/env python3
"""Headline log: every title and thumbnail line Taylor writes or picks, with results, so winners can be found and reused.

The log is a CSV (default: references/shared/headline-log.csv). Keep a durable copy outside the skill (the exported .xlsx,
or a CSV in the user's project) and pass it with --log; import an edited spreadsheet back with `import`.

Usage:
  python3 headline_log.py add --video "AI Vision Boards" --kind title --text "This Is a Cheat Code When Using AI" \
      --source taylor --status chosen [--formula curiosity-verdict] [--tags "curiosity;metaphor"] [--pair "..."] [--notes "..."]
  python3 headline_log.py update --id 21 [--status published] [--ctr 5.2] [--avg 4.1] [--views 1200] [--outlier 1.6] [--notes "..."]
  python3 headline_log.py list [--source taylor] [--kind title]
  python3 headline_log.py winners                      # ranked by CTR vs channel average, then outlier; plus pattern summary
  python3 headline_log.py export headlines.xlsx        # spreadsheet with Headlines, Winners and Patterns sheets
  python3 headline_log.py import headlines.xlsx        # read the Headlines sheet back into the CSV

kind: title | thumbnail_line | working_title | hook_youtube | hook_linkedin | hook_instagram. source: taylor | taylor-spoken | claude.
status: published | chosen | ab-candidate | candidate | on-hold | replaced | recommended-not-used | ... (free text allowed).
"""
import argparse
import csv
import datetime as dt
import os
import statistics
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_LOG = os.path.join(HERE, '..', 'references', 'shared', 'headline-log.csv')
COLS = ['id', 'date', 'video', 'kind', 'text', 'chars', 'source', 'status', 'formula', 'pattern_tags', 'paired_with',
        'ctr_48h', 'channel_avg_ctr', 'views_7d', 'outlier_30d', 'notes']


def load(path):
    if not os.path.exists(path):
        return []
    with open(path, newline='', encoding='utf-8') as f:
        return list(csv.DictReader(f))


def save(path, rows):
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=COLS, extrasaction='ignore')
        w.writeheader()
        for r in rows:
            w.writerow({c: r.get(c, '') for c in COLS})


def num(v):
    try:
        return float(str(v).replace('%', '').strip())
    except (TypeError, ValueError):
        return None


def lift(r):
    """CTR relative to the channel average (1.0 = average). None until both are logged."""
    c, a = num(r.get('ctr_48h')), num(r.get('channel_avg_ctr'))
    return round(c / a, 2) if c is not None and a else None


def ranked(rows):
    scored = [r for r in rows if lift(r) is not None or num(r.get('outlier_30d')) is not None]
    return sorted(scored, key=lambda r: (lift(r) or 0, num(r.get('outlier_30d')) or 0), reverse=True)


def pattern_summary(rows):
    """Per pattern tag: how many Taylor wrote, how many he picked/published, and the median CTR lift where known."""
    tags = {}
    for r in rows:
        for t in filter(None, (x.strip() for x in r.get('pattern_tags', '').split(';'))):
            d = tags.setdefault(t, {'n': 0, 'picked': 0, 'lifts': []})
            d['n'] += 1
            if r.get('status') in ('published', 'chosen'):
                d['picked'] += 1
            if lift(r) is not None:
                d['lifts'].append(lift(r))
    return sorted(((t, d['n'], d['picked'], round(statistics.median(d['lifts']), 2) if d['lifts'] else None)
                   for t, d in tags.items()), key=lambda x: (-x[2], -x[1]))


def export_xlsx(rows, out):
    from openpyxl import Workbook
    from openpyxl.styles import Alignment, Font, PatternFill
    from openpyxl.worksheet.datavalidation import DataValidation
    ink, gold, hl = '1C1A17', '8B6002', 'F6DF8C'
    wb = Workbook()
    ws = wb.active
    ws.title = 'Headlines'
    ws.append(COLS + ['ctr_vs_avg'])
    for i, r in enumerate(rows, start=2):
        vals = [r.get(c, '') for c in COLS]
        for k in ('id', 'chars', 'ctr_48h', 'channel_avg_ctr', 'views_7d', 'outlier_30d'):
            j = COLS.index(k)
            vals[j] = num(vals[j]) if num(vals[j]) is not None else ('' if vals[j] in ('', None) else vals[j])
            if k in ('id', 'chars', 'views_7d') and isinstance(vals[j], float):
                vals[j] = int(vals[j])
        vals[COLS.index('chars')] = f'=LEN(E{i})'
        ws.append(vals + [f'=IF(AND(L{i}<>"",M{i}<>""),L{i}/M{i},"")'])
    head = PatternFill('solid', fgColor=ink)
    for c in ws[1]:
        c.font = Font(bold=True, color='FFFFFF')
        c.fill = head
    widths = {'A': 5, 'B': 11, 'C': 20, 'D': 15, 'E': 62, 'F': 7, 'G': 13, 'H': 20, 'I': 18, 'J': 34, 'K': 30,
              'L': 9, 'M': 12, 'N': 10, 'O': 11, 'P': 60, 'Q': 11}
    for col, w in widths.items():
        ws.column_dimensions[col].width = w
    for row in ws.iter_rows(min_row=2):
        for c in row:
            c.alignment = Alignment(vertical='top', wrap_text=c.column_letter in ('E', 'J', 'K', 'P'))
        if row[COLS.index('source')].value in ('taylor', 'taylor-spoken'):
            row[COLS.index('text')].font = Font(bold=True)
        if row[COLS.index('status')].value in ('published', 'chosen'):
            row[COLS.index('status')].fill = PatternFill('solid', fgColor=hl)
    for r in range(2, ws.max_row + 1):
        ws[f'Q{r}'].number_format = '0.00"x"'
    ws.freeze_panes = 'F2'
    ws.auto_filter.ref = f'A1:Q{ws.max_row}'
    for col, opts in (('D', 'title,thumbnail_line,working_title'), ('G', 'taylor,taylor-spoken,claude'),
                      ('H', 'published,chosen,ab-candidate,candidate,on-hold,replaced,recommended-not-used,candidate-not-used')):
        dv = DataValidation(type='list', formula1=f'"{opts}"', allow_blank=True, showErrorMessage=False)
        ws.add_data_validation(dv)
        dv.add(f'{col}2:{col}1000')

    w2 = wb.create_sheet('Winners')
    w2.append(['Rank', 'Text', 'Kind', 'Video', 'CTR 48h', 'Channel avg', 'CTR vs avg', 'Outlier 30d', 'Pattern tags'])
    for c in w2[1]:
        c.font = Font(bold=True, color='FFFFFF')
        c.fill = PatternFill('solid', fgColor=gold)
    rk = ranked(rows)
    for i, r in enumerate(rk, 1):
        w2.append([i, r['text'], r['kind'], r['video'], num(r['ctr_48h']), num(r['channel_avg_ctr']), lift(r),
                   num(r['outlier_30d']), r['pattern_tags']])
    if not rk:
        w2.append(['', 'No results logged yet. Fill ctr_48h and channel_avg_ctr (YouTube Studio → Reach) 48 hours after publishing.'])
    for col, w in zip('ABCDEFGHI', (6, 62, 15, 20, 9, 11, 10, 11, 34)):
        w2.column_dimensions[col].width = w

    w3 = wb.create_sheet('Patterns')
    w3.append(['Pattern tag', 'Times used', 'Times picked or published', 'Median CTR vs avg'])
    for c in w3[1]:
        c.font = Font(bold=True, color='FFFFFF')
        c.fill = PatternFill('solid', fgColor=ink)
    for t in pattern_summary(rows):
        w3.append(list(t))
    for col, w in zip('ABCD', (24, 12, 24, 18)):
        w3.column_dimensions[col].width = w
    w3.append([])
    w3.append(['Tags describe how each headline is built (see references/shared/taylor-voice.md). '
               'As results come in, the tags with the best median CTR vs avg are the patterns to reuse.'])
    wb.save(out)


def import_xlsx(path):
    from openpyxl import load_workbook
    ws = load_workbook(path, data_only=True)['Headlines']
    hdr = [c.value for c in ws[1]]
    rows = []
    for row in ws.iter_rows(min_row=2, values_only=True):
        if not any(row):
            continue
        r = {h: ('' if v is None else v) for h, v in zip(hdr, row) if h in COLS}
        r['chars'] = len(str(r.get('text', '')))
        rows.append(r)
    return rows


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--log', default=DEFAULT_LOG)
    sub = ap.add_subparsers(dest='cmd', required=True)
    a = sub.add_parser('add')
    for k in ('video', 'kind', 'text', 'source', 'status'):
        a.add_argument('--' + k, required=True)
    for k in ('formula', 'tags', 'pair', 'notes', 'date'):
        a.add_argument('--' + k, default='')
    u = sub.add_parser('update')
    u.add_argument('--id', required=True)
    for k in ('status', 'ctr', 'avg', 'views', 'outlier', 'notes', 'tags', 'formula'):
        u.add_argument('--' + k)
    ls = sub.add_parser('list')
    ls.add_argument('--source')
    ls.add_argument('--kind')
    sub.add_parser('winners')
    e = sub.add_parser('export')
    e.add_argument('out')
    i = sub.add_parser('import')
    i.add_argument('xlsx')
    o = ap.parse_args()
    rows = load(o.log)

    if o.cmd == 'add':
        if any(r['text'].strip().lower() == o.text.strip().lower() and r['video'] == o.video and r['kind'] == o.kind for r in rows):
            sys.exit(f'already logged for {o.video} ({o.kind}): {o.text}')
        nid = max([int(r['id']) for r in rows] or [0]) + 1
        rows.append(dict(id=nid, date=o.date or dt.date.today().isoformat(), video=o.video, kind=o.kind, text=o.text,
                         chars=len(o.text), source=o.source, status=o.status, formula=o.formula, pattern_tags=o.tags,
                         paired_with=o.pair, notes=o.notes))
        save(o.log, rows)
        print(f'added #{nid}: {o.text} ({len(o.text)} chars)')
    elif o.cmd == 'update':
        r = next((r for r in rows if str(r['id']) == str(o.id)), None)
        if not r:
            sys.exit(f'no row with id {o.id}')
        for k, col in (('status', 'status'), ('ctr', 'ctr_48h'), ('avg', 'channel_avg_ctr'), ('views', 'views_7d'),
                       ('outlier', 'outlier_30d'), ('tags', 'pattern_tags'), ('formula', 'formula')):
            if getattr(o, k) is not None:
                r[col] = getattr(o, k)
        if o.notes:
            r['notes'] = (r.get('notes', '') + ' ' + o.notes).strip()
        save(o.log, rows)
        print(f'updated #{o.id}')
    elif o.cmd == 'list':
        for r in rows:
            if (not o.source or r['source'] == o.source) and (not o.kind or r['kind'] == o.kind):
                print(f"#{r['id']:>3} {r['date']} [{r['kind']}/{r['source']}/{r['status']}] {r['text']} ({r['chars']})")
    elif o.cmd == 'winners':
        rk = ranked(rows)
        if not rk:
            print('No results logged yet: fill --ctr and --avg 48 hours after publishing.')
        for n, r in enumerate(rk, 1):
            print(f"{n}. {r['text']}  CTR vs avg {lift(r)}  outlier {r.get('outlier_30d') or '-'}  [{r['pattern_tags']}]")
        print('\nPatterns (tag, used, picked/published, median CTR vs avg):')
        for t in pattern_summary(rows):
            print('  ', *t)
    elif o.cmd == 'export':
        export_xlsx(rows, o.out)
        print(f'wrote {o.out} ({len(rows)} headlines)')
    elif o.cmd == 'import':
        new = import_xlsx(o.xlsx)
        save(o.log, new)
        print(f'imported {len(new)} rows into {o.log}')


if __name__ == '__main__':
    main()

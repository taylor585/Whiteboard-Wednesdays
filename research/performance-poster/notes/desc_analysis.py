#!/usr/bin/env python3
"""Description analysis for the Performance Poster research (20 Oct 2026).

Reads the thumbnail-tracker teardown data (read-only) and computes, per creator
and per sample (latest30 / top20): description length, first-line length,
first-150-character content, keyword-in-first-150, link count, first link line,
hashtag count, chapters, CTA on line 1, and their relationship with `outlier`.

The source data are analyst teardowns, not raw descriptions, so the fields
differ by creator and sample. Every metric records n (non-missing values).
Usage: python3 -I desc_analysis.py <data_dir>   (prints Markdown tables)
"""
import json, re, sys, statistics as st
from pathlib import Path

DATA = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(
    "/root/.claude/skills/synced/d2001955-ee64-4834-bd8f-658c7cbadd7f_ef155cf0-e163-4abb-9fde-56bc76d70115/"
    "thumbnail-tracker/references/research/data")

URL = re.compile(r"(https?://\S+|\b[a-z0-9-]+\.(?:com|co|io|inc|ai|link|app)\b/?\S*)", re.I)
CTA_VERB = re.compile(r"^\W*(join|download|get|grab|check out|book|sign up|apply|watch|subscribe|try|start|claim|the app that)\b", re.I)
STOP = set("""the a an and or of to in on for with without from by at is are was be been this that these those
how why what when who i you your my me we our it its his her their them they he she can will just new
more most way than into out off over under about after before vs versus best full free course hours hrs
make made build built use using get got one two three five ten every all any really actually even still
2024 2025 2026 here there have has had not no do does did like""".split())


def fnum(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def content_words(title):
    return [w for w in re.findall(r"[A-Za-z][A-Za-z0-9.'-]+", title)
            if len(w) >= 4 and w.lower().strip(".'") not in STOP]


def chapters_from(v):
    if isinstance(v, dict):
        if "present" in v:
            return bool(v["present"]), v.get("count")
        c = v.get("count")
        return (c or 0) > 0, c
    if isinstance(v, str):
        if v.strip().lower().startswith("none"):
            return False, 0
        m = re.match(r"\s*(\d+)", v)
        return True, int(m.group(1)) if m else None
    return None, None


def hashtags_from(v):
    if isinstance(v, dict):
        return v.get("count")
    if isinstance(v, list):
        return len(v)
    if isinstance(v, int):
        return v
    if isinstance(v, str):
        return 0 if v.strip().lower().startswith("none") else len(re.findall(r"#\w+", v))
    return None


def first_link_line_from_text(text):
    for i, line in enumerate(text.split("\n"), 1):
        if URL.search(line):
            return i
    return None


def row(creator, sample, v):
    d = v.get("description") or v.get("desc") or {}
    title = v["title"]
    out = {"creator": creator, "sample": sample, "title": title, "outlier": fnum(v.get("outlier")),
           "index": fnum(v.get("index"))}
    # opening text: verbatim above-fold or the first line
    full = d.get("full_text")
    opening = full or d.get("above_fold") or d.get("above_fold_verbatim") or d.get("first_line") or ""
    first_line = d.get("first_line") or opening.split("\n")[0]
    out["opening_src"] = "full_text" if full else ("above_fold" if (d.get("above_fold") or d.get("above_fold_verbatim")) else "first_line")
    out["first_line_len"] = len(first_line) if first_line else None
    first150 = opening.replace("\n", " ")[:150] if opening else ""
    out["first150_complete"] = len(opening) >= 150 if opening else False
    # length
    out["length"] = fnum(d.get("length") or d.get("chars") or d.get("length_chars"))
    # keyword: analyst front keyword (latest30) and a title-content-word proxy (all)
    tf = v.get("title_fields") or {}
    fk = tf.get("front_keyword")
    if isinstance(fk, dict):
        fk = fk.get("word")
    out["front_keyword"] = fk
    out["kw_in_150"] = (fk.lower() in first150.lower()) if (fk and first150) else None
    cw = content_words(title)
    out["title_word_in_150"] = any(w.lower() in first150.lower() for w in cw) if (cw and first150) else None
    # links
    links = d.get("links")
    if isinstance(links, dict):
        out["links"] = links.get("count")
    elif isinstance(links, list):
        out["links"] = len(links)
    else:
        out["links"] = None  # top20: not recorded
    out["links_in_fold"] = len(URL.findall(opening)) if opening else None
    fll = d.get("first_link_line")
    out["first_link_line"] = fll if isinstance(fll, int) else (first_link_line_from_text(opening) if sample == "top20" else None)
    # hashtags
    out["hashtags"] = hashtags_from(d.get("hashtags_real", d.get("hashtags")))
    # chapters
    out["chapters"], out["chapter_count"] = chapters_from(d.get("chapters"))
    # CTA on line 1
    job = str(d.get("first_line_job") or "")
    out["cta_line1"] = bool(job.upper().startswith("CTA") or job.lower().startswith("link")
                            or URL.search(first_line or "") or CTA_VERB.search(first_line or ""))
    out["duration_s"] = fnum(v.get("duration_s")) or (fnum(v.get("duration_min")) * 60 if v.get("duration_min") else None)
    return out


def load():
    rows = []
    for c in ("nick", "riley", "sabri"):
        for s in ("latest30", "top20"):
            data = json.loads((DATA / f"{c}-{s}.json").read_text())
            vids = data["videos"] if isinstance(data, dict) else data
            rows += [row(c, s, v) for v in vids]
    return rows


def q(vals):
    vals = sorted(vals)
    if len(vals) < 4:
        return None, None
    qs = st.quantiles(vals, n=4)
    return qs[0], qs[2]


def rank(xs):
    order = sorted(range(len(xs)), key=lambda i: xs[i])
    r = [0.0] * len(xs)
    i = 0
    while i < len(xs):
        j = i
        while j + 1 < len(xs) and xs[order[j + 1]] == xs[order[i]]:
            j += 1
        for k in range(i, j + 1):
            r[order[k]] = (i + j) / 2 + 1
        i = j + 1
    return r


def spearman(xs, ys):
    pairs = [(x, y) for x, y in zip(xs, ys) if x is not None and y is not None]
    if len(pairs) < 5:
        return None, len(pairs)
    a, b = rank([p[0] for p in pairs]), rank([p[1] for p in pairs])
    if len(set(a)) < 2 or len(set(b)) < 2:
        return None, len(pairs)
    return st.correlation(a, b), len(pairs)


def fmt(x, nd=2):
    if x is None:
        return "n/a"
    if isinstance(x, float):
        return f"{x:,.{nd}f}" if abs(x) < 1000 else f"{x:,.0f}"
    return str(x)


def describe(rows, key):
    vals = [r[key] for r in rows if r[key] is not None]
    if not vals:
        return "n/a (n=0)"
    lo, hi = q(vals)
    iqr = f"{fmt(lo,0)}–{fmt(hi,0)}" if lo is not None else "n/a"
    return f"{fmt(float(st.median(vals)),0)} [{iqr}] (n={len(vals)})"


def share(rows, key):
    vals = [r[key] for r in rows if r[key] is not None]
    if not vals:
        return "n/a (n=0)"
    return f"{sum(1 for v in vals if v)}/{len(vals)}"


def split(rows, key, kind):
    """Median outlier for feature high/present vs low/absent."""
    rs = [r for r in rows if r[key] is not None and r["outlier"] is not None]
    if len(rs) < 4:
        return "n/a"
    if kind == "bool":
        a = [r["outlier"] for r in rs if r[key]]
        b = [r["outlier"] for r in rs if not r[key]]
    else:
        m = st.median([r[key] for r in rs])
        a = [r["outlier"] for r in rs if r[key] > m]
        b = [r["outlier"] for r in rs if r[key] <= m]
    if not a or not b:
        return f"no split (all {'yes' if a else 'no'}, n={len(rs)})"
    return f"{st.median(a):.2f} (n={len(a)}) vs {st.median(b):.2f} (n={len(b)})"


def main():
    rows = load()
    groups = [(c, s) for c in ("nick", "riley", "sabri") for s in ("latest30", "top20")]
    print("## Table A: descriptive statistics (median [IQR] (n) or count/n)\n")
    hdr = ["creator", "sample", "n", "length", "first line chars", "keyword (analyst) in first 150",
           "title word in first 150", "links (total)", "URLs above fold", "first link line", "hashtags>0",
           "hashtag median", "chapters", "CTA on line 1"]
    print("| " + " | ".join(hdr) + " |\n|" + "---|" * len(hdr))
    for c, s in groups:
        g = [r for r in rows if r["creator"] == c and r["sample"] == s]
        hs = [r["hashtags"] for r in g if r["hashtags"] is not None]
        print("| " + " | ".join([c, s, str(len(g)), describe(g, "length"), describe(g, "first_line_len"),
              share(g, "kw_in_150"), share(g, "title_word_in_150"), describe(g, "links"),
              describe(g, "links_in_fold"), describe(g, "first_link_line"),
              f"{sum(1 for h in hs if h)}/{len(hs)}", fmt(float(st.median(hs)), 0) if hs else "n/a",
              share(g, "chapters"), share(g, "cta_line1")]) + " |")

    print("\n## Table B: median outlier, feature high/present vs low/absent (median split for numbers)\n")
    feats = [("length", "num"), ("first_line_len", "num"), ("kw_in_150", "bool"), ("title_word_in_150", "bool"),
             ("links", "num"), ("first_link_line", "num"), ("hashtags", "num"), ("chapters", "bool"),
             ("cta_line1", "bool")]
    print("| creator | sample | " + " | ".join(f for f, _ in feats) + " |\n|" + "---|" * (len(feats) + 2))
    for c, s in groups:
        g = [r for r in rows if r["creator"] == c and r["sample"] == s]
        print(f"| {c} | {s} | " + " | ".join(split(g, f, k) for f, k in feats) + " |")

    print("\n## Table C: Spearman rho with outlier (rho, n)\n")
    num = ["length", "first_line_len", "links", "links_in_fold", "first_link_line", "hashtags", "chapter_count"]
    print("| creator | sample | " + " | ".join(num) + " |\n|" + "---|" * (len(num) + 2))
    for c, s in groups:
        g = [r for r in rows if r["creator"] == c and r["sample"] == s]
        cells = []
        for f in num:
            rho, n = spearman([r[f] for r in g], [r["outlier"] for r in g])
            cells.append(f"{rho:+.2f} (n={n})" if rho is not None else f"n/a (n={n})")
        print(f"| {c} | {s} | " + " | ".join(cells) + " |")

    # sensitivity: drop newest 5 (still-settling ratios) from latest30
    print("\n## Table D: latest30 sensitivity, newest 5 uploads dropped (median outlier split)\n")
    print("| creator | " + " | ".join(f for f, _ in feats) + " |\n|" + "---|" * (len(feats) + 1))
    for c in ("nick", "riley", "sabri"):
        g = [r for r in rows if r["creator"] == c and r["sample"] == "latest30" and (r["index"] or 99) > 5]
        print(f"| {c} (n={len(g)}) | " + " | ".join(split(g, f, k) for f, k in feats) + " |")

    print("\n## Table E: opening-text source used for first-150 metrics\n")
    print("| creator | sample | full_text | above_fold | first_line only | opening shorter than 150 chars |\n|---|---|---|---|---|---|")
    for c, s in groups:
        g = [r for r in rows if r["creator"] == c and r["sample"] == s]
        cnt = {k: sum(1 for r in g if r["opening_src"] == k) for k in ("full_text", "above_fold", "first_line")}
        print(f"| {c} | {s} | {cnt['full_text']} | {cnt['above_fold']} | {cnt['first_line']} | "
              f"{sum(1 for r in g if not r['first150_complete'])} |")

    json.dump(rows, open(Path(__file__).with_name("desc_rows.json"), "w"), indent=1)


if __name__ == "__main__":
    main()

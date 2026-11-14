#!/usr/bin/env python3
"""Whiteboard Wednesday Output: file names, the Post Copy document and the folder check.

  output.py names "<title>" [--reels N]          print every expected name, by folder
  output.py doc <copy.json>                      print the Post Copy document as HTML
  output.py check "<title>" <listing.json> [--reels N]
        listing.json: [{"title": "...", "folder": "Post Videos"}, ...]
        prints PASS or FAIL lines; exit code 1 on any FAIL
Standard library only.
"""
import argparse
import html
import json
import re
import sys

VIDEOS, THUMBS, COPY = "Post Videos", "Post Thumbnail", "Post Copy"
VIDEO_EXT = (".mp4", ".mov", ".m4v")
IMAGE_EXT = (".jpg", ".jpeg", ".png", ".webp")


def safe(title):
    """The title made safe for a file path; everything else is kept word for word."""
    t = title.strip()
    t = t.replace(":", " -").replace("/", "-").replace("\\", "-")
    t = re.sub(r'[*?"<>|]', "", t)
    t = re.sub(r"\s+", " ", t).strip(" .")
    if not t:
        raise ValueError("the title is empty after making it file-safe")
    return t


def expected(title, reels=1):
    """Base names (no extension) by folder."""
    if reels < 1:
        raise ValueError("--reels must be 1 or more")
    t = safe(title)
    vids = [f"{t} - YouTube", f"{t} - LinkedIn"]
    if reels == 1:
        vids += [f"{t} - Instagram and Facebook - Reel", f"{t} - Instagram and Facebook - 4x5"]
    else:
        vids += [f"{t} - Instagram and Facebook - Reel {i}" for i in range(1, reels + 1)]
        vids += [f"{t} - Instagram and Facebook - 4x5 {i}" for i in range(1, reels + 1)]
    return {
        VIDEOS: vids,
        THUMBS: [f"{t} - Thumbnail - YouTube", f"{t} - Thumbnail - LinkedIn"],
        COPY: [f"{t} - Post Copy"],
    }


def split_ext(name):
    m = re.match(r"^(.*?)(\.[A-Za-z0-9]{2,4})?$", name)
    return m.group(1), (m.group(2) or "").lower()


def check(title, listing, reels=1):
    """Return a list of (ok, message)."""
    want = expected(title, reels)
    prefix = safe(title) + " - "
    out = []
    mine = [f for f in listing if f.get("title", "").startswith(prefix)]
    seen = {}
    for f in mine:
        seen.setdefault((f.get("folder"), f["title"]), 0)
        seen[(f.get("folder"), f["title"])] += 1
    for (folder, name), n in seen.items():
        if n > 1:
            out.append((False, f"duplicate: {n} files named '{name}' in {folder}"))
    for folder, names in want.items():
        here = [f for f in mine if f.get("folder") == folder]
        for base in names:
            hits = []
            for f in here:
                b, ext = split_ext(f["title"])
                if folder == COPY:
                    if f["title"] == base:
                        hits.append(f)
                elif b == base:
                    hits.append((f, ext))
            if not hits:
                out.append((False, f"missing in {folder}: '{base}'"))
                continue
            if folder == VIDEOS and hits[0][1] not in VIDEO_EXT:
                out.append((False, f"not a video file: '{hits[0][0]['title']}'"))
            elif folder == THUMBS and hits[0][1] not in IMAGE_EXT:
                out.append((False, f"not an image file: '{hits[0][0]['title']}'"))
            else:
                out.append((True, f"ok {folder}: '{base}'"))
        allowed = set(names)
        for f in here:
            base = f["title"] if folder == COPY else split_ext(f["title"])[0]
            if base not in allowed:
                out.append((False, f"unexpected name in {folder}: '{f['title']}'"))
    for f in mine:
        if f.get("folder") not in want:
            out.append((False, f"in the wrong place ({f.get('folder')}): '{f['title']}'"))
    return out


def para(text):
    blocks = [b for b in re.split(r"\n\s*\n", (text or "").strip()) if b.strip()]
    return "".join("<p>" + "<br>".join(html.escape(l) for l in b.split("\n")) + "</p>" for b in blocks)


def doc(copy):
    title = copy["title"]
    h = ["<html><head><meta charset=\"utf-8\"><title>%s</title></head><body>" % html.escape(title + " - Post Copy")]
    h.append("<h1>%s</h1>" % html.escape(title))
    h.append("<h2>Winning thumbnails</h2>")
    th = copy.get("thumbnails") or {}
    for key, label in (("youtube", "YouTube"), ("linkedin", "LinkedIn")):
        t = th.get(key)
        if not t or not t.get("file"):
            h.append(f"<p>{label}: Not picked yet</p>")
            continue
        line = f"{label}: {html.escape(t['file'])}"
        if t.get("pick"):
            line += f" (thumbnail {html.escape(str(t['pick']))})"
        if t.get("url"):
            u = html.escape(t["url"], quote=True)
            line += f' - <a href="{u}">{u}</a>'
        h.append(f"<p>{line}</p>")
    li = copy.get("linkedin") or {}
    h.append("<h2>LinkedIn post</h2>" + (para(li.get("post")) or "<p>Not written yet</p>"))
    if li.get("firstComment"):
        h.append("<h3>First comment</h3>" + para(li["firstComment"]))
    yt = copy.get("youtube") or {}
    h.append("<h2>YouTube description</h2>")
    if yt.get("title"):
        h.append("<p>Title: %s</p>" % html.escape(yt["title"]))
    h.append(para(yt.get("description")) or "<p>Not written yet</p>")
    ig = copy.get("instagram") or {}
    for kind, label in (("posts", "4x5 post"), ("reels", "Reel")):
        items = ig.get(kind) or []
        if not items:
            h.append(f"<h2>Instagram and Facebook copy - {label}</h2><p>Not written yet</p>")
        for i, text in enumerate(items, 1):
            n = f" {i}" if len(items) > 1 else ""
            h.append(f"<h2>Instagram and Facebook copy - {label}{n}</h2>" + para(text))
    h.append("</body></html>")
    return "\n".join(h)


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    n = sub.add_parser("names"); n.add_argument("title"); n.add_argument("--reels", type=int, default=1)
    d = sub.add_parser("doc"); d.add_argument("copy")
    c = sub.add_parser("check"); c.add_argument("title"); c.add_argument("listing"); c.add_argument("--reels", type=int, default=1)
    a = p.parse_args(argv)
    if a.cmd == "names":
        for folder, names in expected(a.title, a.reels).items():
            print(folder)
            for x in names:
                print("  " + x + ("" if folder == COPY else "  (+ .mp4)" if folder == VIDEOS else "  (+ .jpg)"))
        return 0
    if a.cmd == "doc":
        with open(a.copy, encoding="utf-8") as f:
            sys.stdout.write(doc(json.load(f)) + "\n")
        return 0
    with open(a.listing, encoding="utf-8") as f:
        res = check(a.title, json.load(f), a.reels)
    bad = [m for ok, m in res if not ok]
    for ok, m in res:
        print(("  " if ok else "FAIL ") + m)
    print("PASS" if not bad else f"FAIL ({len(bad)})")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())

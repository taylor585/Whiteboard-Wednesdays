#!/usr/bin/env python3
"""Variety pack for thumbnails: plan a varied batch, and check that a batch really varies.

Taylor's rule (27 Oct 2026): every thumbnail round must vary the background, the headline
typeface and case, the mark (underline, box, colour), and emoji vs no emoji, so there's a real
choice and a real split test. References: references/design/variety.md.

Usage:
  python3 scripts/variety.py plan brief.json spec.json      # write a 5-variant spec from a brief
  python3 scripts/variety.py check spec.json [--strict]     # report the variety axes, FAIL if too samey

Brief (JSON):
  {"title": "How to Build an App With Claude (Without Rebuilds)",   # the YouTube title (feed preview)
   "line": "Motion Planning",          # the thumbnail line (2-5 words)
   "mark": "Planning",                 # word to mark (default: last word)
   "face": "/abs/face.jpg",            # one photo (square crop or cut-out); omit for a placeholder
   "mood": "confused",                 # confused | bold | calm: picks the stickers and punctuation
   "emojis": ["🤯", "😵‍💫"],          # optional override
   "palette": {"ink": "#1C1A17", "red": "#B3261E", "gold": "#CB8E03", "yellow": "#F6DF8C",
               "cream": "#F5EAD8", "black": "#0A0908"},   # brand colours (defaults: Pecuna Factorem)
   "prefix": "MP", "count": 5}          # count 5 (default) or 6 (adds a 'many faces' wildcard)

Stdlib only (Pillow is used, if installed, to judge the brightness of a bg_image).
"""
import json
import re
import sys
from pathlib import Path

PECUNA = {"ink": "#1C1A17", "red": "#B3261E", "gold": "#CB8E03", "yellow": "#F6DF8C",
          "cream": "#F5EAD8", "black": "#0A0908"}
DARK_STYLES = {"black-glow", "black-spotlight"}
DARK_THEMES = {"dark", "purple", "green", "red"}
CAPS_FONTS = {"condensed", "marker"}          # the renderer sets these in capitals
EMOJI_RE = re.compile("[\U0001F300-\U0001FAFF☀-➿]")
STICKERS = {
    "confused": {"emojis": ["🤯", "😵‍💫"], "mark": "?", "suffix": "???"},
    "bold":     {"emojis": ["🔥", "🚀"],   "mark": "!", "suffix": "!"},
    "calm":     {"emojis": ["👀", "✅"],   "mark": "→", "suffix": "."},
}


# ---------------------------------------------------------------- plan
def _two_lines(line):
    w = line.split()
    if len(w) < 2:
        return line
    cut = max(1, round(len(w) / 2))
    return " ".join(w[:cut]) + "\n" + " ".join(w[cut:])


def _face(face, cx, cy, d, ring, inset):
    f = {"frame": "circle", "cx": cx, "cy": cy, "d": d, "ring": ring, "ring_w": 12, "inset": inset,
         "pose": "confused, brows down"}
    if face:
        f["src"] = face
    return f


def plan(brief):
    p = {**PECUNA, **brief.get("palette", {})}
    mood = STICKERS.get(brief.get("mood", "confused"), STICKERS["confused"])
    emojis = brief.get("emojis") or mood["emojis"]
    e1, e2 = emojis[0], emojis[-1]
    q = mood["mark"]
    line = brief["line"].strip()
    mark = brief.get("mark") or line.split()[-1]
    two = _two_lines(line)
    title = brief.get("title", line)
    face = brief.get("face")
    pre = brief.get("prefix", "V")
    common = {"title": title, "archetype": "scene", "format": "jpg", "headline_align": "left"}

    def emoji(t, x, y, s, r=0):
        return {"type": "emoji", "text": t, "x": x, "y": y, "size": s, "rotate": r}

    def mk(x, y, s, c, r=0, font="sans", outline=None):
        m = {"type": "mark", "text": q, "x": x, "y": y, "size": s, "color": c, "rotate": r, "font": font}
        if outline:
            m["outline"] = outline
        return m

    v = []
    # 1 light: white grid, condensed CAPS, red underline, emojis + marks (Taylor's pick, MP1)
    v.append({**common, "id": f"{pre}1-white-caps-underline", "theme": "light", "bg_style": "paper-grid",
              "font": "condensed", "headline": two.upper(), "highlight": mark.upper(), "highlight_style": "underline",
              "accent": p["red"], "headline_color": p["ink"],
              "headline_box": {"x": 40, "y": 70, "w": 640, "h": 480}, "headline_max": 230,
              "face": _face(face, 960, 360, 480, p["red"], p["ink"]),
              "stickers": [emoji(e1, 700, 40, 110, -10), mk(1120, 50, 130, p["red"], 14),
                           mk(670, 410, 150, p["red"], -12, outline="#FFFFFF"), emoji(e1, 1110, 480, 90, 10)]})
    # 2 light: brand yellow, sans Title case, boxed word + punctuation (Taylor's pick, MP2)
    v.append({**common, "id": f"{pre}2-yellow-title-box", "theme": "light", "bg_style": "brand-yellow",
              "bg_color": p["yellow"], "font": "sans", "headline": two + mood["suffix"], "highlight": mark,
              "highlight_style": "box", "box_text": p["yellow"], "accent": p["ink"], "headline_color": p["ink"],
              "headline_box": {"x": 40, "y": 110, "w": 680, "h": 420}, "headline_max": 170,
              "face": _face(face, 960, 360, 480, p["ink"], p["ink"]),
              "stickers": [emoji(e1, 700, 40, 110, -10), mk(450, 110, 130, p["red"], 12), emoji(e1, 40, 580, 90, -6)]})
    # 3 light: cream grid, marker CAPS, red word, marks only (no emoji)
    v.append({**common, "id": f"{pre}3-cream-marker-colour", "theme": "light", "bg_style": "cream-grid",
              "font": "marker", "headline": two.upper() + "?!", "highlight": mark.upper() + "?!",
              "highlight_style": "color", "accent": p["red"], "headline_color": p["ink"],
              "headline_box": {"x": 40, "y": 90, "w": 660, "h": 460}, "headline_max": 170,
              "face": _face(face, 970, 370, 460, p["ink"], p["ink"]),
              "stickers": [mk(690, 40, 140, p["red"], -12, "marker"), mk(1150, 470, 120, p["ink"], 12, "marker")]})
    # 4 dark: black glow, condensed CAPS, highlight box, clean (no emoji, no marks)
    v.append({**common, "id": f"{pre}4-black-caps-box", "theme": "dark", "bg_style": "black-glow",
              "bg_color": p["black"], "glow_color": p["gold"], "font": "condensed", "headline": two.upper(),
              "highlight": mark.upper(), "highlight_style": "box", "box_text": p["black"], "accent": p["yellow"],
              "headline_color": "#FFFFFF", "headline_box": {"x": 40, "y": 90, "w": 640, "h": 460}, "headline_max": 220,
              "face": _face(face, 960, 360, 460, p["gold"], "#2A2722")})
    # 5 dark: black spotlight, serif Title case, gold underline, emojis
    v.append({**common, "id": f"{pre}5-black-serif-underline", "theme": "dark", "bg_style": "black-spotlight",
              "bg_color": p["black"], "glow_color": p["gold"], "font": "serif", "headline": two + q,
              "highlight": two.split("\n")[-1] + q, "highlight_style": "underline", "accent": p["gold"],
              "headline_color": p["cream"], "headline_box": {"x": 44, "y": 120, "w": 620, "h": 380}, "headline_max": 170,
              "face": _face(face, 950, 370, 450, p["gold"], "#2A2722"),
              "stickers": [emoji(e1, 820, 40, 110, -12), emoji(e2, 1130, 470, 90, 8), mk(680, 180, 140, p["gold"], -12, "serif")]})
    if brief.get("count", 5) >= 6:
        # 6 wildcard: several faces (only ever one per batch; Taylor prefers one big face)
        w = json.loads(json.dumps(v[0]))
        w.update({"id": f"{pre}6-wildcard-many-faces", "bg_style": "flat"})
        w["face"] = _face(face, 930, 360, 400, p["red"], p["ink"])
        w["stickers"] = w["stickers"][:2] + [
            {"type": "photo", **({"src": face} if face else {}), "cx": 1170, "cy": 140, "d": 180, "ring": p["ink"], "ring_w": 7},
            {"type": "photo", **({"src": face} if face else {}), "cx": 1150, "cy": 540, "d": 160, "ring": p["ink"], "ring_w": 7}]
        v.append(w)
    return {"thumbnails": v}


# ---------------------------------------------------------------- check
def _lum(hexcol):
    h = hexcol.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ground(t):
    if t.get("bg_style"):
        return "dark" if t["bg_style"] in DARK_STYLES else "light"
    bg = (t.get("theme_overrides") or {}).get("bg")
    if t.get("bg_image"):
        try:
            from PIL import Image, ImageStat
            im = Image.open(t["bg_image"]).convert("L").resize((64, 36))
            return "dark" if ImageStat.Stat(im).mean[0] < 110 else "light"
        except Exception:
            pass
    if bg:
        return "dark" if _lum(bg) < 110 else "light"
    return "dark" if t.get("theme") in DARK_THEMES else "light"


def axes(t):
    font = t.get("font", "sans")
    head = t.get("headline", "")
    caps = font in CAPS_FONTS or (head and head == head.upper() and any(c.isalpha() for c in head))
    texts = [k.get("text", "") for k in t.get("stickers", [])]
    texts += [e.get("text", "") for e in t.get("elements", []) if isinstance(e, dict)]
    emoji = any(k.get("type") == "emoji" for k in t.get("stickers", [])) or any(EMOJI_RE.search(x or "") for x in texts)
    faces = (1 if t.get("face") else 0) + sum(1 for k in t.get("stickers", []) if k.get("type") == "photo")
    bgkey = t.get("bg_style") or (t.get("theme_overrides") or {}).get("bg") or t.get("bg_image") or t.get("theme", "light")
    return {"id": t.get("id", "?"), "ground": ground(t), "background": bgkey if not t.get("bg_image") else "image:" + Path(t["bg_image"]).stem,
            "font": font, "case": "CAPS" if caps else "Title/sentence",
            "mark": t.get("highlight_style", "underline") if t.get("highlight") else "none",
            "emoji": "yes" if emoji else "no", "faces": faces}


def check(spec, strict=False):
    rows = [axes(t) for t in spec.get("thumbnails", [])]
    n = len(rows)
    out = []

    def res(level, msg):
        out.append((level, msg))

    if n < 4:
        res("WARN", f"only {n} thumbnail(s): variety rules apply to rounds of 4 or more")
    dark = sum(r["ground"] == "dark" for r in rows)
    light = n - dark
    if n >= 4:
        res("FAIL" if not dark or not light else "PASS", f"both grounds present (dark {dark}, light {light})")
        if n == 5 and (dark, light) != (2, 3):
            res("WARN", "house mix for 5 is 2 black + 3 light (Taylor, 27 Oct 2026)")
        bgs = len({r["background"] for r in rows})
        res("FAIL" if bgs < 3 else "PASS", f"distinct backgrounds: {bgs} (need 3+)")
        fonts = len({r["font"] for r in rows})
        res("FAIL" if fonts < 3 else "PASS", f"distinct headline typefaces: {fonts} (need 3+)")
        cases = {r["case"] for r in rows}
        res("FAIL" if len(cases) < 2 else "PASS", f"case mix: {', '.join(sorted(cases))} (need CAPS and not)")
        marks = {r["mark"] for r in rows} - {"none"}
        res("FAIL" if len(marks) < 3 else "PASS", f"distinct marks: {', '.join(sorted(marks)) or 'none'} (need 3+)")
        emo = {r["emoji"] for r in rows}
        res("FAIL" if len(emo) < 2 else "PASS", "emoji and no-emoji versions both present" if len(emo) == 2 else "emoji: all the same")
        combos = [(r["background"], r["font"], r["mark"]) for r in rows]
        dup = len(combos) - len(set(combos))
        res("FAIL" if dup else "PASS", f"no two thumbnails share background + typeface + mark ({dup} duplicate(s))")
    many = [r["id"] for r in rows if r["faces"] > 1]
    if len(many) > 1:
        res("FAIL" if strict else "WARN", f"several faces in {len(many)} thumbnails: Taylor prefers one big face; keep multi-face to one wildcard")
    elif many:
        res("PASS", f"one multi-face wildcard ({many[0]})")
    return rows, out


def table(rows):
    cols = ["id", "ground", "background", "font", "case", "mark", "emoji", "faces"]
    w = {c: max(len(c), *(len(str(r[c])) for r in rows)) for c in cols} if rows else {c: len(c) for c in cols}
    lines = [" | ".join(c.ljust(w[c]) for c in cols), "-+-".join("-" * w[c] for c in cols)]
    lines += [" | ".join(str(r[c]).ljust(w[c]) for c in cols) for r in rows]
    return "\n".join(lines)


def main(argv):
    if len(argv) >= 3 and argv[0] == "plan":
        brief = json.loads(Path(argv[1]).read_text())
        spec = plan(brief)
        Path(argv[2]).write_text(json.dumps(spec, indent=1, ensure_ascii=False))
        rows, out = check(spec)
        print(f"wrote {argv[2]} ({len(spec['thumbnails'])} thumbnails)\n" + table(rows))
        return 0
    if len(argv) >= 2 and argv[0] == "check":
        spec = json.loads(Path(argv[1]).read_text())
        rows, out = check(spec, strict="--strict" in argv)
        print(table(rows))
        for level, msg in out:
            print(f"{level} | {msg}")
        fails = sum(level == "FAIL" for level, _ in out)
        print(f"variety: {sum(l == 'PASS' for l, _ in out)} pass, {sum(l == 'WARN' for l, _ in out)} warn, {fails} fail")
        return 1 if fails else 0
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

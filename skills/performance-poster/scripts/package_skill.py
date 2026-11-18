#!/usr/bin/env python3
"""Build a distributable zip of the skill and prove it works.

Usage: python3 scripts/package_skill.py [--dist DIR] [--skip-tests]

1. Checks SKILL.md frontmatter (name and description present, description <= 1024 chars).
2. Writes PACKAGE-MANIFEST.json (name, version, built, files[{path, sha256, bytes}]) to the
   skill root, then builds <dist>/performance-poster-<version>.zip (version from package.json),
   every file under the "performance-poster/" prefix, manifest included.
   Excluded: dist/, node_modules/, __pycache__/, .pytest_cache/, *.pyc, tests/output/, .venv/,
   .git/, and any file over 15 MB.
3. Re-reads the zip: testzip(), then every file's hash against the manifest.
4. Extracts to a temp dir and runs `python3 -m unittest discover tests` there
5. Prints a JSON summary and exits 1 if any step failed.
Stdlib only.
"""
import argparse
import datetime as dt
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NAME = "performance-poster"
MAX_BYTES = 15 * 1024 * 1024
EXCLUDE_DIRS = {"dist", "node_modules", "__pycache__", ".pytest_cache", ".venv", ".git"}
EXCLUDE_PATHS = ("tests/output/",)
MANIFEST = "PACKAGE-MANIFEST.json"


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def collect(root):
    files, skipped = [], []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if d not in EXCLUDE_DIRS)
        for fn in sorted(filenames):
            p = Path(dirpath) / fn
            rel = p.relative_to(root).as_posix()
            if fn.endswith(".pyc") or rel == MANIFEST or rel.startswith(EXCLUDE_PATHS) or p.is_symlink():
                continue
            size = p.stat().st_size
            if size > MAX_BYTES:
                skipped.append({"path": rel, "bytes": size, "reason": "over 15 MB"})
                continue
            files.append({"path": rel, "sha256": sha256(p), "bytes": size})
    return files, skipped


def check_frontmatter(root):
    text = (root / "SKILL.md").read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        return ["SKILL.md has no YAML frontmatter"], {}
    fm, problems = {}, []
    lines = m.group(1).splitlines()
    i = 0
    while i < len(lines):
        km = re.match(r"^([A-Za-z_][\w-]*):\s*(.*)$", lines[i])
        if km:
            key, val = km.group(1), km.group(2).strip()
            if val in ("|", ">", "|-", ">-", ""):
                block = []
                while i + 1 < len(lines) and (lines[i + 1].startswith((" ", "\t")) or not lines[i + 1].strip()):
                    i += 1
                    block.append(lines[i].strip())
                val = (" " if val.startswith(">") or val == "" else "\n").join(b for b in block if b)
            elif len(val) >= 2 and val[0] == val[-1] and val[0] in "\"'":
                val = val[1:-1]
            fm[key] = val
        i += 1
    for k in ("name", "description"):
        if not fm.get(k):
            problems.append(f"SKILL.md frontmatter is missing {k}")
    if len(fm.get("description", "")) > 1024:
        problems.append(f"SKILL.md description is {len(fm['description'])} characters; the limit is 1024")
    if fm.get("name") and fm["name"] != NAME:
        problems.append(f"SKILL.md name is {fm['name']!r}, expected {NAME!r}")
    return problems, {"name": fm.get("name"), "description_chars": len(fm.get("description", ""))}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dist", default=str(ROOT / "dist"))
    ap.add_argument("--skip-tests", action="store_true")
    a = ap.parse_args()
    summary = {"ok": False}
    problems, fm = check_frontmatter(ROOT)
    summary["frontmatter"] = fm
    version = json.loads((ROOT / "package.json").read_text())["version"]
    files, skipped = collect(ROOT)
    manifest = {"name": NAME, "version": version,
                "built": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat(),
                "files": files}
    mtext = json.dumps(manifest, indent=1) + "\n"
    (ROOT / MANIFEST).write_text(mtext)
    dist = Path(a.dist)
    dist.mkdir(parents=True, exist_ok=True)
    zpath = dist / f"{NAME}-{version}.zip"
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for f in files:
            z.write(ROOT / f["path"], f"{NAME}/{f['path']}")
        z.writestr(f"{NAME}/{MANIFEST}", mtext)
    summary.update(zip=str(zpath), version=version, files=len(files) + 1,
                   bytes=sum(f["bytes"] for f in files), zip_bytes=zpath.stat().st_size, skipped=skipped)

    # Verify by re-reading.
    with zipfile.ZipFile(zpath) as z:
        bad = z.testzip()
        if bad:
            problems.append(f"testzip: corrupt member {bad}")
        names = set(z.namelist())
        if any(not n.startswith(NAME + "/") for n in names):
            problems.append(f"zip has files outside the {NAME}/ prefix")
        zm = json.loads(z.read(f"{NAME}/{MANIFEST}"))
        mismatched = [f["path"] for f in zm["files"]
                      if f"{NAME}/{f['path']}" not in names
                      or hashlib.sha256(z.read(f"{NAME}/{f['path']}")).hexdigest() != f["sha256"]]
        if mismatched:
            problems.append(f"hash mismatch: {mismatched[:10]}")
        summary["verified_hashes"] = len(zm["files"]) - len(mismatched)

    # Fresh extraction + tests.
    if not a.skip_tests:
        with tempfile.TemporaryDirectory(prefix="pp-pkg-") as tmp:
            with zipfile.ZipFile(zpath) as z:
                z.extractall(tmp)
            env = dict(os.environ)
            r = subprocess.run([sys.executable, "-m", "unittest", "discover", "tests"],
                               cwd=Path(tmp) / NAME, capture_output=True, text=True, env=env, timeout=900)
            tail = r.stderr.strip().splitlines()
            ran = next((l for l in tail if l.startswith("Ran ")), "")
            summary["tests"] = {"returncode": r.returncode, "ran": ran, "result": tail[-1] if tail else ""}
            if r.returncode:
                problems.append("tests failed in the extracted copy")
                summary["tests"]["log_tail"] = tail[-40:]
    summary["problems"] = problems
    summary["ok"] = not problems
    print(json.dumps(summary, indent=1))
    sys.exit(0 if summary["ok"] else 1)


if __name__ == "__main__":
    main()

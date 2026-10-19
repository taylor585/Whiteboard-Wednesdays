#!/usr/bin/env python3
"""Write PACKAGE-MANIFEST.json: every packaged file with its SHA-256 and size.

Usage: python3 scripts/build_manifest.py
Run before packaging so the archive can be checked against the source after extraction.
"""
import hashlib
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {'__pycache__', '.git', 'evals', 'node_modules'}
SKIP_FILES = {'PACKAGE-MANIFEST.json', '.DS_Store'}


def main():
    files = []
    for base, dirs, names in os.walk(ROOT):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS)
        for n in sorted(names):
            if n in SKIP_FILES or n.endswith('.pyc'):
                continue
            p = os.path.join(base, n)
            data = open(p, 'rb').read()
            files.append({'path': os.path.relpath(p, ROOT).replace(os.sep, '/'),
                          'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)})
    out = {'name': 'trending-topics', 'version': '3.1.0', 'files': files}
    with open(os.path.join(ROOT, 'PACKAGE-MANIFEST.json'), 'w', encoding='utf-8') as fh:
        json.dump(out, fh, indent=2)
        fh.write('\n')
    print(f'PACKAGE-MANIFEST.json: {len(files)} files')


if __name__ == '__main__':
    main()

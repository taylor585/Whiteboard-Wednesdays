#!/usr/bin/env python3
"""Is the copy of this skill being run the newest one? Run it first, every time.

Usage:
  python3 version_check.py [--repo-copy <path to skills/trending-topics in the repo>]

Compares this skill folder's PACKAGE-MANIFEST.json version with the repo copy (default: looks for
skills/trending-topics under the current directory and under ~/Whiteboard-Wednesdays).
Prints one line:
  CURRENT   running v4.0.0, the repo has v4.0.0
  OLD COPY  running v2.0.0, the repo has v4.0.0: use the repo copy for this run, and tell Taylor
            to upload the new zip in claude.ai Settings > Capabilities > Skills
  NO REPO   running v4.0.0; no repo copy found to compare
Exit code is always 0: this is information for the run, not a gate.
"""
import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def version(folder):
    try:
        with open(os.path.join(folder, 'PACKAGE-MANIFEST.json'), encoding='utf-8') as fh:
            return json.load(fh).get('version')
    except (OSError, ValueError):
        return None


def as_tuple(v):
    try:
        return tuple(int(x) for x in (v or '0').split('.'))
    except ValueError:
        return (0,)


def compare(running, repo):
    if repo is None:
        return f'NO REPO   running v{running}; no repo copy found to compare'
    if as_tuple(running) >= as_tuple(repo):
        return f'CURRENT   running v{running}, the repo has v{repo}'
    return (f'OLD COPY  running v{running}, the repo has v{repo}: use the repo copy for this run, and tell '
            'Taylor to upload the new zip in claude.ai Settings > Capabilities > Skills')


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--repo-copy', default=None)
    a = ap.parse_args(argv)
    cands = [a.repo_copy] if a.repo_copy else [
        os.path.join(os.getcwd(), 'skills', 'trending-topics'),
        os.path.expanduser('~/Whiteboard-Wednesdays/skills/trending-topics'),
        '/home/user/Whiteboard-Wednesdays/skills/trending-topics']
    repo = next((c for c in cands if c and os.path.isdir(c) and os.path.abspath(c) != HERE and version(c)), None)
    print(compare(version(HERE) or '0', version(repo) if repo else None) + (f'  [{repo}]' if repo else ''))
    return 0


if __name__ == '__main__':
    sys.exit(main())

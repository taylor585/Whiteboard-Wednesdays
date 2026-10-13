"""Package the whole Whiteboard Wednesdays skill into one zip with a hash manifest, then re-check the archive.

Usage: python3 scripts/package_skill.py [output-directory]
Writes PACKAGE-MANIFEST.json at the skill root and <output>/whiteboard-wednesdays-<version>.zip, whose single top-level
folder is whiteboard-wednesdays/. Excludes dependencies, caches, local secrets and previous packages.
"""
import hashlib, json, sys, zipfile
from pathlib import Path

root = Path(__file__).resolve().parent.parent
out = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root / 'dist'
out.mkdir(parents=True, exist_ok=True)
version = json.loads((root / 'package.json').read_text())['version']
excluded_parts = {'node_modules', '__pycache__', '.cache', 'dist'}
excluded_names = {'PACKAGE-MANIFEST.json', '.DS_Store'}


def wanted(p: Path) -> bool:
    rel = p.relative_to(root)
    if any(part in excluded_parts for part in rel.parts) or p.name in excluded_names:
        return False
    return not (p.name.startswith('.env') or p.suffix in {'.log', '.zip'})


files = sorted(p for p in root.rglob('*') if p.is_file() and wanted(p))
manifest = {
    'name': 'whiteboard-wednesdays',
    'version': version,
    'files': [{'path': str(p.relative_to(root)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size} for p in files],
}
manifest_text = json.dumps(manifest, indent=2) + '\n'
(root / 'PACKAGE-MANIFEST.json').write_text(manifest_text)
archive = out / f'whiteboard-wednesdays-{version}.zip'
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for p in files:
        z.write(p, 'whiteboard-wednesdays/' + str(p.relative_to(root)))
    z.writestr('whiteboard-wednesdays/PACKAGE-MANIFEST.json', manifest_text)

# Re-open the archive and prove every file matches its manifest hash, and that there is exactly one SKILL.md.
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None, 'corrupt archive'
    names = z.namelist()
    assert [n for n in names if n.endswith('/SKILL.md') or n == 'SKILL.md'] == ['whiteboard-wednesdays/SKILL.md'], 'expected exactly one SKILL.md'
    for entry in manifest['files']:
        assert hashlib.sha256(z.read('whiteboard-wednesdays/' + entry['path'])).hexdigest() == entry['sha256'], entry['path']

print(json.dumps({'archive': str(archive), 'files': len(files) + 1, 'bytes': archive.stat().st_size,
                  'sha256': hashlib.sha256(archive.read_bytes()).hexdigest()}, indent=2))

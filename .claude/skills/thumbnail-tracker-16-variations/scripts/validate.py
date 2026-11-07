#!/usr/bin/env python3
"""Validate JSON files against the skill's schemas. Stdlib only.

CLI:
  python3 scripts/validate.py FILE.json [FILE.json ...] [--schema spec|batch|brand|PATH]
Without --schema the kind is guessed: "video" key -> batch, "colours" key -> brand,
otherwise spec. Prints one `SCHEMA: <file>: <path>: <message>` line per problem and
exits 1 if any hard error was found (warnings alone exit 0).

Module:
  from validate import validate_file, validate, load_schema
  errors, warnings = validate(instance, load_schema("batch"))

Supported keywords (a JSON-Schema subset): type (string or list; "integer" excludes
bools), required, properties, additionalProperties (false or a schema), enum, const,
items, minItems/maxItems, minLength/maxLength, pattern, minimum/maximum, anyOf,
$ref ("#/definitions/x" or "other.schema.json#/definitions/x", resolved in schemas/),
plus one extension: "x-warnUnknown": true reports keys not listed in "properties"
as warnings rather than errors (typos such as "headlne").
"""
import json
import re
import sys
from pathlib import Path

SCHEMA_DIR = Path(__file__).resolve().parent.parent / "schemas"
KINDS = {"spec": "spec.schema.json", "batch": "batch.schema.json", "brand": "brand.schema.json"}
_cache = {}


def load_schema(kind_or_path):
    p = Path(KINDS.get(kind_or_path, kind_or_path))
    if not p.is_absolute() and not p.exists():
        p = SCHEMA_DIR / p
    key = str(p.resolve())
    if key not in _cache:
        s = json.loads(p.read_text())
        s.setdefault("$id", p.name)
        _cache[key] = s
        _cache[p.name] = s
    return _cache[key]


def _type_ok(v, t):
    return {
        "object": isinstance(v, dict),
        "array": isinstance(v, list),
        "string": isinstance(v, str),
        "boolean": isinstance(v, bool),
        "null": v is None,
        "integer": isinstance(v, int) and not isinstance(v, bool),
        "number": isinstance(v, (int, float)) and not isinstance(v, bool),
    }.get(t, True)


def _resolve(ref, root):
    file, _, frag = ref.partition("#")
    doc = load_schema(file) if file else root
    node = doc
    for part in [p for p in frag.split("/") if p]:
        node = node[part]
    return node, doc


def _short(v):
    s = json.dumps(v, ensure_ascii=False)
    return s if len(s) <= 40 else s[:37] + "..."


def _check(v, s, path, root, errs, warns):
    if "$ref" in s:
        target, doc = _resolve(s["$ref"], root)
        _check(v, target, path, doc, errs, warns)
        return
    if "type" in s:
        types = s["type"] if isinstance(s["type"], list) else [s["type"]]
        if not any(_type_ok(v, t) for t in types):
            errs.append((path, f"expected {' or '.join(types)}, got {_short(v)}"))
            return
    if "const" in s and v != s["const"]:
        errs.append((path, f"must be {_short(s['const'])}"))
    if "enum" in s and v not in s["enum"]:
        errs.append((path, f"{_short(v)} is not one of {', '.join(map(str, s['enum']))}"))
    if "anyOf" in s:
        for sub in s["anyOf"]:
            e2 = []
            _check(v, sub, path, root, e2, [])
            if not e2:
                break
        else:
            errs.append((path, s.get("x-anyOfMessage", f"{_short(v)} matches none of the allowed shapes")))
    if isinstance(v, str):
        if "minLength" in s and len(v) < s["minLength"]:
            errs.append((path, f"shorter than {s['minLength']} characters"))
        if "maxLength" in s and len(v) > s["maxLength"]:
            errs.append((path, f"is {len(v)} characters; max {s['maxLength']}"))
        if "pattern" in s and not re.search(s["pattern"], v):
            errs.append((path, f"{_short(v)} does not match {s['pattern']}"))
    if _type_ok(v, "number"):
        if "minimum" in s and v < s["minimum"]:
            errs.append((path, f"{v} is below the minimum {s['minimum']}"))
        if "maximum" in s and v > s["maximum"]:
            errs.append((path, f"{v} is above the maximum {s['maximum']}"))
    if isinstance(v, list):
        if "minItems" in s and len(v) < s["minItems"]:
            errs.append((path, f"needs at least {s['minItems']} items, has {len(v)}"))
        if "maxItems" in s and len(v) > s["maxItems"]:
            errs.append((path, f"allows at most {s['maxItems']} items, has {len(v)}"))
        if isinstance(s.get("items"), dict):
            for i, x in enumerate(v):
                _check(x, s["items"], f"{path}[{i}]", root, errs, warns)
    if isinstance(v, dict):
        for k in s.get("required", []):
            if k not in v:
                errs.append((path, f"missing required field \"{k}\""))
        props = s.get("properties", {})
        for k, x in v.items():
            if k in props:
                _check(x, props[k], f"{path}.{k}", root, errs, warns)
            elif s.get("additionalProperties") is False:
                errs.append((path, f"unknown field \"{k}\""))
            elif isinstance(s.get("additionalProperties"), dict):
                _check(x, s["additionalProperties"], f"{path}.{k}", root, errs, warns)
            elif s.get("x-warnUnknown") and not k.startswith("_"):
                warns.append((f"{path}.{k}", "field not in the schema (typo?); the renderer ignores unknown fields"))


def validate(instance, schema):
    """Return (errors, warnings), each a list of (json_path, message)."""
    errs, warns = [], []
    _check(instance, schema, "$", schema, errs, warns)
    return errs, warns


def guess_kind(instance):
    if isinstance(instance, dict) and "video" in instance:
        return "batch"
    if isinstance(instance, dict) and "colours" in instance:
        return "brand"
    return "spec"


def validate_file(path, kind=None):
    try:
        data = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        return [("$", f"cannot read JSON: {e}")], [], kind or "?"
    kind = kind or guess_kind(data)
    e, w = validate(data, load_schema(kind))
    return e, w, kind


def format_lines(name, errs, warns):
    return [f"SCHEMA: {name}: {p}: {m}" for p, m in errs] + \
           [f"SCHEMA: warning: {name}: {p}: {m}" for p, m in warns]


def main(argv=None):
    import argparse
    ap = argparse.ArgumentParser(description="Validate spec, batch or brand JSON files.")
    ap.add_argument("files", nargs="+")
    ap.add_argument("--schema", help="spec, batch, brand, or a schema file path (default: guess)")
    ap.add_argument("-q", "--quiet", action="store_true", help="hide warnings")
    a = ap.parse_args(argv)
    bad = 0
    for f in a.files:
        e, w, kind = validate_file(f, a.schema)
        for line in format_lines(f, e, [] if a.quiet else w):
            print(line)
        if not e:
            print(f"ok: {f} ({kind}{f', {len(w)} warning(s)' if w and not a.quiet else ''})")
        bad += bool(e)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())

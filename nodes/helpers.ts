// Shared plumbing for every plist-tools node: the PlistValue construction
// helpers, the structured error contract, size/depth bounds, and the
// key-path / tree-walk logic used by several nodes. Keeping this in one
// place is what keeps every node's error handling and bounds consistent.

import { PlistValue, PlistEntry, Error as PtError } from '../gen/messages_pb';

// ── Bounds (input -> cost) ─────────────────────────────────────────────────
//
// Every node caps its raw input (XML text bytes, binary plist bytes, or
// JSON text bytes) at this many bytes, checked before any parsing begins.
// Axiom's transport caps a node message around ~4 MiB; a base64-encoded
// binary plist inflates ~4/3 over its raw size before it even reaches this
// process, so 3 MiB of *decoded* bytes here is already a generous ceiling
// relative to that outer limit, while still bounding cost as a function of
// the one dimension every node here takes from the caller: byte length.
export const MAX_INPUT_BYTES = 3 * 1024 * 1024;

// Recursion/nesting-depth bound applied while WALKING an already-parsed
// PlistValue tree (ListAllKeysRecursive, ExtractValuesByType, ConvertToJson,
// SerializeXml, SummarizeStructure) and while building a tree from XML/JSON.
// Bounds stack depth independently of total byte size -- a small input can
// still nest arbitrarily deep. Real-world plists (even deeply-nested
// Info.plist / entitlements structures) are well under 50 levels; 200 is
// generous headroom.
export const MAX_TREE_DEPTH = 200;

// Bound on a caller-supplied key_path's segment count (GetValueAtPath) --
// same rationale as MAX_TREE_DEPTH, applied to the path string instead of
// the tree.
export const MAX_PATH_SEGMENTS = 200;

export function byteLength(text: string): number {
  return Buffer.byteLength(text, 'utf8');
}

export function isTooLarge(byteLen: number): boolean {
  return byteLen > MAX_INPUT_BYTES;
}

// ── Error contract ──────────────────────────────────────────────────────
//
// A node's own thrown failure, carrying a ready-made Error proto. Node
// bodies catch this (and only this) and place it in the output's `error`
// field rather than letting it propagate as an uncaught exception -- the
// package's rule is "malformed input returns a structured error, never a
// crash."

export class PtNodeError extends Error {
  proto: PtError;
  constructor(code: string, message: string) {
    super(message);
    this.proto = mkError(code, message);
  }
}

export function mkError(code: string, message: string): PtError {
  const e = new PtError();
  e.setCode(code);
  e.setMessage(message);
  return e;
}

export function fail(code: string, message: string): never {
  throw new PtNodeError(code, message);
}

export function tooLargeError(byteLen: number): PtNodeError {
  return new PtNodeError(
    'TOO_LARGE',
    `input is ${byteLen} bytes, exceeding the ${MAX_INPUT_BYTES} byte limit`,
  );
}

// ── PlistValue construction ────────────────────────────────────────────

const T = PlistValue.PlistType;

export function mkString(s: string): PlistValue {
  const v = new PlistValue();
  v.setType(T.STRING);
  v.setStringValue(s);
  return v;
}

// `decimal` must already be a valid base-10 integer literal (optional
// leading '-', digits only) -- callers that derive it from an untrusted
// source should validate with isValidDecimalInteger first.
export function mkInteger(decimal: string): PlistValue {
  const v = new PlistValue();
  v.setType(T.INTEGER);
  v.setIntegerValue(decimal);
  return v;
}

export function mkReal(n: number): PlistValue {
  const v = new PlistValue();
  v.setType(T.REAL);
  v.setRealValue(n);
  return v;
}

export function mkBool(b: boolean): PlistValue {
  const v = new PlistValue();
  v.setType(T.BOOLEAN);
  v.setBoolValue(b);
  return v;
}

// `iso` must already be an RFC3339 UTC string.
export function mkDate(iso: string): PlistValue {
  const v = new PlistValue();
  v.setType(T.DATE);
  v.setDateValue(iso);
  return v;
}

export function mkData(bytes: Uint8Array): PlistValue {
  const v = new PlistValue();
  v.setType(T.DATA);
  v.setDataValue(bytes);
  return v;
}

export function mkDict(entries: Array<[string, PlistValue]>): PlistValue {
  const v = new PlistValue();
  v.setType(T.DICT);
  v.setDictValueList(
    entries.map(([key, value]) => {
      const e = new PlistEntry();
      e.setKey(key);
      e.setValue(value);
      return e;
    }),
  );
  return v;
}

export function mkArray(items: PlistValue[]): PlistValue {
  const v = new PlistValue();
  v.setType(T.ARRAY);
  v.setArrayValueList(items);
  return v;
}

export function mkNull(): PlistValue {
  const v = new PlistValue();
  v.setType(T.NULL_VALUE);
  return v;
}

export function isValidDecimalInteger(s: string): boolean {
  return /^-?\d+$/.test(s);
}

export function typeName(t: number): string {
  for (const [name, val] of Object.entries(T)) {
    if (val === t) return name;
  }
  return 'UNKNOWN';
}

// ── Key-path traversal (GetValueAtPath) ────────────────────────────────
//
// Dot-separated: a DICT segment is matched as a literal key; an ARRAY
// segment must be a non-negative decimal index. A literal "." inside a
// dict key cannot be expressed this way -- a disclosed limitation, not a
// bug (see messages.proto). Depth-bounded via MAX_PATH_SEGMENTS.

export interface PathLookup {
  found: boolean;
  value?: PlistValue;
}

export function getAtPath(root: PlistValue, path: string): PathLookup {
  if (path === '') {
    return { found: true, value: root };
  }
  const segments = path.split('.');
  if (segments.length > MAX_PATH_SEGMENTS) {
    fail('PATH_TOO_LONG', `key_path has ${segments.length} segments, exceeding ${MAX_PATH_SEGMENTS}`);
  }
  let current = root;
  for (const seg of segments) {
    if (current.getType() === T.DICT) {
      const match = current.getDictValueList().find((e) => e.getKey() === seg);
      if (!match || !match.getValue()) return { found: false };
      current = match.getValue()!;
    } else if (current.getType() === T.ARRAY) {
      if (!/^\d+$/.test(seg)) return { found: false };
      const idx = Number(seg);
      const items = current.getArrayValueList();
      if (!Number.isSafeInteger(idx) || idx >= items.length) return { found: false };
      current = items[idx];
    } else {
      return { found: false };
    }
  }
  return { found: true, value: current };
}

// ── Recursive tree walk (ListAllKeysRecursive, ExtractValuesByType,
//    SummarizeStructure, ConvertToJson) ───────────────────────────────
//
// Visits every node in the tree depth-first in source order, calling
// `visit(path, value, depth)` for each -- including DICT/ARRAY container
// nodes themselves, not just leaves, so a caller can see the full shape.
// The root itself is visited with path "".

export function walkTree(
  root: PlistValue,
  visit: (path: string, value: PlistValue, depth: number) => void,
  depth = 0,
  path = '',
): void {
  if (depth > MAX_TREE_DEPTH) {
    fail('TOO_DEEP', `tree nesting exceeds ${MAX_TREE_DEPTH} levels`);
  }
  visit(path, root, depth);
  const t = root.getType();
  if (t === T.DICT) {
    for (const entry of root.getDictValueList()) {
      const child = entry.getValue();
      if (!child) continue;
      const childPath = path ? `${path}.${entry.getKey()}` : entry.getKey();
      walkTree(child, visit, depth + 1, childPath);
    }
  } else if (t === T.ARRAY) {
    root.getArrayValueList().forEach((child, idx) => {
      const childPath = path ? `${path}.${idx}` : String(idx);
      walkTree(child, visit, depth + 1, childPath);
    });
  }
}

// Conversions between this package's canonical PlistValue tree and plain
// JSON text (ConvertToJson, JsonToXml). See messages.proto on
// ConvertToJsonRequest / JsonToXmlRequest for the documented type-mapping
// rules; this file is the implementation of those exact rules.

import { PlistValue } from '../gen/messages_pb';
import { fail, isValidDecimalInteger, mkArray, mkBool, mkDict, mkInteger, mkNull, mkReal, mkString, MAX_TREE_DEPTH } from './helpers';

const T = PlistValue.PlistType;
const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);

// PlistValue -> plain JSON-serializable JS value.
//
// Builds every object via Object.fromEntries (never bare `obj[key] = ...`
// assignment) specifically so a dict key literally named "__proto__" (or
// "constructor"/"prototype") becomes an ordinary own property rather than
// reaching the Object.prototype accessor and mutating the object's actual
// prototype -- the same class of bug plist.js itself patched for CVE-2022-
// 22912, avoided here by construction rather than by a key blocklist.
function toJsonValue(value: PlistValue, depth: number): unknown {
  if (depth > MAX_TREE_DEPTH) {
    fail('TOO_DEEP', `tree nesting exceeds ${MAX_TREE_DEPTH} levels`);
  }
  switch (value.getType()) {
    case T.STRING:
      return value.getStringValue();
    case T.INTEGER: {
      const decimal = value.getIntegerValue();
      const big = BigInt(decimal);
      const abs = big < 0n ? -big : big;
      // Only narrow to a JSON number when it round-trips exactly; JSON has
      // no arbitrary-precision integer type, so a value outside the
      // JS-double-safe range is emitted as a decimal string instead of
      // silently losing precision.
      return abs <= MAX_SAFE ? Number(decimal) : decimal;
    }
    case T.REAL:
      return value.getRealValue();
    case T.BOOLEAN:
      return value.getBoolValue();
    case T.DATE:
      return value.getDateValue();
    case T.DATA:
      return Buffer.from(value.getDataValue_asU8()).toString('base64');
    case T.DICT:
      return Object.fromEntries(
        value.getDictValueList().map((e) => [e.getKey(), toJsonValue(e.getValue()!, depth + 1)]),
      );
    case T.ARRAY:
      return value.getArrayValueList().map((v) => toJsonValue(v, depth + 1));
    case T.NULL_VALUE:
      return null;
    default:
      return null;
  }
}

export function plistToJsonText(root: PlistValue): string {
  return JSON.stringify(toJsonValue(root, 0));
}

// Plain JSON value -> PlistValue, per the type-inference rules documented
// on JsonToXmlRequest. `JSON.parse` itself already narrows any numeric
// literal to a JS double, so an integer literal beyond 2^53 in the SOURCE
// JSON text has already lost precision before this function runs -- an
// inherent JSON limitation (not a bug here), documented on the request
// message.
function fromJsonValue(v: unknown, depth: number): PlistValue {
  if (depth > MAX_TREE_DEPTH) {
    fail('TOO_DEEP', `JSON nesting exceeds ${MAX_TREE_DEPTH} levels`);
  }
  if (v === null) return mkNull();
  if (typeof v === 'string') return mkString(v);
  if (typeof v === 'boolean') return mkBool(v);
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) {
      fail('INVALID_NUMBER', 'JSON number is not finite');
    }
    return Number.isInteger(v) ? mkInteger(BigInt(v).toString(10)) : mkReal(v);
  }
  if (Array.isArray(v)) {
    return mkArray(v.map((item) => fromJsonValue(item, depth + 1)));
  }
  if (typeof v === 'object') {
    return mkDict(Object.entries(v as Record<string, unknown>).map(([k, val]) => [k, fromJsonValue(val, depth + 1)]));
  }
  fail('UNSUPPORTED_JSON_VALUE', `unsupported JSON value type: ${typeof v}`);
}

export function jsonTextToPlist(json: string): PlistValue {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    fail('INVALID_JSON', `not valid JSON: ${(e as Error).message}`);
  }
  return fromJsonValue(parsed, 0);
}

// Re-exported for callers that only need the decimal-integer validity
// check without pulling in the rest of this module's surface.
export { isValidDecimalInteger };

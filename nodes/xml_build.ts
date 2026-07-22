// Serializes this package's canonical PlistValue tree to Apple XML plist
// text, using xmlbuilder (MIT) directly for the actual XML construction --
// the same underlying library TooTallNate/plist.js uses for building.
//
// This does NOT go through plist.js's own `build()` entry point: that
// function infers the XML tag from a loosely-typed JS value (`typeof`,
// `x % 1 === 0` to pick <integer> vs <real>), which is the right heuristic
// when converting from arbitrary JSON/JS but is actively wrong for a
// strictly-typed tree like ours -- a REAL value that happens to hold a
// whole number (e.g. 98.0) would silently re-serialize as an <integer>.
// Dispatching directly on PlistValue.type has no such ambiguity.

import * as xmlbuilder from 'xmlbuilder';
import { PlistValue } from '../gen/messages_pb';
import { fail, isValidDecimalInteger, MAX_TREE_DEPTH, PtNodeError } from './helpers';

const T = PlistValue.PlistType;

function writeValue(value: PlistValue, parent: xmlbuilder.XMLElement, depth: number): void {
  if (depth > MAX_TREE_DEPTH) {
    fail('TOO_DEEP', `tree nesting exceeds ${MAX_TREE_DEPTH} levels`);
  }
  switch (value.getType()) {
    case T.STRING:
      parent.ele('string').txt(value.getStringValue());
      return;
    case T.INTEGER: {
      const decimal = value.getIntegerValue();
      if (!isValidDecimalInteger(decimal)) {
        fail('INVALID_INTEGER', `integer_value "${decimal}" is not a valid decimal integer`);
      }
      parent.ele('integer').txt(decimal);
      return;
    }
    case T.REAL: {
      const n = value.getRealValue();
      if (!Number.isFinite(n)) {
        fail('INVALID_REAL', `real_value ${n} is not finite and cannot be represented in a plist`);
      }
      parent.ele('real').txt(String(n));
      return;
    }
    case T.BOOLEAN:
      parent.ele(value.getBoolValue() ? 'true' : 'false');
      return;
    case T.DATE:
      parent.ele('date').txt(value.getDateValue());
      return;
    case T.DATA:
      parent.ele('data').txt(Buffer.from(value.getDataValue_asU8()).toString('base64'));
      return;
    case T.DICT: {
      const dictEl = parent.ele('dict');
      for (const entry of value.getDictValueList()) {
        dictEl.ele('key').txt(entry.getKey());
        const child = entry.getValue();
        if (!child) {
          fail('MALFORMED_TREE', `dict entry "${entry.getKey()}" has no value`);
        }
        writeValue(child, dictEl, depth + 1);
      }
      return;
    }
    case T.ARRAY: {
      const arrEl = parent.ele('array');
      for (const item of value.getArrayValueList()) {
        writeValue(item, arrEl, depth + 1);
      }
      return;
    }
    case T.NULL_VALUE:
      parent.ele('null');
      return;
    default:
      fail('UNKNOWN_TYPE', `PlistValue has an unset/unknown type (${value.getType()})`);
  }
}

export function serializeXmlPlist(root: PlistValue): string {
  // xmlbuilder itself throws a plain Error (not a PtNodeError) for input it
  // cannot represent in XML text at all -- notably a string containing an
  // XML-1.0-illegal control character (e.g. U+0001), which is entirely
  // plausible for a STRING value that originated from corrupted or
  // binary-ish source data. Every xmlbuilder call happens inside
  // writeValue's tree walk, so wrapping the whole walk here converts any
  // such library exception into this package's documented structured
  // error rather than letting it escape uncaught. A PtNodeError raised by
  // this file's own explicit checks (fail(...) above) passes through
  // unchanged -- it is already the right shape.
  try {
    const doc = xmlbuilder.create('plist', { version: '1.0', encoding: 'UTF-8' });
    doc.dtd('-//Apple//DTD PLIST 1.0//EN', 'http://www.apple.com/DTDs/PropertyList-1.0.dtd');
    doc.att('version', '1.0');
    writeValue(root, doc, 0);
    return doc.end({ pretty: true });
  } catch (e) {
    if (e instanceof PtNodeError) {
      throw e;
    }
    fail('XML_BUILD_ERROR', `could not build XML: ${(e as Error).message}`);
  }
}

// XML plist parsing: a DOM walk (via @xmldom/xmldom, MIT) that mirrors the
// well-established algorithm used by TooTallNate/plist.js's parse.js, with
// one deliberate correction: <integer> text is carried through verbatim as
// a decimal string rather than converted through `parseInt` into a JS
// number. plist.js's own parser (all versions through 5.0.0) loses
// precision on any integer beyond 2^53 -- exactly the range real plists can
// legitimately use (a 64-bit signed plist integer, or a nanosecond-epoch
// timestamp stored as an <integer>). Carrying the text verbatim keeps this
// exact for every value; see nodes/bplist_binary.ts for the parallel,
// larger fix needed on the binary-format side.
//
// XXE safety: @xmldom/xmldom has no external-entity or DTD-fetch capability
// at all (verified directly -- a SYSTEM entity referencing a local file
// resolves to a parser-reported "entity not found" error, never the file's
// contents; see nodes/xml_parse_test.ts). This parser treats ANY reported
// XML error (including an unresolved entity) as a hard parse failure rather
// than silently continuing with a partial tree.

import { DOMParser } from '@xmldom/xmldom';
import { PlistValue } from '../gen/messages_pb';
import { fail, isValidDecimalInteger, mkArray, mkBool, mkData, mkDate, mkDict, mkInteger, mkNull, mkReal, mkString, MAX_TREE_DEPTH } from './helpers';

const TEXT_NODE = 3;
const CDATA_NODE = 4;
const COMMENT_NODE = 8;

function shouldIgnore(node: any): boolean {
  return node.nodeType === TEXT_NODE || node.nodeType === COMMENT_NODE || node.nodeType === CDATA_NODE;
}

function isEmptyNode(node: any): boolean {
  return !node.childNodes || node.childNodes.length === 0;
}

function textContent(node: any): string {
  let text = '';
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];
    if (child.nodeType === TEXT_NODE || child.nodeType === CDATA_NODE) {
      text += child.nodeValue;
    }
  }
  return text;
}

export function parseXmlPlist(xml: string): PlistValue {
  const parseErrors: string[] = [];
  const doc = new DOMParser({
    onError: (level: string, msg: string) => {
      parseErrors.push(`${level}: ${msg}`);
    },
  }).parseFromString(xml, 'text/xml');

  if (parseErrors.length > 0) {
    fail('MALFORMED_XML', `XML parse error(s): ${parseErrors.join('; ')}`);
  }
  if (!doc || !doc.documentElement) {
    fail('MALFORMED_XML', 'no document element');
  }
  if (doc.documentElement.nodeName !== 'plist') {
    fail('MALFORMED_XML', `expected root element <plist>, got <${doc.documentElement.nodeName}>`);
  }

  // The root <plist> wraps exactly one value (Apple's DTD); pull it out.
  const children: any[] = [];
  if (!isEmptyNode(doc.documentElement)) {
    for (let i = 0; i < doc.documentElement.childNodes.length; i++) {
      const child = doc.documentElement.childNodes[i];
      if (!shouldIgnore(child)) children.push(child);
    }
  }
  if (children.length === 0) {
    fail('MALFORMED_XML', '<plist> has no value element');
  }
  if (children.length > 1) {
    fail('MALFORMED_XML', '<plist> has more than one top-level value element');
  }

  return walk(children[0], 0);
}

function walk(node: any, depth: number): PlistValue {
  if (depth > MAX_TREE_DEPTH) {
    fail('TOO_DEEP', `XML plist nesting exceeds ${MAX_TREE_DEPTH} levels`);
  }
  const name = node.nodeName;
  switch (name) {
    case 'dict': {
      const entries: Array<[string, PlistValue]> = [];
      if (isEmptyNode(node)) return mkDict(entries);
      let pendingKey: string | null = null;
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        if (shouldIgnore(child)) continue;
        if (pendingKey === null) {
          if (child.nodeName !== 'key') {
            fail('MALFORMED_XML', 'expected <key> while parsing <dict>');
          }
          pendingKey = textContent(child);
        } else {
          if (child.nodeName === 'key') {
            fail('MALFORMED_XML', `unexpected <key> "${textContent(child)}" while parsing <dict> (missing value for previous key)`);
          }
          entries.push([pendingKey, walk(child, depth + 1)]);
          pendingKey = null;
        }
      }
      if (pendingKey !== null) {
        fail('MALFORMED_XML', `<dict> key "${pendingKey}" has no value`);
      }
      return mkDict(entries);
    }
    case 'array': {
      const items: PlistValue[] = [];
      if (isEmptyNode(node)) return mkArray(items);
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        if (!shouldIgnore(child)) items.push(walk(child, depth + 1));
      }
      return mkArray(items);
    }
    case 'string':
      return mkString(isEmptyNode(node) ? '' : textContent(node));
    case 'integer': {
      if (isEmptyNode(node)) fail('MALFORMED_XML', 'empty <integer>');
      const text = textContent(node).trim();
      if (!isValidDecimalInteger(text)) {
        fail('MALFORMED_XML', `<integer> value "${text}" is not a valid decimal integer`);
      }
      return mkInteger(text);
    }
    case 'real': {
      if (isEmptyNode(node)) fail('MALFORMED_XML', 'empty <real>');
      const text = textContent(node).trim();
      const n = Number(text);
      if (!Number.isFinite(n)) {
        fail('MALFORMED_XML', `<real> value "${text}" is not a finite number`);
      }
      return mkReal(n);
    }
    case 'data': {
      const text = isEmptyNode(node) ? '' : textContent(node).replace(/\s+/g, '');
      return mkData(new Uint8Array(Buffer.from(text, 'base64')));
    }
    case 'date': {
      if (isEmptyNode(node)) fail('MALFORMED_XML', 'empty <date>');
      const text = textContent(node).trim();
      const ms = Date.parse(text);
      if (Number.isNaN(ms)) {
        fail('MALFORMED_XML', `<date> value "${text}" is not a parseable date`);
      }
      return mkDate(new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z'));
    }
    case 'true':
      return mkBool(true);
    case 'false':
      return mkBool(false);
    case 'null':
      return mkNull();
    default:
      fail('MALFORMED_XML', `unrecognized plist tag <${name}>`);
  }
}

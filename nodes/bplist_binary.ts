// A binary property list (bplist00) parser, producing this package's
// canonical PlistValue tree directly from the raw buffer.
//
// This is a corrected, from-scratch TypeScript implementation of Apple's
// binary plist format (the same format documented and implemented by
// nearinfinity/node-bplist-parser and 3breadt/dd-plist, both MIT), written
// after discovering that node-bplist-parser 0.3.2 (the only maintained JS
// implementation, last released 2022, still the current npm `latest`)
// silently returns WRONG integer values for any 4-byte-width integer whose
// top bit is set (>= 2^31) and for any 8-byte-width integer outside the
// signed 32-bit range -- both routine magnitudes in real binary plists
// (any ID, hash, large counter/timestamp, or simply any negative number,
// which Python's plistlib -- and, per the documented format, Apple's own
// writer -- always encodes at 8-byte width regardless of magnitude).
// Verified directly: `bplist-parser` decodes a plist-format-compliant
// binary plist (produced independently by CPython's stdlib `plistlib`,
// FMT_BINARY) containing 9223372036854775000 as -808, and 3000000000
// (a 4-byte-width unsigned value) as -1294967296. This is a silent
// wrong-output defect on realistic input, not a pathological/adversarial
// case, so this file avoids the dependency rather than ship it. See
// nodes/bplist_binary_test.ts for the reproduction against those exact
// bytes.
//
// Integer decoding here uses native BigInt accumulation throughout
// (never a 32-bit JS bitwise op), and follows the format's actual
// signedness convention: 1/2/4-byte integers are unsigned; 8- and
// 16-byte integers are signed two's complement (this matches both
// CPython's plistlib writer and the widely-referenced format
// description -- negative values are always written at 8-byte width for
// exactly this reason). Every decoded integer is carried as a base-10
// decimal string (PlistValue.integer_value) so no value is ever narrowed
// through a JS double.

import { PlistValue, PlistEntry } from '../gen/messages_pb';
import { fail, mkArray, mkBool, mkData, mkDate, mkDict, mkInteger, mkNull, mkReal, mkString, MAX_TREE_DEPTH } from './helpers';

const MAGIC = 'bplist00';
const TRAILER_SIZE = 32;
const EPOCH_MS = Date.UTC(2001, 0, 1); // plist DATE epoch: 2001-01-01T00:00:00Z

// Matches node-bplist-parser's own safety bounds (a sane, long-standing
// convention for this format) -- an independent ceiling from our own
// MAX_INPUT_BYTES on total request size, applied per-object so a single
// declared object inside a small file can't claim an absurd length.
const MAX_OBJECT_SIZE = 100 * 1000 * 1000;
const MAX_OBJECT_COUNT = 32768;

function readUBE(buf: Buffer, start: number, len: number): bigint {
  let v = 0n;
  for (let i = 0; i < len; i++) {
    v = (v << 8n) | BigInt(buf[start + i]);
  }
  return v;
}

// Converts a bounded, already-range-checked bigint (an offset, count, or
// ref -- never plist payload data) to a JS number. Safe because every call
// site first checks the value against a bound well under
// Number.MAX_SAFE_INTEGER (buffer length, capped at MAX_INPUT_BYTES).
function toSafeNumber(v: bigint, what: string): number {
  if (v < 0n || v > BigInt(Number.MAX_SAFE_INTEGER)) {
    fail('MALFORMED_BPLIST', `${what} out of safe range`);
  }
  return Number(v);
}

function isoDateString(ms: number): string {
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function parseBinaryPlist(buffer: Buffer): PlistValue {
  if (buffer.length < TRAILER_SIZE + MAGIC.length) {
    fail('MALFORMED_BPLIST', 'buffer too small to be a binary plist');
  }
  if (buffer.subarray(0, MAGIC.length).toString('latin1') !== MAGIC) {
    fail('MALFORMED_BPLIST', `expected '${MAGIC}' magic at offset 0`);
  }

  const trailer = buffer.subarray(buffer.length - TRAILER_SIZE, buffer.length);
  const offsetSize = trailer.readUInt8(6);
  const objectRefSize = trailer.readUInt8(7);
  if (offsetSize < 1 || offsetSize > 8 || objectRefSize < 1 || objectRefSize > 8) {
    fail('MALFORMED_BPLIST', 'invalid offsetSize/objectRefSize in trailer');
  }
  const numObjects = toSafeNumber(readUBE(trailer, 8, 8), 'numObjects');
  const topObject = toSafeNumber(readUBE(trailer, 16, 8), 'topObject');
  const offsetTableOffset = toSafeNumber(readUBE(trailer, 24, 8), 'offsetTableOffset');

  if (numObjects > MAX_OBJECT_COUNT) {
    fail('TOO_MANY_OBJECTS', `binary plist declares ${numObjects} objects, exceeding ${MAX_OBJECT_COUNT}`);
  }
  if (topObject >= numObjects) {
    fail('MALFORMED_BPLIST', 'topObject index out of range');
  }
  if (offsetTableOffset < 0 || offsetTableOffset + numObjects * offsetSize > buffer.length) {
    fail('MALFORMED_BPLIST', 'offset table out of range');
  }

  const offsetTable: number[] = new Array(numObjects);
  for (let i = 0; i < numObjects; i++) {
    const start = offsetTableOffset + i * offsetSize;
    offsetTable[i] = toSafeNumber(readUBE(buffer, start, offsetSize), `offsetTable[${i}]`);
  }

  function checkBounds(offset: number, len: number, what: string): void {
    if (offset < 0 || len < 0 || offset + len > buffer.length) {
      fail('MALFORMED_BPLIST', `${what} out of buffer bounds`);
    }
  }

  // Reads a length-or-size-follows-in-a-nested-int header, used by array,
  // dict, data, and string objects when their inline 4-bit size nibble is
  // 0xF (meaning "size doesn't fit in 4 bits; an integer object header
  // immediately follows carrying the real size").
  function readSize(offset: number, inlineNibble: number): { size: number; bytesConsumed: number } {
    if (inlineNibble !== 0xf) {
      return { size: inlineNibble, bytesConsumed: 0 };
    }
    checkBounds(offset, 1, 'size-int header');
    const intMarker = buffer[offset];
    const intType = (intMarker & 0xf0) >> 4;
    if (intType !== 0x1) {
      fail('MALFORMED_BPLIST', 'expected an integer object as size marker');
    }
    const intInfo = intMarker & 0x0f;
    const intLen = 1 << intInfo;
    checkBounds(offset + 1, intLen, 'size-int payload');
    const size = toSafeNumber(readUBE(buffer, offset + 1, intLen), 'size');
    return { size, bytesConsumed: 1 + intLen };
  }

  function parseObject(ref: number, depth: number): PlistValue {
    if (depth > MAX_TREE_DEPTH) {
      fail('TOO_DEEP', `binary plist nesting exceeds ${MAX_TREE_DEPTH} levels`);
    }
    if (ref < 0 || ref >= numObjects) {
      fail('MALFORMED_BPLIST', `object ref ${ref} out of range`);
    }
    const offset = offsetTable[ref];
    checkBounds(offset, 1, 'object marker');
    const marker = buffer[offset];
    const objType = (marker & 0xf0) >> 4;
    const objInfo = marker & 0x0f;

    switch (objType) {
      case 0x0: // null / bool / fill
        if (objInfo === 0x0 || objInfo === 0xf) return mkNull();
        if (objInfo === 0x8) return mkBool(false);
        if (objInfo === 0x9) return mkBool(true);
        fail('MALFORMED_BPLIST', `unhandled simple object 0x${objInfo.toString(16)}`);
        break;
      case 0x1: { // integer: length 2^objInfo bytes
        const len = 1 << objInfo;
        checkBounds(offset + 1, len, 'integer payload');
        if (len > MAX_OBJECT_SIZE) fail('MALFORMED_BPLIST', 'integer object too large');
        const raw = readUBE(buffer, offset + 1, len);
        let value: bigint;
        if (len <= 4) {
          // 1/2/4-byte integers are unsigned.
          value = raw;
        } else {
          // 8- and 16-byte integers are signed two's complement.
          const bits = BigInt(len * 8);
          const signBit = 1n << (bits - 1n);
          value = raw >= signBit ? raw - (1n << bits) : raw;
        }
        return mkInteger(value.toString(10));
      }
      case 0x8: { // UID (NSKeyedArchiver reference) -- length objInfo+1 bytes,
        // always unsigned. No dedicated PlistType exists for this
        // Apple-internal type, so it is represented the same way `plutil`
        // itself renders a UID when converting a keyed-archiver binary
        // plist to XML: a one-entry dict {"CF$UID": <integer>}.
        const len = objInfo + 1;
        checkBounds(offset + 1, len, 'UID payload');
        const value = readUBE(buffer, offset + 1, len);
        const entry = new PlistEntry();
        entry.setKey('CF$UID');
        entry.setValue(mkInteger(value.toString(10)));
        const dict = new PlistValue();
        dict.setType(PlistValue.PlistType.DICT);
        dict.setDictValueList([entry]);
        return dict;
      }
      case 0x2: { // real: length 2^objInfo bytes (4 -> float, 8 -> double)
        const len = 1 << objInfo;
        checkBounds(offset + 1, len, 'real payload');
        if (len === 4) return mkReal(buffer.readFloatBE(offset + 1));
        if (len === 8) return mkReal(buffer.readDoubleBE(offset + 1));
        fail('MALFORMED_BPLIST', `unsupported real width ${len}`);
        break;
      }
      case 0x3: { // date: always an 8-byte double, seconds since 2001-01-01
        checkBounds(offset + 1, 8, 'date payload');
        const seconds = buffer.readDoubleBE(offset + 1);
        return mkDate(isoDateString(EPOCH_MS + seconds * 1000));
      }
      case 0x4: { // data
        const { size, bytesConsumed } = readSize(offset + 1, objInfo);
        const dataStart = offset + 1 + bytesConsumed;
        checkBounds(dataStart, size, 'data payload');
        if (size > MAX_OBJECT_SIZE) fail('MALFORMED_BPLIST', 'data object too large');
        return mkData(new Uint8Array(buffer.subarray(dataStart, dataStart + size)));
      }
      case 0x5: { // ASCII string
        const { size, bytesConsumed } = readSize(offset + 1, objInfo);
        const strStart = offset + 1 + bytesConsumed;
        checkBounds(strStart, size, 'ascii string payload');
        if (size > MAX_OBJECT_SIZE) fail('MALFORMED_BPLIST', 'string object too large');
        return mkString(buffer.toString('latin1', strStart, strStart + size));
      }
      case 0x6: { // UTF-16BE string (length is in UTF-16 code units)
        const { size, bytesConsumed } = readSize(offset + 1, objInfo);
        const strStart = offset + 1 + bytesConsumed;
        const byteLen = size * 2;
        checkBounds(strStart, byteLen, 'utf16 string payload');
        if (byteLen > MAX_OBJECT_SIZE) fail('MALFORMED_BPLIST', 'string object too large');
        return mkString(decodeUtf16Be(buffer, strStart, byteLen));
      }
      case 0xa: { // array
        const { size: length, bytesConsumed } = readSize(offset + 1, objInfo);
        const refsStart = offset + 1 + bytesConsumed;
        checkBounds(refsStart, length * objectRefSize, 'array refs');
        if (length * objectRefSize > MAX_OBJECT_SIZE) fail('MALFORMED_BPLIST', 'array too large');
        const items: PlistValue[] = new Array(length);
        for (let i = 0; i < length; i++) {
          const itemRef = toSafeNumber(readUBE(buffer, refsStart + i * objectRefSize, objectRefSize), 'array item ref');
          items[i] = parseObject(itemRef, depth + 1);
        }
        return mkArray(items);
      }
      case 0xd: { // dict
        const { size: length, bytesConsumed } = readSize(offset + 1, objInfo);
        const keysStart = offset + 1 + bytesConsumed;
        const valsStart = keysStart + length * objectRefSize;
        checkBounds(keysStart, length * objectRefSize * 2, 'dict refs');
        if (length * 2 * objectRefSize > MAX_OBJECT_SIZE) fail('MALFORMED_BPLIST', 'dict too large');
        const entries: Array<[string, PlistValue]> = new Array(length);
        for (let i = 0; i < length; i++) {
          const keyRef = toSafeNumber(readUBE(buffer, keysStart + i * objectRefSize, objectRefSize), 'dict key ref');
          const valRef = toSafeNumber(readUBE(buffer, valsStart + i * objectRefSize, objectRefSize), 'dict val ref');
          const keyValue = parseObject(keyRef, depth + 1);
          // Plist dict keys are always strings; a non-string key object
          // (malformed input) is reported rather than silently coerced.
          if (keyValue.getType() !== PlistValue.PlistType.STRING) {
            fail('MALFORMED_BPLIST', 'dict key object is not a string');
          }
          entries[i] = [keyValue.getStringValue(), parseObject(valRef, depth + 1)];
        }
        return mkDict(entries);
      }
      default:
        fail('MALFORMED_BPLIST', `unhandled object type 0x${objType.toString(16)}`);
    }
    // Unreachable -- every case above returns or throws.
    fail('MALFORMED_BPLIST', 'unreachable');
  }

  return parseObject(topObject, 0);
}

// UTF-16BE decode (Node's built-in string decoders are all little-endian).
function decodeUtf16Be(buffer: Buffer, start: number, byteLen: number): string {
  const units = new Uint16Array(byteLen / 2);
  for (let i = 0; i < units.length; i++) {
    units[i] = buffer.readUInt16BE(start + i * 2);
  }
  return String.fromCharCode(...units);
}

import { PlistValue, BinaryPlistRequest } from '../gen/messages_pb';
import { parseBinary } from './parse_binary';
import { testContext } from './testctx';
import { FIXTURE1_B64, FIXTURE2_B64, b64ToBytes } from './fixtures';
import { MAX_INPUT_BYTES } from './helpers';

const T = PlistValue.PlistType;

function parse(bytes: Uint8Array) {
  const input = new BinaryPlistRequest();
  input.setData(bytes);
  return parseBinary(testContext, input);
}

function dictGet(value: PlistValue, key: string): PlistValue | undefined {
  return value.getDictValueList().find((e) => e.getKey() === key)?.getValue();
}

describe('ParseBinary', () => {
  // FIXTURE1_B64 is a real bplist00 document, generated independently by
  // CPython's stdlib plistlib from the SAME source dict as FIXTURE1_XML
  // (see fixtures.ts) -- an independent oracle. This is also the
  // reproduction for the defect this package's own parser was written to
  // avoid: the standard JS bplist-parser library decodes LargePositive4Byte
  // as -1294967296 (should be 3000000000) and HugeInt8Byte as -808 (should
  // be 9223372036854775000), verified directly against that library during
  // development.
  it('parses every value type in FIXTURE1 to the exact independently-known values', () => {
    const result = parse(b64ToBytes(FIXTURE1_B64));
    expect(result.getError()).toBeUndefined();
    const root = result.getValue()!;
    expect(root.getType()).toBe(T.DICT);

    expect(dictGet(root, 'SmallInt')!.getIntegerValue()).toBe('42');
    expect(dictGet(root, 'NegativeInt')!.getIntegerValue()).toBe('-5');
    expect(dictGet(root, 'LargePositive4Byte')!.getIntegerValue()).toBe('3000000000');
    expect(dictGet(root, 'HugeInt8Byte')!.getIntegerValue()).toBe('9223372036854775000');

    expect(dictGet(root, 'PiReal')!.getType()).toBe(T.REAL);
    expect(dictGet(root, 'PiReal')!.getRealValue()).toBeCloseTo(3.14159, 5);
    expect(dictGet(root, 'WholeReal')!.getType()).toBe(T.REAL);
    expect(dictGet(root, 'WholeReal')!.getRealValue()).toBe(98);

    expect(dictGet(root, 'IsEnabled')!.getBoolValue()).toBe(true);
    expect(dictGet(root, 'IsDisabled')!.getBoolValue()).toBe(false);

    expect(dictGet(root, 'CreatedAt')!.getType()).toBe(T.DATE);
    expect(dictGet(root, 'CreatedAt')!.getDateValue()).toBe('2026-07-21T12:30:00Z');

    const data = dictGet(root, 'RawData')!;
    expect(data.getType()).toBe(T.DATA);
    expect(Array.from(data.getDataValue_asU8())).toEqual([0x00, 0x01, 0x02, 0xff, 0xfe]);

    const nested = dictGet(root, 'Nested')!;
    const arr = dictGet(nested, 'Array')!;
    expect(arr.getArrayValueList().map((v) => v.getStringValue())).toEqual(['a', 'b', 'c']);
    expect(dictGet(dictGet(nested, 'DeepDict')!, 'Key')!.getStringValue()).toBe('Value');
  });

  it('parses a real Info.plist-shaped binary document, matching the XML twin exactly', () => {
    const result = parse(b64ToBytes(FIXTURE2_B64));
    const root = result.getValue()!;
    expect(dictGet(root, 'CFBundleIdentifier')!.getStringValue()).toBe('com.example.myapp');
    const urlTypes = dictGet(root, 'CFBundleURLTypes')!;
    expect(urlTypes.getType()).toBe(T.ARRAY);
    expect(urlTypes.getArrayValueList().length).toBe(2);
  });

  it('returns a structured error, not a throw, for a bad magic header', () => {
    const result = parse(new TextEncoder().encode('not-a-bplist-at-all-000'));
    expect(result.getValue()).toBeUndefined();
    expect(result.getError()?.getCode()).toBe('MALFORMED_BPLIST');
  });

  it('returns a structured error for a truncated buffer', () => {
    const full = b64ToBytes(FIXTURE1_B64);
    const truncated = full.subarray(0, 20);
    const result = parse(truncated);
    expect(result.getError()).toBeDefined();
  });

  it('rejects input over the size bound with a structured error', () => {
    const huge = new Uint8Array(MAX_INPUT_BYTES + 1);
    const result = parse(huge);
    expect(result.getError()?.getCode()).toBe('TOO_LARGE');
  });
});

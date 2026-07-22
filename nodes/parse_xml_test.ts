import * as fs from 'fs';
import { PlistValue, XmlPlistRequest } from '../gen/messages_pb';
import { parseXml } from './parse_xml';
import { testContext } from './testctx';
import { FIXTURE1_XML, FIXTURE2_XML } from './fixtures';
import { MAX_INPUT_BYTES } from './helpers';

const T = PlistValue.PlistType;

function parse(xml: string) {
  const input = new XmlPlistRequest();
  input.setXml(xml);
  return parseXml(testContext, input);
}

function dictGet(value: PlistValue, key: string): PlistValue | undefined {
  return value.getDictValueList().find((e) => e.getKey() === key)?.getValue();
}

describe('ParseXml', () => {
  // FIXTURE1_XML was generated independently by CPython's stdlib plistlib
  // from a known source dict (see fixtures.ts) -- this is an
  // independent-oracle test, not a self-consistency round-trip.
  it('parses every value type in FIXTURE1 to the exact independently-known values', () => {
    const result = parse(FIXTURE1_XML);
    expect(result.getError()).toBeUndefined();
    const root = result.getValue()!;
    expect(root.getType()).toBe(T.DICT);

    expect(dictGet(root, 'SmallInt')!.getIntegerValue()).toBe('42');
    expect(dictGet(root, 'NegativeInt')!.getIntegerValue()).toBe('-5');
    // Values a standard JS bplist library would corrupt if they came from
    // the binary side (see parse_binary_test.ts) -- here on the XML side,
    // exercised through the same canonical decimal-string representation.
    expect(dictGet(root, 'LargePositive4Byte')!.getIntegerValue()).toBe('3000000000');
    expect(dictGet(root, 'HugeInt8Byte')!.getIntegerValue()).toBe('9223372036854775000');

    expect(dictGet(root, 'PiReal')!.getType()).toBe(T.REAL);
    expect(dictGet(root, 'PiReal')!.getRealValue()).toBeCloseTo(3.14159, 5);
    // A REAL that happens to be a whole number must stay REAL, not
    // collapse to INTEGER.
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
    expect(nested.getType()).toBe(T.DICT);
    const arr = dictGet(nested, 'Array')!;
    expect(arr.getType()).toBe(T.ARRAY);
    expect(arr.getArrayValueList().map((v) => v.getStringValue())).toEqual(['a', 'b', 'c']);
    expect(dictGet(dictGet(nested, 'DeepDict')!, 'Key')!.getStringValue()).toBe('Value');
  });

  it('parses a real Info.plist-shaped document', () => {
    const result = parse(FIXTURE2_XML);
    const root = result.getValue()!;
    expect(dictGet(root, 'CFBundleIdentifier')!.getStringValue()).toBe('com.example.myapp');
    expect(dictGet(root, 'CFBundleVersion')!.getStringValue()).toBe('42');
  });

  it('returns a structured error, not a throw, for a dict with a missing value', () => {
    const result = parse('<?xml version="1.0"?><plist version="1.0"><dict><key>A</key></dict></plist>');
    expect(result.getValue()).toBeUndefined();
    expect(result.getError()?.getCode()).toBe('MALFORMED_XML');
  });

  it('returns a structured error for a non-plist root element', () => {
    const result = parse('<?xml version="1.0"?><notaplist></notaplist>');
    expect(result.getError()?.getCode()).toBe('MALFORMED_XML');
  });

  // Regression: @xmldom/xmldom's DOMParser both reports a `fatalError` to
  // `onError` AND throws it synchronously as a raw exception for something
  // as ordinary as an unclosed tag (a truncated download, a paste error).
  // That raw throw bypassed the onError-collected-errors check entirely
  // and escaped as an uncaught exception (surfaced by the platform as a
  // bare, undocumented `{"error": "unclosed xml tag(s): ..."}` string
  // instead of this node's documented {value?, error?:{code,message}}
  // shape) until parseXmlPlist wrapped the parseFromString call itself in
  // its own try/catch.
  it('returns a structured error, not a throw, for an unclosed tag', () => {
    const result = parse('<?xml version="1.0"?><plist version="1.0"><string>hi');
    expect(result.getError()?.getCode()).toBe('MALFORMED_XML');
    expect(result.getValue()).toBeUndefined();
  });

  it('does not leak local file content through an external XML entity (XXE)', () => {
    const secretPath = '/etc/hostname';
    const secretContent = fs.readFileSync(secretPath, 'utf8').trim();
    const xxe =
      '<?xml version="1.0"?>' +
      `<!DOCTYPE plist [ <!ENTITY xxe SYSTEM "file://${secretPath}"> ]>` +
      '<plist version="1.0"><dict><key>Leak</key><string>&xxe;</string></dict></plist>';
    const result = parse(xxe);
    // Whatever the outcome, the actual file content must never appear.
    const serialized = JSON.stringify(result.toObject());
    if (secretContent.length > 0) {
      expect(serialized).not.toContain(secretContent);
    }
    // This parser's actual, stricter behavior: any XML error (including an
    // unresolved external entity) fails the whole document.
    expect(result.getError()?.getCode()).toBe('MALFORMED_XML');
  });

  it('rejects input over the size bound with a structured error', () => {
    const huge = '<?xml version="1.0"?><plist version="1.0"><string>' + 'x'.repeat(MAX_INPUT_BYTES + 1) + '</string></plist>';
    const result = parse(huge);
    expect(result.getError()?.getCode()).toBe('TOO_LARGE');
  });
});

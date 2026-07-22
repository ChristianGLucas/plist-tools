import { ConvertToJsonRequest, PlistEntry, PlistValue, XmlPlistRequest } from '../gen/messages_pb';
import { convertToJson } from './convert_to_json';
import { parseXml } from './parse_xml';
import { testContext } from './testctx';
import { FIXTURE1_XML } from './fixtures';

function toJson(root: PlistValue): any {
  const input = new ConvertToJsonRequest();
  input.setRoot(root);
  const result = convertToJson(testContext, input);
  expect(result.getError()).toBeUndefined();
  return JSON.parse(result.getJson());
}

function parseFixture1() {
  const input = new XmlPlistRequest();
  input.setXml(FIXTURE1_XML);
  return parseXml(testContext, input).getValue()!;
}

describe('ConvertToJson', () => {
  it('maps every type per the documented rules', () => {
    const json = toJson(parseFixture1());
    expect(json.SmallInt).toBe(42); // small INTEGER -> JSON number
    expect(typeof json.SmallInt).toBe('number');
    // A huge INTEGER outside the JS-double-safe range -> decimal STRING,
    // not a silently-rounded number.
    expect(json.HugeInt8Byte).toBe('9223372036854775000');
    expect(typeof json.HugeInt8Byte).toBe('string');
    expect(json.LargePositive4Byte).toBe(3000000000); // fits safely -> number
    expect(json.PiReal).toBeCloseTo(3.14159, 5);
    expect(json.WholeReal).toBe(98);
    expect(json.IsEnabled).toBe(true);
    expect(json.IsDisabled).toBe(false);
    expect(json.CreatedAt).toBe('2026-07-21T12:30:00Z'); // DATE -> RFC3339 string
    expect(json.RawData).toBe('AAEC//4='); // DATA -> base64 string
    expect(json.Nested.Array).toEqual(['a', 'b', 'c']);
    expect(json.Nested.DeepDict.Key).toBe('Value');
  });

  it('is not vulnerable to prototype pollution via a dict key named "__proto__"', () => {
    const inner = new PlistValue();
    inner.setType(PlistValue.PlistType.STRING);
    inner.setStringValue('polluted');
    const entry = new PlistEntry();
    entry.setKey('__proto__');
    entry.setValue(inner);
    const root = new PlistValue();
    root.setType(PlistValue.PlistType.DICT);
    root.setDictValueList([entry]);

    const json = toJson(root);
    // The malicious key must show up as an ordinary OWN property, and must
    // NOT have altered Object.prototype for every other object in the
    // process.
    expect(Object.prototype.hasOwnProperty.call(json, '__proto__')).toBe(true);
    expect(json.__proto__).toBe('polluted');
    expect(({} as any).polluted).toBeUndefined();
    expect(Object.getPrototypeOf({})).toBe(Object.prototype);
  });

  it('returns a structured error when root is missing', () => {
    const input = new ConvertToJsonRequest();
    const result = convertToJson(testContext, input);
    expect(result.getError()?.getCode()).toBe('MISSING_ROOT');
  });
});

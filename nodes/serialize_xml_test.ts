import { PlistValue, SerializeXmlRequest, XmlPlistRequest } from '../gen/messages_pb';
import { serializeXml } from './serialize_xml';
import { parseXml } from './parse_xml';
import { testContext } from './testctx';
import { FIXTURE1_XML } from './fixtures';

const T = PlistValue.PlistType;

function dictGet(value: PlistValue, key: string): PlistValue | undefined {
  return value.getDictValueList().find((e) => e.getKey() === key)?.getValue();
}

describe('SerializeXml', () => {
  it('round-trips FIXTURE1 through serialize -> re-parse, preserving every value exactly', () => {
    const parseInput = new XmlPlistRequest();
    parseInput.setXml(FIXTURE1_XML);
    const original = parseXml(testContext, parseInput).getValue()!;

    const serializeInput = new SerializeXmlRequest();
    serializeInput.setRoot(original);
    const serialized = serializeXml(testContext, serializeInput);
    expect(serialized.getError()).toBeUndefined();
    expect(serialized.getXml()).toContain('<?xml');
    expect(serialized.getXml()).toContain('<plist');

    // Re-parse with the SAME independently-verified parser and check
    // against the fixture's known values again (not just "equals what we
    // started with") -- this is the regression test for the ambiguity a
    // heuristic-based builder (e.g. plist.js's `build()`) would introduce.
    const reparseInput = new XmlPlistRequest();
    reparseInput.setXml(serialized.getXml());
    const roundTripped = parseXml(testContext, reparseInput).getValue()!;

    expect(dictGet(roundTripped, 'SmallInt')!.getIntegerValue()).toBe('42');
    expect(dictGet(roundTripped, 'HugeInt8Byte')!.getIntegerValue()).toBe('9223372036854775000');
    // The critical regression case: a REAL holding a whole number must
    // still be <real> after a round-trip, never silently <integer>.
    expect(dictGet(roundTripped, 'WholeReal')!.getType()).toBe(T.REAL);
    expect(dictGet(roundTripped, 'WholeReal')!.getRealValue()).toBe(98);
    expect(dictGet(roundTripped, 'PiReal')!.getType()).toBe(T.REAL);
    expect(dictGet(roundTripped, 'PiReal')!.getRealValue()).toBeCloseTo(3.14159, 5);
    expect(dictGet(roundTripped, 'CreatedAt')!.getDateValue()).toBe('2026-07-21T12:30:00Z');
    expect(Array.from(dictGet(roundTripped, 'RawData')!.getDataValue_asU8())).toEqual([0x00, 0x01, 0x02, 0xff, 0xfe]);
  });

  it('returns a structured error when root is missing', () => {
    const input = new SerializeXmlRequest();
    const result = serializeXml(testContext, input);
    expect(result.getError()?.getCode()).toBe('MISSING_ROOT');
  });
});

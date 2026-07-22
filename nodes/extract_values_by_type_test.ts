import { ExtractByTypeRequest, PlistValue, XmlPlistRequest } from '../gen/messages_pb';
import { extractValuesByType } from './extract_values_by_type';
import { parseXml } from './parse_xml';
import { testContext } from './testctx';
import { FIXTURE1_XML } from './fixtures';

const T = PlistValue.PlistType;
type PlistType = PlistValue.PlistTypeMap[keyof PlistValue.PlistTypeMap];

function parseRoot() {
  const input = new XmlPlistRequest();
  input.setXml(FIXTURE1_XML);
  return parseXml(testContext, input).getValue()!;
}

function extractBy(type: PlistType) {
  const input = new ExtractByTypeRequest();
  input.setRoot(parseRoot());
  input.setType(type);
  return extractValuesByType(testContext, input);
}

describe('ExtractValuesByType', () => {
  it('extracts the single DATE leaf with its path', () => {
    const result = extractBy(T.DATE);
    const entries = result.getEntriesList();
    expect(entries.length).toBe(1);
    expect(entries[0].getPath()).toBe('CreatedAt');
    expect(entries[0].getValue()!.getDateValue()).toBe('2026-07-21T12:30:00Z');
  });

  it('extracts the single DATA leaf with its path', () => {
    const result = extractBy(T.DATA);
    const entries = result.getEntriesList();
    expect(entries.length).toBe(1);
    expect(entries[0].getPath()).toBe('RawData');
  });

  it('extracts every DICT node, including the root and the nested one', () => {
    const result = extractBy(T.DICT);
    const paths = result.getEntriesList().map((e) => e.getPath());
    expect(paths).toContain(''); // the root itself
    expect(paths).toContain('Nested');
    expect(paths).toContain('Nested.DeepDict');
  });

  it('returns an empty list (not an error) when no value of the type is present', () => {
    const result = extractBy(T.NULL_VALUE);
    expect(result.getEntriesList()).toEqual([]);
    expect(result.getError()).toBeUndefined();
  });
});

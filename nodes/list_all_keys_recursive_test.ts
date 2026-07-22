import { ListAllKeysRequest, PlistValue, XmlPlistRequest } from '../gen/messages_pb';
import { listAllKeysRecursive } from './list_all_keys_recursive';
import { parseXml } from './parse_xml';
import { testContext } from './testctx';
import { FIXTURE1_XML } from './fixtures';

const T = PlistValue.PlistType;

function parseRoot() {
  const input = new XmlPlistRequest();
  input.setXml(FIXTURE1_XML);
  return parseXml(testContext, input).getValue()!;
}

describe('ListAllKeysRecursive', () => {
  it('flattens every path in the fixture, each with the correct type', () => {
    const input = new ListAllKeysRequest();
    input.setRoot(parseRoot());
    const result = listAllKeysRecursive(testContext, input);
    const byPath = new Map(result.getEntriesList().map((e) => [e.getPath(), e.getType()]));

    expect(byPath.get('SmallInt')).toBe(T.INTEGER);
    expect(byPath.get('RawData')).toBe(T.DATA);
    expect(byPath.get('CreatedAt')).toBe(T.DATE);
    expect(byPath.get('Nested')).toBe(T.DICT);
    expect(byPath.get('Nested.Array')).toBe(T.ARRAY);
    expect(byPath.get('Nested.Array.0')).toBe(T.STRING);
    expect(byPath.get('Nested.Array.1')).toBe(T.STRING);
    expect(byPath.get('Nested.Array.2')).toBe(T.STRING);
    expect(byPath.get('Nested.DeepDict')).toBe(T.DICT);
    expect(byPath.get('Nested.DeepDict.Key')).toBe(T.STRING);

    // The root itself (path "") is not listed.
    expect(byPath.has('')).toBe(false);
  });

  it('returns a structured error when root is missing', () => {
    const input = new ListAllKeysRequest();
    const result = listAllKeysRecursive(testContext, input);
    expect(result.getError()?.getCode()).toBe('MISSING_ROOT');
  });
});

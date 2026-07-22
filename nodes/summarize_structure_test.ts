import { SummarizeRequest, XmlPlistRequest } from '../gen/messages_pb';
import { summarizeStructure } from './summarize_structure';
import { parseXml } from './parse_xml';
import { testContext } from './testctx';
import { FIXTURE2_XML } from './fixtures';

function parseRoot(xml: string) {
  const input = new XmlPlistRequest();
  input.setXml(xml);
  return parseXml(testContext, input).getValue()!;
}

describe('SummarizeStructure', () => {
  // FIXTURE2's structure, hand-counted from the known source dict (see
  // fixtures.ts): a 7-key root dict, where CFBundleURLTypes is a 2-element
  // array of 1-key dicts (each holding a CFBundleURLSchemes array of
  // strings). That's 3 dicts (root + 2 nested) totaling 7 + 1 + 1 = 9
  // dict entries, 3 arrays (CFBundleURLTypes + 2x CFBundleURLSchemes), and
  // 9 STRING leaves (6 top-level strings + 3 scheme strings). Max nesting:
  // root(0) -> CFBundleURLTypes(1) -> dict(2) -> CFBundleURLSchemes(3) ->
  // string(4), reported as depth 5 (root counts as depth 1).
  it('matches the hand-counted structure of the fixture exactly', () => {
    const input = new SummarizeRequest();
    input.setRoot(parseRoot(FIXTURE2_XML));
    const result = summarizeStructure(testContext, input);

    expect(result.getTotalKeys()).toBe(9);
    expect(result.getDictCount()).toBe(3);
    expect(result.getArrayCount()).toBe(3);
    expect(result.getMaxDepth()).toBe(5);

    const typeCounts = result.getTypeCountsMap();
    expect(typeCounts.get('STRING')).toBe(9);
    expect(typeCounts.get('ARRAY')).toBe(3);
    expect(typeCounts.get('DICT')).toBe(3);
  });

  it('reports max_depth 1 for a bare scalar root', () => {
    const input = new SummarizeRequest();
    input.setRoot(parseRoot('<?xml version="1.0"?><plist version="1.0"><string>solo</string></plist>'));
    const result = summarizeStructure(testContext, input);
    expect(result.getMaxDepth()).toBe(1);
    expect(result.getTotalKeys()).toBe(0);
    expect(result.getDictCount()).toBe(0);
  });

  it('returns a structured error when root is missing', () => {
    const input = new SummarizeRequest();
    const result = summarizeStructure(testContext, input);
    expect(result.getError()?.getCode()).toBe('MISSING_ROOT');
  });
});

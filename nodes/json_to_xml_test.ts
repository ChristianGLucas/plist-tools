import { JsonToXmlRequest, PlistValue, XmlPlistRequest } from '../gen/messages_pb';
import { jsonToXml } from './json_to_xml';
import { parseXml } from './parse_xml';
import { testContext } from './testctx';

const T = PlistValue.PlistType;

function convert(json: string) {
  const input = new JsonToXmlRequest();
  input.setJson(json);
  return jsonToXml(testContext, input);
}

function reparse(xml: string): PlistValue {
  const input = new XmlPlistRequest();
  input.setXml(xml);
  return parseXml(testContext, input).getValue()!;
}

function dictGet(value: PlistValue, key: string): PlistValue | undefined {
  return value.getDictValueList().find((e) => e.getKey() === key)?.getValue();
}

describe('JsonToXml', () => {
  it('infers the correct plist type for every JSON value kind', () => {
    const json = JSON.stringify({
      AString: 'hello',
      AWholeNumber: 7,
      AFraction: 2.5,
      ATrue: true,
      AFalse: false,
      ANull: null,
      AnArray: [1, 2, 3],
      ANestedObject: { Inner: 'value' },
    });
    const result = convert(json);
    expect(result.getError()).toBeUndefined();
    const root = reparse(result.getXml());

    expect(dictGet(root, 'AString')!.getType()).toBe(T.STRING);
    expect(dictGet(root, 'AString')!.getStringValue()).toBe('hello');

    expect(dictGet(root, 'AWholeNumber')!.getType()).toBe(T.INTEGER);
    expect(dictGet(root, 'AWholeNumber')!.getIntegerValue()).toBe('7');

    expect(dictGet(root, 'AFraction')!.getType()).toBe(T.REAL);
    expect(dictGet(root, 'AFraction')!.getRealValue()).toBeCloseTo(2.5);

    expect(dictGet(root, 'ATrue')!.getBoolValue()).toBe(true);
    expect(dictGet(root, 'AFalse')!.getBoolValue()).toBe(false);
    expect(dictGet(root, 'ANull')!.getType()).toBe(T.NULL_VALUE);

    const arr = dictGet(root, 'AnArray')!;
    expect(arr.getType()).toBe(T.ARRAY);
    expect(arr.getArrayValueList().map((v) => v.getIntegerValue())).toEqual(['1', '2', '3']);

    expect(dictGet(dictGet(root, 'ANestedObject')!, 'Inner')!.getStringValue()).toBe('value');
  });

  it('returns a structured error for invalid JSON rather than throwing', () => {
    const result = convert('{not valid json');
    expect(result.getError()?.getCode()).toBe('INVALID_JSON');
  });

  // Regression (same root cause as SerializeXml's control-character test):
  // a JSON string value containing an XML-illegal control character must
  // not escape the internal serializeXmlPlist call as an uncaught throw.
  it('returns a structured error, not a throw, for a JSON string with an XML-illegal control character', () => {
    const result = convert(JSON.stringify({ A: 'bad\x01char' }));
    expect(result.getError()).toBeDefined();
    expect(result.getXml()).toBe('');
  });
});

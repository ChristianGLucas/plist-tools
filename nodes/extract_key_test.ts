import { ExtractKeyRequest, PlistEntry, PlistValue, XmlPlistRequest } from '../gen/messages_pb';
import { extractKey } from './extract_key';
import { parseXml } from './parse_xml';
import { testContext } from './testctx';
import { FIXTURE2_XML } from './fixtures';

function parseRoot() {
  const input = new XmlPlistRequest();
  input.setXml(FIXTURE2_XML);
  return parseXml(testContext, input).getValue()!;
}

describe('ExtractKey', () => {
  it('extracts an existing key value', () => {
    const input = new ExtractKeyRequest();
    input.setRoot(parseRoot());
    input.setKey('CFBundleIdentifier');
    const result = extractKey(testContext, input);
    expect(result.getFound()).toBe(true);
    expect(result.getValue()!.getStringValue()).toBe('com.example.myapp');
  });

  it('reports found=false (not an error) for an absent key', () => {
    const input = new ExtractKeyRequest();
    input.setRoot(parseRoot());
    input.setKey('NoSuchKey');
    const result = extractKey(testContext, input);
    expect(result.getFound()).toBe(false);
    expect(result.getError()).toBeUndefined();
  });

  it('matches a key literally, including a literal "." (unlike GetValueAtPath)', () => {
    const inner = new PlistValue();
    inner.setType(PlistValue.PlistType.STRING);
    inner.setStringValue('leaf');

    const entry = new PlistEntry();
    entry.setKey('com.apple.foo');
    entry.setValue(inner);

    const dotted = new PlistValue();
    dotted.setType(PlistValue.PlistType.DICT);
    dotted.setDictValueList([entry]);

    const input = new ExtractKeyRequest();
    input.setRoot(dotted);
    input.setKey('com.apple.foo');
    const result = extractKey(testContext, input);
    expect(result.getFound()).toBe(true);
    expect(result.getValue()!.getStringValue()).toBe('leaf');
  });

  it('returns a structured error when root is not a DICT', () => {
    const stringRoot = parseRoot().getDictValueList()[0].getValue()!;
    const input = new ExtractKeyRequest();
    input.setRoot(stringRoot);
    input.setKey('X');
    const result = extractKey(testContext, input);
    expect(result.getError()?.getCode()).toBe('NOT_A_DICT');
  });
});

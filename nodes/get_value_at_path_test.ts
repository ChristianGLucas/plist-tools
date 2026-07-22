import { KeyPathRequest, XmlPlistRequest } from '../gen/messages_pb';
import { getValueAtPath } from './get_value_at_path';
import { parseXml } from './parse_xml';
import { testContext } from './testctx';
import { FIXTURE2_XML } from './fixtures';

function parseRoot() {
  const input = new XmlPlistRequest();
  input.setXml(FIXTURE2_XML);
  return parseXml(testContext, input).getValue()!;
}

function lookup(path: string) {
  const input = new KeyPathRequest();
  input.setRoot(parseRoot());
  input.setKeyPath(path);
  return getValueAtPath(testContext, input);
}

describe('GetValueAtPath', () => {
  it('resolves a nested dict/array path to the exact value', () => {
    const result = lookup('CFBundleURLTypes.0.CFBundleURLSchemes.0');
    expect(result.getFound()).toBe(true);
    expect(result.getValue()!.getStringValue()).toBe('myapp');
  });

  it('resolves a second array element correctly', () => {
    const result = lookup('CFBundleURLTypes.0.CFBundleURLSchemes.1');
    expect(result.getValue()!.getStringValue()).toBe('myapp-debug');
  });

  it('resolves a top-level scalar path', () => {
    const result = lookup('CFBundleIdentifier');
    expect(result.getFound()).toBe(true);
    expect(result.getValue()!.getStringValue()).toBe('com.example.myapp');
  });

  it('reports found=false (not an error) for a well-formed but absent path', () => {
    const result = lookup('DoesNotExist.0.Nested');
    expect(result.getFound()).toBe(false);
    expect(result.getError()).toBeUndefined();
  });

  it('reports found=false for an out-of-range array index', () => {
    const result = lookup('CFBundleURLTypes.99');
    expect(result.getFound()).toBe(false);
  });

  it('returns a structured error when root is missing', () => {
    const input = new KeyPathRequest();
    input.setKeyPath('A');
    const result = getValueAtPath(testContext, input);
    expect(result.getError()?.getCode()).toBe('MISSING_ROOT');
  });
});

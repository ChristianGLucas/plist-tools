import { ListTopLevelKeysRequest, PlistValue, XmlPlistRequest } from '../gen/messages_pb';
import { listTopLevelKeys } from './list_top_level_keys';
import { parseXml } from './parse_xml';
import { testContext } from './testctx';
import { FIXTURE2_XML } from './fixtures';

function parseRoot() {
  const input = new XmlPlistRequest();
  input.setXml(FIXTURE2_XML);
  return parseXml(testContext, input).getValue()!;
}

describe('ListTopLevelKeys', () => {
  it('lists all 7 top-level keys of the fixture, in source order', () => {
    const input = new ListTopLevelKeysRequest();
    input.setRoot(parseRoot());
    const result = listTopLevelKeys(testContext, input);
    expect(result.getKeysList()).toEqual([
      'CFBundleIdentifier',
      'CFBundleName',
      'CFBundleShortVersionString',
      'CFBundleURLTypes',
      'CFBundleVersion',
      'NSCameraUsageDescription',
      'NSMicrophoneUsageDescription',
    ]);
  });

  it('returns a structured error when root is not a DICT', () => {
    const stringRoot = new PlistValue();
    stringRoot.setType(PlistValue.PlistType.STRING);
    stringRoot.setStringValue('not a dict');
    const input = new ListTopLevelKeysRequest();
    input.setRoot(stringRoot);
    const result = listTopLevelKeys(testContext, input);
    expect(result.getError()?.getCode()).toBe('NOT_A_DICT');
  });
});

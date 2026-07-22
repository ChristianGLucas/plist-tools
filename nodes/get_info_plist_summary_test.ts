import { InfoPlistSummaryRequest, PlistValue, XmlPlistRequest } from '../gen/messages_pb';
import { getInfoPlistSummary } from './get_info_plist_summary';
import { parseXml } from './parse_xml';
import { testContext } from './testctx';
import { FIXTURE2_XML } from './fixtures';

function parseRoot(xml: string) {
  const input = new XmlPlistRequest();
  input.setXml(xml);
  return parseXml(testContext, input).getValue()!;
}

describe('GetInfoPlistSummary', () => {
  it('extracts every common Info.plist field from the fixture', () => {
    const input = new InfoPlistSummaryRequest();
    input.setRoot(parseRoot(FIXTURE2_XML));
    const result = getInfoPlistSummary(testContext, input);

    expect(result.getBundleIdentifier()).toBe('com.example.myapp');
    expect(result.getBundleVersion()).toBe('42');
    expect(result.getBundleShortVersionString()).toBe('1.2.3');
    expect(result.getBundleName()).toBe('MyApp');
    expect(result.getUrlSchemesList()).toEqual(['myapp', 'myapp-debug', 'myapp2']);

    const usage = result.getUsageDescriptionsList();
    expect(usage.length).toBe(2);
    const byKey = new Map(usage.map((u) => [u.getKey(), u.getDescription()]));
    expect(byKey.get('NSCameraUsageDescription')).toBe('This app uses the camera to scan documents.');
    expect(byKey.get('NSMicrophoneUsageDescription')).toBe('This app uses the microphone for voice notes.');

    expect(result.getRecognizedFieldsFound()).toBe(true);
  });

  it('reports recognized_fields_found=false for a dict with none of the recognized keys', () => {
    const input = new InfoPlistSummaryRequest();
    input.setRoot(parseRoot('<?xml version="1.0"?><plist version="1.0"><dict><key>Unrelated</key><string>x</string></dict></plist>'));
    const result = getInfoPlistSummary(testContext, input);
    expect(result.getRecognizedFieldsFound()).toBe(false);
    expect(result.getBundleIdentifier()).toBe('');
    expect(result.getUrlSchemesList()).toEqual([]);
  });

  it('returns a structured error when root is not a DICT', () => {
    const stringRoot = new PlistValue();
    stringRoot.setType(PlistValue.PlistType.STRING);
    stringRoot.setStringValue('nope');
    const input = new InfoPlistSummaryRequest();
    input.setRoot(stringRoot);
    const result = getInfoPlistSummary(testContext, input);
    expect(result.getError()?.getCode()).toBe('NOT_A_DICT');
  });
});

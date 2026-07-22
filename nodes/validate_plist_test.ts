import { ValidateRequest } from '../gen/messages_pb';
import { validatePlist } from './validate_plist';
import { testContext } from './testctx';
import { FIXTURE1_B64, FIXTURE1_XML, b64ToBytes } from './fixtures';

describe('ValidatePlist', () => {
  it('reports a real XML plist as valid with no issues', () => {
    const input = new ValidateRequest();
    input.setXml(FIXTURE1_XML);
    const result = validatePlist(testContext, input);
    expect(result.getValid()).toBe(true);
    expect(result.getFormat()).toBe('xml');
    expect(result.getIssuesList()).toEqual([]);
  });

  it('reports a real binary plist as valid with no issues', () => {
    const input = new ValidateRequest();
    input.setBinary(b64ToBytes(FIXTURE1_B64));
    const result = validatePlist(testContext, input);
    expect(result.getValid()).toBe(true);
    expect(result.getFormat()).toBe('binary');
    expect(result.getIssuesList()).toEqual([]);
  });

  it('reports a malformed XML document as invalid with a specific issue', () => {
    const input = new ValidateRequest();
    input.setXml('<?xml version="1.0"?><plist version="1.0"><dict><key>A</key></dict></plist>');
    const result = validatePlist(testContext, input);
    expect(result.getValid()).toBe(false);
    expect(result.getFormat()).toBe('xml');
    expect(result.getIssuesList().length).toBeGreaterThan(0);
  });

  it('reports a malformed binary document as invalid', () => {
    const input = new ValidateRequest();
    input.setBinary(new TextEncoder().encode('garbage-not-a-plist'));
    const result = validatePlist(testContext, input);
    expect(result.getValid()).toBe(false);
    expect(result.getFormat()).toBe('binary');
  });

  it('reports unknown/invalid when no source is supplied', () => {
    const input = new ValidateRequest();
    const result = validatePlist(testContext, input);
    expect(result.getValid()).toBe(false);
    expect(result.getFormat()).toBe('unknown');
    expect(result.getIssuesList().length).toBeGreaterThan(0);
  });
});

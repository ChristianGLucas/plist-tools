import { DetectFormatRequest } from '../gen/messages_pb';
import { detectFormat } from './detect_format';
import { testContext } from './testctx';
import { FIXTURE1_B64, FIXTURE1_XML, b64ToBytes } from './fixtures';

function detect(bytes: Uint8Array): string {
  const input = new DetectFormatRequest();
  input.setContent(bytes);
  return detectFormat(testContext, input).getFormat();
}

describe('DetectFormat', () => {
  it('detects a real binary plist by its bplist00 magic', () => {
    expect(detect(b64ToBytes(FIXTURE1_B64))).toBe('binary');
  });

  it('detects a real XML plist', () => {
    expect(detect(new TextEncoder().encode(FIXTURE1_XML))).toBe('xml');
  });

  it('detects XML preceded by a UTF-8 BOM', () => {
    const withBom = new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode(FIXTURE1_XML)]);
    expect(detect(withBom)).toBe('xml');
  });

  it('reports unknown for content that is neither', () => {
    expect(detect(new TextEncoder().encode('not a plist at all'))).toBe('unknown');
  });

  it('reports unknown for empty content', () => {
    expect(detect(new Uint8Array())).toBe('unknown');
  });
});

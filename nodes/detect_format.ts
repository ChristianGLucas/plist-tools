import { DetectFormatRequest, DetectFormatResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';

const BINARY_MAGIC = 'bplist00';

/**
 * Detect whether a raw file's content is an XML plist or a binary plist
 * (bplist), from its leading bytes: the literal 8-byte magic "bplist00"
 * for binary, or a "<?xml" / "<plist" opening tag (after skipping leading
 * whitespace/BOM) for XML. Returns "unknown" when neither matches -- this
 * node never errors, since "unknown" is itself a complete, correct answer
 * for content that is not a plist at all.
 */
export function detectFormat(ax: AxiomContext, input: DetectFormatRequest): DetectFormatResult {
  const result = new DetectFormatResult();
  const bytes = input.getContent_asU8();

  if (bytes.length >= BINARY_MAGIC.length && Buffer.from(bytes.subarray(0, BINARY_MAGIC.length)).toString('latin1') === BINARY_MAGIC) {
    result.setFormat('binary');
    return result;
  }

  // Look for an XML/plist opening tag within a small leading window, past
  // optional BOM/whitespace -- real plist XML always opens with one of
  // these within the first few characters, so no full parse is needed.
  let head = Buffer.from(bytes.subarray(0, Math.min(bytes.length, 256))).toString('utf8');
  if (head.charCodeAt(0) === 0xfeff) head = head.slice(1); // strip UTF-8 BOM if present
  head = head.trimStart();
  if (head.startsWith('<?xml') || head.startsWith('<plist') || head.startsWith('<!DOCTYPE plist')) {
    result.setFormat('xml');
    return result;
  }

  result.setFormat('unknown');
  return result;
}

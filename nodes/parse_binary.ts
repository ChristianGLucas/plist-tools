import { BinaryPlistRequest, ParseResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { isTooLarge, tooLargeError, PtNodeError } from './helpers';
import { parseBinaryPlist } from './bplist_binary';

/**
 * Parse a binary property list (bplist00) document into the canonical
 * PlistValue tree (see PlistValue in messages.proto). `data` is the raw
 * binary plist bytes (JSON-transported as base64). Every integer is
 * decoded with arbitrary-precision arithmetic and carried as an exact
 * decimal string -- unlike every current JS binary-plist parser on npm,
 * which silently corrupts integers outside the signed 32-bit range (see
 * nodes/bplist_binary.ts for the reproduction). Malformed input never
 * throws -- it comes back with `error` set.
 */
export function parseBinary(ax: AxiomContext, input: BinaryPlistRequest): ParseResult {
  const result = new ParseResult();
  const bytes = input.getData_asU8();
  if (isTooLarge(bytes.length)) {
    result.setError(tooLargeError(bytes.length).proto);
    return result;
  }
  try {
    result.setValue(parseBinaryPlist(Buffer.from(bytes)));
  } catch (e) {
    if (e instanceof PtNodeError) {
      result.setError(e.proto);
      return result;
    }
    throw e;
  }
  return result;
}

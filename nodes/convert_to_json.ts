import { ConvertToJsonRequest, ConvertToJsonResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { mkError, PtNodeError } from './helpers';
import { plistToJsonText } from './json_convert';

/**
 * Convert a parsed PlistValue tree to plain JSON text. Mapping notes:
 * DATE becomes an RFC3339 string, DATA becomes a base64 string, INTEGER
 * becomes a JSON number when it fits exactly in a JS double
 * (abs(value) <= 2^53) and a decimal STRING otherwise -- JSON has no
 * arbitrary-precision integer type, so a huge plist integer is kept exact
 * as a string rather than silently rounded.
 */
export function convertToJson(ax: AxiomContext, input: ConvertToJsonRequest): ConvertToJsonResult {
  const result = new ConvertToJsonResult();
  const root = input.getRoot();
  if (!root) {
    result.setError(mkError('MISSING_ROOT', 'root is required'));
    return result;
  }
  try {
    result.setJson(plistToJsonText(root));
  } catch (e) {
    if (e instanceof PtNodeError) {
      result.setError(e.proto);
      return result;
    }
    throw e;
  }
  return result;
}

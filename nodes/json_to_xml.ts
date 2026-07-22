import { JsonToXmlRequest, JsonToXmlResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { byteLength, isTooLarge, tooLargeError, PtNodeError } from './helpers';
import { jsonTextToPlist } from './json_convert';
import { serializeXmlPlist } from './xml_build';

/**
 * Convert JSON text directly to an XML plist document. Type inference:
 * string -> STRING, boolean -> BOOLEAN, null -> NULL_VALUE, a whole-number
 * JSON number -> INTEGER, a fractional JSON number -> REAL, object -> DICT
 * (key order preserved), array -> ARRAY. JSON cannot express plist's DATE
 * or DATA types, so this conversion never produces them, and any integer
 * literal beyond 2^53 in the source JSON has already lost precision inside
 * JSON.parse itself before this function runs (an inherent JSON
 * limitation, not a bug here). Malformed input never throws -- it comes
 * back with `error` set.
 */
export function jsonToXml(ax: AxiomContext, input: JsonToXmlRequest): JsonToXmlResult {
  const result = new JsonToXmlResult();
  const json = input.getJson();
  const len = byteLength(json);
  if (isTooLarge(len)) {
    result.setError(tooLargeError(len).proto);
    return result;
  }
  try {
    const tree = jsonTextToPlist(json);
    result.setXml(serializeXmlPlist(tree));
  } catch (e) {
    if (e instanceof PtNodeError) {
      result.setError(e.proto);
      return result;
    }
    throw e;
  }
  return result;
}

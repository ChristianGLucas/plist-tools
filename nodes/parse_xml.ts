import { XmlPlistRequest, ParseResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { byteLength, isTooLarge, tooLargeError, PtNodeError } from './helpers';
import { parseXmlPlist } from './xml_parse';

/**
 * Parse an XML property list document into the canonical PlistValue tree
 * (see PlistValue in messages.proto). Disables external-entity/DTD
 * resolution by construction (the underlying XML parser has no fetch
 * capability) and rejects the input outright on any XML parse error or
 * warning rather than returning a partial tree. Malformed input never
 * throws -- it comes back with `error` set.
 */
export function parseXml(ax: AxiomContext, input: XmlPlistRequest): ParseResult {
  const result = new ParseResult();
  const xml = input.getXml();
  const len = byteLength(xml);
  if (isTooLarge(len)) {
    result.setError(tooLargeError(len).proto);
    return result;
  }
  try {
    result.setValue(parseXmlPlist(xml));
  } catch (e) {
    if (e instanceof PtNodeError) {
      result.setError(e.proto);
      return result;
    }
    throw e;
  }
  return result;
}

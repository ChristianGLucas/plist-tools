import { SerializeXmlRequest, SerializeXmlResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { mkError, PtNodeError } from './helpers';
import { serializeXmlPlist } from './xml_build';

/**
 * Serialize a PlistValue tree (e.g. one built by ParseXml, ParseBinary, or
 * JsonToXml's own conversion step) back into an Apple XML plist document.
 * Dispatches strictly on each value's declared `type`, so a REAL that
 * happens to hold a whole number still round-trips as <real>, never
 * silently as <integer>. Malformed input never throws -- it comes back
 * with `error` set.
 */
export function serializeXml(ax: AxiomContext, input: SerializeXmlRequest): SerializeXmlResult {
  const result = new SerializeXmlResult();
  const root = input.getRoot();
  if (!root) {
    result.setError(mkError('MISSING_ROOT', 'root is required'));
    return result;
  }
  try {
    result.setXml(serializeXmlPlist(root));
  } catch (e) {
    if (e instanceof PtNodeError) {
      result.setError(e.proto);
      return result;
    }
    throw e;
  }
  return result;
}

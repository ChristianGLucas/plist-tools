import { ValidateRequest, ValidateResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { byteLength, isTooLarge, MAX_INPUT_BYTES, PtNodeError } from './helpers';
import { parseXmlPlist } from './xml_parse';
import { parseBinaryPlist } from './bplist_binary';

/**
 * Validate that a document is a well-formed plist -- either form, whichever
 * `source` supplies -- and report issues. Runs the same parser ParseXml /
 * ParseBinary use and reports whatever it raises as an issue, so "valid"
 * here means "ParseXml/ParseBinary will actually succeed on this input."
 */
export function validatePlist(ax: AxiomContext, input: ValidateRequest): ValidateResult {
  const result = new ValidateResult();

  if (input.getSourceCase() === ValidateRequest.SourceCase.XML) {
    result.setFormat('xml');
    const xml = input.getXml();
    const len = byteLength(xml);
    if (isTooLarge(len)) {
      result.setValid(false);
      result.setIssuesList([`input is ${len} bytes, exceeding the ${MAX_INPUT_BYTES} byte limit`]);
      return result;
    }
    try {
      parseXmlPlist(xml);
      result.setValid(true);
      result.setIssuesList([]);
    } catch (e) {
      if (e instanceof PtNodeError) {
        result.setValid(false);
        result.setIssuesList([e.message]);
      } else {
        throw e;
      }
    }
    return result;
  }

  if (input.getSourceCase() === ValidateRequest.SourceCase.BINARY) {
    result.setFormat('binary');
    const bytes = input.getBinary_asU8();
    if (isTooLarge(bytes.length)) {
      result.setValid(false);
      result.setIssuesList([`input is ${bytes.length} bytes, exceeding the ${MAX_INPUT_BYTES} byte limit`]);
      return result;
    }
    try {
      parseBinaryPlist(Buffer.from(bytes));
      result.setValid(true);
      result.setIssuesList([]);
    } catch (e) {
      if (e instanceof PtNodeError) {
        result.setValid(false);
        result.setIssuesList([e.message]);
      } else {
        throw e;
      }
    }
    return result;
  }

  result.setFormat('unknown');
  result.setValid(false);
  result.setIssuesList(['no source supplied (neither xml nor binary was set)']);
  return result;
}

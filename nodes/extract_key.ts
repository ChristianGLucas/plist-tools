import { PlistValue, ExtractKeyRequest, ExtractKeyResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { mkError } from './helpers';

/**
 * Extract a single key's value from a dict, one level deep -- the key is
 * matched literally (including any "." it contains, unlike GetValueAtPath's
 * dotted paths). `error` is set when `root` is not a DICT; `found` is
 * false (not an error) when the key is simply absent.
 */
export function extractKey(ax: AxiomContext, input: ExtractKeyRequest): ExtractKeyResult {
  const result = new ExtractKeyResult();
  const root = input.getRoot();
  if (!root) {
    result.setError(mkError('MISSING_ROOT', 'root is required'));
    return result;
  }
  if (root.getType() !== PlistValue.PlistType.DICT) {
    result.setError(mkError('NOT_A_DICT', 'root is not a DICT'));
    return result;
  }
  const match = root.getDictValueList().find((e) => e.getKey() === input.getKey());
  if (!match || !match.getValue()) {
    result.setFound(false);
    return result;
  }
  result.setFound(true);
  result.setValue(match.getValue());
  return result;
}

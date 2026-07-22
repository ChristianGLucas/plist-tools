import { PlistValue, ListTopLevelKeysRequest, ListTopLevelKeysResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { mkError } from './helpers';

/**
 * List the top-level keys of a dict PlistValue, in source order.
 * `error` is set when `root` is not a DICT.
 */
export function listTopLevelKeys(ax: AxiomContext, input: ListTopLevelKeysRequest): ListTopLevelKeysResult {
  const result = new ListTopLevelKeysResult();
  const root = input.getRoot();
  if (!root) {
    result.setError(mkError('MISSING_ROOT', 'root is required'));
    return result;
  }
  if (root.getType() !== PlistValue.PlistType.DICT) {
    result.setError(mkError('NOT_A_DICT', 'root is not a DICT'));
    return result;
  }
  result.setKeysList(root.getDictValueList().map((e) => e.getKey()));
  return result;
}

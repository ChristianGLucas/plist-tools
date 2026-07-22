import { KeyPathRequest, KeyPathResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { getAtPath, mkError, PtNodeError } from './helpers';

/**
 * Look up a value at a dot-separated key path through a parsed PlistValue
 * tree, e.g. "CFBundleURLTypes.0.CFBundleURLSchemes.0" -- a dict segment
 * is matched as a literal key, an array segment must be a non-negative
 * decimal index. `found` is false (not an error) when the path is well-
 * formed but nothing is there; `error` is set only for a malformed path
 * (e.g. too many segments) or a missing root.
 */
export function getValueAtPath(ax: AxiomContext, input: KeyPathRequest): KeyPathResult {
  const result = new KeyPathResult();
  const root = input.getRoot();
  if (!root) {
    result.setError(mkError('MISSING_ROOT', 'root is required'));
    return result;
  }
  try {
    const lookup = getAtPath(root, input.getKeyPath());
    result.setFound(lookup.found);
    if (lookup.found && lookup.value) {
      result.setValue(lookup.value);
    }
  } catch (e) {
    if (e instanceof PtNodeError) {
      result.setError(e.proto);
      return result;
    }
    throw e;
  }
  return result;
}

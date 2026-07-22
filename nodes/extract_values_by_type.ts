import { KeyPathValueEntry, ExtractByTypeRequest, ExtractByTypeResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { mkError, PtNodeError, walkTree } from './helpers';

/**
 * Extract every value of a given PlistType anywhere in the tree (e.g.
 * every DATA or DATE leaf, or every nested DICT/ARRAY container), each
 * tagged with the dot-path where it was found. The root itself is
 * included when it matches (with path "").
 */
export function extractValuesByType(ax: AxiomContext, input: ExtractByTypeRequest): ExtractByTypeResult {
  const result = new ExtractByTypeResult();
  const root = input.getRoot();
  if (!root) {
    result.setError(mkError('MISSING_ROOT', 'root is required'));
    return result;
  }
  const targetType = input.getType();
  try {
    const entries: KeyPathValueEntry[] = [];
    walkTree(root, (path, value) => {
      if (value.getType() === targetType) {
        const entry = new KeyPathValueEntry();
        entry.setPath(path);
        entry.setValue(value);
        entries.push(entry);
      }
    });
    result.setEntriesList(entries);
  } catch (e) {
    if (e instanceof PtNodeError) {
      result.setError(e.proto);
      return result;
    }
    throw e;
  }
  return result;
}

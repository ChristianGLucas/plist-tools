import { KeyPathEntry, ListAllKeysRequest, ListAllKeysResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { mkError, PtNodeError, walkTree } from './helpers';

/**
 * Recursively flatten every key path in the document -- both container
 * nodes (dicts/arrays) and leaves -- depth-first in source order, each
 * tagged with its PlistType. The root itself is not listed (it has no
 * path); use GetValueType on `root` directly if its own type is needed.
 * Bounded to 200 levels of nesting; deeper input returns a structured
 * error rather than exhausting the stack.
 */
export function listAllKeysRecursive(ax: AxiomContext, input: ListAllKeysRequest): ListAllKeysResult {
  const result = new ListAllKeysResult();
  const root = input.getRoot();
  if (!root) {
    result.setError(mkError('MISSING_ROOT', 'root is required'));
    return result;
  }
  try {
    const entries: KeyPathEntry[] = [];
    walkTree(root, (path, value) => {
      if (path === '') return;
      const entry = new KeyPathEntry();
      entry.setPath(path);
      entry.setType(value.getType());
      entries.push(entry);
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

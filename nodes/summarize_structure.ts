import { PlistValue, SummarizeRequest, SummarizeResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { mkError, PtNodeError, typeName, walkTree } from './helpers';

const T = PlistValue.PlistType;

/**
 * Count keys and summarize a PlistValue tree's structure: total dict-entry
 * count across every nested dict, maximum nesting depth (a bare scalar
 * root is depth 1), dict/array node counts, and a full breakdown of every
 * value (including containers themselves) by PlistType.
 */
export function summarizeStructure(ax: AxiomContext, input: SummarizeRequest): SummarizeResult {
  const result = new SummarizeResult();
  const root = input.getRoot();
  if (!root) {
    result.setError(mkError('MISSING_ROOT', 'root is required'));
    return result;
  }
  try {
    let totalKeys = 0;
    let maxDepthSeen = 0;
    let dictCount = 0;
    let arrayCount = 0;
    const typeCounts = new Map<string, number>();

    walkTree(root, (path, value, depth) => {
      maxDepthSeen = Math.max(maxDepthSeen, depth);
      const tn = typeName(value.getType());
      typeCounts.set(tn, (typeCounts.get(tn) ?? 0) + 1);
      if (value.getType() === T.DICT) {
        dictCount++;
        totalKeys += value.getDictValueList().length;
      } else if (value.getType() === T.ARRAY) {
        arrayCount++;
      }
    });

    result.setTotalKeys(totalKeys);
    result.setMaxDepth(maxDepthSeen + 1);
    result.setDictCount(dictCount);
    result.setArrayCount(arrayCount);
    const map = result.getTypeCountsMap();
    for (const [name, count] of typeCounts.entries()) {
      map.set(name, count);
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

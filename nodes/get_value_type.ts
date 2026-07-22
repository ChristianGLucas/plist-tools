import { GetValueTypeRequest, GetValueTypeResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { typeName } from './helpers';

/**
 * Get the PlistType of a value (e.g. one already extracted via
 * GetValueAtPath or ExtractKey) -- STRING, INTEGER, REAL, BOOLEAN, DATE,
 * DATA, DICT, ARRAY, or NULL_VALUE, matching plist's own typed value
 * model. Never errors: an unset `value` field comes back as UNKNOWN.
 */
export function getValueType(ax: AxiomContext, input: GetValueTypeRequest): GetValueTypeResult {
  const result = new GetValueTypeResult();
  const value = input.getValue();
  const type = value ? value.getType() : 0;
  result.setType(type);
  result.setTypeName(typeName(type));
  return result;
}

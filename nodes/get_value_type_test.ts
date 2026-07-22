import { GetValueTypeRequest, PlistValue } from '../gen/messages_pb';
import { getValueType } from './get_value_type';
import { testContext } from './testctx';

const T = PlistValue.PlistType;
type PlistType = PlistValue.PlistTypeMap[keyof PlistValue.PlistTypeMap];

function typeOf(t: PlistType): { type: number; typeName: string } {
  const value = new PlistValue();
  value.setType(t);
  const input = new GetValueTypeRequest();
  input.setValue(value);
  const result = getValueType(testContext, input);
  return { type: result.getType(), typeName: result.getTypeName() };
}

describe('GetValueType', () => {
  it('reports STRING correctly', () => {
    expect(typeOf(T.STRING)).toEqual({ type: T.STRING, typeName: 'STRING' });
  });

  it('reports INTEGER correctly', () => {
    expect(typeOf(T.INTEGER)).toEqual({ type: T.INTEGER, typeName: 'INTEGER' });
  });

  it('reports DICT correctly', () => {
    expect(typeOf(T.DICT)).toEqual({ type: T.DICT, typeName: 'DICT' });
  });

  it('reports ARRAY correctly', () => {
    expect(typeOf(T.ARRAY)).toEqual({ type: T.ARRAY, typeName: 'ARRAY' });
  });

  it('reports UNKNOWN when value is unset', () => {
    const input = new GetValueTypeRequest();
    const result = getValueType(testContext, input);
    expect(result.getType()).toBe(T.UNKNOWN);
    expect(result.getTypeName()).toBe('UNKNOWN');
  });
});

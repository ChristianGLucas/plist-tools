// package: christiangeorgelucas.plist_tools
// file: messages.proto

import * as jspb from "google-protobuf";

export class Error extends jspb.Message {
  getCode(): string;
  setCode(value: string): void;

  getMessage(): string;
  setMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Error.AsObject;
  static toObject(includeInstance: boolean, msg: Error): Error.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Error, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Error;
  static deserializeBinaryFromReader(message: Error, reader: jspb.BinaryReader): Error;
}

export namespace Error {
  export type AsObject = {
    code: string,
    message: string,
  }
}

export class PlistValue extends jspb.Message {
  getType(): PlistValue.PlistTypeMap[keyof PlistValue.PlistTypeMap];
  setType(value: PlistValue.PlistTypeMap[keyof PlistValue.PlistTypeMap]): void;

  getStringValue(): string;
  setStringValue(value: string): void;

  getIntegerValue(): string;
  setIntegerValue(value: string): void;

  getRealValue(): number;
  setRealValue(value: number): void;

  getBoolValue(): boolean;
  setBoolValue(value: boolean): void;

  getDateValue(): string;
  setDateValue(value: string): void;

  getDataValue(): Uint8Array | string;
  getDataValue_asU8(): Uint8Array;
  getDataValue_asB64(): string;
  setDataValue(value: Uint8Array | string): void;

  clearDictValueList(): void;
  getDictValueList(): Array<PlistEntry>;
  setDictValueList(value: Array<PlistEntry>): void;
  addDictValue(value?: PlistEntry, index?: number): PlistEntry;

  clearArrayValueList(): void;
  getArrayValueList(): Array<PlistValue>;
  setArrayValueList(value: Array<PlistValue>): void;
  addArrayValue(value?: PlistValue, index?: number): PlistValue;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlistValue.AsObject;
  static toObject(includeInstance: boolean, msg: PlistValue): PlistValue.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PlistValue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlistValue;
  static deserializeBinaryFromReader(message: PlistValue, reader: jspb.BinaryReader): PlistValue;
}

export namespace PlistValue {
  export type AsObject = {
    type: PlistValue.PlistTypeMap[keyof PlistValue.PlistTypeMap],
    stringValue: string,
    integerValue: string,
    realValue: number,
    boolValue: boolean,
    dateValue: string,
    dataValue: Uint8Array | string,
    dictValueList: Array<PlistEntry.AsObject>,
    arrayValueList: Array<PlistValue.AsObject>,
  }

  export interface PlistTypeMap {
    UNKNOWN: 0;
    STRING: 1;
    INTEGER: 2;
    REAL: 3;
    BOOLEAN: 4;
    DATE: 5;
    DATA: 6;
    DICT: 7;
    ARRAY: 8;
    NULL_VALUE: 9;
  }

  export const PlistType: PlistTypeMap;
}

export class PlistEntry extends jspb.Message {
  getKey(): string;
  setKey(value: string): void;

  hasValue(): boolean;
  clearValue(): void;
  getValue(): PlistValue | undefined;
  setValue(value?: PlistValue): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlistEntry.AsObject;
  static toObject(includeInstance: boolean, msg: PlistEntry): PlistEntry.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PlistEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlistEntry;
  static deserializeBinaryFromReader(message: PlistEntry, reader: jspb.BinaryReader): PlistEntry;
}

export namespace PlistEntry {
  export type AsObject = {
    key: string,
    value?: PlistValue.AsObject,
  }
}

export class XmlPlistRequest extends jspb.Message {
  getXml(): string;
  setXml(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): XmlPlistRequest.AsObject;
  static toObject(includeInstance: boolean, msg: XmlPlistRequest): XmlPlistRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: XmlPlistRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): XmlPlistRequest;
  static deserializeBinaryFromReader(message: XmlPlistRequest, reader: jspb.BinaryReader): XmlPlistRequest;
}

export namespace XmlPlistRequest {
  export type AsObject = {
    xml: string,
  }
}

export class BinaryPlistRequest extends jspb.Message {
  getData(): Uint8Array | string;
  getData_asU8(): Uint8Array;
  getData_asB64(): string;
  setData(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BinaryPlistRequest.AsObject;
  static toObject(includeInstance: boolean, msg: BinaryPlistRequest): BinaryPlistRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BinaryPlistRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BinaryPlistRequest;
  static deserializeBinaryFromReader(message: BinaryPlistRequest, reader: jspb.BinaryReader): BinaryPlistRequest;
}

export namespace BinaryPlistRequest {
  export type AsObject = {
    data: Uint8Array | string,
  }
}

export class ParseResult extends jspb.Message {
  hasValue(): boolean;
  clearValue(): void;
  getValue(): PlistValue | undefined;
  setValue(value?: PlistValue): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ParseResult.AsObject;
  static toObject(includeInstance: boolean, msg: ParseResult): ParseResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ParseResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ParseResult;
  static deserializeBinaryFromReader(message: ParseResult, reader: jspb.BinaryReader): ParseResult;
}

export namespace ParseResult {
  export type AsObject = {
    value?: PlistValue.AsObject,
    error?: Error.AsObject,
  }
}

export class DetectFormatRequest extends jspb.Message {
  getContent(): Uint8Array | string;
  getContent_asU8(): Uint8Array;
  getContent_asB64(): string;
  setContent(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DetectFormatRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DetectFormatRequest): DetectFormatRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DetectFormatRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DetectFormatRequest;
  static deserializeBinaryFromReader(message: DetectFormatRequest, reader: jspb.BinaryReader): DetectFormatRequest;
}

export namespace DetectFormatRequest {
  export type AsObject = {
    content: Uint8Array | string,
  }
}

export class DetectFormatResult extends jspb.Message {
  getFormat(): string;
  setFormat(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DetectFormatResult.AsObject;
  static toObject(includeInstance: boolean, msg: DetectFormatResult): DetectFormatResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DetectFormatResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DetectFormatResult;
  static deserializeBinaryFromReader(message: DetectFormatResult, reader: jspb.BinaryReader): DetectFormatResult;
}

export namespace DetectFormatResult {
  export type AsObject = {
    format: string,
  }
}

export class SerializeXmlRequest extends jspb.Message {
  hasRoot(): boolean;
  clearRoot(): void;
  getRoot(): PlistValue | undefined;
  setRoot(value?: PlistValue): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SerializeXmlRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SerializeXmlRequest): SerializeXmlRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SerializeXmlRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SerializeXmlRequest;
  static deserializeBinaryFromReader(message: SerializeXmlRequest, reader: jspb.BinaryReader): SerializeXmlRequest;
}

export namespace SerializeXmlRequest {
  export type AsObject = {
    root?: PlistValue.AsObject,
  }
}

export class SerializeXmlResult extends jspb.Message {
  getXml(): string;
  setXml(value: string): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SerializeXmlResult.AsObject;
  static toObject(includeInstance: boolean, msg: SerializeXmlResult): SerializeXmlResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SerializeXmlResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SerializeXmlResult;
  static deserializeBinaryFromReader(message: SerializeXmlResult, reader: jspb.BinaryReader): SerializeXmlResult;
}

export namespace SerializeXmlResult {
  export type AsObject = {
    xml: string,
    error?: Error.AsObject,
  }
}

export class KeyPathRequest extends jspb.Message {
  hasRoot(): boolean;
  clearRoot(): void;
  getRoot(): PlistValue | undefined;
  setRoot(value?: PlistValue): void;

  getKeyPath(): string;
  setKeyPath(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KeyPathRequest.AsObject;
  static toObject(includeInstance: boolean, msg: KeyPathRequest): KeyPathRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: KeyPathRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KeyPathRequest;
  static deserializeBinaryFromReader(message: KeyPathRequest, reader: jspb.BinaryReader): KeyPathRequest;
}

export namespace KeyPathRequest {
  export type AsObject = {
    root?: PlistValue.AsObject,
    keyPath: string,
  }
}

export class KeyPathResult extends jspb.Message {
  hasValue(): boolean;
  clearValue(): void;
  getValue(): PlistValue | undefined;
  setValue(value?: PlistValue): void;

  getFound(): boolean;
  setFound(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KeyPathResult.AsObject;
  static toObject(includeInstance: boolean, msg: KeyPathResult): KeyPathResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: KeyPathResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KeyPathResult;
  static deserializeBinaryFromReader(message: KeyPathResult, reader: jspb.BinaryReader): KeyPathResult;
}

export namespace KeyPathResult {
  export type AsObject = {
    value?: PlistValue.AsObject,
    found: boolean,
    error?: Error.AsObject,
  }
}

export class ExtractKeyRequest extends jspb.Message {
  hasRoot(): boolean;
  clearRoot(): void;
  getRoot(): PlistValue | undefined;
  setRoot(value?: PlistValue): void;

  getKey(): string;
  setKey(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtractKeyRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ExtractKeyRequest): ExtractKeyRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtractKeyRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtractKeyRequest;
  static deserializeBinaryFromReader(message: ExtractKeyRequest, reader: jspb.BinaryReader): ExtractKeyRequest;
}

export namespace ExtractKeyRequest {
  export type AsObject = {
    root?: PlistValue.AsObject,
    key: string,
  }
}

export class ExtractKeyResult extends jspb.Message {
  hasValue(): boolean;
  clearValue(): void;
  getValue(): PlistValue | undefined;
  setValue(value?: PlistValue): void;

  getFound(): boolean;
  setFound(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtractKeyResult.AsObject;
  static toObject(includeInstance: boolean, msg: ExtractKeyResult): ExtractKeyResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtractKeyResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtractKeyResult;
  static deserializeBinaryFromReader(message: ExtractKeyResult, reader: jspb.BinaryReader): ExtractKeyResult;
}

export namespace ExtractKeyResult {
  export type AsObject = {
    value?: PlistValue.AsObject,
    found: boolean,
    error?: Error.AsObject,
  }
}

export class ListTopLevelKeysRequest extends jspb.Message {
  hasRoot(): boolean;
  clearRoot(): void;
  getRoot(): PlistValue | undefined;
  setRoot(value?: PlistValue): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListTopLevelKeysRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListTopLevelKeysRequest): ListTopLevelKeysRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListTopLevelKeysRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListTopLevelKeysRequest;
  static deserializeBinaryFromReader(message: ListTopLevelKeysRequest, reader: jspb.BinaryReader): ListTopLevelKeysRequest;
}

export namespace ListTopLevelKeysRequest {
  export type AsObject = {
    root?: PlistValue.AsObject,
  }
}

export class ListTopLevelKeysResult extends jspb.Message {
  clearKeysList(): void;
  getKeysList(): Array<string>;
  setKeysList(value: Array<string>): void;
  addKeys(value: string, index?: number): string;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListTopLevelKeysResult.AsObject;
  static toObject(includeInstance: boolean, msg: ListTopLevelKeysResult): ListTopLevelKeysResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListTopLevelKeysResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListTopLevelKeysResult;
  static deserializeBinaryFromReader(message: ListTopLevelKeysResult, reader: jspb.BinaryReader): ListTopLevelKeysResult;
}

export namespace ListTopLevelKeysResult {
  export type AsObject = {
    keysList: Array<string>,
    error?: Error.AsObject,
  }
}

export class GetValueTypeRequest extends jspb.Message {
  hasValue(): boolean;
  clearValue(): void;
  getValue(): PlistValue | undefined;
  setValue(value?: PlistValue): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetValueTypeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetValueTypeRequest): GetValueTypeRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetValueTypeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetValueTypeRequest;
  static deserializeBinaryFromReader(message: GetValueTypeRequest, reader: jspb.BinaryReader): GetValueTypeRequest;
}

export namespace GetValueTypeRequest {
  export type AsObject = {
    value?: PlistValue.AsObject,
  }
}

export class GetValueTypeResult extends jspb.Message {
  getType(): PlistValue.PlistTypeMap[keyof PlistValue.PlistTypeMap];
  setType(value: PlistValue.PlistTypeMap[keyof PlistValue.PlistTypeMap]): void;

  getTypeName(): string;
  setTypeName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetValueTypeResult.AsObject;
  static toObject(includeInstance: boolean, msg: GetValueTypeResult): GetValueTypeResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetValueTypeResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetValueTypeResult;
  static deserializeBinaryFromReader(message: GetValueTypeResult, reader: jspb.BinaryReader): GetValueTypeResult;
}

export namespace GetValueTypeResult {
  export type AsObject = {
    type: PlistValue.PlistTypeMap[keyof PlistValue.PlistTypeMap],
    typeName: string,
  }
}

export class KeyPathEntry extends jspb.Message {
  getPath(): string;
  setPath(value: string): void;

  getType(): PlistValue.PlistTypeMap[keyof PlistValue.PlistTypeMap];
  setType(value: PlistValue.PlistTypeMap[keyof PlistValue.PlistTypeMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KeyPathEntry.AsObject;
  static toObject(includeInstance: boolean, msg: KeyPathEntry): KeyPathEntry.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: KeyPathEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KeyPathEntry;
  static deserializeBinaryFromReader(message: KeyPathEntry, reader: jspb.BinaryReader): KeyPathEntry;
}

export namespace KeyPathEntry {
  export type AsObject = {
    path: string,
    type: PlistValue.PlistTypeMap[keyof PlistValue.PlistTypeMap],
  }
}

export class ListAllKeysRequest extends jspb.Message {
  hasRoot(): boolean;
  clearRoot(): void;
  getRoot(): PlistValue | undefined;
  setRoot(value?: PlistValue): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListAllKeysRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListAllKeysRequest): ListAllKeysRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListAllKeysRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListAllKeysRequest;
  static deserializeBinaryFromReader(message: ListAllKeysRequest, reader: jspb.BinaryReader): ListAllKeysRequest;
}

export namespace ListAllKeysRequest {
  export type AsObject = {
    root?: PlistValue.AsObject,
  }
}

export class ListAllKeysResult extends jspb.Message {
  clearEntriesList(): void;
  getEntriesList(): Array<KeyPathEntry>;
  setEntriesList(value: Array<KeyPathEntry>): void;
  addEntries(value?: KeyPathEntry, index?: number): KeyPathEntry;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListAllKeysResult.AsObject;
  static toObject(includeInstance: boolean, msg: ListAllKeysResult): ListAllKeysResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListAllKeysResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListAllKeysResult;
  static deserializeBinaryFromReader(message: ListAllKeysResult, reader: jspb.BinaryReader): ListAllKeysResult;
}

export namespace ListAllKeysResult {
  export type AsObject = {
    entriesList: Array<KeyPathEntry.AsObject>,
    error?: Error.AsObject,
  }
}

export class KeyPathValueEntry extends jspb.Message {
  getPath(): string;
  setPath(value: string): void;

  hasValue(): boolean;
  clearValue(): void;
  getValue(): PlistValue | undefined;
  setValue(value?: PlistValue): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KeyPathValueEntry.AsObject;
  static toObject(includeInstance: boolean, msg: KeyPathValueEntry): KeyPathValueEntry.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: KeyPathValueEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KeyPathValueEntry;
  static deserializeBinaryFromReader(message: KeyPathValueEntry, reader: jspb.BinaryReader): KeyPathValueEntry;
}

export namespace KeyPathValueEntry {
  export type AsObject = {
    path: string,
    value?: PlistValue.AsObject,
  }
}

export class ExtractByTypeRequest extends jspb.Message {
  hasRoot(): boolean;
  clearRoot(): void;
  getRoot(): PlistValue | undefined;
  setRoot(value?: PlistValue): void;

  getType(): PlistValue.PlistTypeMap[keyof PlistValue.PlistTypeMap];
  setType(value: PlistValue.PlistTypeMap[keyof PlistValue.PlistTypeMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtractByTypeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ExtractByTypeRequest): ExtractByTypeRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtractByTypeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtractByTypeRequest;
  static deserializeBinaryFromReader(message: ExtractByTypeRequest, reader: jspb.BinaryReader): ExtractByTypeRequest;
}

export namespace ExtractByTypeRequest {
  export type AsObject = {
    root?: PlistValue.AsObject,
    type: PlistValue.PlistTypeMap[keyof PlistValue.PlistTypeMap],
  }
}

export class ExtractByTypeResult extends jspb.Message {
  clearEntriesList(): void;
  getEntriesList(): Array<KeyPathValueEntry>;
  setEntriesList(value: Array<KeyPathValueEntry>): void;
  addEntries(value?: KeyPathValueEntry, index?: number): KeyPathValueEntry;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtractByTypeResult.AsObject;
  static toObject(includeInstance: boolean, msg: ExtractByTypeResult): ExtractByTypeResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtractByTypeResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtractByTypeResult;
  static deserializeBinaryFromReader(message: ExtractByTypeResult, reader: jspb.BinaryReader): ExtractByTypeResult;
}

export namespace ExtractByTypeResult {
  export type AsObject = {
    entriesList: Array<KeyPathValueEntry.AsObject>,
    error?: Error.AsObject,
  }
}

export class ConvertToJsonRequest extends jspb.Message {
  hasRoot(): boolean;
  clearRoot(): void;
  getRoot(): PlistValue | undefined;
  setRoot(value?: PlistValue): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConvertToJsonRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ConvertToJsonRequest): ConvertToJsonRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ConvertToJsonRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConvertToJsonRequest;
  static deserializeBinaryFromReader(message: ConvertToJsonRequest, reader: jspb.BinaryReader): ConvertToJsonRequest;
}

export namespace ConvertToJsonRequest {
  export type AsObject = {
    root?: PlistValue.AsObject,
  }
}

export class ConvertToJsonResult extends jspb.Message {
  getJson(): string;
  setJson(value: string): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConvertToJsonResult.AsObject;
  static toObject(includeInstance: boolean, msg: ConvertToJsonResult): ConvertToJsonResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ConvertToJsonResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConvertToJsonResult;
  static deserializeBinaryFromReader(message: ConvertToJsonResult, reader: jspb.BinaryReader): ConvertToJsonResult;
}

export namespace ConvertToJsonResult {
  export type AsObject = {
    json: string,
    error?: Error.AsObject,
  }
}

export class JsonToXmlRequest extends jspb.Message {
  getJson(): string;
  setJson(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JsonToXmlRequest.AsObject;
  static toObject(includeInstance: boolean, msg: JsonToXmlRequest): JsonToXmlRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JsonToXmlRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JsonToXmlRequest;
  static deserializeBinaryFromReader(message: JsonToXmlRequest, reader: jspb.BinaryReader): JsonToXmlRequest;
}

export namespace JsonToXmlRequest {
  export type AsObject = {
    json: string,
  }
}

export class JsonToXmlResult extends jspb.Message {
  getXml(): string;
  setXml(value: string): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JsonToXmlResult.AsObject;
  static toObject(includeInstance: boolean, msg: JsonToXmlResult): JsonToXmlResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JsonToXmlResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JsonToXmlResult;
  static deserializeBinaryFromReader(message: JsonToXmlResult, reader: jspb.BinaryReader): JsonToXmlResult;
}

export namespace JsonToXmlResult {
  export type AsObject = {
    xml: string,
    error?: Error.AsObject,
  }
}

export class UsageDescription extends jspb.Message {
  getKey(): string;
  setKey(value: string): void;

  getDescription(): string;
  setDescription(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UsageDescription.AsObject;
  static toObject(includeInstance: boolean, msg: UsageDescription): UsageDescription.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UsageDescription, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UsageDescription;
  static deserializeBinaryFromReader(message: UsageDescription, reader: jspb.BinaryReader): UsageDescription;
}

export namespace UsageDescription {
  export type AsObject = {
    key: string,
    description: string,
  }
}

export class InfoPlistSummaryRequest extends jspb.Message {
  hasRoot(): boolean;
  clearRoot(): void;
  getRoot(): PlistValue | undefined;
  setRoot(value?: PlistValue): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InfoPlistSummaryRequest.AsObject;
  static toObject(includeInstance: boolean, msg: InfoPlistSummaryRequest): InfoPlistSummaryRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InfoPlistSummaryRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InfoPlistSummaryRequest;
  static deserializeBinaryFromReader(message: InfoPlistSummaryRequest, reader: jspb.BinaryReader): InfoPlistSummaryRequest;
}

export namespace InfoPlistSummaryRequest {
  export type AsObject = {
    root?: PlistValue.AsObject,
  }
}

export class InfoPlistSummaryResult extends jspb.Message {
  getBundleIdentifier(): string;
  setBundleIdentifier(value: string): void;

  getBundleVersion(): string;
  setBundleVersion(value: string): void;

  getBundleShortVersionString(): string;
  setBundleShortVersionString(value: string): void;

  getBundleName(): string;
  setBundleName(value: string): void;

  getBundleDisplayName(): string;
  setBundleDisplayName(value: string): void;

  clearUrlSchemesList(): void;
  getUrlSchemesList(): Array<string>;
  setUrlSchemesList(value: Array<string>): void;
  addUrlSchemes(value: string, index?: number): string;

  clearUsageDescriptionsList(): void;
  getUsageDescriptionsList(): Array<UsageDescription>;
  setUsageDescriptionsList(value: Array<UsageDescription>): void;
  addUsageDescriptions(value?: UsageDescription, index?: number): UsageDescription;

  getRecognizedFieldsFound(): boolean;
  setRecognizedFieldsFound(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InfoPlistSummaryResult.AsObject;
  static toObject(includeInstance: boolean, msg: InfoPlistSummaryResult): InfoPlistSummaryResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InfoPlistSummaryResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InfoPlistSummaryResult;
  static deserializeBinaryFromReader(message: InfoPlistSummaryResult, reader: jspb.BinaryReader): InfoPlistSummaryResult;
}

export namespace InfoPlistSummaryResult {
  export type AsObject = {
    bundleIdentifier: string,
    bundleVersion: string,
    bundleShortVersionString: string,
    bundleName: string,
    bundleDisplayName: string,
    urlSchemesList: Array<string>,
    usageDescriptionsList: Array<UsageDescription.AsObject>,
    recognizedFieldsFound: boolean,
    error?: Error.AsObject,
  }
}

export class ValidateRequest extends jspb.Message {
  hasXml(): boolean;
  clearXml(): void;
  getXml(): string;
  setXml(value: string): void;

  hasBinary(): boolean;
  clearBinary(): void;
  getBinary(): Uint8Array | string;
  getBinary_asU8(): Uint8Array;
  getBinary_asB64(): string;
  setBinary(value: Uint8Array | string): void;

  getSourceCase(): ValidateRequest.SourceCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValidateRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ValidateRequest): ValidateRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ValidateRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValidateRequest;
  static deserializeBinaryFromReader(message: ValidateRequest, reader: jspb.BinaryReader): ValidateRequest;
}

export namespace ValidateRequest {
  export type AsObject = {
    xml: string,
    binary: Uint8Array | string,
  }

  export enum SourceCase {
    SOURCE_NOT_SET = 0,
    XML = 1,
    BINARY = 2,
  }
}

export class ValidateResult extends jspb.Message {
  getValid(): boolean;
  setValid(value: boolean): void;

  getFormat(): string;
  setFormat(value: string): void;

  clearIssuesList(): void;
  getIssuesList(): Array<string>;
  setIssuesList(value: Array<string>): void;
  addIssues(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValidateResult.AsObject;
  static toObject(includeInstance: boolean, msg: ValidateResult): ValidateResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ValidateResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValidateResult;
  static deserializeBinaryFromReader(message: ValidateResult, reader: jspb.BinaryReader): ValidateResult;
}

export namespace ValidateResult {
  export type AsObject = {
    valid: boolean,
    format: string,
    issuesList: Array<string>,
  }
}

export class SummarizeRequest extends jspb.Message {
  hasRoot(): boolean;
  clearRoot(): void;
  getRoot(): PlistValue | undefined;
  setRoot(value?: PlistValue): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SummarizeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SummarizeRequest): SummarizeRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SummarizeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SummarizeRequest;
  static deserializeBinaryFromReader(message: SummarizeRequest, reader: jspb.BinaryReader): SummarizeRequest;
}

export namespace SummarizeRequest {
  export type AsObject = {
    root?: PlistValue.AsObject,
  }
}

export class SummarizeResult extends jspb.Message {
  getTotalKeys(): number;
  setTotalKeys(value: number): void;

  getMaxDepth(): number;
  setMaxDepth(value: number): void;

  getDictCount(): number;
  setDictCount(value: number): void;

  getArrayCount(): number;
  setArrayCount(value: number): void;

  getTypeCountsMap(): jspb.Map<string, number>;
  clearTypeCountsMap(): void;
  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SummarizeResult.AsObject;
  static toObject(includeInstance: boolean, msg: SummarizeResult): SummarizeResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SummarizeResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SummarizeResult;
  static deserializeBinaryFromReader(message: SummarizeResult, reader: jspb.BinaryReader): SummarizeResult;
}

export namespace SummarizeResult {
  export type AsObject = {
    totalKeys: number,
    maxDepth: number,
    dictCount: number,
    arrayCount: number,
    typeCountsMap: Array<[string, number]>,
    error?: Error.AsObject,
  }
}


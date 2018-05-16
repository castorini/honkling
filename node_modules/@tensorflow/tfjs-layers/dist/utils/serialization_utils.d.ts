import { ConfigDictValue, JsonValue } from '../types';
export declare function convertPythonicToTs(pythonicConfig: JsonValue, key?: string): ConfigDictValue;
export declare function convertTsToPythonic(tsConfig: ConfigDictValue, key?: string): JsonValue;

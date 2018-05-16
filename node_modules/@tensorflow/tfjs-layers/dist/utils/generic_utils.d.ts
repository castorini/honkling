import { Tensor } from '@tensorflow/tfjs-core';
import { ConfigDict, ConfigDictValue, DType, Serializable, Shape } from '../types';
export declare function pyListRepeat(value: any, numValues: number): any[];
export declare function pyGetAttr<T>(obj: any, attrName: string, defaultValue?: T): T;
export declare function pyNormalizeArrayIndex<T>(x: T[], index: number): number;
export declare function assert(val: boolean, message?: string): void;
export declare function count<T>(array: T[], refernce: T): number;
export declare type Constructor<T> = new (...args: any[]) => T;
export declare class ClassNameMap {
    private static instance;
    pythonClassNameMap: {
        [className: string]: any;
    };
    private constructor();
    static getMap(): ClassNameMap;
    static register<T>(className: string, cls: Constructor<T>): void;
}
export declare class SerializableEnumRegistry {
    private static instance;
    enumRegistry: {
        [fieldName: string]: any;
    };
    private constructor();
    static getMap(): SerializableEnumRegistry;
    static register(fieldName: string, enumCls: any): void;
    static contains(fieldName: string): boolean;
    static lookup(fieldName: string, value: string): any;
    static reverseLookup(fieldName: string, value: any): string;
}
export declare function singletonOrArray<T>(xs: T[]): T | T[];
export declare function toList(x: any): any[];
export declare function objectListUid(objs: any | any[]): string;
export declare function isArrayOfShapes(x: Shape | Shape[]): boolean;
export declare function normalizeShapeList(x: Shape | Shape[]): Shape[];
export declare function toSnakeCase(name: string): string;
export declare function toCamelCase(identifier: string): string;
export declare function serializeKerasObject(instance: Serializable): ConfigDictValue;
export declare function deserializeKerasObject(identifier: string | ConfigDict, moduleObjects?: {
    [objName: string]: any;
}, customObjects?: {
    [objName: string]: any;
}, printableModuleName?: string): any;
export declare function getExactlyOneTensor(xs: Tensor | Tensor[]): Tensor;
export declare function getExactlyOneShape(shapes: Shape | Shape[]): Shape;
export declare function numberCompare(a: number, b: number): 0 | 1 | -1;
export declare function reverseNumberCompare(a: number, b: number): number;
export declare function stringToDType(dtype: string): DType;
export declare function stringsEqual(xs: string[], ys: string[]): boolean;
export declare function unique<T>(xs: T[]): T[];
export declare function isObjectEmpty(obj: {}): boolean;

import * as tfc from '@tensorflow/tfjs-core';
import { Scalar, Tensor } from '@tensorflow/tfjs-core';
import { Constraint } from './constraints';
import { Layer } from './engine/topology';
export declare enum DType {
    float32 = "float32",
    int32 = "int32",
    bool = "bool",
}
export declare type Shape = number[];
export interface TensorInterface {
    readonly dtype: DType;
    readonly shape: Shape;
}
export declare class SymbolicTensor implements TensorInterface {
    readonly dtype: DType;
    readonly shape: Shape;
    sourceLayer: Layer;
    readonly inputs: SymbolicTensor[];
    readonly callArgs: any;
    readonly outputTensorIndex: number;
    readonly id: number;
    readonly name?: string;
    readonly originalName?: string;
    nodeIndex: number;
    tensorIndex: number;
    constructor(dtype: DType, shape: Shape, sourceLayer: Layer, inputs: SymbolicTensor[], callArgs: any, name?: string, outputTensorIndex?: number);
}
export declare class ConcreteTensor implements TensorInterface {
    readonly dtype: DType;
    readonly shape: Shape;
    readonly id: number;
    readonly name?: string;
    readonly originalName?: string;
    protected val: Tensor;
    constructor(val: Tensor, name?: string);
    value(): Tensor;
}
export declare class LayerVariable {
    readonly dtype: DType;
    readonly shape: Shape;
    readonly id: number;
    readonly name: string;
    readonly originalName: string;
    readonly trainable: boolean;
    protected readonly val: tfc.Variable;
    readonly constraint: Constraint;
    constructor(val: Tensor | ConcreteTensor, dtype?: DType, name?: string, trainable?: boolean, constraint?: Constraint);
    read(): Tensor;
    write(newVal: Tensor | ConcreteTensor): this;
}
export declare type LossOrMetricFn = (yTrue: Tensor, yPred: Tensor) => Tensor;
export declare type RegularizerFn = () => Scalar;
export declare type RnnStepFunction = (inputs: Tensor, states: Tensor[]) => [Tensor, Tensor[]];
export declare type JsonValue = boolean | number | string | null | JsonArray | JsonDict;
export interface JsonDict {
    [key: string]: JsonValue;
}
export interface JsonArray extends Array<JsonValue> {
}
export declare type ConfigDictValue = boolean | number | string | null | ConfigDictArray | ConfigDict;
export interface ConfigDict {
    [key: string]: ConfigDictValue;
}
export interface ConfigDictArray extends Array<ConfigDictValue> {
}
export declare type NamedTensorMap = {
    [name: string]: Tensor;
};
export declare abstract class Serializable {
    abstract getClassName(): string;
    abstract getConfig(): ConfigDict;
}

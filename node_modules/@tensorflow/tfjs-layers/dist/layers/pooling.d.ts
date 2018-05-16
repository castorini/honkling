import { Tensor } from '@tensorflow/tfjs-core';
import { DataFormat, PaddingMode } from '../common';
import { Layer, LayerConfig } from '../engine/topology';
import { ConfigDict, Shape } from '../types';
export interface Pooling1DLayerConfig extends LayerConfig {
    poolSize?: number;
    strides?: number;
    padding?: PaddingMode;
}
export declare abstract class Pooling1D extends Layer {
    protected readonly poolSize: [number];
    protected readonly strides: [number];
    protected readonly padding: PaddingMode;
    constructor(config: Pooling1DLayerConfig);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    protected abstract poolingFunction(inputs: Tensor, poolSize: [number, number], strides: [number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    getConfig(): ConfigDict;
}
export declare class MaxPooling1D extends Pooling1D {
    constructor(config: Pooling1DLayerConfig);
    getClassName(): string;
    protected poolingFunction(inputs: Tensor, poolSize: [number, number], strides: [number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
}
export declare class AveragePooling1D extends Pooling1D {
    constructor(config: Pooling1DLayerConfig);
    getClassName(): string;
    protected poolingFunction(inputs: Tensor, poolSize: [number, number], strides: [number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
}
export interface Pooling2DLayerConfig extends LayerConfig {
    poolSize?: number | [number, number];
    strides?: [number, number];
    padding?: PaddingMode;
    dataFormat?: DataFormat;
}
export declare abstract class Pooling2D extends Layer {
    protected readonly poolSize: [number, number];
    protected readonly strides: [number, number];
    protected readonly padding: PaddingMode;
    protected readonly dataFormat: DataFormat;
    constructor(config: Pooling2DLayerConfig);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    protected abstract poolingFunction(inputs: Tensor, poolSize: [number, number], strides: [number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    getConfig(): ConfigDict;
}
export declare class MaxPooling2D extends Pooling2D {
    constructor(config: Pooling2DLayerConfig);
    getClassName(): string;
    protected poolingFunction(inputs: Tensor, poolSize: [number, number], strides: [number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
}
export declare class AveragePooling2D extends Pooling2D {
    constructor(config: Pooling2DLayerConfig);
    getClassName(): string;
    protected poolingFunction(inputs: Tensor, poolSize: [number, number], strides: [number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
}
export declare abstract class GlobalPooling1D extends Layer {
    constructor(config: LayerConfig);
    computeOutputShape(inputShape: Shape): Shape;
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
}
export declare class GlobalAveragePooling1D extends GlobalPooling1D {
    constructor(config: LayerConfig);
    getClassName(): string;
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
}
export declare class GlobalMaxPooling1D extends GlobalPooling1D {
    constructor(config: LayerConfig);
    getClassName(): string;
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
}
export interface GlobalPooling2DLayerConfig extends LayerConfig {
    dataFormat?: DataFormat;
}
export declare abstract class GlobalPooling2D extends Layer {
    protected dataFormat: DataFormat;
    constructor(config: GlobalPooling2DLayerConfig);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    getConfig(): ConfigDict;
}
export declare class GlobalAveragePooling2D extends GlobalPooling2D {
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    getClassName(): string;
}
export declare class GlobalMaxPooling2D extends GlobalPooling2D {
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    getClassName(): string;
}

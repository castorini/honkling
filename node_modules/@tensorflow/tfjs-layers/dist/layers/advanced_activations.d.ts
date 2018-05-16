import { Tensor } from '@tensorflow/tfjs-core';
import { Layer, LayerConfig } from '../engine/topology';
import { ConfigDict, Shape } from '../types';
export interface LeakyReLULayerConfig extends LayerConfig {
    alpha?: number;
}
export declare class LeakyReLU extends Layer {
    readonly alpha: number;
    readonly DEFAULT_ALPHA: number;
    constructor(config?: LeakyReLULayerConfig);
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getClassName(): string;
    getConfig(): ConfigDict;
}
export interface ELULayerConfig extends LayerConfig {
    alpha?: number;
}
export declare class ELU extends Layer {
    readonly alpha: number;
    readonly DEFAULT_ALPHA: number;
    constructor(config?: ELULayerConfig);
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getClassName(): string;
    getConfig(): ConfigDict;
}
export interface ThresholdedReLULayerConfig extends LayerConfig {
    theta?: number;
}
export declare class ThresholdedReLU extends Layer {
    readonly theta: number;
    private readonly thetaTensor;
    readonly DEFAULT_THETA: number;
    constructor(config?: ThresholdedReLULayerConfig);
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getClassName(): string;
    getConfig(): ConfigDict;
}
export interface SoftmaxLayerConfig extends LayerConfig {
    axis?: number;
}
export declare class Softmax extends Layer {
    readonly axis: number;
    readonly DEFAULT_AXIS: number;
    constructor(config?: ThresholdedReLULayerConfig);
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getClassName(): string;
    getConfig(): ConfigDict;
}

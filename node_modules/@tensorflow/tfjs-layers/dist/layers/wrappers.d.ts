import { Tensor } from '@tensorflow/tfjs-core';
import { Layer, LayerConfig } from '../engine/topology';
import { Shape, TensorInterface } from '../types';
import { ConfigDict, LayerVariable, RegularizerFn, SymbolicTensor } from '../types';
import * as generic_utils from '../utils/generic_utils';
import { RNN } from './recurrent';
export interface WrapperLayerConfig extends LayerConfig {
    layer: Layer;
}
export declare abstract class Wrapper extends Layer {
    readonly layer: Layer;
    constructor(config: WrapperLayerConfig);
    build(inputShape: Shape | Shape[]): void;
    trainable: boolean;
    readonly trainableWeights: LayerVariable[];
    readonly nonTrainableWeights: LayerVariable[];
    readonly updates: TensorInterface[];
    readonly losses: RegularizerFn[];
    getWeights(): Tensor[];
    setWeights(weights: Tensor[]): void;
    getConfig(): ConfigDict;
    static fromConfig<T>(cls: generic_utils.Constructor<T>, config: ConfigDict, customObjects?: ConfigDict): T;
}
export declare class TimeDistributed extends Wrapper {
    constructor(config: WrapperLayerConfig);
    build(inputShape: Shape | Shape[]): void;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    getClassName(): string;
}
export declare enum BidirectionalMergeMode {
    SUM = 0,
    MUL = 1,
    CONCAT = 2,
    AVE = 3,
}
export interface BidirectionalLayerConfig extends WrapperLayerConfig {
    layer: RNN;
    mergeMode?: BidirectionalMergeMode;
}
export declare class Bidirectional extends Wrapper {
    private forwardLayer;
    private backwardLayer;
    private mergeMode;
    private returnSequences;
    private returnState;
    private _trainable;
    constructor(config: BidirectionalLayerConfig);
    trainable: boolean;
    getWeights(): Tensor[];
    setWeights(weights: Tensor[]): void;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    apply(inputs: Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[], kwargs?: any): Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[];
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    resetStates(states?: Tensor | Tensor[]): void;
    build(inputShape: Shape | Shape[]): void;
    readonly trainableWeights: LayerVariable[];
    readonly nonTrainableWeights: LayerVariable[];
    getClassName(): string;
}

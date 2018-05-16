import { Tensor } from '@tensorflow/tfjs-core';
import { ActivationFn, ActivationIdentifier } from '../activations';
import { Constraint, ConstraintIdentifier } from '../constraints';
import { Layer, LayerConfig } from '../engine/topology';
import { Initializer, InitializerIdentifier } from '../initializers';
import { Regularizer, RegularizerIdentifier } from '../regularizers';
import { Shape } from '../types';
import { ConfigDict } from '../types';
export interface DropoutLayerConfig extends LayerConfig {
    rate: number;
    noiseShape?: number[];
    seed?: number;
}
export declare class Dropout extends Layer {
    private readonly rate;
    private readonly rateScalar;
    private readonly noiseShape;
    private readonly seed;
    constructor(config: DropoutLayerConfig);
    private getNoiseShape(input);
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    getClassName(): string;
    getConfig(): ConfigDict;
}
export interface DenseLayerConfig extends LayerConfig {
    units: number;
    activation?: ActivationIdentifier;
    useBias?: boolean;
    kernelInitializer?: InitializerIdentifier | Initializer;
    biasInitializer?: InitializerIdentifier | Initializer;
    inputDim?: number;
    kernelConstraint?: ConstraintIdentifier | Constraint;
    biasConstraint?: ConstraintIdentifier | Constraint;
    kernelRegularizer?: RegularizerIdentifier | Regularizer;
    biasRegularizer?: RegularizerIdentifier | Regularizer;
    activityRegularizer?: RegularizerIdentifier | Regularizer;
}
export declare class Dense extends Layer {
    private units;
    private activation;
    private useBias;
    private kernelInitializer;
    private biasInitializer;
    private kernel;
    private bias;
    readonly DEFAULT_KERNEL_INITIALIZER: InitializerIdentifier;
    readonly DEFAULT_BIAS_INITIALIZER: InitializerIdentifier;
    private readonly kernelConstraint?;
    private readonly biasConstraint?;
    private readonly kernelRegularizer?;
    private readonly biasRegularizer?;
    constructor(config: DenseLayerConfig);
    build(inputShape: Shape | Shape[]): void;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    getClassName(): string;
    getConfig(): ConfigDict;
}
export declare class Flatten extends Layer {
    constructor(config?: LayerConfig);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getClassName(): string;
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
}
export interface ActivationLayerConfig extends LayerConfig {
    activation: ActivationIdentifier;
}
export declare class Activation extends Layer {
    activation: ActivationFn;
    constructor(config: ActivationLayerConfig);
    getClassName(): string;
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
}
export interface ReshapeLayerConfig extends LayerConfig {
    targetShape: Shape;
}
export interface RepeatVectorLayerConfig extends LayerConfig {
    n: number;
}
export declare class RepeatVector extends Layer {
    readonly n: number;
    constructor(config: RepeatVectorLayerConfig);
    computeOutputShape(inputShape: Shape): Shape;
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    getClassName(): string;
    getConfig(): ConfigDict;
}
export declare class Reshape extends Layer {
    private targetShape;
    constructor(config: ReshapeLayerConfig);
    private isUnknown(dim);
    private fixUnknownDimension(inputShape, outputShape);
    computeOutputShape(inputShape: Shape): Shape;
    getClassName(): string;
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
}

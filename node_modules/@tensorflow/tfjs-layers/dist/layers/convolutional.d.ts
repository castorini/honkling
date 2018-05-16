import { Tensor } from '@tensorflow/tfjs-core';
import { ActivationFn } from '../activations';
import { DataFormat, PaddingMode } from '../common';
import { Constraint, ConstraintIdentifier } from '../constraints';
import { InputSpec, Layer, LayerConfig } from '../engine/topology';
import { Initializer, InitializerIdentifier } from '../initializers';
import { Regularizer, RegularizerIdentifier } from '../regularizers';
import { Shape } from '../types';
import { ConfigDict, LayerVariable } from '../types';
export interface ConvLayerConfig extends LayerConfig {
    kernelSize: number | number[];
    filters?: number;
    strides?: number | number[];
    padding?: PaddingMode;
    dataFormat?: DataFormat;
    dilationRate?: number | [number] | [number, number];
    activation?: string;
    useBias?: boolean;
    kernelInitializer?: InitializerIdentifier | Initializer;
    biasInitializer?: InitializerIdentifier | Initializer;
    kernelConstraint?: ConstraintIdentifier | Constraint;
    biasConstraint?: ConstraintIdentifier | Constraint;
    kernelRegularizer?: RegularizerIdentifier | Regularizer;
    biasRegularizer?: RegularizerIdentifier | Regularizer;
    activityRegularizer?: RegularizerIdentifier | Regularizer;
}
export declare abstract class Conv extends Layer {
    protected readonly rank: number;
    protected readonly filters: number;
    protected readonly kernelSize: number[];
    protected readonly strides: number[];
    protected readonly padding: PaddingMode;
    protected readonly dataFormat: DataFormat;
    protected readonly dilationRate: number | [number] | [number, number];
    protected readonly activation: ActivationFn;
    protected readonly useBias: boolean;
    protected readonly kernelInitializer?: Initializer;
    protected readonly biasInitializer?: Initializer;
    protected readonly kernelConstraint?: Constraint;
    protected readonly biasConstraint?: Constraint;
    protected readonly kernelRegularizer?: Regularizer;
    protected readonly biasRegularizer?: Regularizer;
    protected kernel: LayerVariable;
    protected bias: LayerVariable;
    readonly DEFAULT_KERNEL_INITIALIZER: InitializerIdentifier;
    readonly DEFAULT_BIAS_INITIALIZER: InitializerIdentifier;
    constructor(rank: number, config: ConvLayerConfig);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): ConfigDict;
}
export declare class Conv2D extends Conv {
    constructor(config: ConvLayerConfig);
    getClassName(): string;
    getConfig(): ConfigDict;
}
export declare class Conv2DTranspose extends Conv2D {
    inputSpec: InputSpec[];
    constructor(config: ConvLayerConfig);
    getClassName(): string;
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): ConfigDict;
}
export interface SeparableConvLayerConfig extends ConvLayerConfig {
    depthMultiplier?: number;
    depthwiseInitializer?: InitializerIdentifier | Initializer;
    pointwiseInitializer?: InitializerIdentifier | Initializer;
    depthwiseRegularizer?: RegularizerIdentifier | Regularizer;
    pointwiseRegularizer?: RegularizerIdentifier | Regularizer;
    depthwiseConstraint?: ConstraintIdentifier | Constraint;
    pointwiseConstraint?: ConstraintIdentifier | Constraint;
}
export declare class SeparableConv extends Conv {
    readonly depthMultiplier: number;
    protected readonly depthwiseInitializer?: Initializer;
    protected readonly depthwiseRegularizer?: Regularizer;
    protected readonly depthwiseConstraint?: Constraint;
    protected readonly pointwiseInitializer?: Initializer;
    protected readonly pointwiseRegularizer?: Regularizer;
    protected readonly pointwiseConstraint?: Constraint;
    readonly DEFAULT_DEPTHWISE_INITIALIZER: InitializerIdentifier;
    readonly DEFAULT_POINTWISE_INITIALIZER: InitializerIdentifier;
    protected depthwiseKernel: LayerVariable;
    protected pointwiseKernel: LayerVariable;
    constructor(rank: number, config?: SeparableConvLayerConfig);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    getClassName(): string;
    getConfig(): ConfigDict;
}
export declare class SeparableConv2D extends SeparableConv {
    constructor(config?: SeparableConvLayerConfig);
    getClassName(): string;
}
export declare class Conv1D extends Conv {
    constructor(config: ConvLayerConfig);
    getClassName(): string;
    getConfig(): ConfigDict;
}

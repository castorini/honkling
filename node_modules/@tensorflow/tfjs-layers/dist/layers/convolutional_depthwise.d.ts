import { Tensor } from '@tensorflow/tfjs-core';
import { Constraint, ConstraintIdentifier } from '../constraints';
import { Initializer, InitializerIdentifier } from '../initializers';
import { Regularizer, RegularizerIdentifier } from '../regularizers';
import { Shape } from '../types';
import { Conv2D, ConvLayerConfig } from './convolutional';
export interface DepthwiseConv2DLayerConfig extends ConvLayerConfig {
    kernelSize: number | [number, number];
    depthMultiplier?: number;
    depthwiseInitializer?: InitializerIdentifier | Initializer;
    depthwiseConstraint?: ConstraintIdentifier | Constraint;
    depthwiseRegularizer?: RegularizerIdentifier | Regularizer;
}
export declare class DepthwiseConv2D extends Conv2D {
    private readonly depthMultiplier;
    private readonly depthwiseInitializer;
    private readonly depthwiseConstraint;
    private readonly depthwiseRegularizer;
    private depthwiseKernel;
    constructor(config: DepthwiseConv2DLayerConfig);
    getClassName(): string;
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
}

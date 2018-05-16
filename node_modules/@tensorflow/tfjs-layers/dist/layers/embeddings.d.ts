import { Tensor } from '@tensorflow/tfjs-core';
import { Constraint, ConstraintIdentifier } from '../constraints';
import { Layer, LayerConfig } from '../engine/topology';
import { Initializer, InitializerIdentifier } from '../initializers';
import { Regularizer, RegularizerIdentifier } from '../regularizers';
import { Shape } from '../types';
import { ConfigDict } from '../types';
export interface EmbeddingLayerConfig extends LayerConfig {
    inputDim: number;
    outputDim: number;
    embeddingsInitializer?: InitializerIdentifier | Initializer;
    embeddingsRegularizer?: RegularizerIdentifier | Regularizer;
    activityRegularizer?: RegularizerIdentifier | Regularizer;
    embeddingsConstraint?: ConstraintIdentifier | Constraint;
    maskZero?: boolean;
    inputLength?: number | number[];
}
export declare class Embedding extends Layer {
    private inputDim;
    private outputDim;
    private embeddingsInitializer;
    private maskZero;
    private inputLength;
    private embeddings;
    readonly DEFAULT_EMBEDDINGS_INITIALIZER: InitializerIdentifier;
    private readonly embeddingsRegularizer?;
    private readonly embeddingsConstraint?;
    constructor(config: EmbeddingLayerConfig);
    build(inputShape: Shape | Shape[]): void;
    computeMask(inputs: Tensor | Tensor[], mask?: Tensor | Tensor[]): Tensor;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    getClassName(): string;
    getConfig(): ConfigDict;
}

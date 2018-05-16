import { Tensor } from '@tensorflow/tfjs-core';
import { ActivationFn, ActivationIdentifier } from '../activations';
import { Constraint, ConstraintIdentifier } from '../constraints';
import { InputSpec } from '../engine/topology';
import { Layer, LayerConfig } from '../engine/topology';
import { Initializer, InitializerIdentifier } from '../initializers';
import { Regularizer, RegularizerIdentifier } from '../regularizers';
import { Shape, SymbolicTensor } from '../types';
import { ConfigDict, LayerVariable } from '../types';
import * as generic_utils from '../utils/generic_utils';
export interface BaseRNNLayerConfig extends LayerConfig {
    cell?: RNNCell | RNNCell[];
    returnSequences?: boolean;
    returnState?: boolean;
    goBackwards?: boolean;
    stateful?: boolean;
    unroll?: boolean;
    inputDim?: number;
    inputLength?: number;
}
export interface RNNLayerConfig extends BaseRNNLayerConfig {
    cell: RNNCell | RNNCell[];
}
export declare class RNN extends Layer {
    readonly cell: RNNCell;
    readonly returnSequences: boolean;
    readonly returnState: boolean;
    readonly goBackwards: boolean;
    readonly unroll: boolean;
    stateSpec: InputSpec[];
    states: Tensor[];
    private numConstants;
    constructor(config: RNNLayerConfig);
    getStates(): Tensor[];
    setStates(states: Tensor[]): void;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    computeMask(inputs: Tensor | Tensor[], mask?: Tensor | Tensor[]): Tensor;
    build(inputShape: Shape | Shape[]): void;
    resetStates(states?: Tensor | Tensor[]): void;
    protected standardizeArgs(inputs: Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[], initialState: Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[], constants: Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[]): {
        inputs: Tensor | SymbolicTensor;
        initialState: Tensor[] | SymbolicTensor[];
        constants: Tensor[] | SymbolicTensor[];
    };
    apply(inputs: Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[], kwargs?: any): Tensor | Tensor[] | SymbolicTensor | SymbolicTensor[];
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    getInitialState(inputs: Tensor): Tensor[];
    readonly trainableWeights: LayerVariable[];
    readonly nonTrainableWeights: LayerVariable[];
    getClassName(): string;
    getConfig(): ConfigDict;
}
export declare abstract class RNNCell extends Layer {
    stateSize: number | number[];
}
export interface SimpleRNNCellLayerConfig extends LayerConfig {
    units: number;
    activation?: ActivationIdentifier;
    useBias?: boolean;
    kernelInitializer?: InitializerIdentifier | Initializer;
    recurrentInitializer?: InitializerIdentifier | Initializer;
    biasInitializer?: InitializerIdentifier | Initializer;
    kernelRegularizer?: RegularizerIdentifier | Regularizer;
    recurrentRegularizer?: RegularizerIdentifier | Regularizer;
    biasRegularizer?: RegularizerIdentifier | Regularizer;
    kernelConstraint?: ConstraintIdentifier | Constraint;
    recurrentConstraint?: ConstraintIdentifier | Constraint;
    biasConstraint?: ConstraintIdentifier | Constraint;
    dropout?: number;
    recurrentDropout?: number;
}
export declare class SimpleRNNCell extends RNNCell {
    readonly units: number;
    readonly activation: ActivationFn;
    readonly useBias: boolean;
    readonly kernelInitializer: Initializer;
    readonly recurrentInitializer: Initializer;
    readonly biasInitializer: Initializer;
    readonly kernelConstraint: Constraint;
    readonly recurrentConstraint: Constraint;
    readonly biasConstraint: Constraint;
    readonly kernelRegularizer: Regularizer;
    readonly recurrentRegularizer: Regularizer;
    readonly biasRegularizer: Regularizer;
    readonly dropout: number;
    readonly recurrentDropout: number;
    readonly stateSize: number;
    kernel: LayerVariable;
    recurrentKernel: LayerVariable;
    bias: LayerVariable;
    readonly DEFAULT_ACTIVATION: string;
    readonly DEFAULT_KERNEL_INITIALIZER: string;
    readonly DEFAULT_RECURRENT_INITIALIZER: string;
    readonly DEFAULT_BIAS_INITIALIZER: InitializerIdentifier;
    constructor(config: SimpleRNNCellLayerConfig);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    getClassName(): string;
    getConfig(): ConfigDict;
}
export interface SimpleRNNLayerConfig extends BaseRNNLayerConfig {
    units: number;
    activation?: ActivationIdentifier;
    useBias?: boolean;
    kernelInitializer?: InitializerIdentifier | Initializer;
    recurrentInitializer?: InitializerIdentifier | Initializer;
    biasInitializer?: InitializerIdentifier | Initializer;
    kernelRegularizer?: RegularizerIdentifier | Regularizer;
    recurrentRegularizer?: RegularizerIdentifier | Regularizer;
    biasRegularizer?: RegularizerIdentifier | Regularizer;
    kernelConstraint?: ConstraintIdentifier | Constraint;
    recurrentConstraint?: ConstraintIdentifier | Constraint;
    biasConstraint?: ConstraintIdentifier | Constraint;
    dropout?: number;
    recurrentDropout?: number;
}
export declare class SimpleRNN extends RNN {
    constructor(config: SimpleRNNLayerConfig);
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    readonly units: number;
    readonly activation: ActivationFn;
    readonly useBias: boolean;
    readonly kernelInitializer: Initializer;
    readonly recurrentInitializer: Initializer;
    readonly biasInitializer: Initializer;
    readonly kernelRegularizer: Regularizer;
    readonly recurrentRegularizer: Regularizer;
    readonly biasRegularizer: Regularizer;
    readonly kernelConstraint: Constraint;
    readonly recurrentConstraint: Constraint;
    readonly biasConstraint: Constraint;
    readonly dropout: number;
    readonly recurrentDropout: number;
    getClassName(): string;
    getConfig(): ConfigDict;
}
export interface GRUCellLayerConfig extends SimpleRNNCellLayerConfig {
    recurrentActivation?: string;
    implementation?: number;
}
export declare class GRUCell extends RNNCell {
    readonly units: number;
    readonly activation: ActivationFn;
    readonly recurrentActivation: ActivationFn;
    readonly useBias: boolean;
    readonly kernelInitializer: Initializer;
    readonly recurrentInitializer: Initializer;
    readonly biasInitializer: Initializer;
    readonly kernelRegularizer: Regularizer;
    readonly recurrentRegularizer: Regularizer;
    readonly biasRegularizer: Regularizer;
    readonly kernelConstraint: Constraint;
    readonly recurrentConstraint: Constraint;
    readonly biasConstraint: Constraint;
    readonly dropout: number;
    readonly recurrentDropout: number;
    readonly stateSize: number;
    readonly implementation: number;
    readonly DEFAULT_ACTIVATION: string;
    readonly DEFAULT_RECURRENT_ACTIVATION: string;
    readonly DEFAULT_KERNEL_INITIALIZER: string;
    readonly DEFAULT_RECURRENT_INITIALIZER: string;
    readonly DEFAULT_BIAS_INITIALIZER: InitializerIdentifier;
    kernel: LayerVariable;
    recurrentKernel: LayerVariable;
    bias: LayerVariable;
    constructor(config: GRUCellLayerConfig);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    getClassName(): string;
    getConfig(): ConfigDict;
}
export interface GRULayerConfig extends SimpleRNNLayerConfig {
    implementation?: number;
}
export declare class GRU extends RNN {
    constructor(config: GRULayerConfig);
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    readonly units: number;
    readonly activation: ActivationFn;
    readonly useBias: boolean;
    readonly kernelInitializer: Initializer;
    readonly recurrentInitializer: Initializer;
    readonly biasInitializer: Initializer;
    readonly kernelRegularizer: Regularizer;
    readonly recurrentRegularizer: Regularizer;
    readonly biasRegularizer: Regularizer;
    readonly kernelConstraint: Constraint;
    readonly recurrentConstraint: Constraint;
    readonly biasConstraint: Constraint;
    readonly dropout: number;
    readonly recurrentDropout: number;
    readonly implementation: number;
    getClassName(): string;
    getConfig(): ConfigDict;
    static fromConfig<T>(cls: generic_utils.Constructor<T>, config: ConfigDict): T;
}
export interface LSTMCellLayerConfig extends SimpleRNNCellLayerConfig {
    recurrentActivation?: ActivationIdentifier;
    unitForgetBias?: boolean;
    implementation?: 1 | 2;
}
export declare class LSTMCell extends RNNCell {
    readonly units: number;
    readonly activation: ActivationFn;
    readonly recurrentActivation: ActivationFn;
    readonly useBias: boolean;
    readonly kernelInitializer: Initializer;
    readonly recurrentInitializer: Initializer;
    readonly biasInitializer: Initializer;
    readonly unitForgetBias: boolean;
    readonly kernelConstraint: Constraint;
    readonly recurrentConstraint: Constraint;
    readonly biasConstraint: Constraint;
    readonly kernelRegularizer: Regularizer;
    readonly recurrentRegularizer: Regularizer;
    readonly biasRegularizer: Regularizer;
    readonly dropout: number;
    readonly recurrentDropout: number;
    readonly stateSize: number[];
    readonly implementation: number;
    readonly DEFAULT_ACTIVATION: string;
    readonly DEFAULT_RECURRENT_ACTIVATION: string;
    readonly DEFAULT_KERNEL_INITIALIZER: string;
    readonly DEFAULT_RECURRENT_INITIALIZER: string;
    readonly DEFAULT_BIAS_INITIALIZER: string;
    kernel: LayerVariable;
    recurrentKernel: LayerVariable;
    bias: LayerVariable;
    constructor(config: LSTMCellLayerConfig);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    getClassName(): string;
    getConfig(): ConfigDict;
}
export interface LSTMLayerConfig extends SimpleRNNLayerConfig {
    unitForgetBias?: boolean;
    implementation?: 1 | 2;
}
export declare class LSTM extends RNN {
    constructor(config: LSTMLayerConfig);
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    readonly units: number;
    readonly activation: ActivationFn;
    readonly useBias: boolean;
    readonly kernelInitializer: Initializer;
    readonly recurrentInitializer: Initializer;
    readonly biasInitializer: Initializer;
    readonly unitForgetBias: boolean;
    readonly kernelRegularizer: Regularizer;
    readonly recurrentRegularizer: Regularizer;
    readonly biasRegularizer: Regularizer;
    readonly kernelConstraint: Constraint;
    readonly recurrentConstraint: Constraint;
    readonly biasConstraint: Constraint;
    readonly dropout: number;
    readonly recurrentDropout: number;
    readonly implementation: number;
    getClassName(): string;
    getConfig(): ConfigDict;
    static fromConfig<T>(cls: generic_utils.Constructor<T>, config: ConfigDict): T;
}
export interface StackedRNNCellsConfig extends LayerConfig {
    cells: RNNCell[];
}
export declare class StackedRNNCells extends RNNCell {
    protected cells: RNNCell[];
    constructor(config: StackedRNNCellsConfig);
    readonly stateSize: number[];
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    build(inputShape: Shape | Shape[]): void;
    getClassName(): string;
    getConfig(): ConfigDict;
    static fromConfig<T>(cls: generic_utils.Constructor<T>, config: ConfigDict, customObjects?: ConfigDict): T;
    readonly trainableWeights: LayerVariable[];
    readonly nonTrainableWeights: LayerVariable[];
    getWeights(): Tensor[];
    setWeights(weights: Tensor[]): void;
}

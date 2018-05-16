import { Tensor } from '@tensorflow/tfjs-core';
import { ConfigDict, ConfigDictValue, Serializable } from './types';
export declare abstract class Constraint extends Serializable {
    abstract apply(w: Tensor): Tensor;
    getConfig(): ConfigDict;
}
export interface MaxNormConfig {
    maxValue?: number;
    axis?: number;
}
export declare class MaxNorm extends Constraint {
    private maxValue;
    private axis;
    private readonly defaultMaxValue;
    private readonly defaultAxis;
    constructor(config: MaxNormConfig);
    apply(w: Tensor): Tensor;
    getClassName(): string;
    getConfig(): ConfigDict;
}
export interface UnitNormConfig {
    axis?: number;
}
export declare class UnitNorm extends Constraint {
    private axis;
    private readonly defaultAxis;
    constructor(config: UnitNormConfig);
    apply(w: Tensor): Tensor;
    getClassName(): string;
    getConfig(): ConfigDict;
}
export declare class NonNeg extends Constraint {
    apply(w: Tensor): Tensor;
    getClassName(): string;
}
export interface MinMaxNormConfig {
    minValue?: number;
    maxValue?: number;
    axis?: number;
    rate?: number;
}
export declare class MinMaxNorm extends Constraint {
    private minValue;
    private maxValue;
    private rate;
    private axis;
    private readonly defaultMinValue;
    private readonly defaultMaxValue;
    private readonly defaultRate;
    private readonly defaultAxis;
    constructor(config: MinMaxNormConfig);
    apply(w: Tensor): Tensor;
    getClassName(): string;
    getConfig(): ConfigDict;
}
export declare type ConstraintIdentifier = 'maxNorm' | 'minMaxNorm' | 'nonNeg' | 'unitNorm' | string;
export declare const CONSTRAINT_IDENTIFIER_REGISTRY_SYMBOL_MAP: {
    [identifier in ConstraintIdentifier]: string;
};
export declare function serializeConstraint(constraint: Constraint): ConfigDictValue;
export declare function deserializeConstraint(config: ConfigDict, customObjects?: ConfigDict): Constraint;
export declare function getConstraint(identifier: ConstraintIdentifier | ConfigDict | Constraint): Constraint;

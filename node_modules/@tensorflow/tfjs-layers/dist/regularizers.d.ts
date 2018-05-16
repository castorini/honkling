import { Scalar, Tensor } from '@tensorflow/tfjs-core';
import { ConfigDict, ConfigDictValue, Serializable } from './types';
import * as generic_utils from './utils/generic_utils';
export declare abstract class Regularizer extends Serializable {
    abstract apply(x: Tensor): Scalar;
}
export interface L1L2Config {
    l1?: number;
    l2?: number;
}
export interface L1Config {
    l1: number;
}
export interface L2Config {
    l2: number;
}
export declare class L1L2 extends Regularizer {
    private readonly l1;
    private readonly l2;
    private readonly hasL1;
    private readonly hasL2;
    constructor(config?: L1L2Config);
    apply(x: Tensor): Scalar;
    getClassName(): string;
    getConfig(): ConfigDict;
    static fromConfig(cls: generic_utils.Constructor<L1L2>, config: ConfigDict): L1L2;
}
export declare function l1(config?: L1Config): L1L2;
export declare function l2(config: L2Config): L1L2;
export declare type RegularizerIdentifier = 'l1l2' | string;
export declare const REGULARIZER_IDENTIFIER_REGISTRY_SYMBOL_MAP: {
    [identifier in RegularizerIdentifier]: string;
};
export declare function serializeRegularizer(constraint: Regularizer): ConfigDictValue;
export declare function deserializeRegularizer(config: ConfigDict, customObjects?: ConfigDict): Regularizer;
export declare function getRegularizer(identifier: RegularizerIdentifier | ConfigDict | Regularizer): Regularizer;

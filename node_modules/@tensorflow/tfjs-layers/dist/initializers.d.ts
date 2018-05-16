import { Tensor } from '@tensorflow/tfjs-core';
import { DType, Serializable, Shape } from './types';
import { ConfigDict, ConfigDictValue } from './types';
import { Constructor } from './utils/generic_utils';
export declare type FanMode = 'fanIn' | 'fanOut' | 'fanAvg';
export declare const VALID_FAN_MODE_VALUES: string[];
export declare function checkFanMode(value?: string): void;
export declare type Distribution = 'normal' | 'uniform';
export declare const VALID_DISTRIBUTION_VALUES: string[];
export declare function checkDistribution(value?: string): void;
export declare abstract class Initializer extends Serializable {
    static fromConfig<T>(cls: Constructor<T>, config: ConfigDict): T;
    fromConfigUsesCustomObjects(): boolean;
    abstract apply(shape: Shape, dtype?: DType): Tensor;
    getConfig(): ConfigDict;
}
export declare class Zeros extends Initializer {
    getClassName(): string;
    apply(shape: Shape, dtype?: DType): Tensor;
}
export declare class Ones extends Initializer {
    getClassName(): string;
    apply(shape: Shape, dtype?: DType): Tensor;
}
export interface ConstantConfig {
    value: number;
}
export declare class Constant extends Initializer {
    private value;
    constructor(config: ConstantConfig);
    apply(shape: Shape, dtype?: DType): Tensor;
    getClassName(): string;
    getConfig(): ConfigDict;
}
export interface RandomUniformConfig {
    minval?: number;
    maxval?: number;
    seed?: number;
}
export declare class RandomUniform extends Initializer {
    readonly DEFAULT_MINVAL: number;
    readonly DEFAULT_MAXVAL: number;
    private minval;
    private maxval;
    private seed;
    constructor(config: RandomUniformConfig);
    apply(shape: Shape, dtype?: DType): Tensor;
    getClassName(): string;
    getConfig(): ConfigDict;
}
export interface RandomNormalConfig {
    mean?: number;
    stddev?: number;
    seed?: number;
}
export declare class RandomNormal extends Initializer {
    readonly DEFAULT_MEAN: number;
    readonly DEFAULT_STDDEV: number;
    private mean;
    private stddev;
    private seed;
    constructor(config: RandomNormalConfig);
    apply(shape: Shape, dtype?: DType): Tensor;
    getClassName(): string;
    getConfig(): ConfigDict;
}
export interface TruncatedNormalConfig {
    mean?: number;
    stddev?: number;
    seed?: number;
}
export declare class TruncatedNormal extends Initializer {
    readonly DEFAULT_MEAN: number;
    readonly DEFAULT_STDDEV: number;
    private mean;
    private stddev;
    private seed;
    constructor(config: TruncatedNormalConfig);
    apply(shape: Shape, dtype?: DType): Tensor;
    getClassName(): string;
    getConfig(): ConfigDict;
}
export interface IdentityConfig {
    gain?: number;
}
export declare class Identity extends Initializer {
    private gain;
    constructor(config: IdentityConfig);
    apply(shape: Shape, dtype?: DType): Tensor;
    getClassName(): string;
    getConfig(): ConfigDict;
}
export interface VarianceScalingConfig {
    scale: number;
    mode: FanMode;
    distribution: Distribution;
    seed?: number;
}
export declare class VarianceScaling extends Initializer {
    private scale;
    private mode;
    private distribution;
    private seed;
    constructor(config: VarianceScalingConfig);
    apply(shape: Shape, dtype?: DType): Tensor;
    getClassName(): string;
    getConfig(): ConfigDict;
}
export interface SeedOnlyInitializerConfig {
    seed?: number;
}
export declare class GlorotUniform extends VarianceScaling {
    constructor(config?: SeedOnlyInitializerConfig);
}
export declare class GlorotNormal extends VarianceScaling {
    constructor(config?: SeedOnlyInitializerConfig);
}
export declare class HeNormal extends VarianceScaling {
    constructor(config?: SeedOnlyInitializerConfig);
}
export declare class LeCunNormal extends VarianceScaling {
    constructor(config?: SeedOnlyInitializerConfig);
}
export interface OrthogonalConfig extends SeedOnlyInitializerConfig {
    gain?: number;
}
export declare class Orthogonal extends Initializer {
    readonly DEFAULT_GAIN: number;
    protected readonly gain: number;
    protected readonly seed: number;
    constructor(config?: OrthogonalConfig);
    apply(shape: Shape, dtype?: DType): Tensor;
    getClassName(): string;
    getConfig(): ConfigDict;
}
export declare type InitializerIdentifier = 'constant' | 'glorotNormal' | 'glorotUniform' | 'heNormal' | 'identity' | 'leCunNormal' | 'ones' | 'orthogonal' | 'randomNormal' | 'randomUniform' | 'truncatedNormal' | 'varianceScaling' | 'zeros' | string;
export declare const INITIALIZER_IDENTIFIER_REGISTRY_SYMBOL_MAP: {
    [identifier in InitializerIdentifier]: string;
};
export declare function serializeInitializer(initializer: Initializer): ConfigDictValue;
export declare function getInitializer(identifier: InitializerIdentifier | Initializer | ConfigDict): Initializer;

import { Scalar } from '../tensor';
import { NamedTensorMap } from '../types';
import { Optimizer } from './optimizer';
export declare class SGDOptimizer extends Optimizer {
    protected learningRate: number;
    protected c: Scalar;
    constructor(learningRate: number);
    applyGradients(variableGradients: NamedTensorMap): void;
    setLearningRate(learningRate: number): void;
    dispose(): void;
}

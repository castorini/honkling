import { NamedVariableMap } from '../types';
import { Optimizer } from './optimizer';
export declare class AdamaxOptimizer extends Optimizer {
    protected learningRate: number;
    private c;
    private eps;
    private accBeta1;
    private beta1;
    private beta2;
    private decay;
    private oneMinusBeta1;
    private one;
    private iteration;
    private accumulatedFirstMoment;
    private accumulatedWeightedInfNorm;
    constructor(learningRate: number, beta1: number, beta2: number, epsilon?: number, decay?: number);
    applyGradients(variableGradients: NamedVariableMap): void;
    dispose(): void;
}

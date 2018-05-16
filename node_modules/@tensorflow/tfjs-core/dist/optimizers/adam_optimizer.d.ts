import { NamedVariableMap } from '../types';
import { Optimizer } from './optimizer';
export declare class AdamOptimizer extends Optimizer {
    protected learningRate: number;
    private c;
    private eps;
    private beta1;
    private beta2;
    private accBeta1;
    private accBeta2;
    private oneMinusBeta1;
    private oneMinusBeta2;
    private one;
    private accumulatedFirstMoment;
    private accumulatedSecondMoment;
    constructor(learningRate: number, beta1: number, beta2: number, epsilon?: number);
    applyGradients(variableGradients: NamedVariableMap): void;
    dispose(): void;
}

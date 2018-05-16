import { NamedVariableMap } from '../types';
import { Optimizer } from './optimizer';
export declare class AdagradOptimizer extends Optimizer {
    protected learningRate: number;
    private initialAccumulatorValue;
    private c;
    private epsilon;
    private accumulatedGrads;
    constructor(learningRate: number, initialAccumulatorValue?: number);
    applyGradients(variableGradients: NamedVariableMap): void;
    dispose(): void;
}

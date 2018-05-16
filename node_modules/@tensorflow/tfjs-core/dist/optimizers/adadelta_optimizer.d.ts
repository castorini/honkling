import { NamedVariableMap } from '../types';
import { Optimizer } from './optimizer';
export declare class AdadeltaOptimizer extends Optimizer {
    private c;
    private epsilon;
    private rho;
    private oneMinusRho;
    private accumulatedGrads;
    private accumulatedUpdates;
    constructor(learningRate: number, rho: number, epsilon?: number);
    applyGradients(variableGradients: NamedVariableMap): void;
    dispose(): void;
}

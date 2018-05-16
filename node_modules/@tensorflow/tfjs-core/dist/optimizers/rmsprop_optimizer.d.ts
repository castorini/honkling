import { NamedVariableMap } from '../types';
import { Optimizer } from './optimizer';
export declare class RMSPropOptimizer extends Optimizer {
    protected learningRate: number;
    private c;
    private epsilon;
    private decay;
    private momentum;
    private oneMinusDecay;
    private centered;
    private accumulatedMeanSquares;
    private accumulatedMeanGrads;
    private accumulatedMoments;
    constructor(learningRate: number, decay?: number, momentum?: number, epsilon?: number, centered?: boolean);
    applyGradients(variableGradients: NamedVariableMap): void;
    dispose(): void;
}

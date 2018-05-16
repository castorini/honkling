import { NamedVariableMap } from '../types';
import { SGDOptimizer } from './sgd_optimizer';
export declare class MomentumOptimizer extends SGDOptimizer {
    protected learningRate: number;
    private momentum;
    private useNesterov;
    private m;
    private accumulations;
    constructor(learningRate: number, momentum: number, useNesterov?: boolean);
    applyGradients(variableGradients: NamedVariableMap): void;
    dispose(): void;
    setMomentum(momentum: number): void;
}

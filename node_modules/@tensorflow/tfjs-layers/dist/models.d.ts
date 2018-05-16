import { Scalar, Tensor, WeightsManifestConfig } from '@tensorflow/tfjs-core';
import { History } from './callbacks';
import { Layer } from './engine/topology';
import { Model, ModelCompileConfig, ModelEvaluateConfig, ModelFitConfig, ModelPredictConfig } from './engine/training';
import { Shape } from './types';
import { ConfigDict, JsonDict } from './types';
import * as generic_utils from './utils/generic_utils';
export declare function modelFromJSON(modelAndWeightsConfig: ModelAndWeightsConfig, customObjects?: ConfigDict): Promise<Model>;
export interface ModelAndWeightsConfig {
    modelTopology: JsonDict;
    weightsManifest?: WeightsManifestConfig;
    pathPrefix?: string;
}
export declare function loadModelInternal(modelConfigPath: string): Promise<Model>;
export interface SequentialConfig {
    layers?: Layer[];
    name?: string;
}
export declare class Sequential extends Model {
    private model;
    private _updatable;
    constructor(config?: SequentialConfig);
    getClassName(): string;
    add(layer: Layer): void;
    pop(): void;
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    build(inputShape?: Shape): void;
    setWeights(weights: Tensor[]): void;
    updatable: boolean;
    evaluate(x: Tensor | Tensor[], y: Tensor | Tensor[], config?: ModelEvaluateConfig): Scalar | Scalar[];
    predict(x: Tensor | Tensor[], config?: ModelPredictConfig): Tensor | Tensor[];
    predictOnBatch(x: Tensor): Tensor | Tensor[];
    compile(config: ModelCompileConfig): void;
    fit(x: Tensor | Tensor[] | {
        [inputName: string]: Tensor;
    }, y: Tensor | Tensor[] | {
        [inputName: string]: Tensor;
    }, config?: ModelFitConfig): Promise<History>;
    static fromConfig<T>(cls: generic_utils.Constructor<T>, config: ConfigDict): T;
    getConfig(): any;
}

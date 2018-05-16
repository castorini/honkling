import { Tensor } from '@tensorflow/tfjs-core';
import { DataFormat } from '../common';
import { Layer, LayerConfig } from '../engine/topology';
import { ConfigDict, Shape } from '../types';
export interface ZeroPadding2DLayerConfig extends LayerConfig {
    padding?: number | [number, number] | [[number, number], [number, number]];
    dataFormat?: DataFormat;
}
export declare class ZeroPadding2D extends Layer {
    readonly dataFormat: DataFormat;
    readonly padding: [[number, number], [number, number]];
    constructor(config?: ZeroPadding2DLayerConfig);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor | Tensor[], kwargs: any): Tensor | Tensor[];
    getClassName(): string;
    getConfig(): ConfigDict;
}

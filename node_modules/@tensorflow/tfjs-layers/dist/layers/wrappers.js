"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var K = require("../backend/tfjs_backend");
var topology_1 = require("../engine/topology");
var errors_1 = require("../errors");
var generic_utils = require("../utils/generic_utils");
var serialization_1 = require("./serialization");
var Wrapper = (function (_super) {
    __extends(Wrapper, _super);
    function Wrapper(config) {
        var _this = _super.call(this, config) || this;
        _this.layer = config.layer;
        return _this;
    }
    Wrapper.prototype.build = function (inputShape) {
        this.built = true;
    };
    Object.defineProperty(Wrapper.prototype, "trainable", {
        get: function () {
            if (this.layer != null) {
                return this.layer.trainable;
            }
            else {
                return false;
            }
        },
        set: function (value) {
            if (this.layer != null) {
                this.layer.trainable = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wrapper.prototype, "trainableWeights", {
        get: function () {
            return this.layer.trainableWeights;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wrapper.prototype, "nonTrainableWeights", {
        get: function () {
            return this.layer.nonTrainableWeights;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wrapper.prototype, "updates", {
        get: function () {
            return this.layer._updates;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wrapper.prototype, "losses", {
        get: function () {
            return this.layer.losses;
        },
        enumerable: true,
        configurable: true
    });
    Wrapper.prototype.getWeights = function () {
        return this.layer.getWeights();
    };
    Wrapper.prototype.setWeights = function (weights) {
        this.layer.setWeights(weights);
    };
    Wrapper.prototype.getConfig = function () {
        var config = {
            'layer': {
                'className': this.layer.getClassName(),
                'config': this.layer.getConfig(),
            }
        };
        var baseConfig = _super.prototype.getConfig.call(this);
        Object.assign(config, baseConfig);
        return config;
    };
    Wrapper.fromConfig = function (cls, config, customObjects) {
        if (customObjects === void 0) { customObjects = {}; }
        var layerConfig = config['layer'];
        var layer = serialization_1.deserialize(layerConfig, customObjects);
        delete config['layer'];
        var newConfig = { layer: layer };
        Object.assign(newConfig, config);
        return new cls(newConfig);
    };
    return Wrapper;
}(topology_1.Layer));
exports.Wrapper = Wrapper;
var TimeDistributed = (function (_super) {
    __extends(TimeDistributed, _super);
    function TimeDistributed(config) {
        var _this = _super.call(this, config) || this;
        _this.supportsMasking = true;
        return _this;
    }
    TimeDistributed.prototype.build = function (inputShape) {
        inputShape = generic_utils.getExactlyOneShape(inputShape);
        if (inputShape.length < 3) {
            throw new errors_1.ValueError("TimeDistributed layer expects an input shape >= 3D, but received " +
                ("input shape " + JSON.stringify(inputShape)));
        }
        this.inputSpec = [{ shape: inputShape }];
        var childInputShape = [inputShape[0]].concat(inputShape.slice(2));
        if (!this.layer.built) {
            this.layer.build(childInputShape);
            this.layer.built = true;
        }
        _super.prototype.build.call(this, inputShape);
    };
    TimeDistributed.prototype.computeOutputShape = function (inputShape) {
        inputShape = generic_utils.getExactlyOneShape(inputShape);
        var childInputShape = [inputShape[0]].concat(inputShape.slice(2));
        var childOutputShape = this.layer.computeOutputShape(childInputShape);
        var timesteps = inputShape[1];
        return [childOutputShape[0], timesteps].concat(childOutputShape.slice(1));
    };
    TimeDistributed.prototype.call = function (inputs, kwargs) {
        var _this = this;
        inputs = generic_utils.getExactlyOneTensor(inputs);
        var step = function (inputs, states) {
            var output = _this.layer.call(inputs, kwargs);
            return [output, []];
        };
        var rnnOutputs = K.rnn(step, inputs, [], false, null, null, false, inputs.shape[1]);
        var y = rnnOutputs[1];
        return y;
    };
    TimeDistributed.prototype.getClassName = function () {
        return 'TimeDistributed';
    };
    return TimeDistributed;
}(Wrapper));
exports.TimeDistributed = TimeDistributed;
generic_utils.ClassNameMap.register('TimeDistributed', TimeDistributed);
var BidirectionalMergeMode;
(function (BidirectionalMergeMode) {
    BidirectionalMergeMode[BidirectionalMergeMode["SUM"] = 0] = "SUM";
    BidirectionalMergeMode[BidirectionalMergeMode["MUL"] = 1] = "MUL";
    BidirectionalMergeMode[BidirectionalMergeMode["CONCAT"] = 2] = "CONCAT";
    BidirectionalMergeMode[BidirectionalMergeMode["AVE"] = 3] = "AVE";
})(BidirectionalMergeMode = exports.BidirectionalMergeMode || (exports.BidirectionalMergeMode = {}));
generic_utils.SerializableEnumRegistry.register('merge_mode', {
    'sum': BidirectionalMergeMode.SUM,
    'mul': BidirectionalMergeMode.MUL,
    'concat': BidirectionalMergeMode.CONCAT,
    'ave': BidirectionalMergeMode.AVE,
});
var Bidirectional = (function (_super) {
    __extends(Bidirectional, _super);
    function Bidirectional(config) {
        var _this = _super.call(this, config) || this;
        _this.forwardLayer = config.layer;
        var layerConfig = config.layer.getConfig();
        layerConfig['goBackwards'] =
            layerConfig['goBackwards'] === true ? false : true;
        _this.backwardLayer =
            serialization_1.deserialize({ className: config.layer.getClassName(), config: layerConfig });
        _this.forwardLayer.name = 'forward_' + _this.forwardLayer.name;
        _this.backwardLayer.name = 'backward_' + _this.backwardLayer.name;
        _this.mergeMode = config.mergeMode;
        if (config.weights) {
            throw new errors_1.NotImplementedError('weights support is not implemented for Bidirectional layer yet.');
        }
        _this._stateful = config.layer.stateful;
        _this.returnSequences = config.layer.returnSequences;
        _this.returnState = config.layer.returnState;
        _this.supportsMasking = true;
        _this._trainable = true;
        _this.inputSpec = config.layer.inputSpec;
        return _this;
    }
    Object.defineProperty(Bidirectional.prototype, "trainable", {
        get: function () {
            return this._trainable;
        },
        set: function (value) {
            this._trainable = value;
            if (this.forwardLayer != null) {
                this.forwardLayer.trainable = value;
            }
            if (this.backwardLayer != null) {
                this.backwardLayer.trainable = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Bidirectional.prototype.getWeights = function () {
        return this.forwardLayer.getWeights().concat(this.backwardLayer.getWeights());
    };
    Bidirectional.prototype.setWeights = function (weights) {
        var numWeights = weights.length;
        var numeightsOver2 = Math.floor(numWeights / 2);
        this.forwardLayer.setWeights(weights.slice(0, numeightsOver2));
        this.backwardLayer.setWeights(weights.slice(numeightsOver2));
    };
    Bidirectional.prototype.computeOutputShape = function (inputShape) {
        var layerShapes = this.forwardLayer.computeOutputShape(inputShape);
        if (!(Array.isArray(layerShapes) && Array.isArray(layerShapes[0]))) {
            layerShapes = [layerShapes];
        }
        layerShapes = layerShapes;
        var outputShape;
        var outputShapes;
        var stateShape;
        if (this.returnState) {
            stateShape = layerShapes.slice(1);
            outputShape = layerShapes[0];
        }
        else {
            outputShape = layerShapes[0];
        }
        outputShape = outputShape;
        if (this.mergeMode === BidirectionalMergeMode.CONCAT) {
            outputShape[outputShape.length - 1] *= 2;
            outputShapes = [outputShape];
        }
        else if (this.mergeMode == null) {
            outputShapes = [outputShape, outputShape.slice()];
        }
        else {
            outputShapes = [outputShape];
        }
        if (this.returnState) {
            if (this.mergeMode == null) {
                return outputShapes.concat(stateShape).concat(stateShape.slice());
            }
            return [outputShape].concat(stateShape).concat(stateShape.slice());
        }
        return generic_utils.singletonOrArray(outputShapes);
    };
    Bidirectional.prototype.apply = function (inputs, kwargs) {
        var initialState = null;
        if (kwargs != null) {
            initialState = kwargs['initialState'];
        }
        if (Array.isArray(inputs)) {
            initialState = inputs.slice(1);
            inputs = inputs[0];
        }
        if (initialState == null || initialState.length === 0) {
            var applyOutputs = _super.prototype.apply.call(this, inputs, kwargs);
            return applyOutputs;
        }
        else {
            throw new errors_1.NotImplementedError('The support for initial states is not implemented for ' +
                'Bidirectional layers yet.');
        }
    };
    Bidirectional.prototype.call = function (inputs, kwargs) {
        if (kwargs['mask'] != null) {
            throw new errors_1.NotImplementedError('The support for masking is not implemented for ' +
                'Bidirectional layers yet.');
        }
        if (kwargs['initialState'] != null) {
            throw new errors_1.NotImplementedError('The support for initial states is not implemented for ' +
                'Bidirectional layers yet.');
        }
        var y = this.forwardLayer.call(inputs, kwargs);
        var yRev = this.backwardLayer.call(inputs, kwargs);
        var states;
        if (this.returnState) {
            if (Array.isArray(y)) {
                states = y.slice(1).concat(yRev.slice(1));
            }
            else {
            }
            y = y[0];
            yRev = yRev[0];
        }
        if (this.returnSequences) {
            yRev = K.reverse(yRev, 1);
        }
        var output;
        if (this.mergeMode === BidirectionalMergeMode.CONCAT) {
            output = K.concatenate([y, yRev]);
        }
        else if (this.mergeMode === BidirectionalMergeMode.SUM) {
            output = K.add(y, yRev);
        }
        else if (this.mergeMode === BidirectionalMergeMode.AVE) {
            output = K.scalarTimesArray(K.getScalar(0.5), K.add(y, yRev));
        }
        else if (this.mergeMode === BidirectionalMergeMode.MUL) {
            output = K.multiply(y, yRev);
        }
        else if (this.mergeMode == null) {
            output = [y, yRev];
        }
        if (this.returnState) {
            if (this.mergeMode == null) {
                return output.concat(states);
            }
            return [output].concat(states);
        }
        return output;
    };
    Bidirectional.prototype.resetStates = function (states) {
        this.forwardLayer.resetStates();
        this.backwardLayer.resetStates();
    };
    Bidirectional.prototype.build = function (inputShape) {
        var _this = this;
        K.nameScope(this.forwardLayer.name, function () {
            _this.forwardLayer.build(inputShape);
        });
        K.nameScope(this.backwardLayer.name, function () {
            _this.backwardLayer.build(inputShape);
        });
        this.built = true;
    };
    Object.defineProperty(Bidirectional.prototype, "trainableWeights", {
        get: function () {
            return this.forwardLayer.trainableWeights.concat(this.backwardLayer.trainableWeights);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bidirectional.prototype, "nonTrainableWeights", {
        get: function () {
            return this.forwardLayer.nonTrainableWeights.concat(this.backwardLayer.nonTrainableWeights);
        },
        enumerable: true,
        configurable: true
    });
    Bidirectional.prototype.getClassName = function () {
        return 'Bidirectional';
    };
    return Bidirectional;
}(Wrapper));
exports.Bidirectional = Bidirectional;
generic_utils.ClassNameMap.register('Bidirectional', Bidirectional);

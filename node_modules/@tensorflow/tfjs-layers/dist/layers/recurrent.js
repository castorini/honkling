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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var tfjs_core_1 = require("@tensorflow/tfjs-core");
var activations_1 = require("../activations");
var K = require("../backend/tfjs_backend");
var constraints_1 = require("../constraints");
var topology_1 = require("../engine/topology");
var topology_2 = require("../engine/topology");
var errors_1 = require("../errors");
var initializers_1 = require("../initializers");
var regularizers_1 = require("../regularizers");
var types_1 = require("../types");
var generic_utils = require("../utils/generic_utils");
var math_utils = require("../utils/math_utils");
var serialization_1 = require("./serialization");
var RNN = (function (_super) {
    __extends(RNN, _super);
    function RNN(config) {
        var _this = _super.call(this, config) || this;
        var cell;
        if (config.cell == null) {
            throw new errors_1.ValueError('cell property is missing for the constructor of RNN.');
        }
        else if (Array.isArray(config.cell)) {
            cell = new StackedRNNCells({ cells: config.cell });
        }
        else {
            cell = config.cell;
        }
        if (cell.stateSize == null) {
            throw new errors_1.ValueError('The RNN cell should have an attribute `stateSize` (tuple of ' +
                'integers, one integer per RNN state).');
        }
        _this.cell = cell;
        _this.returnSequences =
            config.returnSequences == null ? false : config.returnSequences;
        _this.returnState = config.returnState == null ? false : config.returnState;
        _this.goBackwards = config.goBackwards == null ? false : config.goBackwards;
        _this._stateful = config.stateful == null ? false : config.stateful;
        _this.unroll = config.unroll == null ? false : config.unroll;
        _this.supportsMasking = true;
        _this.inputSpec = [new topology_1.InputSpec({ ndim: 3 })];
        _this.stateSpec = null;
        _this.states = null;
        _this.numConstants = null;
        return _this;
    }
    RNN.prototype.getStates = function () {
        if (this.states == null) {
            var numStates = Array.isArray(this.cell.stateSize) ? this.cell.stateSize.length : 1;
            return math_utils.range(0, numStates).map(function (x) { return null; });
        }
        else {
            return this.states;
        }
    };
    RNN.prototype.setStates = function (states) {
        this.states = states;
    };
    RNN.prototype.computeOutputShape = function (inputShape) {
        if (generic_utils.isArrayOfShapes(inputShape)) {
            inputShape = inputShape[0];
        }
        inputShape = inputShape;
        var stateSize = this.cell.stateSize;
        if (!Array.isArray(stateSize)) {
            stateSize = [stateSize];
        }
        var outputDim = stateSize[0];
        var outputShape;
        if (this.returnSequences) {
            outputShape = [inputShape[0], inputShape[1], outputDim];
        }
        else {
            outputShape = [inputShape[0], outputDim];
        }
        if (this.returnState) {
            var stateShape = [];
            for (var _i = 0, stateSize_1 = stateSize; _i < stateSize_1.length; _i++) {
                var dim = stateSize_1[_i];
                stateShape.push([inputShape[0], dim]);
            }
            return [outputShape].concat(stateShape);
        }
        else {
            return outputShape;
        }
    };
    RNN.prototype.computeMask = function (inputs, mask) {
        throw new errors_1.NotImplementedError('computeMask has not been implemented for RNN yet');
    };
    RNN.prototype.build = function (inputShape) {
        var constantShape = null;
        if (this.numConstants != null) {
            throw new errors_1.NotImplementedError('Constants support is not implemented in RNN yet.');
        }
        if (generic_utils.isArrayOfShapes(inputShape)) {
            inputShape = inputShape[0];
        }
        inputShape = inputShape;
        var batchSize = this.stateful ? inputShape[0] : null;
        var inputDim = inputShape[inputShape.length - 1];
        this.inputSpec[0] = new topology_1.InputSpec({ shape: [batchSize, null, inputDim] });
        var stepInputShape = [inputShape[0]].concat(inputShape.slice(2));
        if (constantShape != null) {
            throw new errors_1.NotImplementedError('Constants support is not implemented in RNN yet.');
        }
        else {
            this.cell.build(stepInputShape);
        }
        var stateSize;
        if (Array.isArray(this.cell.stateSize)) {
            stateSize = this.cell.stateSize;
        }
        else {
            stateSize = [this.cell.stateSize];
        }
        if (this.stateSpec != null) {
            if (!tfjs_core_1.util.arraysEqual(this.stateSpec.map(function (spec) { return spec.shape[spec.shape.length - 1]; }), stateSize)) {
                throw new errors_1.ValueError("An initialState was passed that is not compatible with " +
                    ("cell.stateSize. Received stateSpec=" + this.stateSpec + "; ") +
                    ("However cell.stateSize is " + this.cell.stateSize));
            }
        }
        else {
            this.stateSpec =
                stateSize.map(function (dim) { return new topology_1.InputSpec({ shape: [null, dim] }); });
        }
        if (this.stateful) {
            throw new errors_1.NotImplementedError('stateful RNN layer is not implemented yet');
        }
    };
    RNN.prototype.resetStates = function (states) {
        if (!this.stateful) {
            throw new errors_1.AttributeError('Cannot call resetState() on an RNN Layer that is not stateful.');
        }
        var batchSize = this.inputSpec[0].shape[0];
        if (batchSize == null) {
            throw new errors_1.ValueError('If an RNN is stateful, it needs to know its batch size. Specify ' +
                'the batch size of your input tensors: \n' +
                '- If using a Sequential model, specify the batch size by passing ' +
                'a `batchInputShape` option to your first layer.\n' +
                '- If using the functional API, specify the batch size by ' +
                'passing a `batchShape` option to your Input layer.');
        }
        if (this.states == null) {
            if (Array.isArray(this.cell.stateSize)) {
                this.states = this.cell.stateSize.map(function (dim) { return K.zeros([batchSize, dim]); });
            }
            else {
                this.states = [K.zeros([batchSize, this.cell.stateSize])];
            }
        }
        else if (states == null) {
            if (Array.isArray(this.cell.stateSize)) {
                this.states = this.cell.stateSize.map(function (dim) { return K.zeros([batchSize, dim]); });
            }
            else {
                this.states[0] = K.zeros([batchSize, this.cell.stateSize]);
            }
        }
        else {
            if (!Array.isArray(states)) {
                states = [states];
            }
            if (states.length !== this.states.length) {
                throw new errors_1.ValueError("Layer " + this.name + " expects " + this.states.length + " state(s), " +
                    ("but it received " + states.length + " state value(s). Input ") +
                    ("received: " + states));
            }
            for (var index = 0; index < this.states.length; ++index) {
                var value = states[index];
                var dim = Array.isArray(this.cell.stateSize) ?
                    this.cell.stateSize[index] :
                    this.cell.stateSize;
                var expectedShape = [batchSize, dim];
                if (!tfjs_core_1.util.arraysEqual(value.shape, expectedShape)) {
                    throw new errors_1.ValueError("State " + index + " is incompatible with layer " + this.name + ": " +
                        ("expected shape=" + expectedShape + ", received shape=" + value.shape));
                }
                this.states[index] = value;
            }
        }
    };
    RNN.prototype.standardizeArgs = function (inputs, initialState, constants) {
        if (Array.isArray(inputs)) {
            if (initialState != null || constants != null) {
                throw new errors_1.ValueError('When inputs is an array, neither initialState or constants ' +
                    'should be provided');
            }
            if (this.numConstants != null) {
                constants =
                    inputs.slice(inputs.length - this.numConstants, inputs.length);
                inputs = inputs.slice(0, inputs.length - this.numConstants);
            }
            if (inputs.length > 1) {
                initialState = inputs.slice(1, inputs.length);
            }
            inputs = inputs[0];
        }
        function toListOrNull(x) {
            if (x == null || Array.isArray(x)) {
                return x;
            }
            else {
                return [x];
            }
        }
        initialState = toListOrNull(initialState);
        constants = toListOrNull(constants);
        return { inputs: inputs, initialState: initialState, constants: constants };
    };
    RNN.prototype.apply = function (inputs, kwargs) {
        var initialState = kwargs == null ? null : kwargs['initialState'];
        var constants = kwargs == null ? null : kwargs['constants'];
        if (kwargs == null) {
            kwargs = {};
        }
        var standardized = this.standardizeArgs(inputs, initialState, constants);
        inputs = standardized.inputs;
        initialState = standardized.initialState;
        constants = standardized.constants;
        var additionalInputs = [];
        var additionalSpecs = [];
        if (initialState != null) {
            kwargs['initialState'] = initialState;
            additionalInputs = additionalInputs.concat(initialState);
            this.stateSpec = [];
            for (var _i = 0, initialState_1 = initialState; _i < initialState_1.length; _i++) {
                var state = initialState_1[_i];
                this.stateSpec.push(new topology_1.InputSpec({ shape: state.shape }));
            }
            additionalSpecs = additionalSpecs.concat(this.stateSpec);
        }
        if (constants != null) {
            kwargs['constants'] = constants;
            additionalInputs = additionalInputs.concat(constants);
            this.numConstants = constants.length;
        }
        var isTensor = additionalInputs[0] instanceof types_1.SymbolicTensor;
        if (isTensor) {
            var fullInput = [inputs].concat(additionalInputs);
            var fullInputSpec = this.inputSpec.concat(additionalSpecs);
            var originalInputSpec = this.inputSpec;
            this.inputSpec = fullInputSpec;
            var output = _super.prototype.apply.call(this, fullInput, kwargs);
            this.inputSpec = originalInputSpec;
            return output;
        }
        else {
            return _super.prototype.apply.call(this, inputs, kwargs);
        }
    };
    RNN.prototype.call = function (inputs, kwargs) {
        var _this = this;
        var mask = kwargs == null ? null : kwargs['mask'];
        var training = kwargs == null ? null : kwargs['training'];
        var initialState = kwargs == null ? null : kwargs['initialState'];
        inputs = generic_utils.getExactlyOneTensor(inputs);
        if (initialState == null) {
            if (this.stateful) {
                throw new errors_1.NotImplementedError('stateful RNN layer is not implemented yet.');
            }
            else {
                initialState = this.getInitialState(inputs);
            }
        }
        if (mask != null) {
            throw new errors_1.NotImplementedError('Masking is not implemented for RNN yet');
        }
        var numStates = Array.isArray(this.cell.stateSize) ? this.cell.stateSize.length : 1;
        if (initialState.length !== numStates) {
            throw new errors_1.ValueError("RNN Layer has " + numStates + " state(s) but was passed " +
                (initialState.length + " initial state(s)."));
        }
        var inputShape = inputs.shape;
        var timesteps = inputShape[1];
        if (this.unroll) {
            console.warn('Ignoring unroll = true for RNN layer, due to imperative backend.');
        }
        var cellCallKwargs = { training: training };
        var step = function (inputs, states) {
            var outputs = _this.cell.call([inputs].concat(states), cellCallKwargs);
            return [outputs[0], outputs.slice(1)];
        };
        var rnnOutputs = K.rnn(step, inputs, initialState, this.goBackwards, null, null, this.unroll, timesteps);
        var lastOutput = rnnOutputs[0];
        var outputs = rnnOutputs[1];
        var states = rnnOutputs[2];
        if (this.stateful) {
            throw new errors_1.NotImplementedError('stateful RNN layer is not implemented yet');
        }
        var output = this.returnSequences ? outputs : lastOutput;
        if (this.returnState) {
            return [output].concat(states);
        }
        else {
            return output;
        }
    };
    RNN.prototype.getInitialState = function (inputs) {
        var initialState = K.zeros(inputs.shape);
        initialState = K.sum(initialState, [1, 2]);
        initialState = K.expandDims(initialState);
        if (Array.isArray(this.cell.stateSize)) {
            return this.cell.stateSize.map(function (dim) { return dim > 1 ? K.tile(initialState, [1, dim]) : initialState; });
        }
        else {
            return this.cell.stateSize > 1 ?
                [K.tile(initialState, [1, this.cell.stateSize])] :
                [initialState];
        }
    };
    Object.defineProperty(RNN.prototype, "trainableWeights", {
        get: function () {
            if (!this.trainable) {
                return [];
            }
            return this.cell.trainableWeights;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RNN.prototype, "nonTrainableWeights", {
        get: function () {
            if (!this.trainable) {
                return this.cell.weights;
            }
            return this.cell.nonTrainableWeights;
        },
        enumerable: true,
        configurable: true
    });
    RNN.prototype.getClassName = function () {
        return 'RNN';
    };
    RNN.prototype.getConfig = function () {
        var config = {
            returnSequences: this.returnSequences,
            returnState: this.returnState,
            goBackwards: this.goBackwards,
            stateful: this.stateful,
            unroll: this.unroll,
        };
        if (this.numConstants != null) {
            config.numConstants = this.numConstants;
        }
        var cellConfig = this.cell.getConfig();
        config.cell = {
            className: this.cell.getClassName(),
            config: cellConfig,
        };
        var baseConfig = _super.prototype.getConfig.call(this);
        Object.assign(config, baseConfig);
        return config;
    };
    return RNN;
}(topology_2.Layer));
exports.RNN = RNN;
generic_utils.ClassNameMap.register('RNN', RNN);
var RNNCell = (function (_super) {
    __extends(RNNCell, _super);
    function RNNCell() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RNNCell = __decorate([
        tfjs_core_1.doc({ heading: 'Layers', subheading: 'Classes' })
    ], RNNCell);
    return RNNCell;
}(topology_2.Layer));
exports.RNNCell = RNNCell;
var SimpleRNNCell = (function (_super) {
    __extends(SimpleRNNCell, _super);
    function SimpleRNNCell(config) {
        var _this = _super.call(this, config) || this;
        _this.DEFAULT_ACTIVATION = 'tanh';
        _this.DEFAULT_KERNEL_INITIALIZER = 'glorotNormal';
        _this.DEFAULT_RECURRENT_INITIALIZER = 'orthogonal';
        _this.DEFAULT_BIAS_INITIALIZER = 'zeros';
        _this.units = config.units;
        _this.activation = activations_1.getActivation(config.activation == null ? _this.DEFAULT_ACTIVATION :
            config.activation);
        _this.useBias = config.useBias == null ? true : config.useBias;
        _this.kernelInitializer = initializers_1.getInitializer(config.kernelInitializer || _this.DEFAULT_KERNEL_INITIALIZER);
        _this.recurrentInitializer = initializers_1.getInitializer(config.recurrentInitializer || _this.DEFAULT_RECURRENT_INITIALIZER);
        _this.biasInitializer =
            initializers_1.getInitializer(config.biasInitializer || _this.DEFAULT_BIAS_INITIALIZER);
        _this.kernelRegularizer = regularizers_1.getRegularizer(config.kernelRegularizer);
        _this.recurrentRegularizer = regularizers_1.getRegularizer(config.recurrentRegularizer);
        _this.biasRegularizer = regularizers_1.getRegularizer(config.biasRegularizer);
        _this.kernelConstraint = constraints_1.getConstraint(config.kernelConstraint);
        _this.recurrentConstraint = constraints_1.getConstraint(config.recurrentConstraint);
        _this.biasConstraint = constraints_1.getConstraint(config.biasConstraint);
        _this.dropout = math_utils.min([1, math_utils.max([0, config.dropout == null ? 0 : config.dropout])]);
        _this.recurrentDropout = math_utils.min([
            1,
            math_utils.max([0, config.recurrentDropout == null ? 0 : config.recurrentDropout])
        ]);
        _this.stateSize = _this.units;
        return _this;
    }
    SimpleRNNCell.prototype.build = function (inputShape) {
        inputShape = generic_utils.getExactlyOneShape(inputShape);
        this.kernel = this.addWeight('kernel', [inputShape[inputShape.length - 1], this.units], null, this.kernelInitializer, this.kernelRegularizer, true, this.kernelConstraint);
        this.recurrentKernel = this.addWeight('recurrent_kernel', [this.units, this.units], null, this.recurrentInitializer, this.recurrentRegularizer, true, this.recurrentConstraint);
        if (this.useBias) {
            this.bias = this.addWeight('bias', [this.units], null, this.biasInitializer, this.biasRegularizer, true, this.biasConstraint);
        }
        else {
            this.bias = null;
        }
        this.built = true;
    };
    SimpleRNNCell.prototype.call = function (inputs, kwargs) {
        inputs = inputs;
        if (inputs.length !== 2) {
            throw new errors_1.ValueError("SimpleRNNCell expects 2 input Tensors, got " + inputs.length + ".");
        }
        var prevOutput = inputs[1];
        inputs = inputs[0];
        if (this.dropout !== 0 || this.recurrentDropout !== 0) {
            throw new errors_1.NotImplementedError('Dropout is not implemented for SimpleRNNCell yet');
        }
        var h = K.dot(inputs, this.kernel.read());
        if (this.bias != null) {
            h = K.biasAdd(h, this.bias.read());
        }
        var output = K.add(h, K.dot(prevOutput, this.recurrentKernel.read()));
        if (this.activation != null) {
            output = this.activation(output);
        }
        return [output, output];
    };
    SimpleRNNCell.prototype.getClassName = function () {
        return 'SimpleRNNCell';
    };
    SimpleRNNCell.prototype.getConfig = function () {
        var config = {
            units: this.units,
            activation: activations_1.serializeActivation(this.activation),
            useBias: this.useBias,
            kernelInitializer: initializers_1.serializeInitializer(this.kernelInitializer),
            recurrentInitializer: initializers_1.serializeInitializer(this.recurrentInitializer),
            biasInitializer: initializers_1.serializeInitializer(this.biasInitializer),
            kernelRegularizer: regularizers_1.serializeRegularizer(this.kernelRegularizer),
            recurrentRegularizer: regularizers_1.serializeRegularizer(this.recurrentRegularizer),
            biasRegularizer: regularizers_1.serializeRegularizer(this.biasRegularizer),
            activityRegularizer: regularizers_1.serializeRegularizer(this.activityRegularizer),
            kernelConstraint: constraints_1.serializeConstraint(this.kernelConstraint),
            recurrentConstraint: constraints_1.serializeConstraint(this.recurrentConstraint),
            biasConstraint: constraints_1.serializeConstraint(this.biasConstraint),
            dropout: this.dropout,
            recurrentDropout: this.recurrentDropout,
        };
        var baseConfig = _super.prototype.getConfig.call(this);
        Object.assign(config, baseConfig);
        return config;
    };
    return SimpleRNNCell;
}(RNNCell));
exports.SimpleRNNCell = SimpleRNNCell;
generic_utils.ClassNameMap.register('SimpleRNNCell', SimpleRNNCell);
var SimpleRNN = (function (_super) {
    __extends(SimpleRNN, _super);
    function SimpleRNN(config) {
        var _this = this;
        config.cell = new SimpleRNNCell(config);
        _this = _super.call(this, config) || this;
        return _this;
    }
    SimpleRNN.prototype.call = function (inputs, kwargs) {
        var mask = kwargs == null ? null : kwargs['mask'];
        var training = kwargs == null ? null : kwargs['training'];
        var initialState = kwargs == null ? null : kwargs['initialState'];
        return _super.prototype.call.call(this, inputs, { mask: mask, training: training, initialState: initialState });
    };
    Object.defineProperty(SimpleRNN.prototype, "units", {
        get: function () {
            return this.cell.units;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleRNN.prototype, "activation", {
        get: function () {
            return this.cell.activation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleRNN.prototype, "useBias", {
        get: function () {
            return this.cell.useBias;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleRNN.prototype, "kernelInitializer", {
        get: function () {
            return this.cell.kernelInitializer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleRNN.prototype, "recurrentInitializer", {
        get: function () {
            return this.cell.recurrentInitializer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleRNN.prototype, "biasInitializer", {
        get: function () {
            return this.cell.biasInitializer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleRNN.prototype, "kernelRegularizer", {
        get: function () {
            return this.cell.kernelRegularizer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleRNN.prototype, "recurrentRegularizer", {
        get: function () {
            return this.cell.recurrentRegularizer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleRNN.prototype, "biasRegularizer", {
        get: function () {
            return this.cell.biasRegularizer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleRNN.prototype, "kernelConstraint", {
        get: function () {
            return this.cell.kernelConstraint;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleRNN.prototype, "recurrentConstraint", {
        get: function () {
            return this.cell.recurrentConstraint;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleRNN.prototype, "biasConstraint", {
        get: function () {
            return this.cell.biasConstraint;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleRNN.prototype, "dropout", {
        get: function () {
            return this.cell.dropout;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleRNN.prototype, "recurrentDropout", {
        get: function () {
            return this.cell.recurrentDropout;
        },
        enumerable: true,
        configurable: true
    });
    SimpleRNN.prototype.getClassName = function () {
        return 'SimpleRNN';
    };
    SimpleRNN.prototype.getConfig = function () {
        var config = {
            units: this.units,
            activation: activations_1.serializeActivation(this.activation),
            useBias: this.useBias,
            kernelInitializer: initializers_1.serializeInitializer(this.kernelInitializer),
            recurrentInitializer: initializers_1.serializeInitializer(this.recurrentInitializer),
            biasInitializer: initializers_1.serializeInitializer(this.biasInitializer),
            kernelRegularizer: regularizers_1.serializeRegularizer(this.kernelRegularizer),
            recurrentRegularizer: regularizers_1.serializeRegularizer(this.recurrentRegularizer),
            biasRegularizer: regularizers_1.serializeRegularizer(this.biasRegularizer),
            activityRegularizer: regularizers_1.serializeRegularizer(this.activityRegularizer),
            kernelConstraint: constraints_1.serializeConstraint(this.kernelConstraint),
            recurrentConstraint: constraints_1.serializeConstraint(this.recurrentConstraint),
            biasConstraint: constraints_1.serializeConstraint(this.biasConstraint),
            dropout: this.dropout,
            recurrentDropout: this.recurrentDropout,
        };
        var baseConfig = _super.prototype.getConfig.call(this);
        Object.assign(config, baseConfig);
        return config;
    };
    return SimpleRNN;
}(RNN));
exports.SimpleRNN = SimpleRNN;
generic_utils.ClassNameMap.register('SimpleRNN', SimpleRNN);
var GRUCell = (function (_super) {
    __extends(GRUCell, _super);
    function GRUCell(config) {
        var _this = _super.call(this, config) || this;
        _this.DEFAULT_ACTIVATION = 'tanh';
        _this.DEFAULT_RECURRENT_ACTIVATION = 'hardSigmoid';
        _this.DEFAULT_KERNEL_INITIALIZER = 'glorotNormal';
        _this.DEFAULT_RECURRENT_INITIALIZER = 'orthogonal';
        _this.DEFAULT_BIAS_INITIALIZER = 'zeros';
        _this.units = config.units;
        _this.activation = activations_1.getActivation(config.activation === undefined ? _this.DEFAULT_ACTIVATION :
            config.activation);
        _this.recurrentActivation = activations_1.getActivation(config.activation === undefined ? _this.DEFAULT_RECURRENT_ACTIVATION :
            config.recurrentActivation);
        _this.useBias = config.useBias == null ? true : config.useBias;
        _this.kernelInitializer = initializers_1.getInitializer(config.kernelInitializer || _this.DEFAULT_KERNEL_INITIALIZER);
        _this.recurrentInitializer = initializers_1.getInitializer(config.recurrentInitializer || _this.DEFAULT_RECURRENT_INITIALIZER);
        _this.biasInitializer =
            initializers_1.getInitializer(config.biasInitializer || _this.DEFAULT_BIAS_INITIALIZER);
        _this.kernelRegularizer = regularizers_1.getRegularizer(config.kernelRegularizer);
        _this.recurrentRegularizer = regularizers_1.getRegularizer(config.recurrentRegularizer);
        _this.biasRegularizer = regularizers_1.getRegularizer(config.biasRegularizer);
        _this.kernelConstraint = constraints_1.getConstraint(config.kernelConstraint);
        _this.recurrentConstraint = constraints_1.getConstraint(config.recurrentConstraint);
        _this.biasConstraint = constraints_1.getConstraint(config.biasConstraint);
        _this.dropout = math_utils.min([1, math_utils.max([0, config.dropout == null ? 0 : config.dropout])]);
        _this.recurrentDropout = math_utils.min([
            1,
            math_utils.max([0, config.recurrentDropout == null ? 0 : config.recurrentDropout])
        ]);
        _this.implementation = config.implementation;
        _this.stateSize = _this.units;
        return _this;
    }
    GRUCell.prototype.build = function (inputShape) {
        inputShape = generic_utils.getExactlyOneShape(inputShape);
        var inputDim = inputShape[inputShape.length - 1];
        this.kernel = this.addWeight('kernel', [inputDim, this.units * 3], null, this.kernelInitializer, this.kernelRegularizer, true, this.kernelConstraint);
        this.recurrentKernel = this.addWeight('recurrent_kernel', [this.units, this.units * 3], null, this.recurrentInitializer, this.recurrentRegularizer, true, this.recurrentConstraint);
        if (this.useBias) {
            this.bias = this.addWeight('bias', [this.units * 3], null, this.biasInitializer, this.biasRegularizer, true, this.biasConstraint);
        }
        else {
            this.bias = null;
        }
        this.built = true;
    };
    GRUCell.prototype.call = function (inputs, kwargs) {
        if (this.dropout !== 0 || this.recurrentDropout !== 0) {
            throw new errors_1.NotImplementedError('Dropout is not implemented for GRUCell yet');
        }
        inputs = inputs;
        if (inputs.length !== 2) {
            throw new errors_1.ValueError("GRUCell expects 2 input Tensors (inputs, h, c), got " +
                (inputs.length + "."));
        }
        var hTMinus1 = inputs[1];
        inputs = inputs[0];
        var z;
        var r;
        var hh;
        if (this.implementation === 1) {
            var kernelZ = K.sliceAlongLastAxis(this.kernel.read(), 0, this.units);
            var kernelR = K.sliceAlongLastAxis(this.kernel.read(), this.units, this.units);
            var kernelH = K.sliceAlongLastAxis(this.kernel.read(), this.units * 2, this.units);
            var recurrentKernelZ = K.sliceAlongLastAxis(this.recurrentKernel.read(), 0, this.units);
            var recurrentKernelR = K.sliceAlongLastAxis(this.recurrentKernel.read(), this.units, this.units);
            var recurrentKernelH = K.sliceAlongLastAxis(this.recurrentKernel.read(), this.units * 2, this.units);
            var inputsZ = inputs;
            var inputsR = inputs;
            var inputsH = inputs;
            var xZ = K.dot(inputsZ, kernelZ);
            var xR = K.dot(inputsR, kernelR);
            var xH = K.dot(inputsH, kernelH);
            if (this.useBias) {
                var biasZ = K.sliceAlongFirstAxis(this.bias.read(), 0, this.units);
                var biasR = K.sliceAlongFirstAxis(this.bias.read(), this.units, this.units);
                var biasH = K.sliceAlongFirstAxis(this.bias.read(), this.units * 2, this.units);
                xZ = K.biasAdd(xZ, biasZ);
                xR = K.biasAdd(xR, biasR);
                xH = K.biasAdd(xH, biasH);
            }
            var hTMinus1Z = hTMinus1;
            var hTMinus1R = hTMinus1;
            var hTMinus1H = hTMinus1;
            z = this.recurrentActivation(K.add(xZ, K.dot(hTMinus1Z, recurrentKernelZ)));
            r = this.recurrentActivation(K.add(xR, K.dot(hTMinus1R, recurrentKernelR)));
            hh = this.activation(K.add(xH, K.dot(K.multiply(r, hTMinus1H), recurrentKernelH)));
        }
        else {
            var matrixX = K.dot(inputs, this.kernel.read());
            if (this.useBias) {
                matrixX = K.biasAdd(matrixX, this.bias.read());
            }
            var matrixInner = K.dot(hTMinus1, K.sliceAlongLastAxis(this.recurrentKernel.read(), 0, 2 * this.units));
            var xZ = K.sliceAlongLastAxis(matrixX, 0, this.units);
            var xR = K.sliceAlongLastAxis(matrixX, this.units, this.units);
            var recurrentZ = K.sliceAlongLastAxis(matrixInner, 0, this.units);
            var recurrentR = K.sliceAlongLastAxis(matrixInner, this.units, this.units);
            z = this.recurrentActivation(K.add(xZ, recurrentZ));
            r = this.recurrentActivation(K.add(xR, recurrentR));
            var xH = K.sliceAlongLastAxis(matrixX, 2 * this.units, this.units);
            var recurrentH = K.dot(K.multiply(r, hTMinus1), K.sliceAlongLastAxis(this.recurrentKernel.read(), 2 * this.units, this.units));
            hh = this.activation(K.add(xH, recurrentH));
        }
        var h = K.add(K.multiply(z, hTMinus1), K.multiply(K.scalarPlusArray(K.getScalar(1), K.neg(z)), hh));
        return [h, h];
    };
    GRUCell.prototype.getClassName = function () {
        return 'GRUCell';
    };
    GRUCell.prototype.getConfig = function () {
        var config = {
            units: this.units,
            activation: activations_1.serializeActivation(this.activation),
            useBias: this.useBias,
            kernelInitializer: initializers_1.serializeInitializer(this.kernelInitializer),
            recurrentInitializer: initializers_1.serializeInitializer(this.recurrentInitializer),
            biasInitializer: initializers_1.serializeInitializer(this.biasInitializer),
            kernelRegularizer: regularizers_1.serializeRegularizer(this.kernelRegularizer),
            recurrentRegularizer: regularizers_1.serializeRegularizer(this.recurrentRegularizer),
            biasRegularizer: regularizers_1.serializeRegularizer(this.biasRegularizer),
            activityRegularizer: regularizers_1.serializeRegularizer(this.activityRegularizer),
            kernelConstraint: constraints_1.serializeConstraint(this.kernelConstraint),
            recurrentConstraint: constraints_1.serializeConstraint(this.recurrentConstraint),
            biasConstraint: constraints_1.serializeConstraint(this.biasConstraint),
            dropout: this.dropout,
            recurrentDropout: this.recurrentDropout,
            implementation: this.implementation,
        };
        var baseConfig = _super.prototype.getConfig.call(this);
        Object.assign(config, baseConfig);
        return config;
    };
    return GRUCell;
}(RNNCell));
exports.GRUCell = GRUCell;
generic_utils.ClassNameMap.register('GRUCell', GRUCell);
var GRU = (function (_super) {
    __extends(GRU, _super);
    function GRU(config) {
        var _this = this;
        if (config.implementation === 0) {
            console.warn('`implementation=0` has been deprecated, and now defaults to ' +
                '`implementation=1`. Please update your layer call.');
        }
        config.cell = new GRUCell(config);
        _this = _super.call(this, config) || this;
        return _this;
    }
    GRU.prototype.call = function (inputs, kwargs) {
        var mask = kwargs == null ? null : kwargs['mask'];
        var training = kwargs == null ? null : kwargs['training'];
        var initialState = kwargs == null ? null : kwargs['initialState'];
        return _super.prototype.call.call(this, inputs, { mask: mask, training: training, initialState: initialState });
    };
    Object.defineProperty(GRU.prototype, "units", {
        get: function () {
            return this.cell.units;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GRU.prototype, "activation", {
        get: function () {
            return this.cell.activation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GRU.prototype, "useBias", {
        get: function () {
            return this.cell.useBias;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GRU.prototype, "kernelInitializer", {
        get: function () {
            return this.cell.kernelInitializer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GRU.prototype, "recurrentInitializer", {
        get: function () {
            return this.cell.recurrentInitializer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GRU.prototype, "biasInitializer", {
        get: function () {
            return this.cell.biasInitializer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GRU.prototype, "kernelRegularizer", {
        get: function () {
            return this.cell.kernelRegularizer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GRU.prototype, "recurrentRegularizer", {
        get: function () {
            return this.cell.recurrentRegularizer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GRU.prototype, "biasRegularizer", {
        get: function () {
            return this.cell.biasRegularizer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GRU.prototype, "kernelConstraint", {
        get: function () {
            return this.cell.kernelConstraint;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GRU.prototype, "recurrentConstraint", {
        get: function () {
            return this.cell.recurrentConstraint;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GRU.prototype, "biasConstraint", {
        get: function () {
            return this.cell.biasConstraint;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GRU.prototype, "dropout", {
        get: function () {
            return this.cell.dropout;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GRU.prototype, "recurrentDropout", {
        get: function () {
            return this.cell.recurrentDropout;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GRU.prototype, "implementation", {
        get: function () {
            return this.cell.implementation;
        },
        enumerable: true,
        configurable: true
    });
    GRU.prototype.getClassName = function () {
        return 'GRU';
    };
    GRU.prototype.getConfig = function () {
        var config = {
            units: this.units,
            activation: activations_1.serializeActivation(this.activation),
            useBias: this.useBias,
            kernelInitializer: initializers_1.serializeInitializer(this.kernelInitializer),
            recurrentInitializer: initializers_1.serializeInitializer(this.recurrentInitializer),
            biasInitializer: initializers_1.serializeInitializer(this.biasInitializer),
            kernelRegularizer: regularizers_1.serializeRegularizer(this.kernelRegularizer),
            recurrentRegularizer: regularizers_1.serializeRegularizer(this.recurrentRegularizer),
            biasRegularizer: regularizers_1.serializeRegularizer(this.biasRegularizer),
            activityRegularizer: regularizers_1.serializeRegularizer(this.activityRegularizer),
            kernelConstraint: constraints_1.serializeConstraint(this.kernelConstraint),
            recurrentConstraint: constraints_1.serializeConstraint(this.recurrentConstraint),
            biasConstraint: constraints_1.serializeConstraint(this.biasConstraint),
            dropout: this.dropout,
            recurrentDropout: this.recurrentDropout,
            implementation: this.implementation,
        };
        var baseConfig = _super.prototype.getConfig.call(this);
        Object.assign(config, baseConfig);
        return config;
    };
    GRU.fromConfig = function (cls, config) {
        if (config['implmentation'] === 0) {
            config['implementation'] = 1;
        }
        return new cls(config);
    };
    return GRU;
}(RNN));
exports.GRU = GRU;
generic_utils.ClassNameMap.register('GRU', GRU);
var LSTMCell = (function (_super) {
    __extends(LSTMCell, _super);
    function LSTMCell(config) {
        var _this = _super.call(this, config) || this;
        _this.DEFAULT_ACTIVATION = 'tanh';
        _this.DEFAULT_RECURRENT_ACTIVATION = 'hardSigmoid';
        _this.DEFAULT_KERNEL_INITIALIZER = 'glorotNormal';
        _this.DEFAULT_RECURRENT_INITIALIZER = 'orthogonal';
        _this.DEFAULT_BIAS_INITIALIZER = 'zeros';
        _this.units = config.units;
        _this.activation = activations_1.getActivation(config.activation === undefined ? _this.DEFAULT_ACTIVATION :
            config.activation);
        _this.recurrentActivation = activations_1.getActivation(config.activation === undefined ? _this.DEFAULT_RECURRENT_ACTIVATION :
            config.recurrentActivation);
        _this.useBias = config.useBias == null ? true : config.useBias;
        _this.kernelInitializer = initializers_1.getInitializer(config.kernelInitializer || _this.DEFAULT_KERNEL_INITIALIZER);
        _this.recurrentInitializer = initializers_1.getInitializer(config.recurrentInitializer || _this.DEFAULT_RECURRENT_INITIALIZER);
        _this.biasInitializer =
            initializers_1.getInitializer(config.biasInitializer || _this.DEFAULT_BIAS_INITIALIZER);
        _this.unitForgetBias = config.unitForgetBias;
        _this.kernelRegularizer = regularizers_1.getRegularizer(config.kernelRegularizer);
        _this.recurrentRegularizer = regularizers_1.getRegularizer(config.recurrentRegularizer);
        _this.biasRegularizer = regularizers_1.getRegularizer(config.biasRegularizer);
        _this.kernelConstraint = constraints_1.getConstraint(config.kernelConstraint);
        _this.recurrentConstraint = constraints_1.getConstraint(config.recurrentConstraint);
        _this.biasConstraint = constraints_1.getConstraint(config.biasConstraint);
        _this.dropout = math_utils.min([1, math_utils.max([0, config.dropout == null ? 0 : config.dropout])]);
        _this.recurrentDropout = math_utils.min([
            1,
            math_utils.max([0, config.recurrentDropout == null ? 0 : config.recurrentDropout])
        ]);
        _this.implementation = config.implementation;
        _this.stateSize = [_this.units, _this.units];
        return _this;
    }
    LSTMCell.prototype.build = function (inputShape) {
        inputShape = generic_utils.getExactlyOneShape(inputShape);
        var inputDim = inputShape[inputShape.length - 1];
        this.kernel = this.addWeight('kernel', [inputDim, this.units * 4], null, this.kernelInitializer, this.kernelRegularizer, true, this.kernelConstraint);
        this.recurrentKernel = this.addWeight('recurrent_kernel', [this.units, this.units * 4], null, this.recurrentInitializer, this.recurrentRegularizer, true, this.recurrentConstraint);
        var biasInitializer;
        if (this.useBias) {
            if (this.unitForgetBias) {
                var capturedBiasInit_1 = this.biasInitializer;
                var capturedUnits_1 = this.units;
                biasInitializer = new ((function (_super) {
                    __extends(CustomInit, _super);
                    function CustomInit() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    CustomInit.prototype.apply = function (shape, dtype) {
                        var bI = capturedBiasInit_1.apply([capturedUnits_1]);
                        var bF = (new initializers_1.Ones()).apply([capturedUnits_1]);
                        var bCAndH = capturedBiasInit_1.apply([capturedUnits_1 * 2]);
                        return K.concatAlongFirstAxis(K.concatAlongFirstAxis(bI, bF), bCAndH);
                    };
                    CustomInit.prototype.getClassName = function () {
                        return 'CustomInit';
                    };
                    return CustomInit;
                }(initializers_1.Initializer)))();
            }
            else {
                biasInitializer = this.biasInitializer;
            }
            this.bias = this.addWeight('bias', [this.units * 4], null, biasInitializer, this.biasRegularizer, true, this.biasConstraint);
        }
        else {
            this.bias = null;
        }
        this.built = true;
    };
    LSTMCell.prototype.call = function (inputs, kwargs) {
        if (this.dropout !== 0 || this.recurrentDropout !== 0) {
            throw new errors_1.NotImplementedError('Dropout is not implemented for LSTMCell yet');
        }
        inputs = inputs;
        if (inputs.length !== 3) {
            throw new errors_1.ValueError("LSTMCell expects 3 input Tensors (inputs, h, c), got " +
                (inputs.length + "."));
        }
        var hTMinus1 = inputs[1];
        var cTMinus1 = inputs[2];
        inputs = inputs[0];
        var i;
        var f;
        var c;
        var o;
        if (this.implementation === 1) {
            var kernelI = K.sliceAlongLastAxis(this.kernel.read(), 0, this.units);
            var kernelF = K.sliceAlongLastAxis(this.kernel.read(), this.units, this.units);
            var kernelC = K.sliceAlongLastAxis(this.kernel.read(), this.units * 2, this.units);
            var kernelO = K.sliceAlongLastAxis(this.kernel.read(), this.units * 3, this.units);
            var recurrentKernelI = K.sliceAlongLastAxis(this.recurrentKernel.read(), 0, this.units);
            var recurrentKernelF = K.sliceAlongLastAxis(this.recurrentKernel.read(), this.units, this.units);
            var recurrentKernelC = K.sliceAlongLastAxis(this.recurrentKernel.read(), this.units * 2, this.units);
            var recurrentKernelO = K.sliceAlongLastAxis(this.recurrentKernel.read(), this.units * 3, this.units);
            var inputsI = inputs;
            var inputsF = inputs;
            var inputsC = inputs;
            var inputsO = inputs;
            var xI = K.dot(inputsI, kernelI);
            var xF = K.dot(inputsF, kernelF);
            var xC = K.dot(inputsC, kernelC);
            var xO = K.dot(inputsO, kernelO);
            if (this.useBias) {
                var biasI = K.sliceAlongFirstAxis(this.bias.read(), 0, this.units);
                var biasF = K.sliceAlongFirstAxis(this.bias.read(), this.units, this.units);
                var biasC = K.sliceAlongFirstAxis(this.bias.read(), this.units * 2, this.units);
                var biasO = K.sliceAlongFirstAxis(this.bias.read(), this.units * 3, this.units);
                xI = K.biasAdd(xI, biasI);
                xF = K.biasAdd(xF, biasF);
                xC = K.biasAdd(xC, biasC);
                xO = K.biasAdd(xO, biasO);
            }
            var hTMinus1I = hTMinus1;
            var hTMinus1F = hTMinus1;
            var hTMinus1C = hTMinus1;
            var hTMinus1O = hTMinus1;
            i = this.recurrentActivation(K.add(xI, K.dot(hTMinus1I, recurrentKernelI)));
            f = this.recurrentActivation(K.add(xF, K.dot(hTMinus1F, recurrentKernelF)));
            c = K.add(K.multiply(f, cTMinus1), K.multiply(i, this.activation(K.add(xC, K.dot(hTMinus1C, recurrentKernelC)))));
            o = this.recurrentActivation(K.add(xO, K.dot(hTMinus1O, recurrentKernelO)));
        }
        else {
            var z = K.dot(inputs, this.kernel.read());
            z = K.add(z, K.dot(hTMinus1, this.recurrentKernel.read()));
            if (this.useBias) {
                z = K.biasAdd(z, this.bias.read());
            }
            var z0 = K.sliceAlongLastAxis(z, 0, this.units);
            var z1 = K.sliceAlongLastAxis(z, this.units, this.units);
            var z2 = K.sliceAlongLastAxis(z, this.units * 2, this.units);
            var z3 = K.sliceAlongLastAxis(z, this.units * 3, this.units);
            i = this.recurrentActivation(z0);
            f = this.recurrentActivation(z1);
            c = K.add(K.multiply(f, cTMinus1), K.multiply(i, this.activation(z2)));
            o = this.recurrentActivation(z3);
        }
        var h = K.multiply(o, this.activation(c));
        return [h, h, c];
    };
    LSTMCell.prototype.getClassName = function () {
        return 'LSTMCell';
    };
    LSTMCell.prototype.getConfig = function () {
        var config = {
            units: this.units,
            activation: activations_1.serializeActivation(this.activation),
            useBias: this.useBias,
            kernelInitializer: initializers_1.serializeInitializer(this.kernelInitializer),
            recurrentInitializer: initializers_1.serializeInitializer(this.recurrentInitializer),
            biasInitializer: initializers_1.serializeInitializer(this.biasInitializer),
            unitForgetBias: this.unitForgetBias,
            kernelRegularizer: regularizers_1.serializeRegularizer(this.kernelRegularizer),
            recurrentRegularizer: regularizers_1.serializeRegularizer(this.recurrentRegularizer),
            biasRegularizer: regularizers_1.serializeRegularizer(this.biasRegularizer),
            activityRegularizer: regularizers_1.serializeRegularizer(this.activityRegularizer),
            kernelConstraint: constraints_1.serializeConstraint(this.kernelConstraint),
            recurrentConstraint: constraints_1.serializeConstraint(this.recurrentConstraint),
            biasConstraint: constraints_1.serializeConstraint(this.biasConstraint),
            dropout: this.dropout,
            recurrentDropout: this.recurrentDropout,
            implementation: this.implementation,
        };
        var baseConfig = _super.prototype.getConfig.call(this);
        Object.assign(config, baseConfig);
        return config;
    };
    return LSTMCell;
}(RNNCell));
exports.LSTMCell = LSTMCell;
generic_utils.ClassNameMap.register('LSTMCell', LSTMCell);
var LSTM = (function (_super) {
    __extends(LSTM, _super);
    function LSTM(config) {
        var _this = this;
        if (config.implementation === 0) {
            console.warn('`implementation=0` has been deprecated, and now defaults to ' +
                '`implementation=1`. Please update your layer call.');
        }
        config.cell = new LSTMCell(config);
        _this = _super.call(this, config) || this;
        return _this;
    }
    LSTM.prototype.call = function (inputs, kwargs) {
        var mask = kwargs == null ? null : kwargs['mask'];
        var training = kwargs == null ? null : kwargs['training'];
        var initialState = kwargs == null ? null : kwargs['initialState'];
        return _super.prototype.call.call(this, inputs, { mask: mask, training: training, initialState: initialState });
    };
    Object.defineProperty(LSTM.prototype, "units", {
        get: function () {
            return this.cell.units;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LSTM.prototype, "activation", {
        get: function () {
            return this.cell.activation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LSTM.prototype, "useBias", {
        get: function () {
            return this.cell.useBias;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LSTM.prototype, "kernelInitializer", {
        get: function () {
            return this.cell.kernelInitializer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LSTM.prototype, "recurrentInitializer", {
        get: function () {
            return this.cell.recurrentInitializer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LSTM.prototype, "biasInitializer", {
        get: function () {
            return this.cell.biasInitializer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LSTM.prototype, "unitForgetBias", {
        get: function () {
            return this.cell.unitForgetBias;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LSTM.prototype, "kernelRegularizer", {
        get: function () {
            return this.cell.kernelRegularizer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LSTM.prototype, "recurrentRegularizer", {
        get: function () {
            return this.cell.recurrentRegularizer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LSTM.prototype, "biasRegularizer", {
        get: function () {
            return this.cell.biasRegularizer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LSTM.prototype, "kernelConstraint", {
        get: function () {
            return this.cell.kernelConstraint;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LSTM.prototype, "recurrentConstraint", {
        get: function () {
            return this.cell.recurrentConstraint;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LSTM.prototype, "biasConstraint", {
        get: function () {
            return this.cell.biasConstraint;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LSTM.prototype, "dropout", {
        get: function () {
            return this.cell.dropout;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LSTM.prototype, "recurrentDropout", {
        get: function () {
            return this.cell.recurrentDropout;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LSTM.prototype, "implementation", {
        get: function () {
            return this.cell.implementation;
        },
        enumerable: true,
        configurable: true
    });
    LSTM.prototype.getClassName = function () {
        return 'LSTM';
    };
    LSTM.prototype.getConfig = function () {
        var config = {
            units: this.units,
            activation: activations_1.serializeActivation(this.activation),
            useBias: this.useBias,
            kernelInitializer: initializers_1.serializeInitializer(this.kernelInitializer),
            recurrentInitializer: initializers_1.serializeInitializer(this.recurrentInitializer),
            biasInitializer: initializers_1.serializeInitializer(this.biasInitializer),
            unitForgetBias: this.unitForgetBias,
            kernelRegularizer: regularizers_1.serializeRegularizer(this.kernelRegularizer),
            recurrentRegularizer: regularizers_1.serializeRegularizer(this.recurrentRegularizer),
            biasRegularizer: regularizers_1.serializeRegularizer(this.biasRegularizer),
            activityRegularizer: regularizers_1.serializeRegularizer(this.activityRegularizer),
            kernelConstraint: constraints_1.serializeConstraint(this.kernelConstraint),
            recurrentConstraint: constraints_1.serializeConstraint(this.recurrentConstraint),
            biasConstraint: constraints_1.serializeConstraint(this.biasConstraint),
            dropout: this.dropout,
            recurrentDropout: this.recurrentDropout,
            implementation: this.implementation,
        };
        var baseConfig = _super.prototype.getConfig.call(this);
        Object.assign(config, baseConfig);
        return config;
    };
    LSTM.fromConfig = function (cls, config) {
        if (config['implmentation'] === 0) {
            config['implementation'] = 1;
        }
        return new cls(config);
    };
    return LSTM;
}(RNN));
exports.LSTM = LSTM;
generic_utils.ClassNameMap.register('LSTM', LSTM);
var StackedRNNCells = (function (_super) {
    __extends(StackedRNNCells, _super);
    function StackedRNNCells(config) {
        var _this = _super.call(this, config) || this;
        _this.cells = config.cells;
        return _this;
    }
    Object.defineProperty(StackedRNNCells.prototype, "stateSize", {
        get: function () {
            var stateSize = [];
            for (var _i = 0, _a = this.cells.slice().reverse(); _i < _a.length; _i++) {
                var cell = _a[_i];
                if (Array.isArray(cell.stateSize)) {
                    stateSize.push.apply(stateSize, cell.stateSize);
                }
                else {
                    stateSize.push(cell.stateSize);
                }
            }
            return stateSize;
        },
        enumerable: true,
        configurable: true
    });
    StackedRNNCells.prototype.call = function (inputs, kwargs) {
        inputs = inputs;
        var states = inputs.slice(1);
        var nestedStates = [];
        for (var _i = 0, _a = this.cells.slice().reverse(); _i < _a.length; _i++) {
            var cell = _a[_i];
            if (Array.isArray(cell.stateSize)) {
                nestedStates.push(states.splice(0, cell.stateSize.length));
            }
            else {
                nestedStates.push(states.splice(0, 1));
            }
        }
        nestedStates.reverse();
        var newNestedStates = [];
        var callInputs;
        for (var i = 0; i < this.cells.length; ++i) {
            var cell = this.cells[i];
            states = nestedStates[i];
            if (i === 0) {
                callInputs = [inputs[0]].concat(states);
            }
            else {
                callInputs = [callInputs[0]].concat(states);
            }
            callInputs = cell.call(callInputs, kwargs);
            newNestedStates.push(callInputs.slice(1));
        }
        states = [];
        for (var _b = 0, _c = newNestedStates.slice().reverse(); _b < _c.length; _b++) {
            var cellStates = _c[_b];
            states.push.apply(states, cellStates);
        }
        return [callInputs[0]].concat(states);
    };
    StackedRNNCells.prototype.build = function (inputShape) {
        if (generic_utils.isArrayOfShapes(inputShape)) {
            inputShape = inputShape[0];
        }
        inputShape = inputShape;
        var outputDim;
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            cell.build(inputShape);
            if (Array.isArray(cell.stateSize)) {
                outputDim = cell.stateSize[0];
            }
            else {
                outputDim = cell.stateSize;
            }
            inputShape = [inputShape[0], outputDim];
        }
        this.built = true;
    };
    StackedRNNCells.prototype.getClassName = function () {
        return 'StackedRNNCells';
    };
    StackedRNNCells.prototype.getConfig = function () {
        var cellConfigs = [];
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            cellConfigs.push({
                'className': this.getClassName(),
                'config': cell.getConfig(),
            });
        }
        var config = { 'cells': cellConfigs };
        var baseConfig = _super.prototype.getConfig.call(this);
        Object.assign(config, baseConfig);
        return config;
    };
    StackedRNNCells.fromConfig = function (cls, config, customObjects) {
        if (customObjects === void 0) { customObjects = {}; }
        var cells = [];
        for (var _i = 0, _a = config['cells']; _i < _a.length; _i++) {
            var cellConfig = _a[_i];
            cells.push(serialization_1.deserialize(cellConfig, customObjects));
        }
        return new cls({ cells: cells });
    };
    Object.defineProperty(StackedRNNCells.prototype, "trainableWeights", {
        get: function () {
            if (!this.trainable) {
                return [];
            }
            var weights = [];
            for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
                var cell = _a[_i];
                weights.push.apply(weights, cell.trainableWeights);
            }
            return weights;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StackedRNNCells.prototype, "nonTrainableWeights", {
        get: function () {
            var weights = [];
            for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
                var cell = _a[_i];
                weights.push.apply(weights, cell.nonTrainableWeights);
            }
            if (!this.trainable) {
                var trainableWeights = [];
                for (var _b = 0, _c = this.cells; _b < _c.length; _b++) {
                    var cell = _c[_b];
                    trainableWeights.push.apply(trainableWeights, cell.trainableWeights);
                }
                return trainableWeights.concat(weights);
            }
            return weights;
        },
        enumerable: true,
        configurable: true
    });
    StackedRNNCells.prototype.getWeights = function () {
        var weights = [];
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            weights.push.apply(weights, cell.weights);
        }
        return K.batchGetValue(weights);
    };
    StackedRNNCells.prototype.setWeights = function (weights) {
        var tuples = [];
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            var numParams = cell.weights.length;
            var inputWeights = weights.splice(numParams);
            for (var i = 0; i < cell.weights.length; ++i) {
                tuples.push([cell.weights[i], inputWeights[i]]);
            }
        }
        K.batchSetValue(tuples);
    };
    return StackedRNNCells;
}(RNNCell));
exports.StackedRNNCells = StackedRNNCells;
generic_utils.ClassNameMap.register('StackedRNNCells', StackedRNNCells);

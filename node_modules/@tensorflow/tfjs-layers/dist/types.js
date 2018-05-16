"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var tfjs_core_1 = require("@tensorflow/tfjs-core");
var common_1 = require("./common");
var DType;
(function (DType) {
    DType["float32"] = "float32";
    DType["int32"] = "int32";
    DType["bool"] = "bool";
})(DType = exports.DType || (exports.DType = {}));
var _nextUniqueTensorId = 0;
var SymbolicTensor = (function () {
    function SymbolicTensor(dtype, shape, sourceLayer, inputs, callArgs, name, outputTensorIndex) {
        this.dtype = dtype;
        this.shape = shape;
        this.sourceLayer = sourceLayer;
        this.inputs = inputs;
        this.callArgs = callArgs;
        this.outputTensorIndex = outputTensorIndex;
        this.id = _nextUniqueTensorId++;
        if (name != null) {
            this.originalName = common_1.getScopedTensorName(name);
            this.name = common_1.getUniqueTensorName(this.originalName);
        }
    }
    SymbolicTensor = __decorate([
        tfjs_core_1.doc({ heading: 'Models', 'subheading': 'Classes' })
    ], SymbolicTensor);
    return SymbolicTensor;
}());
exports.SymbolicTensor = SymbolicTensor;
var ConcreteTensor = (function () {
    function ConcreteTensor(val, name) {
        this.dtype = DType.float32;
        this.shape = val.shape;
        this.val = val;
        this.id = _nextUniqueTensorId++;
        if (name != null) {
            this.originalName = common_1.getScopedTensorName(name);
            this.name = common_1.getUniqueTensorName(this.originalName);
        }
    }
    ConcreteTensor.prototype.value = function () {
        return this.val;
    };
    return ConcreteTensor;
}());
exports.ConcreteTensor = ConcreteTensor;
function checkShapesMatch(x, y) {
    if (x.shape.toString() !== y.shape.toString()) {
        throw new Error('Shape mismatch: ' + JSON.stringify(x.shape) + ' vs. ' +
            JSON.stringify(y.shape));
    }
}
function getValueTensor(val) {
    return val instanceof ConcreteTensor ? val.value() : val;
}
var DEFAULT_VARIABLE_NAME_PREFIX = 'Variable';
var LayerVariable = (function () {
    function LayerVariable(val, dtype, name, trainable, constraint) {
        if (dtype === void 0) { dtype = DType.float32; }
        if (name === void 0) { name = DEFAULT_VARIABLE_NAME_PREFIX; }
        if (trainable === void 0) { trainable = true; }
        if (constraint === void 0) { constraint = null; }
        this.dtype = dtype == null ? DType.float32 : dtype;
        this.shape = val.shape;
        this.id = _nextUniqueTensorId++;
        name = name == null ? DEFAULT_VARIABLE_NAME_PREFIX : name;
        this.originalName = common_1.getScopedTensorName(name);
        this.name = common_1.getUniqueTensorName(this.originalName);
        this.trainable = trainable;
        this.constraint = constraint;
        this.val =
            tfjs_core_1.variable(getValueTensor(val), this.trainable, this.name, this.dtype);
    }
    LayerVariable.prototype.read = function () {
        return this.val;
    };
    LayerVariable.prototype.write = function (newVal) {
        checkShapesMatch(this.val, newVal);
        this.val.assign(getValueTensor(newVal));
        if (this.constraint != null) {
            this.val.assign(this.constraint.apply(this.val));
        }
        return this;
    };
    return LayerVariable;
}());
exports.LayerVariable = LayerVariable;
var Serializable = (function () {
    function Serializable() {
    }
    return Serializable;
}());
exports.Serializable = Serializable;

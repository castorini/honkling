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
var constraints_1 = require("../constraints");
var errors_1 = require("../errors");
var initializers_1 = require("../initializers");
var regularizers_1 = require("../regularizers");
var conv_utils_1 = require("../utils/conv_utils");
var generic_utils = require("../utils/generic_utils");
var generic_utils_1 = require("../utils/generic_utils");
var convolutional_1 = require("./convolutional");
var DepthwiseConv2D = (function (_super) {
    __extends(DepthwiseConv2D, _super);
    function DepthwiseConv2D(config) {
        var _this = _super.call(this, config) || this;
        _this.depthwiseKernel = null;
        _this.depthMultiplier =
            config.depthMultiplier == null ? 1 : config.depthMultiplier;
        _this.depthwiseInitializer = initializers_1.getInitializer(config.depthwiseInitializer || _this.DEFAULT_KERNEL_INITIALIZER);
        _this.depthwiseConstraint = constraints_1.getConstraint(config.depthwiseConstraint);
        _this.depthwiseRegularizer = regularizers_1.getRegularizer(config.depthwiseRegularizer);
        return _this;
    }
    DepthwiseConv2D.prototype.getClassName = function () {
        return 'DepthwiseConv2D';
    };
    DepthwiseConv2D.prototype.build = function (inputShape) {
        inputShape = generic_utils_1.getExactlyOneShape(inputShape);
        if (inputShape.length < 4) {
            throw new errors_1.ValueError("Inputs to DepthwiseConv2D should have rank 4. " +
                ("Received input shape: " + JSON.stringify(inputShape) + "."));
        }
        var channelAxis = this.dataFormat === 'channelsFirst' ? 1 : 3;
        if (inputShape[channelAxis] == null || inputShape[channelAxis] < 0) {
            throw new errors_1.ValueError('The channel dimension of the inputs to DepthwiseConv2D should ' +
                ("be defined, but is not (" + inputShape[channelAxis] + ")."));
        }
        var inputDim = inputShape[channelAxis];
        var depthwiseKernelShape = [
            this.kernelSize[0], this.kernelSize[1], inputDim, this.depthMultiplier
        ];
        this.depthwiseKernel = this.addWeight('depthwise_kernel', depthwiseKernelShape, null, this.depthwiseInitializer, this.depthwiseRegularizer, true, this.depthwiseConstraint);
        if (this.useBias) {
            this.bias = this.addWeight('bias', [inputDim * this.depthMultiplier], null, this.biasInitializer, this.biasRegularizer, true, this.biasConstraint);
        }
        else {
            this.bias = null;
        }
        this.built = true;
    };
    DepthwiseConv2D.prototype.call = function (inputs, kwargs) {
        inputs = generic_utils_1.getExactlyOneTensor(inputs);
        var outputs = K.depthwiseConv2d(inputs, this.depthwiseKernel.read(), this.strides, this.padding, this.dataFormat, null);
        if (this.useBias) {
            outputs = K.biasAdd(outputs, this.bias.read(), this.dataFormat);
        }
        if (this.activation != null) {
            outputs = this.activation(outputs);
        }
        return outputs;
    };
    DepthwiseConv2D.prototype.computeOutputShape = function (inputShape) {
        inputShape = generic_utils_1.getExactlyOneShape(inputShape);
        var rows = this.dataFormat === 'channelsFirst' ? inputShape[2] : inputShape[1];
        var cols = this.dataFormat === 'channelsFirst' ? inputShape[3] : inputShape[2];
        var outFilters = this.dataFormat === 'channelsFirst' ?
            inputShape[1] * this.depthMultiplier :
            inputShape[3] * this.depthMultiplier;
        var outRows = conv_utils_1.convOutputLength(rows, this.kernelSize[0], this.padding, this.strides[0]);
        var outCols = conv_utils_1.convOutputLength(cols, this.kernelSize[1], this.padding, this.strides[1]);
        if (this.dataFormat === 'channelsFirst') {
            return [inputShape[0], outFilters, outRows, outCols];
        }
        else {
            return [inputShape[0], outRows, outCols, outFilters];
        }
    };
    return DepthwiseConv2D;
}(convolutional_1.Conv2D));
exports.DepthwiseConv2D = DepthwiseConv2D;
generic_utils.ClassNameMap.register('DepthwiseConv2D', DepthwiseConv2D);

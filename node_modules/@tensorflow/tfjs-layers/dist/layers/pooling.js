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
var common_1 = require("../common");
var topology_1 = require("../engine/topology");
var topology_2 = require("../engine/topology");
var errors_1 = require("../errors");
var conv_utils_1 = require("../utils/conv_utils");
var generic_utils = require("../utils/generic_utils");
var Pooling1D = (function (_super) {
    __extends(Pooling1D, _super);
    function Pooling1D(config) {
        var _this = this;
        if (config.poolSize == null) {
            config.poolSize = 2;
        }
        _this = _super.call(this, config) || this;
        _this.poolSize = [config.poolSize];
        _this.strides = config.strides == null ? _this.poolSize : [config.strides];
        _this.padding = config.padding == null ? 'valid' : config.padding;
        common_1.checkPaddingMode(_this.padding);
        _this.inputSpec = [new topology_1.InputSpec({ ndim: 3 })];
        return _this;
    }
    Pooling1D.prototype.computeOutputShape = function (inputShape) {
        inputShape = generic_utils.getExactlyOneShape(inputShape);
        length = conv_utils_1.convOutputLength(inputShape[1], this.poolSize[0], this.padding, this.strides[0]);
        return [inputShape[0], length, inputShape[2]];
    };
    Pooling1D.prototype.call = function (inputs, kwargs) {
        this.invokeCallHook(inputs, kwargs);
        inputs = K.expandDims(generic_utils.getExactlyOneTensor(inputs), 2);
        var output = this.poolingFunction(generic_utils.getExactlyOneTensor(inputs), [this.poolSize[0], 1], [this.strides[0], 1], this.padding, 'channelsLast');
        return K.squeeze(output, 2);
    };
    Pooling1D.prototype.getConfig = function () {
        var config = {
            poolSize: this.poolSize,
            padding: this.padding,
            strides: this.strides,
        };
        var baseConfig = _super.prototype.getConfig.call(this);
        Object.assign(config, baseConfig);
        return config;
    };
    return Pooling1D;
}(topology_2.Layer));
exports.Pooling1D = Pooling1D;
var MaxPooling1D = (function (_super) {
    __extends(MaxPooling1D, _super);
    function MaxPooling1D(config) {
        return _super.call(this, config) || this;
    }
    MaxPooling1D.prototype.getClassName = function () {
        return 'MaxPooling1D';
    };
    MaxPooling1D.prototype.poolingFunction = function (inputs, poolSize, strides, padding, dataFormat) {
        common_1.checkDataFormat(dataFormat);
        common_1.checkPaddingMode(padding);
        return K.pool2d(inputs, poolSize, strides, padding, dataFormat, 'max');
    };
    return MaxPooling1D;
}(Pooling1D));
exports.MaxPooling1D = MaxPooling1D;
generic_utils.ClassNameMap.register('MaxPooling1D', MaxPooling1D);
var AveragePooling1D = (function (_super) {
    __extends(AveragePooling1D, _super);
    function AveragePooling1D(config) {
        return _super.call(this, config) || this;
    }
    AveragePooling1D.prototype.getClassName = function () {
        return 'AveragePooling1D';
    };
    AveragePooling1D.prototype.poolingFunction = function (inputs, poolSize, strides, padding, dataFormat) {
        common_1.checkDataFormat(dataFormat);
        common_1.checkPaddingMode(padding);
        return K.pool2d(inputs, poolSize, strides, padding, dataFormat, 'avg');
    };
    return AveragePooling1D;
}(Pooling1D));
exports.AveragePooling1D = AveragePooling1D;
generic_utils.ClassNameMap.register('AveragePooling1D', AveragePooling1D);
var Pooling2D = (function (_super) {
    __extends(Pooling2D, _super);
    function Pooling2D(config) {
        var _this = this;
        if (config.poolSize == null) {
            config.poolSize = [2, 2];
        }
        _this = _super.call(this, config) || this;
        _this.poolSize = Array.isArray(config.poolSize) ?
            config.poolSize :
            [config.poolSize, config.poolSize];
        _this.strides = config.strides == null ? _this.poolSize : config.strides;
        _this.padding = config.padding == null ? 'valid' : config.padding;
        _this.dataFormat =
            config.dataFormat == null ? 'channelsLast' : config.dataFormat;
        common_1.checkDataFormat(_this.dataFormat);
        common_1.checkPaddingMode(_this.padding);
        _this.inputSpec = [new topology_1.InputSpec({ ndim: 4 })];
        return _this;
    }
    Pooling2D.prototype.computeOutputShape = function (inputShape) {
        inputShape = generic_utils.getExactlyOneShape(inputShape);
        var rows = this.dataFormat === 'channelsFirst' ? inputShape[2] : inputShape[1];
        var cols = this.dataFormat === 'channelsFirst' ? inputShape[3] : inputShape[2];
        rows =
            conv_utils_1.convOutputLength(rows, this.poolSize[0], this.padding, this.strides[0]);
        cols =
            conv_utils_1.convOutputLength(cols, this.poolSize[1], this.padding, this.strides[1]);
        if (this.dataFormat === 'channelsFirst') {
            return [inputShape[0], inputShape[1], rows, cols];
        }
        else {
            return [inputShape[0], rows, cols, inputShape[3]];
        }
    };
    Pooling2D.prototype.call = function (inputs, kwargs) {
        this.invokeCallHook(inputs, kwargs);
        return this.poolingFunction(generic_utils.getExactlyOneTensor(inputs), this.poolSize, this.strides, this.padding, this.dataFormat);
    };
    Pooling2D.prototype.getConfig = function () {
        var config = {
            poolSize: this.poolSize,
            padding: this.padding,
            strides: this.strides,
            dataFormat: this.dataFormat
        };
        var baseConfig = _super.prototype.getConfig.call(this);
        Object.assign(config, baseConfig);
        return config;
    };
    return Pooling2D;
}(topology_2.Layer));
exports.Pooling2D = Pooling2D;
var MaxPooling2D = (function (_super) {
    __extends(MaxPooling2D, _super);
    function MaxPooling2D(config) {
        return _super.call(this, config) || this;
    }
    MaxPooling2D.prototype.getClassName = function () {
        return 'MaxPooling2D';
    };
    MaxPooling2D.prototype.poolingFunction = function (inputs, poolSize, strides, padding, dataFormat) {
        common_1.checkDataFormat(dataFormat);
        common_1.checkPaddingMode(padding);
        return K.pool2d(inputs, poolSize, strides, padding, dataFormat, 'max');
    };
    return MaxPooling2D;
}(Pooling2D));
exports.MaxPooling2D = MaxPooling2D;
generic_utils.ClassNameMap.register('MaxPooling2D', MaxPooling2D);
var AveragePooling2D = (function (_super) {
    __extends(AveragePooling2D, _super);
    function AveragePooling2D(config) {
        return _super.call(this, config) || this;
    }
    AveragePooling2D.prototype.getClassName = function () {
        return 'AveragePooling2D';
    };
    AveragePooling2D.prototype.poolingFunction = function (inputs, poolSize, strides, padding, dataFormat) {
        common_1.checkDataFormat(dataFormat);
        common_1.checkPaddingMode(padding);
        return K.pool2d(inputs, poolSize, strides, padding, dataFormat, 'avg');
    };
    return AveragePooling2D;
}(Pooling2D));
exports.AveragePooling2D = AveragePooling2D;
generic_utils.ClassNameMap.register('AveragePooling2D', AveragePooling2D);
var GlobalPooling1D = (function (_super) {
    __extends(GlobalPooling1D, _super);
    function GlobalPooling1D(config) {
        var _this = _super.call(this, config) || this;
        _this.inputSpec = [new topology_1.InputSpec({ ndim: 3 })];
        return _this;
    }
    GlobalPooling1D.prototype.computeOutputShape = function (inputShape) {
        return [inputShape[0], inputShape[2]];
    };
    GlobalPooling1D.prototype.call = function (inputs, kwargs) {
        throw new errors_1.NotImplementedError();
    };
    return GlobalPooling1D;
}(topology_2.Layer));
exports.GlobalPooling1D = GlobalPooling1D;
var GlobalAveragePooling1D = (function (_super) {
    __extends(GlobalAveragePooling1D, _super);
    function GlobalAveragePooling1D(config) {
        return _super.call(this, config) || this;
    }
    GlobalAveragePooling1D.prototype.getClassName = function () {
        return 'GlobalAveragePooling1D';
    };
    GlobalAveragePooling1D.prototype.call = function (inputs, kwargs) {
        var input = generic_utils.getExactlyOneTensor(inputs);
        return K.mean(input, 1);
    };
    return GlobalAveragePooling1D;
}(GlobalPooling1D));
exports.GlobalAveragePooling1D = GlobalAveragePooling1D;
generic_utils.ClassNameMap.register('GlobalAveragePooling1D', GlobalAveragePooling1D);
var GlobalMaxPooling1D = (function (_super) {
    __extends(GlobalMaxPooling1D, _super);
    function GlobalMaxPooling1D(config) {
        return _super.call(this, config) || this;
    }
    GlobalMaxPooling1D.prototype.getClassName = function () {
        return 'GlobalMaxPooling1D';
    };
    GlobalMaxPooling1D.prototype.call = function (inputs, kwargs) {
        var input = generic_utils.getExactlyOneTensor(inputs);
        return K.max(input, 1);
    };
    return GlobalMaxPooling1D;
}(GlobalPooling1D));
exports.GlobalMaxPooling1D = GlobalMaxPooling1D;
generic_utils.ClassNameMap.register('GlobalMaxPooling1D', GlobalMaxPooling1D);
var GlobalPooling2D = (function (_super) {
    __extends(GlobalPooling2D, _super);
    function GlobalPooling2D(config) {
        var _this = _super.call(this, config) || this;
        _this.dataFormat =
            config.dataFormat == null ? 'channelsLast' : config.dataFormat;
        common_1.checkDataFormat(_this.dataFormat);
        _this.inputSpec = [new topology_1.InputSpec({ ndim: 4 })];
        return _this;
    }
    GlobalPooling2D.prototype.computeOutputShape = function (inputShape) {
        inputShape = inputShape;
        if (this.dataFormat === 'channelsLast') {
            return [inputShape[0], inputShape[3]];
        }
        else {
            return [inputShape[0], inputShape[1]];
        }
    };
    GlobalPooling2D.prototype.call = function (inputs, kwargs) {
        throw new errors_1.NotImplementedError();
    };
    GlobalPooling2D.prototype.getConfig = function () {
        var config = { dataFormat: this.dataFormat };
        var baseConfig = _super.prototype.getConfig.call(this);
        Object.assign(config, baseConfig);
        return config;
    };
    return GlobalPooling2D;
}(topology_2.Layer));
exports.GlobalPooling2D = GlobalPooling2D;
var GlobalAveragePooling2D = (function (_super) {
    __extends(GlobalAveragePooling2D, _super);
    function GlobalAveragePooling2D() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GlobalAveragePooling2D.prototype.call = function (inputs, kwargs) {
        var input = generic_utils.getExactlyOneTensor(inputs);
        if (this.dataFormat === 'channelsLast') {
            return K.mean(input, [1, 2]);
        }
        else {
            return K.mean(input, [2, 3]);
        }
    };
    GlobalAveragePooling2D.prototype.getClassName = function () {
        return 'GlobalAveragePooling2D';
    };
    return GlobalAveragePooling2D;
}(GlobalPooling2D));
exports.GlobalAveragePooling2D = GlobalAveragePooling2D;
generic_utils.ClassNameMap.register('GlobalAveragePooling2D', GlobalAveragePooling2D);
var GlobalMaxPooling2D = (function (_super) {
    __extends(GlobalMaxPooling2D, _super);
    function GlobalMaxPooling2D() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GlobalMaxPooling2D.prototype.call = function (inputs, kwargs) {
        var input = generic_utils.getExactlyOneTensor(inputs);
        if (this.dataFormat === 'channelsLast') {
            return K.max(input, [1, 2]);
        }
        else {
            return K.max(input, [2, 3]);
        }
    };
    GlobalMaxPooling2D.prototype.getClassName = function () {
        return 'GlobalMaxPooling2D';
    };
    return GlobalMaxPooling2D;
}(GlobalPooling2D));
exports.GlobalMaxPooling2D = GlobalMaxPooling2D;
generic_utils.ClassNameMap.register('GlobalMaxPooling2D', GlobalMaxPooling2D);

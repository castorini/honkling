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
var K = require("./backend/tfjs_backend");
var common_1 = require("./common");
var errors_1 = require("./errors");
var types_1 = require("./types");
var generic_utils_1 = require("./utils/generic_utils");
var math_utils_1 = require("./utils/math_utils");
generic_utils_1.SerializableEnumRegistry.register('mode', { 'fan_in': 'fanIn', 'fan_out': 'fanOut', 'fan_avg': 'fanAvg' });
exports.VALID_FAN_MODE_VALUES = ['fanIn', 'fanOut', 'fanAvg', undefined, null];
function checkFanMode(value) {
    if (value == null) {
        return;
    }
    if (exports.VALID_FAN_MODE_VALUES.indexOf(value) < 0) {
        throw new errors_1.ValueError(value + " is not a valid FanMode.  Valid values as " + exports.VALID_FAN_MODE_VALUES);
    }
}
exports.checkFanMode = checkFanMode;
generic_utils_1.SerializableEnumRegistry.register('distribution', { 'normal': 'normal', 'uniform': 'uniform' });
exports.VALID_DISTRIBUTION_VALUES = ['normal', 'uniform', undefined, null];
function checkDistribution(value) {
    if (value == null) {
        return;
    }
    if (exports.VALID_DISTRIBUTION_VALUES.indexOf(value) < 0) {
        throw new errors_1.ValueError(value + " is not a valid Distribution.  Valid values as " + exports.VALID_DISTRIBUTION_VALUES);
    }
}
exports.checkDistribution = checkDistribution;
var Initializer = (function (_super) {
    __extends(Initializer, _super);
    function Initializer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Initializer.fromConfig = function (cls, config) {
        return new cls(config);
    };
    Initializer.prototype.fromConfigUsesCustomObjects = function () {
        return false;
    };
    Initializer.prototype.getConfig = function () {
        return {};
    };
    Initializer = __decorate([
        tfjs_core_1.doc({ heading: 'Initializers', subheading: 'Classes', namespace: 'initializers' })
    ], Initializer);
    return Initializer;
}(types_1.Serializable));
exports.Initializer = Initializer;
var Zeros = (function (_super) {
    __extends(Zeros, _super);
    function Zeros() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Zeros.prototype.getClassName = function () {
        return 'Zeros';
    };
    Zeros.prototype.apply = function (shape, dtype) {
        return K.zeros(shape, dtype);
    };
    return Zeros;
}(Initializer));
exports.Zeros = Zeros;
generic_utils_1.ClassNameMap.register('Zeros', Zeros);
var Ones = (function (_super) {
    __extends(Ones, _super);
    function Ones() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Ones.prototype.getClassName = function () {
        return 'Ones';
    };
    Ones.prototype.apply = function (shape, dtype) {
        return K.ones(shape, dtype);
    };
    return Ones;
}(Initializer));
exports.Ones = Ones;
generic_utils_1.ClassNameMap.register('Ones', Ones);
var Constant = (function (_super) {
    __extends(Constant, _super);
    function Constant(config) {
        var _this = _super.call(this) || this;
        _this.value = config.value;
        return _this;
    }
    Constant.prototype.apply = function (shape, dtype) {
        return K.scalarTimesArray(tfjs_core_1.scalar(this.value), K.ones(shape, dtype));
    };
    Constant.prototype.getClassName = function () {
        return 'Constant';
    };
    Constant.prototype.getConfig = function () {
        return {
            value: this.value,
        };
    };
    return Constant;
}(Initializer));
exports.Constant = Constant;
generic_utils_1.ClassNameMap.register('Constant', Constant);
var RandomUniform = (function (_super) {
    __extends(RandomUniform, _super);
    function RandomUniform(config) {
        var _this = _super.call(this) || this;
        _this.DEFAULT_MINVAL = -0.05;
        _this.DEFAULT_MAXVAL = 0.05;
        _this.minval = config.minval || _this.DEFAULT_MINVAL;
        _this.maxval = config.maxval || _this.DEFAULT_MAXVAL;
        _this.seed = config.seed;
        return _this;
    }
    RandomUniform.prototype.apply = function (shape, dtype) {
        return K.randomUniform(shape, this.minval, this.maxval, dtype, this.seed);
    };
    RandomUniform.prototype.getClassName = function () {
        return 'RandomUniform';
    };
    RandomUniform.prototype.getConfig = function () {
        return { minval: this.minval, maxval: this.maxval, seed: this.seed };
    };
    return RandomUniform;
}(Initializer));
exports.RandomUniform = RandomUniform;
generic_utils_1.ClassNameMap.register('RandomUniform', RandomUniform);
var RandomNormal = (function (_super) {
    __extends(RandomNormal, _super);
    function RandomNormal(config) {
        var _this = _super.call(this) || this;
        _this.DEFAULT_MEAN = 0.;
        _this.DEFAULT_STDDEV = 0.05;
        _this.mean = config.mean || _this.DEFAULT_MEAN;
        _this.stddev = config.stddev || _this.DEFAULT_STDDEV;
        _this.seed = config.seed;
        return _this;
    }
    RandomNormal.prototype.apply = function (shape, dtype) {
        return K.randomNormal(shape, this.mean, this.stddev, dtype, this.seed);
    };
    RandomNormal.prototype.getClassName = function () {
        return 'RandomNormal';
    };
    RandomNormal.prototype.getConfig = function () {
        return { mean: this.mean, stddev: this.stddev, seed: this.seed };
    };
    return RandomNormal;
}(Initializer));
exports.RandomNormal = RandomNormal;
generic_utils_1.ClassNameMap.register('RandomNormal', RandomNormal);
var TruncatedNormal = (function (_super) {
    __extends(TruncatedNormal, _super);
    function TruncatedNormal(config) {
        var _this = _super.call(this) || this;
        _this.DEFAULT_MEAN = 0.;
        _this.DEFAULT_STDDEV = 0.05;
        _this.mean = config.mean || _this.DEFAULT_MEAN;
        _this.stddev = config.stddev || _this.DEFAULT_STDDEV;
        _this.seed = config.seed;
        return _this;
    }
    TruncatedNormal.prototype.apply = function (shape, dtype) {
        return K.truncatedNormal(shape, this.mean, this.stddev, dtype, this.seed);
    };
    TruncatedNormal.prototype.getClassName = function () {
        return 'TruncatedNormal';
    };
    TruncatedNormal.prototype.getConfig = function () {
        return { mean: this.mean, stddev: this.stddev, seed: this.seed };
    };
    return TruncatedNormal;
}(Initializer));
exports.TruncatedNormal = TruncatedNormal;
generic_utils_1.ClassNameMap.register('TruncatedNormal', TruncatedNormal);
var Identity = (function (_super) {
    __extends(Identity, _super);
    function Identity(config) {
        var _this = _super.call(this) || this;
        _this.gain = config.gain != null ? tfjs_core_1.scalar(config.gain) : K.getScalar(1.0);
        return _this;
    }
    Identity.prototype.apply = function (shape, dtype) {
        if (shape.length !== 2 || shape[0] !== shape[1]) {
            throw new errors_1.ValueError('Identity matrix initializer can only be used for' +
                ' 2D square matrices.');
        }
        else {
            return K.scalarTimesArray(this.gain, K.eye(shape[0]));
        }
    };
    Identity.prototype.getClassName = function () {
        return 'Identity';
    };
    Identity.prototype.getConfig = function () {
        return { gain: this.gain.get() };
    };
    return Identity;
}(Initializer));
exports.Identity = Identity;
generic_utils_1.ClassNameMap.register('Identity', Identity);
function computeFans(shape, dataFormat) {
    if (dataFormat === void 0) { dataFormat = 'channelsLast'; }
    var fanIn;
    var fanOut;
    common_1.checkDataFormat(dataFormat);
    if (shape.length === 2) {
        fanIn = shape[0];
        fanOut = shape[1];
    }
    else if ([3, 4, 5].indexOf(shape.length) !== -1) {
        if (dataFormat === 'channelsFirst') {
            var receptiveFieldSize = math_utils_1.arrayProd(shape, 2);
            fanIn = shape[1] * receptiveFieldSize;
            fanOut = shape[0] * receptiveFieldSize;
        }
        else if (dataFormat === 'channelsLast') {
            var receptiveFieldSize = math_utils_1.arrayProd(shape, 0, shape.length - 2);
            fanIn = shape[shape.length - 2] * receptiveFieldSize;
            fanOut = shape[shape.length - 1] * receptiveFieldSize;
        }
    }
    else {
        var shapeProd = math_utils_1.arrayProd(shape);
        fanIn = Math.sqrt(shapeProd);
        fanOut = Math.sqrt(shapeProd);
    }
    return [fanIn, fanOut];
}
var VarianceScaling = (function (_super) {
    __extends(VarianceScaling, _super);
    function VarianceScaling(config) {
        var _this = _super.call(this) || this;
        if (config.scale < 0.0) {
            throw new errors_1.ValueError("scale must be a positive float. Got: " + config.scale);
        }
        _this.scale = config.scale == null ? 1.0 : config.scale;
        _this.mode = config.mode;
        checkFanMode(_this.mode);
        _this.distribution = config.distribution;
        checkDistribution(_this.distribution);
        _this.seed = config.seed;
        return _this;
    }
    VarianceScaling.prototype.apply = function (shape, dtype) {
        var fans = computeFans(shape);
        var fanIn = fans[0];
        var fanOut = fans[1];
        var scale = this.scale;
        if (this.mode === 'fanIn') {
            scale /= Math.max(1, fanIn);
        }
        else if (this.mode === 'fanOut') {
            scale /= Math.max(1, fanOut);
        }
        else {
            scale /= Math.max(1, (fanIn + fanOut) / 2);
        }
        if (this.distribution === 'normal') {
            var stddev = Math.sqrt(scale);
            return K.truncatedNormal(shape, 0, stddev, dtype, this.seed);
        }
        else {
            var limit = Math.sqrt(3 * scale);
            return K.randomUniform(shape, -limit, limit, dtype, this.seed);
        }
    };
    VarianceScaling.prototype.getClassName = function () {
        return 'VarianceScaling';
    };
    VarianceScaling.prototype.getConfig = function () {
        return {
            scale: this.scale,
            mode: this.mode,
            distribution: this.distribution,
            seed: this.seed
        };
    };
    return VarianceScaling;
}(Initializer));
exports.VarianceScaling = VarianceScaling;
generic_utils_1.ClassNameMap.register('VarianceScaling', VarianceScaling);
var GlorotUniform = (function (_super) {
    __extends(GlorotUniform, _super);
    function GlorotUniform(config) {
        return _super.call(this, {
            scale: 1.0,
            mode: 'fanAvg',
            distribution: 'uniform',
            seed: config.seed
        }) || this;
    }
    return GlorotUniform;
}(VarianceScaling));
exports.GlorotUniform = GlorotUniform;
generic_utils_1.ClassNameMap.register('GlorotUniform', GlorotUniform);
var GlorotNormal = (function (_super) {
    __extends(GlorotNormal, _super);
    function GlorotNormal(config) {
        return _super.call(this, {
            scale: 1.0,
            mode: 'fanAvg',
            distribution: 'normal',
            seed: config.seed
        }) || this;
    }
    return GlorotNormal;
}(VarianceScaling));
exports.GlorotNormal = GlorotNormal;
generic_utils_1.ClassNameMap.register('GlorotNormal', GlorotNormal);
var HeNormal = (function (_super) {
    __extends(HeNormal, _super);
    function HeNormal(config) {
        return _super.call(this, { scale: 2.0, mode: 'fanIn', distribution: 'normal', seed: config.seed }) || this;
    }
    return HeNormal;
}(VarianceScaling));
exports.HeNormal = HeNormal;
generic_utils_1.ClassNameMap.register('HeNormal', HeNormal);
var LeCunNormal = (function (_super) {
    __extends(LeCunNormal, _super);
    function LeCunNormal(config) {
        return _super.call(this, { scale: 1.0, mode: 'fanIn', distribution: 'normal', seed: config.seed }) || this;
    }
    return LeCunNormal;
}(VarianceScaling));
exports.LeCunNormal = LeCunNormal;
generic_utils_1.ClassNameMap.register('LeCunNormal', LeCunNormal);
var Orthogonal = (function (_super) {
    __extends(Orthogonal, _super);
    function Orthogonal(config) {
        var _this = _super.call(this) || this;
        _this.DEFAULT_GAIN = 1;
        _this.gain = config.gain == null ? _this.DEFAULT_GAIN : config.gain;
        _this.seed = config.seed;
        if (_this.seed != null) {
            throw new errors_1.NotImplementedError('Random seed is not implemented for Orthogonal Initializer yet.');
        }
        return _this;
    }
    Orthogonal.prototype.apply = function (shape, dtype) {
        if (shape.length !== 2) {
            throw new errors_1.NotImplementedError('The Orthogonal Initializer does not support non-2D shapes yet.');
        }
        var normalizedShape = shape[0] >= shape[1] ? shape : [shape[1], shape[0]];
        var a = K.randomNormal(normalizedShape, 0, 1, types_1.DType.float32);
        var q = K.qr(a)[0];
        if (q.shape[1] > normalizedShape[1]) {
            q = q.slice([0, 0], normalizedShape);
        }
        if (shape[0] < shape[1]) {
            q = q.transpose();
        }
        return K.scalarTimesArray(K.getScalar(this.gain), q);
    };
    Orthogonal.prototype.getClassName = function () {
        return 'Orthogonal';
    };
    Orthogonal.prototype.getConfig = function () {
        return {
            gain: this.gain,
            seed: this.seed,
        };
    };
    return Orthogonal;
}(Initializer));
exports.Orthogonal = Orthogonal;
generic_utils_1.ClassNameMap.register('Orthogonal', Orthogonal);
exports.INITIALIZER_IDENTIFIER_REGISTRY_SYMBOL_MAP = {
    'constant': 'Constant',
    'glorotNormal': 'GlorotNormal',
    'glorotUniform': 'GlorotUniform',
    'heNormal': 'HeNormal',
    'identity': 'Identity',
    'leCunNormal': 'LeCunNormal',
    'ones': 'Ones',
    'orthogonal': 'Orthogonal',
    'randomNormal': 'RandomNormal',
    'randomUniform': 'RandomUniform',
    'truncatedNormal': 'TruncatedNormal',
    'varianceScaling': 'VarianceScaling',
    'zeros': 'Zeros'
};
function deserializeInitializer(config, customObjects) {
    if (customObjects === void 0) { customObjects = {}; }
    return generic_utils_1.deserializeKerasObject(config, generic_utils_1.ClassNameMap.getMap().pythonClassNameMap, customObjects, 'initializer');
}
function serializeInitializer(initializer) {
    return generic_utils_1.serializeKerasObject(initializer);
}
exports.serializeInitializer = serializeInitializer;
function getInitializer(identifier) {
    if (typeof identifier === 'string') {
        var className = identifier in exports.INITIALIZER_IDENTIFIER_REGISTRY_SYMBOL_MAP ?
            exports.INITIALIZER_IDENTIFIER_REGISTRY_SYMBOL_MAP[identifier] :
            identifier;
        var config = { className: className, config: {} };
        return deserializeInitializer(config);
    }
    else if (identifier instanceof Initializer) {
        return identifier;
    }
    else {
        return deserializeInitializer(identifier);
    }
}
exports.getInitializer = getInitializer;

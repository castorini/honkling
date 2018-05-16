"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tfc = require("@tensorflow/tfjs-core");
var tfjs_core_1 = require("@tensorflow/tfjs-core");
var common_1 = require("../common");
var errors_1 = require("../errors");
var types_1 = require("../types");
var generic_utils_1 = require("../utils/generic_utils");
var math_utils = require("../utils/math_utils");
var common_2 = require("./common");
var common_3 = require("./common");
var backend = 'webgl';
var DEFAULT_DTYPE = types_1.DType.float32;
function disposeScalarCache() {
    for (var typeKey in scalarCache) {
        for (var key in scalarCache[typeKey]) {
            scalarCache[typeKey][key].dispose();
            delete scalarCache[typeKey][key];
        }
    }
}
exports.disposeScalarCache = disposeScalarCache;
function setBackend(requestedBackend) {
    tfc.setBackend(requestedBackend);
    backend = requestedBackend;
    disposeScalarCache();
}
exports.setBackend = setBackend;
function getBackend() {
    return backend;
}
exports.getBackend = getBackend;
function keep(x) {
    return tfc.keep(x);
}
exports.keep = keep;
var scalarCache = {
    float32: {},
    int32: {}
};
function getScalar(value, dtype) {
    if (dtype === undefined) {
        dtype = DEFAULT_DTYPE;
    }
    if (scalarCache[dtype][value] == null) {
        scalarCache[dtype][value] = tfjs_core_1.scalar(value, dtype);
        tfc.keep(scalarCache[dtype][value]);
    }
    return scalarCache[dtype][value];
}
exports.getScalar = getScalar;
exports.epsilon = common_2.epsilon;
function isBackendSymbolic() {
    return false;
}
exports.isBackendSymbolic = isBackendSymbolic;
function shape(x) {
    return x.shape;
}
exports.shape = shape;
function intShape(x) {
    return x.shape;
}
exports.intShape = intShape;
function ndim(x) {
    return x.shape.length;
}
exports.ndim = ndim;
function dtype(x) {
    return (x instanceof tfjs_core_1.Tensor) ? DEFAULT_DTYPE : x.dtype;
}
exports.dtype = dtype;
function normalizeAxis(x, axis) {
    if (axis == null) {
        return axis;
    }
    var xShape = shape(x);
    if (Array.isArray(axis)) {
        return axis.map(function (thisAxis) { return generic_utils_1.pyNormalizeArrayIndex(xShape, thisAxis); });
    }
    return generic_utils_1.pyNormalizeArrayIndex(xShape, axis);
}
exports.normalizeAxis = normalizeAxis;
function countParams(x) {
    var shape = x.shape;
    if (shape.length > 0) {
        return shape.reduce(function (a, b) { return a * b; });
    }
    else {
        return 1;
    }
}
exports.countParams = countParams;
function cast(x, dtype) {
    return x.asType(dtype);
}
exports.cast = cast;
function reshape(x, shape) {
    return x.reshape(shape);
}
exports.reshape = reshape;
function transpose(x, perm) {
    return tfc.transpose(x, perm);
}
exports.transpose = transpose;
exports.permuteDimensions = transpose;
function reverse(x, axes) {
    return tfc.reverse(x, axes);
}
exports.reverse = reverse;
function expandDims(x, axis) {
    if (axis === void 0) { axis = -1; }
    var outShape = shape(x).slice();
    if (axis < 0) {
        axis = outShape.length + axis + 1;
    }
    outShape.splice(axis, 0, 1);
    return reshape(x, outShape);
}
exports.expandDims = expandDims;
function squeeze(x, axis) {
    return tfc.squeeze(x, [axis]);
}
exports.squeeze = squeeze;
function temporalPadding(x, padding) {
    if (ndim(x) !== 3) {
        throw new errors_1.ValueError("temporalPadding expects input tensor to be 3-D, but received a " +
            (ndim(x) + "-D tensor."));
    }
    if (padding == null) {
        padding = [1, 1];
    }
    if (padding.length !== 2) {
        throw new errors_1.ValueError("temporalPadding expects input padding pattern to be a length-2 " +
            ("array, but received a length-" + padding.length + " array."));
    }
    var pattern = [[0, 0], padding, [0, 0]];
    return tfc.pad(x, pattern);
}
exports.temporalPadding = temporalPadding;
function spatial2dPadding(x, padding, dataFormat) {
    if (ndim(x) !== 4) {
        throw new errors_1.ValueError("temporalPadding expects input tensor to be 4-D, but received a " +
            (ndim(x) + "-D tensor."));
    }
    if (padding == null) {
        padding = [[1, 1], [1, 1]];
    }
    if (padding.length !== 2 || padding[0].length !== 2 ||
        padding[1].length !== 2) {
        throw new errors_1.ValueError('spatial2dPadding expects `padding` to be an Array of two Arrays, ' +
            'each of which is an Array of two integers.');
    }
    if (dataFormat == null) {
        dataFormat = common_3.imageDataFormat();
    }
    if (dataFormat !== 'channelsLast' && dataFormat !== 'channelsFirst') {
        throw new errors_1.ValueError("Unknown data format: " + dataFormat + ". " +
            "Supported data formats are 'channelsLast' and 'channelsFirst.");
    }
    var pattern;
    if (dataFormat === 'channelsFirst') {
        pattern = [[0, 0], [0, 0], padding[0], padding[1]];
    }
    else {
        pattern = [[0, 0], padding[0], padding[1], [0, 0]];
    }
    return tfc.pad(x, pattern);
}
exports.spatial2dPadding = spatial2dPadding;
function repeat(x, n) {
    if (x.shape.length !== 2) {
        throw new errors_1.ValueError("repeat() expects a rank-2 tensor, but received a " +
            ("rank-" + x.shape.length + " tensor."));
    }
    var y = expandDims(x, 1);
    return tile(y, [1, n, 1]);
}
exports.repeat = repeat;
function flatten(x) {
    var newShape = [math_utils.arrayProd(x.shape)];
    return reshape(x, newShape);
}
exports.flatten = flatten;
function batchFlatten(x) {
    if (ndim(x) <= 1) {
        throw new errors_1.ValueError("batchFlatten requires a minimum rank of 2. Got rank: " + ndim(x) + ".");
    }
    var newShape = [x.shape[0], math_utils.arrayProd(x.shape, 1)];
    return reshape(x, newShape);
}
exports.batchFlatten = batchFlatten;
function sliceAlongFirstAxis(array, start, size) {
    switch (array.rank) {
        case 1:
            return tfc.slice1d(array, start, size);
        case 2:
            return tfc.slice2d(array, [start, 0], [size, array.shape[1]]);
        case 3:
            return tfc.slice3d(array, [start, 0, 0], [size, array.shape[1], array.shape[2]]);
        case 4:
            return tfc.slice4d(array, [start, 0, 0, 0], [size, array.shape[1], array.shape[2], array.shape[3]]);
        default:
            throw new errors_1.ValueError("sliceAlongFirstAxis() received an unsupported tensor rank: " +
                ("" + array.rank));
    }
}
exports.sliceAlongFirstAxis = sliceAlongFirstAxis;
function sliceAlongLastAxis(array, start, size) {
    switch (array.rank) {
        case 1:
            return tfc.slice1d(array, start, size);
        case 2:
            return tfc.slice2d(array, [0, start], [array.shape[0], size]);
        case 3:
            return tfc.slice3d(array, [0, 0, start], [array.shape[0], array.shape[1], size]);
        case 4:
            return tfc.slice4d(array, [0, 0, 0, start], [array.shape[0], array.shape[1], array.shape[2], size]);
        default:
            throw new errors_1.ValueError("sliceAlongLastAxis() received an unsupported tensor rank: " +
                ("" + array.rank));
    }
}
exports.sliceAlongLastAxis = sliceAlongLastAxis;
function regularNormalizeBatchInTraining(x, gamma, beta, reductionAxes, epsilon) {
    if (epsilon === void 0) { epsilon = 1e-3; }
    return tfjs_core_1.tidy(function () {
        var meanAndVariance = tfc.moments(x, reductionAxes);
        var mean = meanAndVariance.mean;
        var variance = meanAndVariance.variance;
        var normed = batchNormalization(x, mean, variance, beta, gamma, epsilon);
        return [normed, mean, variance];
    });
}
function broadcastNormalizeBatchInTraining(x, gamma, beta, reductionAxes, epsilon) {
    if (epsilon === void 0) { epsilon = 1e-3; }
    return tfjs_core_1.tidy(function () {
        var meanAndVariance = tfc.moments(x, reductionAxes);
        var mean = meanAndVariance.mean;
        var variance = meanAndVariance.variance;
        var targetShape = [];
        for (var _i = 0, _a = math_utils.range(0, ndim(x)); _i < _a.length; _i++) {
            var axis = _a[_i];
            if (reductionAxes.indexOf(axis) !== -1) {
                targetShape.push(1);
            }
            else {
                targetShape.push(x.shape[axis]);
            }
        }
        var broadcastMean = reshape(mean, targetShape);
        var broadcastVariance = reshape(variance, targetShape);
        var broadcastGamma = gamma == null ? null : reshape(gamma, targetShape);
        var broadcastBeta = beta == null ? null : reshape(beta, targetShape);
        var normed = batchNormalization(x, broadcastMean, broadcastVariance, broadcastBeta, broadcastGamma, epsilon);
        return [normed, mean, variance];
    });
}
function normalizeBatchInTraining(x, gamma, beta, reductionAxes, epsilon) {
    if (epsilon === void 0) { epsilon = 1e-3; }
    if (tfjs_core_1.util.arraysEqual(reductionAxes.slice().sort(), math_utils.range(0, ndim(x) - 1))) {
        return regularNormalizeBatchInTraining(x, gamma, beta, reductionAxes, epsilon);
    }
    else {
        return broadcastNormalizeBatchInTraining(x, gamma, beta, reductionAxes, epsilon);
    }
}
exports.normalizeBatchInTraining = normalizeBatchInTraining;
function concatenate(tensors, axis) {
    if (axis === void 0) { axis = -1; }
    var rank;
    if (axis < 0) {
        rank = ndim(tensors[0]);
        if (rank !== 0) {
            axis = rank;
        }
        else {
            axis = 0;
        }
    }
    if (axis === ndim(tensors[0])) {
        axis = -1;
    }
    return tfc.concat(tensors, axis);
}
exports.concatenate = concatenate;
function concatAlongFirstAxis(a, b) {
    switch (a.rank) {
        case 1:
            return tfc.concat1d([a, b]);
        case 2:
            return tfc.concat2d([a, b], 0);
        case 3:
            return tfc.concat3d([a, b], 0);
        case 4:
            return tfc.concat4d([a, b], 0);
        default:
            throw new errors_1.ValueError('concatAlongFirstAxis() received an unsupported tensor rank: ' +
                a.rank);
    }
}
exports.concatAlongFirstAxis = concatAlongFirstAxis;
function tile(x, n) {
    if (!Array.isArray(n)) {
        n = [n];
    }
    if (ndim(x) !== n.length) {
        throw new errors_1.ValueError("The length of input n (" + n.length + ") does not match " +
            ("the number of dimensions in input x (" + ndim(x) + ")"));
    }
    return tfc.tile(x, n);
}
exports.tile = tile;
function variable(x, dtype, name, constraint) {
    return new types_1.LayerVariable(x, dtype, name, true, constraint);
}
exports.variable = variable;
function batchGetValue(xs) {
    return xs.map(function (x) { return x.read(); });
}
exports.batchGetValue = batchGetValue;
function batchSetValue(variablesAndValues) {
    variablesAndValues.map(function (variableAndValue) {
        var variable = variableAndValue[0];
        variable.write(variableAndValue[1]);
    });
}
exports.batchSetValue = batchSetValue;
function zeros(shape, dtype) {
    return tfc.zeros(shape);
}
exports.zeros = zeros;
function zerosVariable(shape, dtype, name) {
    return new types_1.LayerVariable(zeros(shape), dtype, name);
}
exports.zerosVariable = zerosVariable;
function zerosLike(x, dtype, name) {
    return new types_1.LayerVariable(tfc.zerosLike(x), dtype, name);
}
exports.zerosLike = zerosLike;
function ones(shape, dtype) {
    return tfc.ones(shape);
}
exports.ones = ones;
function onesVariable(shape, dtype, name) {
    var allocated = tfc.ones(shape);
    return new types_1.LayerVariable(allocated, dtype, name);
}
exports.onesVariable = onesVariable;
function onesLike(x, dtype, name) {
    var allocated = tfc.onesLike(x);
    return new types_1.LayerVariable(allocated, dtype, name);
}
exports.onesLike = onesLike;
function identity(x) {
    return x.clone();
}
exports.identity = identity;
function eye(size, dtype, name) {
    var buffer = [];
    for (var i = 0; i < size; ++i) {
        for (var j = 0; j < size; ++j) {
            buffer.push(i === j ? 1 : 0);
        }
    }
    return tfjs_core_1.tensor2d(buffer, [size, size]);
}
exports.eye = eye;
function eyeVariable(size, dtype, name) {
    return new types_1.LayerVariable(eye(size, dtype), dtype, name);
}
exports.eyeVariable = eyeVariable;
function neg(x) {
    return tfc.neg(x);
}
exports.neg = neg;
function add(x, y) {
    return tfc.add(x, y);
}
exports.add = add;
function subtract(x, y) {
    return tfc.sub(x, y);
}
exports.subtract = subtract;
function multiply(x, y) {
    return tfc.mul(x, y);
}
exports.multiply = multiply;
function divide(x, y) {
    return tfc.div(x, y);
}
exports.divide = divide;
function scalarTimesArray(c, x) {
    return tfc.mul(c, x);
}
exports.scalarTimesArray = scalarTimesArray;
function scalarPlusArray(c, x) {
    return tfc.add(c, x);
}
exports.scalarPlusArray = scalarPlusArray;
function randomUniform(shape, minval, maxval, dtype, seed) {
    return tfc.randomUniform(shape, minval, maxval);
}
exports.randomUniform = randomUniform;
function randomUniformVariable(shape, minval, maxval, dtype, seed, name) {
    if (name === void 0) { name = 'randomUniform'; }
    return new types_1.LayerVariable(randomUniform(shape, minval, maxval, dtype, seed), dtype, name);
}
exports.randomUniformVariable = randomUniformVariable;
function truncatedNormal(shape, mean, stddev, dtype, seed) {
    if (mean === void 0) { mean = 0.0; }
    if (stddev === void 0) { stddev = 1.0; }
    return tfc.truncatedNormal(shape, mean, stddev);
}
exports.truncatedNormal = truncatedNormal;
function truncatedNormalVariable(shape, mean, stddev, dtype, seed, name) {
    if (mean === void 0) { mean = 0.0; }
    if (stddev === void 0) { stddev = 1.0; }
    if (name === void 0) { name = 'truncatedNormal'; }
    return new types_1.LayerVariable(truncatedNormal(shape, mean, stddev, dtype, seed), dtype, name);
}
exports.truncatedNormalVariable = truncatedNormalVariable;
function randomNormal(shape, mean, stddev, dtype, seed) {
    if (mean === void 0) { mean = 0.0; }
    if (stddev === void 0) { stddev = 1.0; }
    if (dtype === types_1.DType.bool) {
        throw new errors_1.NotImplementedError("randomNormal does not support dType bool.");
    }
    var dtypeString = (dtype === types_1.DType.float32) ? 'float32' : 'int32';
    return tfc.randomNormal(shape, mean, stddev, dtypeString, seed);
}
exports.randomNormal = randomNormal;
function randomNormalVariable(shape, mean, stddev, dtype, seed, name) {
    if (mean === void 0) { mean = 0.0; }
    if (stddev === void 0) { stddev = 1.0; }
    if (name === void 0) { name = 'randomNormal'; }
    return new types_1.LayerVariable(randomNormal(shape, mean, stddev, dtype, seed), dtype, name);
}
exports.randomNormalVariable = randomNormalVariable;
function update(x, xNew) {
    return x.write(xNew);
}
exports.update = update;
function updateAdd(x, increment) {
    return x.write(tfc.add(x.read(), increment));
}
exports.updateAdd = updateAdd;
function updateSub(x, decrement) {
    return x.write(tfc.sub(x.read(), decrement));
}
exports.updateSub = updateSub;
function dot(x, y) {
    if (ndim(y) !== 2) {
        throw new errors_1.NotImplementedError("dot support for y other than rank 2 is not yet implemented: " +
            ("y shape = " + shape));
    }
    else {
        if (ndim(x) === 2) {
            return tfc.matMul(x, y);
        }
        else if (ndim(x) === 3) {
            var xShape0 = x.shape[0];
            var xShape1 = x.shape[1];
            var xShape2 = x.shape[2];
            x = x.reshape([xShape0 * xShape1, xShape2]);
            return tfc.matMul(x, y).reshape([
                xShape0, xShape1, y.shape[1]
            ]);
        }
        else {
            throw new errors_1.NotImplementedError("dot support for x of rank " + ndim(x) + " is not yet implemented: " +
                ("x shape = " + shape));
        }
    }
}
exports.dot = dot;
function sign(x) {
    var zerosLikeX = tfjs_core_1.zerosLike(x);
    var onesLikeX = tfjs_core_1.onesLike(x);
    return tfjs_core_1.where(equal(x, zerosLikeX), zerosLikeX, tfjs_core_1.where(greater(x, tfjs_core_1.zerosLike(x)), onesLikeX, scalarTimesArray(getScalar(-1), onesLikeX)));
}
exports.sign = sign;
function qr(x) {
    if (x.shape.length !== 2) {
        throw new errors_1.ValueError("qr() requires a 2D Tensor, but got a " + x.shape.length + "D Tensor.");
    }
    if (x.shape[0] < x.shape[1]) {
        throw new errors_1.ValueError("qr() requires x.shape[0] >= x.shape[1], but got shape: [" + x.shape + "]");
    }
    var m = x.shape[0];
    var n = x.shape[1];
    var q = eye(m);
    var r = x;
    var one2D = tfjs_core_1.tensor2d([[1]], [1, 1]);
    for (var j = 0; j < n; ++j) {
        var rjEnd1 = r.slice([j, j], [m - j, 1]);
        var normX = tfc.norm(rjEnd1);
        var rjj = r.slice([j, j], [1, 1]);
        var s = tfc.neg(sign(rjj));
        var u1 = rjj.sub(multiply(s, normX));
        var wPre = divide(rjEnd1, u1);
        var w = void 0;
        if (wPre.shape[0] === 1) {
            w = one2D;
        }
        else {
            w = one2D.concat(wPre.slice([1, 0], [wPre.shape[0] - 1, wPre.shape[1]]), 0);
        }
        var tau = tfc.neg(divide(tfc.matMul(s, u1), normX));
        var rjEndAll = r.slice([j, 0], [m - j, n]);
        var tauTimesW = tau.mul(w);
        if (j === 0) {
            r = rjEndAll.sub(tauTimesW.matMul(w.transpose().matMul(rjEndAll)));
        }
        else {
            r = r.slice([0, 0], [j, n])
                .concat(rjEndAll.sub(tauTimesW.matMul(w.transpose().matMul(rjEndAll))), 0);
        }
        var qAllJEnd = q.slice([0, j], [m, q.shape[1] - j]);
        if (j === 0) {
            q = qAllJEnd.sub(qAllJEnd.matMul(w).matMul(tauTimesW.transpose()));
        }
        else {
            q = q.slice([0, 0], [m, j])
                .concat(qAllJEnd.sub(qAllJEnd.matMul(w).matMul(tauTimesW.transpose())), 1);
        }
    }
    return [q, r];
}
exports.qr = qr;
function oneHot(indices, numClasses) {
    if (ndim(indices) !== 1) {
        throw new Error('Only 1D one-hot tensors are supported in the ' +
            'deeplearn backend, at present.');
    }
    indices = indices.toInt();
    return tfc.oneHot(indices, numClasses).toFloat();
}
exports.oneHot = oneHot;
function mean(x, axis, keepDims) {
    axis = normalizeAxis(x, axis);
    return tfc.mean(x, axis, keepDims);
}
exports.mean = mean;
function argmax(x, axis) {
    if (axis === void 0) { axis = -1; }
    return tfc.argMax(x, axis);
}
exports.argmax = argmax;
function gather(reference, indices, axis) {
    if (Array.isArray(indices)) {
        indices = tfjs_core_1.tensor1d(indices, 'int32');
    }
    else {
        indices = indices.toInt();
    }
    return tfc.gather(reference, indices, axis);
}
exports.gather = gather;
function max(x, axis, keepDims) {
    return tfc.max(x, axis, keepDims);
}
exports.max = max;
function min(x, axis, keepDims) {
    return tfc.min(x, axis, keepDims);
}
exports.min = min;
function minimum(x, y) {
    return tfc.minimum(x, y);
}
exports.minimum = minimum;
function sum(x, axis, keepDims) {
    return tfc.sum(x, axis, keepDims);
}
exports.sum = sum;
function abs(x) {
    return tfc.abs(x);
}
exports.abs = abs;
function square(x) {
    return tfc.mulStrict(x, x);
}
exports.square = square;
function sqrt(x) {
    return tfc.sqrt(x);
}
exports.sqrt = sqrt;
function exp(x) {
    return tfc.exp(x);
}
exports.exp = exp;
function log(x) {
    return tfc.log(x);
}
exports.log = log;
function pow(x, a) {
    if (typeof (a) === 'number') {
        a = tfjs_core_1.scalar(Math.round(a), 'int32');
    }
    if (a.dtype !== 'int32') {
        throw new errors_1.NotImplementedError("Non-int32 dtype (" + a.dtype + ") is not supported by pow() yet");
    }
    return tfc.pow(x, a);
}
exports.pow = pow;
function clip(x, minValue, maxValue) {
    return tfc.clipByValue(x, minValue, maxValue);
}
exports.clip = clip;
function equal(x, y) {
    return tfc.equal(x, y);
}
exports.equal = equal;
function greater(x, y) {
    return tfc.greater(x, y);
}
exports.greater = greater;
function greaterEqual(x, y) {
    return tfc.greaterEqual(x, y);
}
exports.greaterEqual = greaterEqual;
function maximum(x, y) {
    return tfc.maximum(x, y);
}
exports.maximum = maximum;
function sin(x) {
    return tfc.sin(x.value());
}
exports.sin = sin;
function cos(x) {
    return tfc.cos(x.value());
}
exports.cos = cos;
function batchNormalization(x, mean, variance, beta, gamma, epsilon) {
    if (epsilon === void 0) { epsilon = 1e-3; }
    var out;
    if (ndim(x) === 2) {
        out = tfc.batchNormalization2d(x, mean, variance, epsilon, gamma, beta);
    }
    else if (ndim(x) === 3) {
        out = tfc.batchNormalization3d(x, mean, variance, epsilon, gamma, beta);
    }
    else if (ndim(x) === 4) {
        out = tfc.batchNormalization4d(x, mean, variance, epsilon, gamma, beta);
    }
    else {
        throw new errors_1.NotImplementedError("batchNormalization is not implememnted for array of rank " + ndim(x) + " " +
            "yet");
    }
    return out;
}
exports.batchNormalization = batchNormalization;
function biasAdd(x, bias, dataFormat) {
    if (dataFormat == null) {
        dataFormat = common_3.imageDataFormat();
    }
    common_1.checkDataFormat(dataFormat);
    if (ndim(bias) !== 1 && ndim(bias) !== ndim(x)) {
        throw new errors_1.ValueError('Unexpected bias dimensions: ' + ndim(bias) +
            '; expected it to be 1 or ' + ndim(x));
    }
    var biasShape = bias.shape;
    var y;
    if (ndim(x) === 5) {
        if (dataFormat === 'channelsFirst') {
            if (biasShape.length === 1) {
                y = x.add(bias.reshape([1, biasShape[0], 1, 1, 1]));
            }
            else {
                y = x.add(bias.reshape([1, biasShape[3], biasShape[0], biasShape[1], biasShape[2]]));
            }
        }
        else if (dataFormat === 'channelsLast') {
            if (biasShape.length === 1) {
                y = x.add(bias.reshape([1, 1, 1, 1, biasShape[0]]));
            }
            else {
                y = x.add(bias.reshape([1].concat(biasShape)));
            }
        }
    }
    else if (ndim(x) === 4) {
        if (dataFormat === 'channelsFirst') {
            if (biasShape.length === 1) {
                y = x.add(bias.reshape([1, biasShape[0], 1, 1]));
            }
            else {
                y = x.add(bias.reshape([1, biasShape[2], biasShape[0], biasShape[1]]));
            }
        }
        else if (dataFormat === 'channelsLast') {
            if (biasShape.length === 1) {
                y = x.add(bias.reshape([1, 1, 1, biasShape[0]]));
            }
            else {
                y = x.add(bias.reshape([1].concat(biasShape)));
            }
        }
    }
    else if (ndim(x) === 3) {
        if (dataFormat === 'channelsFirst') {
            if (biasShape.length === 1) {
                y = x.add(bias.reshape([1, biasShape[0], 1]));
            }
            else {
                y = x.add(bias.reshape([1, biasShape[1], biasShape[0]]));
            }
        }
        else if (dataFormat === 'channelsLast') {
            if (biasShape.length === 1) {
                y = x.add(bias.reshape([1, 1, biasShape[0]]));
            }
            else {
                y = x.add(bias.reshape([1].concat(biasShape)));
            }
        }
    }
    else if (ndim(x) < 3) {
        y = x.add(bias);
    }
    else {
        throw new errors_1.ValueError("Unsupported input rank by biasAdd: " + ndim(x));
    }
    return y;
}
exports.biasAdd = biasAdd;
function elu(x, alpha) {
    if (alpha === void 0) { alpha = 1; }
    if (alpha !== 1) {
        throw new errors_1.NotImplementedError("Support for alpha values other than 1 (" + alpha + ") is not implemented " +
            "yet.");
    }
    return tfc.elu(x);
}
exports.elu = elu;
function selu(x) {
    return tfc.selu(x);
}
exports.selu = selu;
function relu(x) {
    return tfc.relu(x);
}
exports.relu = relu;
function softplus(x) {
    return tfc.log(tfc.add(getScalar(1), tfc.exp(x)));
}
exports.softplus = softplus;
function softsign(x) {
    return tfc.div(x, tfc.add(getScalar(1), tfc.abs(x)));
}
exports.softsign = softsign;
function tanh(x) {
    return tfc.tanh(x);
}
exports.tanh = tanh;
function dropout(x, level, noiseShape, seed) {
    if (noiseShape != null && !tfjs_core_1.util.arraysEqual(x.shape, noiseShape)) {
        throw new errors_1.NotImplementedError('Non-default noise shape is not implemented yet: ' +
            JSON.stringify(noiseShape));
    }
    if (seed != null) {
        throw new errors_1.NotImplementedError('seed is not implemented for dropout yet.');
    }
    var multiplier = tfc.step(tfc.add(neg(level), randomUniform(x.shape, 0, 1, types_1.DType.float32)));
    multiplier = tfc.mul(divide(getScalar(1), subtract(getScalar(1), level)), multiplier);
    return tfc.mul(x, multiplier);
}
exports.dropout = dropout;
function l2Normalize(x, axis) {
    var squareSum = sum(square(x), axis, true);
    var epsilonTensor = scalarTimesArray(tfjs_core_1.scalar(exports.epsilon()), tfc.onesLike(x));
    var norm = sqrt(maximum(squareSum, epsilonTensor));
    return divide(x, norm);
}
exports.l2Normalize = l2Normalize;
function preprocessConv2DInput(x, dataFormat) {
    common_1.checkDataFormat(dataFormat);
    if (dataFormat === 'channelsFirst') {
        return tfc.transpose(x, [0, 2, 3, 1]);
    }
    else {
        return x;
    }
}
function conv1dWithBias(x, kernel, bias, strides, padding, dataFormat, dilationRate) {
    if (strides === void 0) { strides = 1; }
    if (padding === void 0) { padding = 'valid'; }
    if (dilationRate === void 0) { dilationRate = 1; }
    if (dataFormat == null) {
        dataFormat = common_3.imageDataFormat();
    }
    common_1.checkDataFormat(dataFormat);
    if (x.shape.length !== 3) {
        throw new errors_1.ValueError("The input of a conv1dWithBias operation should be 3, but is " +
            (x.shape.length + " instead."));
    }
    if (kernel.shape.length !== 3) {
        throw new errors_1.ValueError("The kernel for a conv1dWithBias operation should be 3, but is " +
            (kernel.shape.length + " instead"));
    }
    if (bias != null && bias.shape.length !== 1) {
        throw new errors_1.ValueError("The bias for a conv1dWithBias operation should be 1, but is " +
            (kernel.shape.length + " instead"));
    }
    if (dataFormat === 'channelsFirst') {
        x = transpose(x, [0, 2, 1]);
    }
    if (padding === 'casual') {
        throw new errors_1.NotImplementedError('The support for CASUAL padding mode in conv1dWithBias is not ' +
            'implemented yet.');
    }
    var y = tfc.conv1d(x, kernel, strides, padding === 'same' ? 'same' : 'valid', 'NWC', dilationRate);
    if (bias != null) {
        y = biasAdd(y, bias);
    }
    return y;
}
exports.conv1dWithBias = conv1dWithBias;
function conv1d(x, kernel, strides, padding, dataFormat, dilationRate) {
    if (strides === void 0) { strides = 1; }
    if (padding === void 0) { padding = 'valid'; }
    if (dilationRate === void 0) { dilationRate = 1; }
    common_1.checkDataFormat(dataFormat);
    return conv1dWithBias(x, kernel, null, strides, padding, dataFormat, dilationRate);
}
exports.conv1d = conv1d;
function conv2d(x, kernel, strides, padding, dataFormat, dilationRate) {
    if (strides === void 0) { strides = [1, 1]; }
    if (padding === void 0) { padding = 'valid'; }
    common_1.checkDataFormat(dataFormat);
    return conv2dWithBias(x, kernel, null, strides, padding, dataFormat, dilationRate);
}
exports.conv2d = conv2d;
function conv2dWithBias(x, kernel, bias, strides, padding, dataFormat, dilationRate) {
    if (strides === void 0) { strides = [1, 1]; }
    if (padding === void 0) { padding = 'valid'; }
    if (dataFormat == null) {
        dataFormat = common_3.imageDataFormat();
    }
    common_1.checkDataFormat(dataFormat);
    if (ndim(x) !== 3 && ndim(x) !== 4) {
        throw new errors_1.ValueError("conv2dWithBias expects input to be of rank 3 or 4, but received " +
            (ndim(x) + "."));
    }
    if (ndim(kernel) !== 3 && ndim(kernel) !== 4) {
        throw new errors_1.ValueError("conv2dWithBias expects kernel to be of rank 3 or 4, but received " +
            (ndim(x) + "."));
    }
    var y = preprocessConv2DInput(x, dataFormat);
    if (padding === 'casual') {
        throw new errors_1.NotImplementedError('The support for CASUAL padding mode in conv1dWithBias is not ' +
            'implemented yet.');
    }
    y = tfc.conv2d(y, kernel, strides, padding === 'same' ? 'same' : 'valid', 'NHWC', dilationRate);
    if (bias != null) {
        y = biasAdd(y, bias);
    }
    if (dataFormat === 'channelsFirst') {
        y = tfc.transpose(y, [0, 3, 1, 2]);
    }
    return y;
}
exports.conv2dWithBias = conv2dWithBias;
function depthwiseConv2d(x, depthwiseKernel, strides, padding, dataFormat, dilationRate) {
    if (strides === void 0) { strides = [1, 1]; }
    if (padding === void 0) { padding = 'valid'; }
    if (dataFormat == null) {
        dataFormat = common_3.imageDataFormat();
    }
    common_1.checkDataFormat(dataFormat);
    var y = preprocessConv2DInput(x, dataFormat);
    if (ndim(x) !== 4) {
        throw new errors_1.ValueError("Input for depthwiseConv2d is required to be 4-D, but is instead " +
            (ndim(x) + "-D"));
    }
    if (ndim(depthwiseKernel) !== 4) {
        throw new errors_1.ValueError("depthwiseKernel is required to be 4-D, but is instead " +
            (ndim(depthwiseKernel) + "-D"));
    }
    y = tfc.depthwiseConv2d(y, depthwiseKernel, strides, padding === 'same' ? 'same' : 'valid', 'NHWC', dilationRate);
    if (dataFormat === 'channelsFirst') {
        y = tfc.transpose(y, [0, 3, 1, 2]);
    }
    return y;
}
exports.depthwiseConv2d = depthwiseConv2d;
function pool2d(x, poolSize, strides, padding, dataFormat, poolMode) {
    common_1.checkDataFormat(dataFormat);
    common_1.checkPoolMode(poolMode);
    common_1.checkPaddingMode(padding);
    if (strides == null) {
        strides = [1, 1];
    }
    if (padding == null) {
        padding = 'valid';
    }
    if (dataFormat == null) {
        dataFormat = common_3.imageDataFormat();
    }
    if (poolMode == null) {
        poolMode = 'max';
    }
    x = preprocessConv2DInput(x, dataFormat);
    var y;
    var paddingString = (padding === 'same') ? 'same' : 'valid';
    if (poolMode === 'max') {
        y = tfc.maxPool(x, poolSize, strides, paddingString);
    }
    else {
        y = tfc.avgPool(x, poolSize, strides, paddingString);
    }
    if (dataFormat === 'channelsFirst') {
        y = tfc.transpose(y, [0, 3, 1, 2]);
    }
    return y;
}
exports.pool2d = pool2d;
function nameScope(name, fn) {
    return common_1.nameScope(name, fn);
}
exports.nameScope = nameScope;
function floatx() {
    return types_1.DType.float32;
}
exports.floatx = floatx;
var _uidPrefixes = {};
function getUid(prefix) {
    if (prefix === void 0) { prefix = ''; }
    if (!(prefix in _uidPrefixes)) {
        _uidPrefixes[prefix] = 0;
    }
    _uidPrefixes[prefix] += 1;
    return prefix + _uidPrefixes[prefix].toString();
}
exports.getUid = getUid;
function softmax(x, axis) {
    if (axis === void 0) { axis = -1; }
    return tfc.softmax(x, axis);
}
exports.softmax = softmax;
function categoricalCrossentropy(target, output, fromLogits) {
    if (fromLogits === void 0) { fromLogits = false; }
    if (fromLogits) {
        output = softmax(output);
    }
    else {
        var outputSum = sum(output, shape(output).length - 1, true);
        output = divide(output, outputSum);
    }
    output = clip(output, exports.epsilon(), 1 - exports.epsilon());
    return tfc.neg(tfc.sum(tfc.mul(target.toFloat(), tfc.log(output)), shape(output).length - 1));
}
exports.categoricalCrossentropy = categoricalCrossentropy;
function sparseCategoricalCrossentropy(target, output, fromLogits) {
    if (fromLogits === void 0) { fromLogits = false; }
    var flatTarget = tfc.floor(flatten(target)).toInt();
    var outputShape = shape(output);
    var oneHotTarget = reshape(tfc.oneHot(flatTarget, outputShape[outputShape.length - 1]), outputShape);
    return categoricalCrossentropy(oneHotTarget, output, fromLogits);
}
exports.sparseCategoricalCrossentropy = sparseCategoricalCrossentropy;
function binaryCrossentropy(target, output, fromLogits) {
    if (fromLogits === void 0) { fromLogits = false; }
    var y;
    if (!fromLogits) {
        y = clip(output, exports.epsilon(), 1 - exports.epsilon());
        y = log(divide(y, subtract(tfc.onesLike(y), y)));
    }
    else {
        y = output;
    }
    return sigmoidCrossEntropyWithLogits(target, y);
}
exports.binaryCrossentropy = binaryCrossentropy;
function sigmoidCrossEntropyWithLogits(target, output) {
    var maxOutput = tfc.maximum(output, tfc.zerosLike(output));
    var outputXTarget = tfc.mul(output, target);
    var sigmoidOutput = tfc.log(tfc.add(getScalar(1), tfc.exp(tfc.neg(tfc.abs(output)))));
    var result = tfc.add(tfc.sub(maxOutput, outputXTarget), sigmoidOutput);
    return result;
}
exports.sigmoidCrossEntropyWithLogits = sigmoidCrossEntropyWithLogits;
function sigmoid(x) {
    return tfc.sigmoid(x);
}
exports.sigmoid = sigmoid;
function hardSigmoid(x) {
    var y = scalarPlusArray(tfjs_core_1.scalar(0.5), scalarTimesArray(tfjs_core_1.scalar(0.2), x));
    return clip(y, 0, 1);
}
exports.hardSigmoid = hardSigmoid;
function inTrainPhase(x, alt, training) {
    if (training === void 0) { training = false; }
    return training ? x() : alt();
}
exports.inTrainPhase = inTrainPhase;
function rnn(stepFunction, inputs, initialStates, goBackwards, mask, constants, unroll, inputLength) {
    if (goBackwards === void 0) { goBackwards = false; }
    if (unroll === void 0) { unroll = false; }
    var ndim = inputs.shape.length;
    if (ndim < 3) {
        throw new errors_1.ValueError("Input should be at least 3D, but is " + ndim + "D.");
    }
    var axes = [1, 0].concat(math_utils.range(2, ndim));
    inputs = transpose(inputs, axes);
    if (mask != null) {
        throw new errors_1.NotImplementedError('The rnn() function of the deeplearn.js backend does not support ' +
            'masking yet.');
    }
    if (constants != null) {
        throw new errors_1.NotImplementedError('The rnn() functoin of the deeplearn.js backend does not support ' +
            'constants yet.');
    }
    if (unroll) {
        console.warn('Backend rnn(): the unroll = true option is not applicable to the ' +
            'imperative deeplearn.js backend.');
    }
    if (goBackwards) {
        inputs = reverse(inputs, 0);
    }
    var outputs;
    var lastOutput;
    var states = initialStates;
    var timeSteps = inputs.shape[0];
    for (var t = 0; t < timeSteps; ++t) {
        var currentInput = sliceAlongFirstAxis(inputs, t, 1);
        currentInput = reshape(currentInput, currentInput.shape.slice(1));
        var stepOutputs = stepFunction(currentInput, states);
        lastOutput = stepOutputs[0];
        if (t === 0) {
            outputs = lastOutput.reshape([1].concat(lastOutput.shape));
        }
        else {
            outputs = concatAlongFirstAxis(outputs, lastOutput.reshape([1].concat(lastOutput.shape)));
        }
        states = stepOutputs[1];
    }
    return [
        lastOutput,
        transpose(outputs, [1, 0].concat(math_utils.range(2, outputs.shape.length))),
        states
    ];
}
exports.rnn = rnn;
function gradients(lossFn, variables) {
    var variableList = variables.map(function (variable) { return variable.read(); });
    var valudAndGrads = tfjs_core_1.variableGrads(lossFn, variableList);
    return variables.map(function (variable) { return valudAndGrads.grads[variable.name]; });
}
exports.gradients = gradients;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var K = require("./backend/tfjs_backend");
var errors_1 = require("./errors");
function meanSquaredError(yTrue, yPred) {
    return K.mean(K.square(K.subtract(yPred, yTrue)), -1);
}
exports.meanSquaredError = meanSquaredError;
function meanAbsoluteError(yTrue, yPred) {
    return K.mean(K.abs(K.subtract(yPred, yTrue)), -1);
}
exports.meanAbsoluteError = meanAbsoluteError;
function meanAbsolutePercentageError(yTrue, yPred) {
    var diff = K.subtract(yTrue, yPred);
    var clippedTrue = K.clip(K.abs(yTrue), K.epsilon(), Number.MAX_VALUE);
    var absResult = K.abs(K.divide(diff, clippedTrue));
    return K.scalarTimesArray(K.getScalar(100.0), K.mean(absResult, -1));
}
exports.meanAbsolutePercentageError = meanAbsolutePercentageError;
function meanSquaredLogarithmicError(yTrue, yPred) {
    var one = K.getScalar(1.0);
    var clippedPred = K.clip(yPred, K.epsilon(), Number.MAX_VALUE);
    var firstLog = K.log(K.scalarPlusArray(one, clippedPred));
    var clippedTrue = K.clip(yTrue, K.epsilon(), Number.MAX_VALUE);
    var secondLog = K.log(K.scalarPlusArray(one, clippedTrue));
    return K.mean(K.square(K.subtract(firstLog, secondLog)), -1);
}
exports.meanSquaredLogarithmicError = meanSquaredLogarithmicError;
function squaredHinge(yTrue, yPred) {
    var zeroTensor = K.getScalar(0.0);
    var one = K.getScalar(1.0);
    var maxResult = K.maximum(zeroTensor, K.subtract(one, K.multiply(yTrue, yPred)));
    return K.mean(K.square(maxResult), -1);
}
exports.squaredHinge = squaredHinge;
function hinge(yTrue, yPred) {
    var zeroTensor = K.getScalar(0.0);
    var one = K.getScalar(1.0);
    var maxResult = K.maximum(zeroTensor, K.subtract(one, K.multiply(yTrue, yPred)));
    return K.mean(maxResult, -1);
}
exports.hinge = hinge;
function categoricalHinge(yTrue, yPred) {
    var zeroTensor = K.getScalar(0.0);
    var one = K.getScalar(1.0);
    var pos = K.sum(K.multiply(yTrue, yPred), -1);
    var neg = K.max(K.multiply(K.subtract(one, yTrue), yPred), -1);
    return K.maximum(zeroTensor, K.scalarPlusArray(one, K.subtract(neg, pos)));
}
exports.categoricalHinge = categoricalHinge;
function logcosh(yTrue, yPred) {
    var log2 = K.getScalar(Math.log(2.0));
    var predictionDiff = K.subtract(yPred, yTrue);
    var logcoshResult = K.subtract(K.add(predictionDiff, K.softplus(K.scalarTimesArray(K.getScalar(-2.0), predictionDiff))), log2);
    return K.mean(logcoshResult, -1);
}
exports.logcosh = logcosh;
function categoricalCrossentropy(yTrue, yPred) {
    return K.categoricalCrossentropy(yTrue, yPred);
}
exports.categoricalCrossentropy = categoricalCrossentropy;
function sparseCategoricalCrossentropy(yTrue, yPred) {
    return K.sparseCategoricalCrossentropy(yTrue, yPred);
}
exports.sparseCategoricalCrossentropy = sparseCategoricalCrossentropy;
function binaryCrossentropy(yTrue, yPred) {
    return K.mean(K.binaryCrossentropy(yTrue, yPred), -1);
}
exports.binaryCrossentropy = binaryCrossentropy;
function kullbackLeiblerDivergence(yTrue, yPred) {
    var clippedTrue = K.clip(yTrue, K.epsilon(), 1);
    var clippedPred = K.clip(yPred, K.epsilon(), 1);
    return K.sum(K.multiply(yTrue, K.log(K.divide(clippedTrue, clippedPred))), -1);
}
exports.kullbackLeiblerDivergence = kullbackLeiblerDivergence;
function poisson(yTrue, yPred) {
    var logPred = K.log(K.scalarPlusArray(K.getScalar(K.epsilon()), yPred));
    return K.mean(K.subtract(yPred, K.multiply(yTrue, logPred)), -1);
}
exports.poisson = poisson;
function cosineProximity(yTrue, yPred) {
    var trueNormalized = K.l2Normalize(yTrue, -1);
    var predNormalized = K.l2Normalize(yPred, -1);
    var trueXPred = K.multiply(trueNormalized, predNormalized);
    return K.neg(K.sum(trueXPred, -1));
}
exports.cosineProximity = cosineProximity;
exports.mse = meanSquaredError;
exports.MSE = meanSquaredError;
exports.mae = meanAbsoluteError;
exports.MAE = meanAbsoluteError;
exports.mape = meanAbsolutePercentageError;
exports.MAPE = meanAbsolutePercentageError;
exports.msle = meanSquaredLogarithmicError;
exports.MSLE = meanSquaredLogarithmicError;
exports.kld = kullbackLeiblerDivergence;
exports.KLD = kullbackLeiblerDivergence;
exports.cosine = cosineProximity;
function get(identifierOrFn) {
    var lossesMap = {
        meanSquaredError: meanSquaredError,
        meanAbsoluteError: meanAbsoluteError,
        meanAbsolutePercentageError: meanAbsolutePercentageError,
        meanSquaredLogarithmicError: meanSquaredLogarithmicError,
        squaredHinge: squaredHinge,
        hinge: hinge,
        categoricalHinge: categoricalHinge,
        logcosh: logcosh,
        categoricalCrossentropy: categoricalCrossentropy,
        sparseCategoricalCrossentropy: sparseCategoricalCrossentropy,
        binaryCrossentropy: binaryCrossentropy,
        kullbackLeiblerDivergence: kullbackLeiblerDivergence,
        poisson: poisson,
        cosineProximity: cosineProximity
    };
    if (typeof identifierOrFn === 'string') {
        if (identifierOrFn in lossesMap) {
            return lossesMap[identifierOrFn];
        }
        throw new errors_1.ValueError("Unknown loss " + identifierOrFn);
    }
    else {
        return identifierOrFn;
    }
}
exports.get = get;

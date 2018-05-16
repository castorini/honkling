"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tfjs_core_1 = require("@tensorflow/tfjs-core");
var K = require("./backend/tfjs_backend");
var errors_1 = require("./errors");
function getActivation(activationType) {
    if (activationType == null) {
        return linear;
    }
    else if (activationType.toLowerCase() === 'elu') {
        return elu;
    }
    else if (activationType.toLowerCase() === 'hardsigmoid') {
        return hardSigmoid;
    }
    else if (activationType.toLowerCase() === 'linear') {
        return linear;
    }
    else if (activationType.toLowerCase() === 'relu') {
        return relu;
    }
    else if (activationType.toLowerCase() === 'relu6') {
        return relu6;
    }
    else if (activationType.toLowerCase() === 'selu') {
        return selu;
    }
    else if (activationType.toLowerCase() === 'sigmoid') {
        return sigmoid;
    }
    else if (activationType.toLowerCase() === 'softmax') {
        return softmax;
    }
    else if (activationType.toLowerCase() === 'softplus') {
        return softplus;
    }
    else if (activationType.toLowerCase() === 'softsign') {
        return softsign;
    }
    else if (activationType.toLowerCase() === 'tanh') {
        return tanh;
    }
    else {
        throw new errors_1.ValueError("Unsupported activation function " + activationType);
    }
}
exports.getActivation = getActivation;
function elu(x, alpha) {
    if (alpha === void 0) { alpha = 1; }
    return K.elu(x, alpha);
}
exports.elu = elu;
function selu(x) {
    return K.selu(x);
}
exports.selu = selu;
function relu(x) {
    return K.relu(x);
}
exports.relu = relu;
function relu6(x) {
    return K.minimum(tfjs_core_1.scalar(6.0), K.relu(x));
}
exports.relu6 = relu6;
function linear(x) {
    return x;
}
exports.linear = linear;
function sigmoid(x) {
    return K.sigmoid(x);
}
exports.sigmoid = sigmoid;
function hardSigmoid(x) {
    return K.hardSigmoid(x);
}
exports.hardSigmoid = hardSigmoid;
function softplus(x) {
    return K.softplus(x);
}
exports.softplus = softplus;
function softsign(x) {
    return K.softsign(x);
}
exports.softsign = softsign;
function tanh(x) {
    return K.tanh(x);
}
exports.tanh = tanh;
function softmax(x, axis) {
    if (axis === void 0) { axis = (-1); }
    return K.softmax(x, axis);
}
exports.softmax = softmax;
function serializeActivation(activation) {
    return activation.name;
}
exports.serializeActivation = serializeActivation;

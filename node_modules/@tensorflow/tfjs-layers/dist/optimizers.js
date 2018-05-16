"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tfjs_core_1 = require("@tensorflow/tfjs-core");
var K = require("./backend/tfjs_backend");
var errors_1 = require("./errors");
function getOptimizer(identifier) {
    var optimizerMap = {
        'Adagrad': function () { return tfjs_core_1.train.adagrad(.01); },
        'Adam': function () { return tfjs_core_1.train.adam(.001, .9, .999, K.epsilon()); },
        'RMSProp': function () { return tfjs_core_1.train.rmsprop(.001, .9, null, K.epsilon()); },
        'SGD': function () { return tfjs_core_1.train.sgd(.01); }
    };
    optimizerMap['adagrad'] = optimizerMap['Adagrad'];
    optimizerMap['adam'] = optimizerMap['Adam'];
    optimizerMap['rmsprop'] = optimizerMap['RMSProp'];
    optimizerMap['sgd'] = optimizerMap['SGD'];
    if (identifier in optimizerMap) {
        return optimizerMap[identifier]();
    }
    throw new errors_1.ValueError("Unknown Optimizer " + identifier);
}
exports.getOptimizer = getOptimizer;

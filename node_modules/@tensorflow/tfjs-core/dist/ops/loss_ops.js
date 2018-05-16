"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var doc_1 = require("../doc");
var util = require("../util");
var operation_1 = require("./operation");
var ops = require("./ops");
var Reduction;
(function (Reduction) {
    Reduction[Reduction["NONE"] = 0] = "NONE";
    Reduction[Reduction["MEAN"] = 1] = "MEAN";
    Reduction[Reduction["SUM"] = 2] = "SUM";
    Reduction[Reduction["SUM_BY_NONZERO_WEIGHTS"] = 3] = "SUM_BY_NONZERO_WEIGHTS";
})(Reduction = exports.Reduction || (exports.Reduction = {}));
var LossOps = (function () {
    function LossOps() {
    }
    LossOps.computeWeightedLoss = function (losses, weights, reduction) {
        if (reduction === void 0) { reduction = Reduction.SUM_BY_NONZERO_WEIGHTS; }
        util.assertArgumentsAreTensors({ losses: losses }, 'computeWeightedLoss');
        if (weights != null) {
            util.assertArgumentsAreTensors({ weights: weights }, 'computeWeightedLoss');
        }
        var weightedLoss = (weights == null) ? losses : losses.mul(weights);
        if (reduction === Reduction.NONE) {
            return weightedLoss;
        }
        if (reduction === Reduction.SUM) {
            return weightedLoss.sum();
        }
        if (reduction === Reduction.MEAN) {
            return (weights == null) ? weightedLoss.mean() :
                weightedLoss.sum().div(weights.sum());
        }
        if (reduction === Reduction.SUM_BY_NONZERO_WEIGHTS) {
            if (weights == null) {
                return weightedLoss.sum().div(ops.scalar(losses.size));
            }
            else {
                var numNonZeros = weights.notEqual(ops.scalar(0)).sum().toFloat();
                return weightedLoss.sum().div(numNonZeros);
            }
        }
        throw Error("Unknown reduction: " + reduction);
    };
    LossOps.absoluteDifference = function (labels, predictions, weights, reduction) {
        if (reduction === void 0) { reduction = Reduction.SUM_BY_NONZERO_WEIGHTS; }
        util.assertArgumentsAreTensors({ labels: labels, predictions: predictions }, 'absoluteDifference');
        if (weights != null) {
            util.assertArgumentsAreTensors({ weights: weights }, 'absoluteDifference');
        }
        util.assertShapesMatch(labels.shape, predictions.shape, 'Error in absoluteDifference: ');
        var losses = labels.sub(predictions).abs();
        return LossOps.computeWeightedLoss(losses, weights, reduction);
    };
    __decorate([
        doc_1.doc({ heading: 'Training', subheading: 'Losses', namespace: 'losses' }),
        operation_1.operation
    ], LossOps, "computeWeightedLoss", null);
    __decorate([
        doc_1.doc({ heading: 'Training', subheading: 'Losses', namespace: 'losses' }),
        operation_1.operation
    ], LossOps, "absoluteDifference", null);
    return LossOps;
}());
exports.LossOps = LossOps;

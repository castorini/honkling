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
var environment_1 = require("../environment");
var globals_1 = require("../globals");
var ops_1 = require("../ops/ops");
var optimizer_1 = require("./optimizer");
var AdamaxOptimizer = (function (_super) {
    __extends(AdamaxOptimizer, _super);
    function AdamaxOptimizer(learningRate, beta1, beta2, epsilon, decay) {
        if (epsilon === void 0) { epsilon = 1e-8; }
        if (decay === void 0) { decay = 0.0; }
        var _this = _super.call(this) || this;
        _this.learningRate = learningRate;
        _this.accumulatedFirstMoment = {};
        _this.accumulatedWeightedInfNorm = {};
        _this.c = globals_1.keep(ops_1.scalar(-learningRate));
        _this.eps = globals_1.keep(ops_1.scalar(epsilon));
        _this.beta1 = globals_1.keep(ops_1.scalar(beta1));
        _this.beta2 = globals_1.keep(ops_1.scalar(beta2));
        _this.decay = globals_1.keep(ops_1.scalar(decay));
        globals_1.tidy(function () {
            _this.iteration = ops_1.scalar(0).variable();
            _this.accBeta1 = ops_1.scalar(beta1).variable();
        });
        _this.oneMinusBeta1 = globals_1.keep(ops_1.scalar(1 - beta1));
        _this.one = globals_1.keep(ops_1.scalar(1));
        return _this;
    }
    AdamaxOptimizer.prototype.applyGradients = function (variableGradients) {
        var _this = this;
        globals_1.tidy(function () {
            var oneMinusAccBeta1 = _this.one.sub(_this.accBeta1);
            var lr = _this.c.div(_this.one.add(_this.decay.mul(_this.iteration)));
            for (var variableName in variableGradients) {
                var value = environment_1.ENV.engine.registeredVariables[variableName];
                if (_this.accumulatedFirstMoment[variableName] == null) {
                    var trainable = false;
                    _this.accumulatedFirstMoment[variableName] =
                        ops_1.zerosLike(value).variable(trainable);
                }
                if (_this.accumulatedWeightedInfNorm[variableName] == null) {
                    var trainable = false;
                    _this.accumulatedWeightedInfNorm[variableName] =
                        ops_1.zerosLike(value).variable(trainable);
                }
                var gradient = variableGradients[variableName];
                var firstMoment = _this.accumulatedFirstMoment[variableName];
                var weightedInfNorm = _this.accumulatedWeightedInfNorm[variableName];
                var newFirstMoment = _this.beta1.mul(firstMoment).add(_this.oneMinusBeta1.mul(gradient));
                var ut0 = _this.beta2.mul(weightedInfNorm);
                var ut1 = gradient.abs();
                var newWeightedInfNorm = ut0.maximum(ut1);
                _this.accumulatedFirstMoment[variableName].assign(newFirstMoment);
                _this.accumulatedWeightedInfNorm[variableName].assign(newWeightedInfNorm);
                var newValue = lr.div(oneMinusAccBeta1)
                    .mul(newFirstMoment.div(_this.eps.add(newWeightedInfNorm)))
                    .add(value);
                value.assign(newValue);
            }
            _this.iteration.assign(_this.iteration.add(_this.one));
            _this.accBeta1.assign(_this.accBeta1.mul(_this.beta1));
        });
    };
    AdamaxOptimizer.prototype.dispose = function () {
        var _this = this;
        this.c.dispose();
        this.eps.dispose();
        this.accBeta1.dispose();
        this.beta1.dispose();
        this.beta2.dispose();
        this.oneMinusBeta1.dispose();
        this.decay.dispose();
        this.iteration.dispose();
        this.one.dispose();
        if (this.accumulatedFirstMoment != null) {
            Object.keys(this.accumulatedFirstMoment)
                .forEach(function (name) { return _this.accumulatedFirstMoment[name].dispose(); });
        }
        if (this.accumulatedWeightedInfNorm != null) {
            Object.keys(this.accumulatedWeightedInfNorm)
                .forEach(function (name) { return _this.accumulatedWeightedInfNorm[name].dispose(); });
        }
    };
    return AdamaxOptimizer;
}(optimizer_1.Optimizer));
exports.AdamaxOptimizer = AdamaxOptimizer;

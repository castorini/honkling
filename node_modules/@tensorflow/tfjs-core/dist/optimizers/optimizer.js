"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var doc_1 = require("../doc");
var globals_1 = require("../globals");
var Optimizer = (function () {
    function Optimizer() {
    }
    Optimizer.prototype.minimize = function (f, returnCost, varList) {
        if (returnCost === void 0) { returnCost = false; }
        var _a = this.computeGradients(f, varList), value = _a.value, grads = _a.grads;
        this.applyGradients(grads);
        var varNames = Object.keys(grads);
        varNames.forEach(function (varName) { return grads[varName].dispose(); });
        if (returnCost) {
            return value;
        }
        else {
            value.dispose();
            return null;
        }
    };
    Optimizer.prototype.computeGradients = function (f, varList) {
        return globals_1.variableGrads(f, varList);
    };
    __decorate([
        doc_1.doc({ heading: 'Training', subheading: 'Optimizers' })
    ], Optimizer.prototype, "minimize", null);
    Optimizer = __decorate([
        doc_1.doc({ heading: 'Training', subheading: 'Classes', namespace: 'train' })
    ], Optimizer);
    return Optimizer;
}());
exports.Optimizer = Optimizer;

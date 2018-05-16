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
var common_1 = require("../backend/common");
var K = require("../backend/tfjs_backend");
var topology_1 = require("../engine/topology");
var errors_1 = require("../errors");
var generic_utils_1 = require("../utils/generic_utils");
var ZeroPadding2D = (function (_super) {
    __extends(ZeroPadding2D, _super);
    function ZeroPadding2D(config) {
        var _this = this;
        if (config == null) {
            config = {};
        }
        _this = _super.call(this, config) || this;
        _this.dataFormat =
            config.dataFormat == null ? common_1.imageDataFormat() : config.dataFormat;
        if (config.padding == null) {
            _this.padding = [[1, 1], [1, 1]];
        }
        else if (typeof config.padding === 'number') {
            _this.padding =
                [[config.padding, config.padding], [config.padding, config.padding]];
        }
        else {
            config.padding = config.padding;
            if (config.padding.length !== 2) {
                throw new errors_1.ValueError("ZeroPadding2D expects padding to be a length-2 array, but " +
                    ("received a length-" + config.padding.length + " array."));
            }
            var heightPadding = void 0;
            var widthPadding = void 0;
            if (typeof config.padding[0] === 'number') {
                heightPadding =
                    [config.padding[0], config.padding[0]];
                widthPadding =
                    [config.padding[1], config.padding[1]];
            }
            else {
                config.padding = config.padding;
                if (config.padding[0].length !== 2) {
                    throw new errors_1.ValueError("ZeroPadding2D expects height padding to be a length-2 array, " +
                        ("but received a length-" + config.padding[0].length + " array."));
                }
                heightPadding = config.padding[0];
                if (config.padding[1].length !== 2) {
                    throw new errors_1.ValueError("ZeroPadding2D expects width padding to be a length-2 array, " +
                        ("but received a length-" + config.padding[1].length + " array."));
                }
                widthPadding = config.padding[1];
            }
            _this.padding = [heightPadding, widthPadding];
        }
        _this.inputSpec = [new topology_1.InputSpec({ ndim: 4 })];
        return _this;
    }
    ZeroPadding2D.prototype.computeOutputShape = function (inputShape) {
        inputShape = generic_utils_1.getExactlyOneShape(inputShape);
        var rows;
        var cols;
        if (this.dataFormat === 'channelsFirst') {
            if (inputShape[2] != null && inputShape[2] >= 0) {
                rows = inputShape[2] + this.padding[0][0] + this.padding[0][1];
            }
            else {
                rows = null;
            }
            if (inputShape[3] != null && inputShape[3] >= 0) {
                cols = inputShape[3] + this.padding[1][0] + this.padding[1][1];
            }
            else {
                cols = null;
            }
            return [inputShape[0], inputShape[1], rows, cols];
        }
        else {
            if (inputShape[1] != null && inputShape[1] >= 0) {
                rows = inputShape[1] + this.padding[0][0] + this.padding[0][1];
            }
            else {
                rows = null;
            }
            if (inputShape[2] != null && inputShape[2] >= 0) {
                cols = inputShape[2] + this.padding[1][0] + this.padding[1][1];
            }
            else {
                cols = null;
            }
            return [inputShape[0], rows, cols, inputShape[3]];
        }
    };
    ZeroPadding2D.prototype.call = function (inputs, kwargs) {
        return K.spatial2dPadding(generic_utils_1.getExactlyOneTensor(inputs), this.padding, this.dataFormat);
    };
    ZeroPadding2D.prototype.getClassName = function () {
        return 'ZeroPadding2D';
    };
    ZeroPadding2D.prototype.getConfig = function () {
        var config = {
            padding: this.padding,
            dataFormat: this.dataFormat,
        };
        var baseConfig = _super.prototype.getConfig.call(this);
        Object.assign(config, baseConfig);
        return config;
    };
    return ZeroPadding2D;
}(topology_1.Layer));
exports.ZeroPadding2D = ZeroPadding2D;
generic_utils_1.ClassNameMap.register('ZeroPadding2D', ZeroPadding2D);

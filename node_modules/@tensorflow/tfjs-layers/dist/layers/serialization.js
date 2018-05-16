"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var generic_utils_1 = require("../utils/generic_utils");
function deserialize(config, customObjects) {
    if (customObjects === void 0) { customObjects = {}; }
    return generic_utils_1.deserializeKerasObject(config, generic_utils_1.ClassNameMap.getMap().pythonClassNameMap, customObjects, 'layer');
}
exports.deserialize = deserialize;

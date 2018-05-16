"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("../errors");
var types_1 = require("../types");
function pyListRepeat(value, numValues) {
    if (Array.isArray(value)) {
        var newArray = [];
        for (var i = 0; i < numValues; i++) {
            newArray = newArray.concat(value);
        }
        return newArray;
    }
    else {
        var newArray = new Array(numValues);
        newArray.fill(value);
        return newArray;
    }
}
exports.pyListRepeat = pyListRepeat;
function pyGetAttr(obj, attrName, defaultValue) {
    if (attrName in obj) {
        return obj[attrName];
    }
    if (defaultValue === undefined) {
        throw new errors_1.AttributeError('pyGetAttr: Attempting to get attribute ' + attrName +
            'with no default value defined');
    }
    return defaultValue;
}
exports.pyGetAttr = pyGetAttr;
function pyNormalizeArrayIndex(x, index) {
    if (x == null || index == null) {
        throw new errors_1.ValueError("Must provide a valid array and index for " +
            ("pyNormalizeArrayIndex(). Got array " + x + " and index " + index + "."));
    }
    var errMsg = "Index " + index + " out of range for array of length " + x.length;
    if (index < 0) {
        if (index < -x.length) {
            throw new errors_1.IndexError(errMsg);
        }
        return x.length + index;
    }
    if (index >= x.length) {
        throw new errors_1.IndexError(errMsg);
    }
    return index;
}
exports.pyNormalizeArrayIndex = pyNormalizeArrayIndex;
function assert(val, message) {
    if (!val) {
        throw new errors_1.AssertionError(message);
    }
}
exports.assert = assert;
function count(array, refernce) {
    var counter = 0;
    for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
        var item = array_1[_i];
        if (item === refernce) {
            counter++;
        }
    }
    return counter;
}
exports.count = count;
var ClassNameMap = (function () {
    function ClassNameMap() {
        this.pythonClassNameMap = {};
    }
    ClassNameMap.getMap = function () {
        if (ClassNameMap.instance == null) {
            ClassNameMap.instance = new ClassNameMap();
        }
        return ClassNameMap.instance;
    };
    ClassNameMap.register = function (className, cls) {
        this.getMap().pythonClassNameMap[className] =
            [cls, cls.fromConfig];
    };
    return ClassNameMap;
}());
exports.ClassNameMap = ClassNameMap;
var SerializableEnumRegistry = (function () {
    function SerializableEnumRegistry() {
        this.enumRegistry = {};
    }
    SerializableEnumRegistry.getMap = function () {
        if (SerializableEnumRegistry.instance == null) {
            SerializableEnumRegistry.instance = new SerializableEnumRegistry();
        }
        return SerializableEnumRegistry.instance;
    };
    SerializableEnumRegistry.register = function (fieldName, enumCls) {
        if (SerializableEnumRegistry.contains(fieldName)) {
            throw new errors_1.ValueError("Attempting to register a repeated enum: " + fieldName);
        }
        this.getMap().enumRegistry[fieldName] = enumCls;
    };
    SerializableEnumRegistry.contains = function (fieldName) {
        return fieldName in this.getMap().enumRegistry;
    };
    SerializableEnumRegistry.lookup = function (fieldName, value) {
        return this.getMap().enumRegistry[fieldName][value];
    };
    SerializableEnumRegistry.reverseLookup = function (fieldName, value) {
        var enumMap = this.getMap().enumRegistry[fieldName];
        for (var candidateString in enumMap) {
            if (enumMap[candidateString] === value) {
                return candidateString;
            }
        }
        throw new errors_1.ValueError("Could not find serialization string for " + value);
    };
    return SerializableEnumRegistry;
}());
exports.SerializableEnumRegistry = SerializableEnumRegistry;
function singletonOrArray(xs) {
    if (xs.length === 1) {
        return xs[0];
    }
    return xs;
}
exports.singletonOrArray = singletonOrArray;
function toList(x) {
    if (Array.isArray(x)) {
        return x;
    }
    return [x];
}
exports.toList = toList;
function objectListUid(objs) {
    var objectList = toList(objs);
    var retVal = '';
    for (var _i = 0, objectList_1 = objectList; _i < objectList_1.length; _i++) {
        var obj = objectList_1[_i];
        if (obj.id == null) {
            throw new errors_1.ValueError("Object " + obj + " passed to objectListUid without an id");
        }
        if (retVal !== '') {
            retVal = retVal + ', ';
        }
        retVal = retVal + Math.abs(obj.id);
    }
    return retVal;
}
exports.objectListUid = objectListUid;
function isArrayOfShapes(x) {
    return Array.isArray(x) && Array.isArray(x[0]);
}
exports.isArrayOfShapes = isArrayOfShapes;
function normalizeShapeList(x) {
    if (x.length === 0) {
        return [];
    }
    if (!Array.isArray(x[0])) {
        return [x];
    }
    return x;
}
exports.normalizeShapeList = normalizeShapeList;
function toSnakeCase(name) {
    var intermediate = name.replace(/(.)([A-Z][a-z0-9]+)/g, '$1_$2');
    var insecure = intermediate.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    if (insecure[0] !== '_') {
        return insecure;
    }
    return 'private' + insecure;
}
exports.toSnakeCase = toSnakeCase;
function toCamelCase(identifier) {
    if (identifier.length <= 1) {
        return identifier;
    }
    if (identifier.indexOf('_') === -1) {
        return identifier;
    }
    return identifier.replace(/[_]+(\w|$)/g, function (m, p1) { return p1.toUpperCase(); });
}
exports.toCamelCase = toCamelCase;
var _GLOBAL_CUSTOM_OBJECTS = {};
function serializeKerasObject(instance) {
    if (instance === null || instance === undefined) {
        return null;
    }
    return { className: instance.getClassName(), config: instance.getConfig() };
}
exports.serializeKerasObject = serializeKerasObject;
function deserializeKerasObject(identifier, moduleObjects, customObjects, printableModuleName) {
    if (moduleObjects === void 0) { moduleObjects = {}; }
    if (customObjects === void 0) { customObjects = {}; }
    if (printableModuleName === void 0) { printableModuleName = 'object'; }
    if (typeof identifier === 'string') {
        var functionName = identifier;
        var fn = void 0;
        if (functionName in customObjects) {
            fn = customObjects[functionName];
        }
        else if (functionName in _GLOBAL_CUSTOM_OBJECTS) {
            fn = _GLOBAL_CUSTOM_OBJECTS[functionName];
        }
        else {
            fn = moduleObjects[functionName];
            if (fn == null) {
                throw new errors_1.ValueError("Unknown " + printableModuleName + ": " + identifier);
            }
        }
        return fn;
    }
    else {
        var config = identifier;
        if (config.className == null || config.config == null) {
            throw new errors_1.ValueError(printableModuleName + ": Improper config format: " +
                (JSON.stringify(config) + ".\n") +
                "'className' and 'config' must set.");
        }
        var className = config.className;
        var cls = void 0, fromConfig = void 0;
        if (className in customObjects) {
            _a = customObjects.get(className), cls = _a[0], fromConfig = _a[1];
        }
        else if (className in _GLOBAL_CUSTOM_OBJECTS) {
            _b = _GLOBAL_CUSTOM_OBJECTS.className, cls = _b[0], fromConfig = _b[1];
        }
        else if (className in moduleObjects) {
            _c = moduleObjects[className], cls = _c[0], fromConfig = _c[1];
        }
        if (cls == null) {
            throw new errors_1.ValueError("Unknown " + printableModuleName + ": " + className);
        }
        if (fromConfig != null) {
            var customObjectsCombined = {};
            for (var _i = 0, _d = Object.keys(_GLOBAL_CUSTOM_OBJECTS); _i < _d.length; _i++) {
                var key = _d[_i];
                customObjectsCombined[key] = _GLOBAL_CUSTOM_OBJECTS[key];
            }
            for (var _e = 0, _f = Object.keys(customObjects); _e < _f.length; _e++) {
                var key = _f[_e];
                customObjectsCombined[key] = customObjects[key];
            }
            var nestedConfig = config.config;
            nestedConfig.customObjects = customObjectsCombined;
            var backupCustomObjects = __assign({}, _GLOBAL_CUSTOM_OBJECTS);
            for (var _g = 0, _h = Object.keys(customObjects); _g < _h.length; _g++) {
                var key = _h[_g];
                _GLOBAL_CUSTOM_OBJECTS[key] = customObjects[key];
            }
            var returnObj = fromConfig(cls, config.config);
            _GLOBAL_CUSTOM_OBJECTS = __assign({}, backupCustomObjects);
            return returnObj;
        }
        else {
            var backupCustomObjects = __assign({}, _GLOBAL_CUSTOM_OBJECTS);
            for (var _j = 0, _k = Object.keys(customObjects); _j < _k.length; _j++) {
                var key = _k[_j];
                _GLOBAL_CUSTOM_OBJECTS[key] = customObjects[key];
            }
            var returnObj = new cls(config.config);
            _GLOBAL_CUSTOM_OBJECTS = __assign({}, backupCustomObjects);
            return returnObj;
        }
    }
    var _a, _b, _c;
}
exports.deserializeKerasObject = deserializeKerasObject;
function getExactlyOneTensor(xs) {
    var x;
    if (Array.isArray(xs)) {
        if (xs.length !== 1) {
            throw new errors_1.ValueError("Expected Tensor length to be 1; got " + xs.length);
        }
        x = xs[0];
    }
    else {
        x = xs;
    }
    return x;
}
exports.getExactlyOneTensor = getExactlyOneTensor;
function getExactlyOneShape(shapes) {
    if (Array.isArray(shapes) && Array.isArray(shapes[0])) {
        if (shapes.length === 1) {
            shapes = shapes;
            return shapes[0];
        }
        else {
            throw new errors_1.ValueError("Expected exactly 1 Shape; got " + shapes.length);
        }
    }
    else {
        return shapes;
    }
}
exports.getExactlyOneShape = getExactlyOneShape;
function numberCompare(a, b) {
    return (a < b) ? -1 : ((a > b) ? 1 : 0);
}
exports.numberCompare = numberCompare;
function reverseNumberCompare(a, b) {
    return -1 * numberCompare(a, b);
}
exports.reverseNumberCompare = reverseNumberCompare;
function stringToDType(dtype) {
    switch (dtype) {
        case 'float32':
            return types_1.DType.float32;
        default:
            throw new errors_1.ValueError("Invalid dtype: " + dtype);
    }
}
exports.stringToDType = stringToDType;
function stringsEqual(xs, ys) {
    if (xs == null || ys == null) {
        return xs === ys;
    }
    if (xs.length !== ys.length) {
        return false;
    }
    for (var i = 0; i < xs.length; ++i) {
        if (xs[i] !== ys[i]) {
            return false;
        }
    }
    return true;
}
exports.stringsEqual = stringsEqual;
function unique(xs) {
    if (xs == null) {
        return xs;
    }
    var out = [];
    for (var _i = 0, xs_1 = xs; _i < xs_1.length; _i++) {
        var x = xs_1[_i];
        if (out.indexOf(x) === -1) {
            out.push(x);
        }
    }
    return out;
}
exports.unique = unique;
function isObjectEmpty(obj) {
    if (obj == null) {
        throw new errors_1.ValueError("Invalid value in obj: " + JSON.stringify(obj));
    }
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}
exports.isObjectEmpty = isObjectEmpty;

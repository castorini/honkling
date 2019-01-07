"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _powerSpectrum = _interopRequireDefault(require("./powerSpectrum"));

var _utilities = _interopRequireDefault(require("./../utilities"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// ~~~ ORIGINAL CODE ~~~
// var dct = require('dct');
// ~~~~~~~~~~~~~~~~
// ~~~ NEW CODE ~~~
var cosMap = null; // Builds a cosine map for the given input size. This allows multiple input sizes to be memoized automagically
// if you want to run the DCT over and over.

var memoizeCosines = function memoizeCosines(N) {
  cosMap = cosMap || {};
  cosMap[N] = new Array(N * N);
  var PI_N = Math.PI / (2 * N); // first row

  for (var n = 0; n < N; n++) {
    cosMap[N][n] = 1.0 / Math.sqrt(N);
  }

  for (var k = 1; k < N; k++) {
    for (var n = 0; n < N; n++) {
      cosMap[N][n + k * N] = Math.cos(PI_N * (n * 2 + 1) * k) * Math.sqrt(2 / N);
    }
  }
};

function dct(signal, scale) {
  var L = signal.length;
  scale = scale || 2;
  if (!cosMap || !cosMap[L]) memoizeCosines(L);
  var coefficients = signal.map(function () {
    return 0;
  });
  return coefficients.map(function (__, ix) {
    return scale * signal.reduce(function (prev, cur, ix_, arr) {
      return prev + cur * cosMap[L][ix_ + ix * L];
    }, 0);
  });
}

; // ~~~~~~~~~~~~~~~~

function _default(args) {
  if (_typeof(args.ampSpectrum) !== 'object') {
    throw new TypeError('Valid ampSpectrum is required to generate MFCC');
  }

  if (_typeof(args.melFilterBank) !== 'object') {
    throw new TypeError('Valid melFilterBank is required to generate MFCC');
  }

  var numberOfMFCCCoefficients = Math.min(40, Math.max(1, args.numberOfMFCCCoefficients || 13)); // Tutorial from:
  // http://practicalcryptography.com/miscellaneous/machine-learning
  // /guide-mel-frequency-cepstral-coefficients-mfccs/

  var powSpec = (0, _powerSpectrum.default)(args);
  var numFilters = args.melFilterBank.length;
  var filtered = Array(numFilters);

  if (numFilters < numberOfMFCCCoefficients) {
    throw new Error("Insufficient filter bank for requested number of coefficients");
  }

  var loggedMelBands = new Float32Array(numFilters); // ~~~ ORIGINAL CODE ~~~
  // for (let i = 0; i < loggedMelBands.length; i++) {
  //   filtered[i] = new Float32Array(args.bufferSize / 2);
  //   loggedMelBands[i] = 0;
  //   for (let j = 0; j < (args.bufferSize / 2); j++) {
  //     //point-wise multiplication between power spectrum and filterbanks.
  //     filtered[i][j] = args.melFilterBank[i][j] * powSpec[j];
  //
  //     //summing up all of the coefficients into one array
  //     loggedMelBands[i] += filtered[i][j];
  //   }
  //
  //   //log each coefficient.
  //   loggedMelBands[i] = Math.log(loggedMelBands[i] + 1);
  // }
  //
  // //dct
  // let loggedMelBandsArray = Array.prototype.slice.call(loggedMelBands);
  // let mfccs = dct(loggedMelBandsArray).slice(0, numberOfMFCCCoefficients);
  // ~~~~~~~~~~~~~~~~
  // ~~~ NEW CODE ~~~

  for (var i = 0; i < numFilters; i++) {
    filtered[i] = new Float32Array(args.bufferSize / 2 + 1);
    loggedMelBands[i] = 0;

    for (var j = 0; j < filtered[i].length; j++) {
      //point-wise multiplication between power spectrum and filterbanks.
      filtered[i][j] = args.melFilterBank[i][j] * powSpec[j]; //summing up all of the coefficients into one array

      loggedMelBands[i] += filtered[i][j];
    } //log positive coefficient.


    if (loggedMelBands[i] > 0) {
      loggedMelBands[i] = Math.log(loggedMelBands[i]);
    }
  } //dct


  var loggedMelBandsArray = Array.prototype.slice.call(loggedMelBands);
  var mfccs = dct(loggedMelBandsArray, 1).slice(0, numberOfMFCCCoefficients); // ~~~~~~~~~~~~~~~~

  return mfccs;
}

module.exports = exports["default"];
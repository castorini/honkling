"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isPowerOfTwo = isPowerOfTwo;
exports.error = error;
exports.pointwiseBufferMult = pointwiseBufferMult;
exports.applyWindow = applyWindow;
exports.typedToArray = typedToArray;
exports.arrayToTyped = arrayToTyped;
exports._normalize = _normalize;
exports.normalize = normalize;
exports.normalizeToOne = normalizeToOne;
exports.mean = mean;
exports.melToFreq = melToFreq;
exports.freqToMel = freqToMel;
exports.createMelFilterBank = createMelFilterBank;
exports.frame = frame;

var windowing = _interopRequireWildcard(require("./windowing"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var windows = {};

function isPowerOfTwo(num) {
  while (num % 2 === 0 && num > 1) {
    num /= 2;
  }

  return num === 1;
}

function error(message) {
  throw new Error('Meyda: ' + message);
}

function pointwiseBufferMult(a, b) {
  var c = [];

  for (var i = 0; i < Math.min(a.length, b.length); i++) {
    c[i] = a[i] * b[i];
  }

  return c;
}

function applyWindow(signal, windowname) {
  if (windowname !== 'rect') {
    if (windowname === '' || !windowname) windowname = 'hanning';
    if (!windows[windowname]) windows[windowname] = {};

    if (!windows[windowname][signal.length]) {
      try {
        // ~~~ ORIGINAL CODE ~~~
        // windows[windowname][signal.length] = windowing[windowname](signal.length);
        // ~~~~~~~~~~~~~~~~~
        // ~~~ new CODE ~~~
        if (signal.length == 512) {
          // scipy.signal.hann can generate two different version of window : symmetric or periodic
          // https://docs.scipy.org/doc/scipy-0.19.1/reference/generated/scipy.signal.hanning.html
          // librosa asks for periodic for fft. However, meyda generates symmetric version of hanning all the time
          // hard coding window function for our use case. function hanning(size) must be revised
          windows[windowname][signal.length] = new Float32Array([0.00000000e+00, 3.76490804e-05, 1.50590652e-04, 3.38807706e-04, 6.02271897e-04, 9.40943550e-04, 1.35477166e-03, 1.84369391e-03, 2.40763666e-03, 3.04651500e-03, 3.76023270e-03, 4.54868229e-03, 5.41174502e-03, 6.34929092e-03, 7.36117881e-03, 8.44725628e-03, 9.60735980e-03, 1.08413146e-02, 1.21489350e-02, 1.35300239e-02, 1.49843734e-02, 1.65117645e-02, 1.81119671e-02, 1.97847403e-02, 2.15298321e-02, 2.33469798e-02, 2.52359097e-02, 2.71963373e-02, 2.92279674e-02, 3.13304940e-02, 3.35036006e-02, 3.57469598e-02, 3.80602337e-02, 4.04430742e-02, 4.28951221e-02, 4.54160085e-02, 4.80053534e-02, 5.06627672e-02, 5.33878494e-02, 5.61801898e-02, 5.90393678e-02, 6.19649529e-02, 6.49565044e-02, 6.80135719e-02, 7.11356950e-02, 7.43224034e-02, 7.75732174e-02, 8.08876472e-02, 8.42651938e-02, 8.77053486e-02, 9.12075934e-02, 9.47714009e-02, 9.83962343e-02, 1.02081548e-01, 1.05826786e-01, 1.09631386e-01, 1.13494773e-01, 1.17416367e-01, 1.21395577e-01, 1.25431803e-01, 1.29524437e-01, 1.33672864e-01, 1.37876459e-01, 1.42134587e-01, 1.46446609e-01, 1.50811875e-01, 1.55229728e-01, 1.59699501e-01, 1.64220523e-01, 1.68792111e-01, 1.73413579e-01, 1.78084229e-01, 1.82803358e-01, 1.87570256e-01, 1.92384205e-01, 1.97244479e-01, 2.02150348e-01, 2.07101071e-01, 2.12095904e-01, 2.17134095e-01, 2.22214883e-01, 2.27337506e-01, 2.32501190e-01, 2.37705159e-01, 2.42948628e-01, 2.48230808e-01, 2.53550904e-01, 2.58908114e-01, 2.64301632e-01, 2.69730645e-01, 2.75194335e-01, 2.80691881e-01, 2.86222453e-01, 2.91785220e-01, 2.97379343e-01, 3.03003980e-01, 3.08658284e-01, 3.14341403e-01, 3.20052482e-01, 3.25790660e-01, 3.31555073e-01, 3.37344854e-01, 3.43159130e-01, 3.48997025e-01, 3.54857661e-01, 3.60740155e-01, 3.66643621e-01, 3.72567170e-01, 3.78509910e-01, 3.84470946e-01, 3.90449380e-01, 3.96444312e-01, 4.02454839e-01, 4.08480056e-01, 4.14519056e-01, 4.20570928e-01, 4.26634763e-01, 4.32709646e-01, 4.38794662e-01, 4.44888896e-01, 4.50991430e-01, 4.57101344e-01, 4.63217718e-01, 4.69339632e-01, 4.75466163e-01, 4.81596389e-01, 4.87729386e-01, 4.93864231e-01, 5.00000000e-01, 5.06135769e-01, 5.12270614e-01, 5.18403611e-01, 5.24533837e-01, 5.30660368e-01, 5.36782282e-01, 5.42898656e-01, 5.49008570e-01, 5.55111104e-01, 5.61205338e-01, 5.67290354e-01, 5.73365237e-01, 5.79429072e-01, 5.85480944e-01, 5.91519944e-01, 5.97545161e-01, 6.03555688e-01, 6.09550620e-01, 6.15529054e-01, 6.21490090e-01, 6.27432830e-01, 6.33356379e-01, 6.39259845e-01, 6.45142339e-01, 6.51002975e-01, 6.56840870e-01, 6.62655146e-01, 6.68444927e-01, 6.74209340e-01, 6.79947518e-01, 6.85658597e-01, 6.91341716e-01, 6.96996020e-01, 7.02620657e-01, 7.08214780e-01, 7.13777547e-01, 7.19308119e-01, 7.24805665e-01, 7.30269355e-01, 7.35698368e-01, 7.41091886e-01, 7.46449096e-01, 7.51769192e-01, 7.57051372e-01, 7.62294841e-01, 7.67498810e-01, 7.72662494e-01, 7.77785117e-01, 7.82865905e-01, 7.87904096e-01, 7.92898929e-01, 7.97849652e-01, 8.02755521e-01, 8.07615795e-01, 8.12429744e-01, 8.17196642e-01, 8.21915771e-01, 8.26586421e-01, 8.31207889e-01, 8.35779477e-01, 8.40300499e-01, 8.44770272e-01, 8.49188125e-01, 8.53553391e-01, 8.57865413e-01, 8.62123541e-01, 8.66327136e-01, 8.70475563e-01, 8.74568197e-01, 8.78604423e-01, 8.82583633e-01, 8.86505227e-01, 8.90368614e-01, 8.94173214e-01, 8.97918452e-01, 9.01603766e-01, 9.05228599e-01, 9.08792407e-01, 9.12294651e-01, 9.15734806e-01, 9.19112353e-01, 9.22426783e-01, 9.25677597e-01, 9.28864305e-01, 9.31986428e-01, 9.35043496e-01, 9.38035047e-01, 9.40960632e-01, 9.43819810e-01, 9.46612151e-01, 9.49337233e-01, 9.51994647e-01, 9.54583992e-01, 9.57104878e-01, 9.59556926e-01, 9.61939766e-01, 9.64253040e-01, 9.66496399e-01, 9.68669506e-01, 9.70772033e-01, 9.72803663e-01, 9.74764090e-01, 9.76653020e-01, 9.78470168e-01, 9.80215260e-01, 9.81888033e-01, 9.83488236e-01, 9.85015627e-01, 9.86469976e-01, 9.87851065e-01, 9.89158685e-01, 9.90392640e-01, 9.91552744e-01, 9.92638821e-01, 9.93650709e-01, 9.94588255e-01, 9.95451318e-01, 9.96239767e-01, 9.96953485e-01, 9.97592363e-01, 9.98156306e-01, 9.98645228e-01, 9.99059056e-01, 9.99397728e-01, 9.99661192e-01, 9.99849409e-01, 9.99962351e-01, 1.00000000e+00, 9.99962351e-01, 9.99849409e-01, 9.99661192e-01, 9.99397728e-01, 9.99059056e-01, 9.98645228e-01, 9.98156306e-01, 9.97592363e-01, 9.96953485e-01, 9.96239767e-01, 9.95451318e-01, 9.94588255e-01, 9.93650709e-01, 9.92638821e-01, 9.91552744e-01, 9.90392640e-01, 9.89158685e-01, 9.87851065e-01, 9.86469976e-01, 9.85015627e-01, 9.83488236e-01, 9.81888033e-01, 9.80215260e-01, 9.78470168e-01, 9.76653020e-01, 9.74764090e-01, 9.72803663e-01, 9.70772033e-01, 9.68669506e-01, 9.66496399e-01, 9.64253040e-01, 9.61939766e-01, 9.59556926e-01, 9.57104878e-01, 9.54583992e-01, 9.51994647e-01, 9.49337233e-01, 9.46612151e-01, 9.43819810e-01, 9.40960632e-01, 9.38035047e-01, 9.35043496e-01, 9.31986428e-01, 9.28864305e-01, 9.25677597e-01, 9.22426783e-01, 9.19112353e-01, 9.15734806e-01, 9.12294651e-01, 9.08792407e-01, 9.05228599e-01, 9.01603766e-01, 8.97918452e-01, 8.94173214e-01, 8.90368614e-01, 8.86505227e-01, 8.82583633e-01, 8.78604423e-01, 8.74568197e-01, 8.70475563e-01, 8.66327136e-01, 8.62123541e-01, 8.57865413e-01, 8.53553391e-01, 8.49188125e-01, 8.44770272e-01, 8.40300499e-01, 8.35779477e-01, 8.31207889e-01, 8.26586421e-01, 8.21915771e-01, 8.17196642e-01, 8.12429744e-01, 8.07615795e-01, 8.02755521e-01, 7.97849652e-01, 7.92898929e-01, 7.87904096e-01, 7.82865905e-01, 7.77785117e-01, 7.72662494e-01, 7.67498810e-01, 7.62294841e-01, 7.57051372e-01, 7.51769192e-01, 7.46449096e-01, 7.41091886e-01, 7.35698368e-01, 7.30269355e-01, 7.24805665e-01, 7.19308119e-01, 7.13777547e-01, 7.08214780e-01, 7.02620657e-01, 6.96996020e-01, 6.91341716e-01, 6.85658597e-01, 6.79947518e-01, 6.74209340e-01, 6.68444927e-01, 6.62655146e-01, 6.56840870e-01, 6.51002975e-01, 6.45142339e-01, 6.39259845e-01, 6.33356379e-01, 6.27432830e-01, 6.21490090e-01, 6.15529054e-01, 6.09550620e-01, 6.03555688e-01, 5.97545161e-01, 5.91519944e-01, 5.85480944e-01, 5.79429072e-01, 5.73365237e-01, 5.67290354e-01, 5.61205338e-01, 5.55111104e-01, 5.49008570e-01, 5.42898656e-01, 5.36782282e-01, 5.30660368e-01, 5.24533837e-01, 5.18403611e-01, 5.12270614e-01, 5.06135769e-01, 5.00000000e-01, 4.93864231e-01, 4.87729386e-01, 4.81596389e-01, 4.75466163e-01, 4.69339632e-01, 4.63217718e-01, 4.57101344e-01, 4.50991430e-01, 4.44888896e-01, 4.38794662e-01, 4.32709646e-01, 4.26634763e-01, 4.20570928e-01, 4.14519056e-01, 4.08480056e-01, 4.02454839e-01, 3.96444312e-01, 3.90449380e-01, 3.84470946e-01, 3.78509910e-01, 3.72567170e-01, 3.66643621e-01, 3.60740155e-01, 3.54857661e-01, 3.48997025e-01, 3.43159130e-01, 3.37344854e-01, 3.31555073e-01, 3.25790660e-01, 3.20052482e-01, 3.14341403e-01, 3.08658284e-01, 3.03003980e-01, 2.97379343e-01, 2.91785220e-01, 2.86222453e-01, 2.80691881e-01, 2.75194335e-01, 2.69730645e-01, 2.64301632e-01, 2.58908114e-01, 2.53550904e-01, 2.48230808e-01, 2.42948628e-01, 2.37705159e-01, 2.32501190e-01, 2.27337506e-01, 2.22214883e-01, 2.17134095e-01, 2.12095904e-01, 2.07101071e-01, 2.02150348e-01, 1.97244479e-01, 1.92384205e-01, 1.87570256e-01, 1.82803358e-01, 1.78084229e-01, 1.73413579e-01, 1.68792111e-01, 1.64220523e-01, 1.59699501e-01, 1.55229728e-01, 1.50811875e-01, 1.46446609e-01, 1.42134587e-01, 1.37876459e-01, 1.33672864e-01, 1.29524437e-01, 1.25431803e-01, 1.21395577e-01, 1.17416367e-01, 1.13494773e-01, 1.09631386e-01, 1.05826786e-01, 1.02081548e-01, 9.83962343e-02, 9.47714009e-02, 9.12075934e-02, 8.77053486e-02, 8.42651938e-02, 8.08876472e-02, 7.75732174e-02, 7.43224034e-02, 7.11356950e-02, 6.80135719e-02, 6.49565044e-02, 6.19649529e-02, 5.90393678e-02, 5.61801898e-02, 5.33878494e-02, 5.06627672e-02, 4.80053534e-02, 4.54160085e-02, 4.28951221e-02, 4.04430742e-02, 3.80602337e-02, 3.57469598e-02, 3.35036006e-02, 3.13304940e-02, 2.92279674e-02, 2.71963373e-02, 2.52359097e-02, 2.33469798e-02, 2.15298321e-02, 1.97847403e-02, 1.81119671e-02, 1.65117645e-02, 1.49843734e-02, 1.35300239e-02, 1.21489350e-02, 1.08413146e-02, 9.60735980e-03, 8.44725628e-03, 7.36117881e-03, 6.34929092e-03, 5.41174502e-03, 4.54868229e-03, 3.76023270e-03, 3.04651500e-03, 2.40763666e-03, 1.84369391e-03, 1.35477166e-03, 9.40943550e-04, 6.02271897e-04, 3.38807706e-04, 1.50590652e-04, 3.76490804e-05]);
        } else {
          windows[windowname][signal.length] = windowing[windowname](signal.length);
        } // ~~~~~~~~~~~~~~~~~

      } catch (e) {
        throw new Error('Invalid windowing function');
      }
    }

    signal = pointwiseBufferMult(signal, windows[windowname][signal.length]);
  }

  return signal;
} // ~~~ UNNECESSARY CODE ~~~
// export function createBarkScale(length, sampleRate, bufferSize) {
//   let barkScale = new Float32Array(length);
//
//   for (var i = 0; i < barkScale.length; i++) {
//     barkScale[i] = i * sampleRate / (bufferSize);
//     barkScale[i] = 13 * Math.atan(barkScale[i] / 1315.8) +
//             3.5 * Math.atan(Math.pow((barkScale[i] / 7518), 2));
//   }
//
//   return barkScale;
// }
// ~~~~~~~~~~~~~~~~~


function typedToArray(t) {
  // utility to convert typed arrays to normal arrays
  return Array.prototype.slice.call(t);
}

function arrayToTyped(t) {
  // utility to convert arrays to typed F32 arrays
  return Float32Array.from(t);
}

function _normalize(num, range) {
  return num / range;
}

function normalize(a, range) {
  return a.map(function (n) {
    return _normalize(n, range);
  });
}

function normalizeToOne(a) {
  var max = Math.max.apply(null, a);
  return a.map(function (n) {
    return n / max;
  });
}

function mean(a) {
  return a.reduce(function (prev, cur) {
    return prev + cur;
  }) / a.length;
} // ~~~ ORIGINAL CODE ~~~
// function _melToFreq(melValue) {
//   var freqValue = 700 * (Math.exp(melValue / 1125) - 1);
//   return freqValue;
// }
//
// function _freqToMel(freqValue) {
//   var melValue = 1125 * Math.log(1 + (freqValue / 700));
//   return melValue;
// }
// ~~~~~~~~~~~~~~~~~
// ~~~ NEW CODE ~~~


var f_min = 0.0;
var f_sp = 200.0 / 3;
var min_log_hz = 1000; // beginning of log region (Hz)

var min_log_mel = (min_log_hz - f_min) / f_sp; // same (Mels)

var logstep = Math.log(6.4) / 27.0; // step size for log region

function _melToFreq(melValue) {
  // Slaney formula
  var freqs = f_min + f_sp * melValue;

  if (melValue >= min_log_mel) {
    freqs = min_log_hz * Math.exp(logstep * (melValue - min_log_mel));
  }

  return freqs;
}

function _freqToMel(freqValue) {
  // Slaney formula
  var mels = (freqValue - f_min) / f_sp;

  if (freqValue >= min_log_hz) {
    mels = min_log_mel + Math.log(freqValue / min_log_hz) / logstep;
  }

  return mels;
} // ~~~~~~~~~~~~~~~~~


function melToFreq(mV) {
  return _melToFreq(mV);
}

function freqToMel(fV) {
  return _freqToMel(fV);
}

function createMelFilterBank(numFilters, sampleRate, bufferSize) {
  //the +2 is the upper and lower limits
  var melValues = new Float32Array(numFilters + 2);
  var melValuesInFreq = new Float32Array(numFilters + 2); //Generate limits in Hz - from 0 to the nyquist.
  // ~~~ ORIGINAL CODE ~~~
  // let lowerLimitFreq = 0;
  // let upperLimitFreq = sampleRate / 2;
  // ~~~~~~~~~~~~~~~~~
  // ~~~ NEW CODE ~~~

  var lowerLimitFreq = 20;
  var upperLimitFreq = 4000; // ~~~~~~~~~~~~~~~~~
  //Convert the limits to Mel

  var lowerLimitMel = _freqToMel(lowerLimitFreq);

  var upperLimitMel = _freqToMel(upperLimitFreq); //Find the range


  var range = upperLimitMel - lowerLimitMel; // ~~~ ORIGINAL CODE ~~~
  //Find the range as part of the linear interpolation
  // let valueToAdd = range / (numFilters + 1);
  //
  // let fftBinsOfFreq = Array(numFilters + 2);
  //
  // for (let i = 0; i < melValues.length; i++) {
  //   // Initialising the mel frequencies
  //   // They're a linear interpolation between the lower and upper limits.
  //   melValues[i] = i * valueToAdd;
  //
  //   // Convert back to Hz
  //   melValuesInFreq[i] = _melToFreq(melValues[i]);
  //
  //   // Find the corresponding bins
  //   fftBinsOfFreq[i] = Math.floor((bufferSize + 1) *
  //                          melValuesInFreq[i] / sampleRate);
  // }
  //
  // var filterBank = Array(numFilters);
  // for (let j = 0; j < filterBank.length; j++) {
  //   // Create a two dimensional array of size numFilters * (buffersize/2)+1
  //   // pre-populating the arrays with 0s.
  //   filterBank[j] = Array.apply(
  //           null,
  //           new Array((bufferSize / 2) + 1)).map(Number.prototype.valueOf, 0);
  //
  //   //creating the lower and upper slopes for each bin
  //   for (let i = fftBinsOfFreq[j]; i < fftBinsOfFreq[j + 1]; i++) {
  //     filterBank[j][i] = (i - fftBinsOfFreq[j]) /
  //               (fftBinsOfFreq[j + 1] - fftBinsOfFreq[j]);
  //   }
  //
  //   for (let i = fftBinsOfFreq[j + 1]; i < fftBinsOfFreq[j + 2]; i++) {
  //     filterBank[j][i] = (fftBinsOfFreq[j + 2] - i) /
  //               (fftBinsOfFreq[j + 2] - fftBinsOfFreq[j + 1]);
  //   }
  // }
  // ~~~~~~~~~~~~~~~~~
  // ~~~ NEW CODE ~~~
  //Find the range as part of the linear interpolation

  var melValueToAdd = range / (numFilters + 1);
  var freqDiff = Array(numFilters + 1); // Slaney-style mel is scaled to be approx constant energy per channel

  var enorm = Array(numFilters);

  for (var i = 0; i < melValues.length; i++) {
    // Initialising the mel frequencies
    // They're a linear interpolation between the lower and upper limits.
    melValues[i] = i * melValueToAdd + lowerLimitMel; // Convert back to Hz

    melValuesInFreq[i] = _melToFreq(melValues[i]);

    if (i > 0) {
      // store the difference
      freqDiff[i - 1] = melValuesInFreq[i] - melValuesInFreq[i - 1];
    }

    if (i > 1) {
      enorm[i - 2] = 2.0 / (melValuesInFreq[i] - melValuesInFreq[i - 2]);
    }
  }

  var fftValueToAdd = sampleRate / bufferSize;
  var fftFreq = new Float32Array(bufferSize / 2 + 1);

  for (var i = 0; i < fftFreq.length; i++) {
    fftFreq[i] = i * fftValueToAdd;
  }

  var ramps = Array(melValues.length);

  for (var i = 0; i < melValues.length; i++) {
    ramps[i] = Array(fftFreq.length);

    for (var j = 0; j < fftFreq.length; j++) {
      ramps[i][j] = melValuesInFreq[i] - fftFreq[j];
    }
  }

  var filterBank = Array(numFilters);

  for (var i = 0; i < filterBank.length; i++) {
    // Create a two dimensional array of size numFilters * (buffersize/2)+1
    // pre-populating the arrays with 0s.
    filterBank[i] = Array(bufferSize / 2 + 1);

    for (var j = 0; j < fftFreq.length; j++) {
      var lower = -ramps[i][j] / freqDiff[i];
      var upper = ramps[i + 2][j] / freqDiff[i + 1];
      if (isNaN(lower)) lower = 0;
      if (isNaN(upper)) upper = 0;
      filterBank[i][j] = enorm[i] * Math.max(0, Math.min(lower, upper));
    }
  } // ~~~~~~~~~~~~~~~~~


  return filterBank;
} // ~~~ UNNECESSARY CODE ~~~
// export function hzToOctaves(freq, A440) {
//   return Math.log2(16 * freq / A440);
// }
//
// export function normalizeByColumn (a) {
//   var emptyRow = a[0].map(() => 0);
//   var colDenominators = a.reduce((acc, row) => {
//     row.forEach((cell, j) => {
//       acc[j] += Math.pow(cell, 2);
//     });
//     return acc;
//   }, emptyRow).map(Math.sqrt);
//   return a.map((row, i) => row.map((v, j) => v / (colDenominators[j] || 1) ));
// };
//
// export function createChromaFilterBank(numFilters, sampleRate, bufferSize, centerOctave=5, octaveWidth=2, baseC=true, A440=440) {
//   var numOutputBins = Math.floor(bufferSize / 2) + 1;
//
//
//   var frequencyBins = new Array(bufferSize).fill(0)
//     .map((_, i) => numFilters * hzToOctaves(sampleRate * i / bufferSize, A440));
//
//   // Set a value for the 0 Hz bin that is 1.5 octaves below bin 1
//   // (so chroma is 50% rotated from bin 1, and bin width is broad)
//   frequencyBins[0] = frequencyBins[1] - 1.5 * numFilters;
//
//   var binWidthBins = frequencyBins
//     .slice(1)
//     .map((v, i) => Math.max(v - frequencyBins[i]), 1)
//     .concat([1]);
//
//   var halfNumFilters = Math.round(numFilters / 2);
//
//   var filterPeaks = new Array(numFilters).fill(0)
//     .map((_, i) => frequencyBins.map(frq =>
//       ((10 * numFilters + halfNumFilters + frq - i) % numFilters) - halfNumFilters
//     ));
//
//   var weights = filterPeaks.map((row, i) => row.map((_, j) => (
//     Math.exp(-0.5 * Math.pow(2 * filterPeaks[i][j] / binWidthBins[j], 2))
//   )));
//
//   weights = normalizeByColumn(weights);
//
//   if (octaveWidth) {
//     var octaveWeights = frequencyBins.map(v =>
//       Math.exp(-0.5 * Math.pow((v / numFilters - centerOctave) / octaveWidth, 2))
//     );
//     weights = weights.map(row => row.map((cell, j) => cell * octaveWeights[j]));
//   }
//
//   if (baseC) {
//     weights = [...weights.slice(3), ...weights.slice(0, 3)];
//   }
//
//   return weights.map(row => row.slice(0, numOutputBins));
// }
// ~~~~~~~~~~~~~~~~


function frame(buffer, frameLength, hopLength) {
  if (buffer.length < frameLength) {
    throw new Error('Buffer is too short for frame length');
  }

  if (hopLength < 1) {
    throw new Error('Hop length cannot be less that 1');
  }

  if (frameLength < 1) {
    throw new Error('Frame length cannot be less that 1');
  }

  var numFrames = 1 + Math.floor((buffer.length - frameLength) / hopLength);
  return new Array(numFrames).fill(0).map(function (_, i) {
    return buffer.slice(i * hopLength, i * hopLength + frameLength);
  });
}
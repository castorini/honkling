if (typeof FFT === 'undefined') {
	// loaded by node.js
	FFT = require('./fft');
}

if (typeof util === 'undefined') {
	// loaded by node.js
	util = require('./util').util;
}

// in-browser implementation uses meyda but the implementation are the same
class Spectogram {
  constructor(config) {
  	this.n_fft = config.featureExtractionConfig.n_fft
  	this.hop_length = config.featureExtractionConfig.hop_length
  	this.power = config.featureExtractionConfig.power
  	this.win_length = config.featureExtractionConfig.win_length
  	this.window = config.featureExtractionConfig.window
  	this.center = config.featureExtractionConfig.center
  	this.pad_mode = config.featureExtractionConfig.pad_mode
  	this.fft = new FFT();
  }

  applyWindow(data, window) {
  	if (window != "hann") {
			throw new Error('Invalid windowing function : ', window);
  	}

  	const hanningWindow = precomputed.hanningWindow;

  	return util.pointwiseBufferMult(data, hanningWindow);
  }

  compute(data) {
	  let windowedSignal = this.applyWindow(data, this.window);

	  let complexSpectrum = this.fft.compute(windowedSignal);

	  let spectogram = new Float32Array(this.n_fft / 2 + 1);

	  for (var i = 0; i < this.n_fft / 2 + 1; i++) {
	    spectogram[i] = Math.sqrt(Math.pow(complexSpectrum.real[i], 2) + Math.pow(complexSpectrum.imag[i], 2));
	  }

	  return spectogram;
  }
}


if (typeof module !== 'undefined') {
  module.exports = Spectogram;
}

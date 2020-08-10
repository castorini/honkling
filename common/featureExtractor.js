class FeatureExtractor {
  constructor(config) {

    this.power = config.featureExtractionConfig.power;
    this.n_fft = config.featureExtractionConfig.n_fft
    this.hopSize = config.featureExtractionConfig.hopSize;
    this.melBands = config.featureExtractionConfig.melBands;
    this.melFilterBank = precomputed.melBasis[config.featureExtractionConfig.melBands.toString()];

    this.input_width = config.modelConfig.input_shape[1]

    this.mean = config.zmuvConfig["mean"]
    this.std = config.zmuvConfig["std"]

    this.spectogram = new Spectogram(config);
  }

  frame(buffer, frameLength, hopLength) {
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

  compute_mel_spetogram(data) {
    let spectogram = this.spectogram.compute(data);

    var powSpec = util.arrPower(spectogram, this.power);
    var numFilters = this.melFilterBank.length;

    var filtered = Array(numFilters);

    var loggedMelBands = new Float32Array(numFilters);

    for (var i = 0; i < numFilters; i++) {
      filtered[i] = new Float32Array(this.n_fft / 2 + 1);
      loggedMelBands[i] = 0;

      for (var j = 0; j < filtered[i].length; j++) {
        //point-wise multiplication between power spectrum and filterbanks.
        filtered[i][j] = this.melFilterBank[i][j] * powSpec[j]; //summing up all of the coefficients into one array

        loggedMelBands[i] += filtered[i][j];
      } //log positive coefficient.


      loggedMelBands[i] = Math.log(loggedMelBands[i] + 1e-7);
    }

    var loggedMelBandsArray = Array.prototype.slice.call(loggedMelBands);

    return loggedMelBandsArray
  }

  extract(data) {
    var frames = this.frame(data, this.n_fft, this.hopSize);
    var processed = [];

  	for (var i = 0; i < frames.length; i++) {
  		processed.push(this.compute_mel_spetogram(frames[i]));
  	}

    processed = processed.slice(0, this.input_width);

    // if data we get from meyda is shorter than what we expected
    // due to some delays between two audio processor
    if (processed.length < this.input_width) {
      while (processed.length != this.input_width) {
        processed.push(new Array(this.melBands).fill(0));
      }
    }
    processed = util.transposeFlatten2d(processed);

    // ZMUV
  	for (var i = 0; i < processed.length; i++) {
  		processed[i] = (processed[i] - this.mean) / this.std
  	}

    return processed

  }

}
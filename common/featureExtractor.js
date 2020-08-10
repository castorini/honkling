var _featureExtractor;

class FeatureExtractor {
  constructor(config) {

    _featureExtractor = this;

    this.power = config.featureExtractionConfig.power;
    this.n_fft = config.featureExtractionConfig.n_fft
    this.hopSize = config.featureExtractionConfig.hopSize;
    this.melBands = config.featureExtractionConfig.melBands;
    this.melFilterBank = precomputed.melBasis[config.featureExtractionConfig.melBands.toString()];

    this.input_width = config.modelConfig.input_shape[1]

    this.mean = config.zmuvConfig["mean"]
    this.std = config.zmuvConfig["std"]

    this.spectogram = new Spectogram(config);

    this.previousInputData = [];
    this.processed = [];

    while (this.processed.length != this.input_width) {
      this.processed.push(new Array(this.melBands).fill(0));
    }
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

  appendData(inputData) {
    if (inputData < this.hopSize) {
      console.err("mic input frame size must be greater than hopsize");
    }

    // make sure enough data is loaded for the first time
    if (this.previousInputData.length < this.n_fft) {
      this.previousInputData = this.previousInputData.concat(inputData);
      console.log(inputData.length, this.previousInputData.length)
      return;
    }

    var buffer = new Float32Array(this.previousInputData.length + inputData.length - this.hopSize);
    buffer.set(this.previousInputData.slice(this.hopSize)); // drop first hopsize
    buffer.set(inputData, this.previousInputData.length - this.hopSize); // fill the rest with new data

    this.previousInputData = inputData

    var frames = this.frame(buffer, this.n_fft, this.hopSize);

    frames.forEach(function (f) {
      _featureExtractor.processed.push(_featureExtractor.compute_mel_spetogram(f));
    });
  }

  extract() {
    this.processed = this.processed.slice(this.processed.length - this.input_width);
    var flattened = util.transposeFlatten2d(this.processed);
    
    // ZMUV
    flattened.forEach(function(part, index) {
      this[index] = (this[index] - _featureExtractor.mean) / _featureExtractor.std
    }, flattened);


    return flattened
  }

}
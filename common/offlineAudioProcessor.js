var offlineProc;
// TODO :: stream of input is supported generating multiple processor,
// each async response should be able to fine the caller offline processor.

class OfflineAudioProcessor {
  constructor(config, audioData) {
    offlineProc = this;
    this.sampleRate = config.sampleRate;
    this.window_size = config.windowSize * config.sampleRate; // convert from s to n_samples
    this.padding_size = config.micAudioProcessorConfig.paddingSize
    this.melBands = config.featureExtractionConfig.melBands;
    this.audioData = audioData;

    this.bufferSize = 512;
    // when audio features are down sampled to SR of 16000, each 30ms window will have size of 480
    // Unfortunately, minimum buffer size that meyda supports is 512.
    // which means that we have to pass in at least 32 ms
    // As a result, 32 ms length of feature is used for each 30 ms window

    this.meydaHopSize = config.featureExtractionConfig.hopSize;
    this.mfccDataLength = Math.floor(this.window_size / this.meydaHopSize) + 1;

    this.deferred = $.Deferred();
    this.mfcc = [];

    this.audioContext = new OfflineAudioContext(1, this.window_size + this.padding_size, this.sampleRate);
    // make length of the context long enough that mfcc always gets enough buffers to process
    // consider the delay for starting/stopping the meyda audio context

    this.initBufferSourceNode();
    this.initMeydaNode();

    this.power = config.featureExtractionConfig.power;
    this.n_fft = config.featureExtractionConfig.n_fft


    this.spectogram = new Spectogram(config);
    this.melFilterBank = precomputed.melBasis[config.featureExtractionConfig.melBands.toString()];

    this.initFeatureExtractionNode();

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


  compute(data) {
    let spectogram = offlineProc.spectogram.compute(data);

    var powSpec = util.arrPower(spectogram, offlineProc.power);
    var numFilters = offlineProc.melFilterBank.length;

    var filtered = Array(numFilters);

    var loggedMelBands = new Float32Array(numFilters);

    for (var i = 0; i < numFilters; i++) {
      filtered[i] = new Float32Array(offlineProc.n_fft / 2 + 1);
      loggedMelBands[i] = 0;

      for (var j = 0; j < filtered[i].length; j++) {
        //point-wise multiplication between power spectrum and filterbanks.
        filtered[i][j] = offlineProc.melFilterBank[i][j] * powSpec[j]; //summing up all of the coefficients into one array

        loggedMelBands[i] += filtered[i][j];
      } //log positive coefficient.


      loggedMelBands[i] = Math.log(loggedMelBands[i] + 1e-7);
    }

    var loggedMelBandsArray = Array.prototype.slice.call(loggedMelBands);

    return loggedMelBandsArray
  }

  initBufferSourceNode() {
    let audioSourceBuffer = this.audioContext.createBuffer(1, this.audioContext.length, this.sampleRate);
    let audioSourceData = audioSourceBuffer.getChannelData(0);

    for (let i = 0; i < audioSourceBuffer.length; i++) {
      if (i < this.audioData.length) {
        audioSourceData[i] = this.audioData[i];
      } else {
        audioSourceData[i] = 0;
      }
    }

    // audioSourceData.length == this.audioContext.length
    // this.audioData.length == window_size

    // Get an AudioBufferSourceNode.
    // This is the AudioNode to use when we want to play an AudioBuffer

    this.audioSource = this.audioContext.createBufferSource();
    this.audioSource.buffer = audioSourceBuffer;
  }

  initFeatureExtractionNode() {
    this.srcBufferSize = 512;
    this.featureExtractionNode = this.audioContext.createScriptProcessor(this.srcBufferSize, 1, 1);

    this.featureExtractionNode.onaudioprocess = function(audioProcessingEvent) {
      var inputData = audioProcessingEvent.inputBuffer.getChannelData(0);

      var buffer = inputData;

      if (offlineProc.previousInputData) {
        buffer = new Float32Array(offlineProc.previousInputData.length + inputData.length - offlineProc.meydaHopSize);
        buffer.set(offlineProc.previousInputData.slice(offlineProc.meydaHopSize)); // drop first hopsize
        buffer.set(inputData, offlineProc.previousInputData.length - offlineProc.meydaHopSize); // fill the rest with new data
      }

      offlineProc.previousInputData = inputData

      var frames = offlineProc.frame(buffer, offlineProc.bufferSize, offlineProc.meydaHopSize);

      frames.forEach(function (f) {
        var features = offlineProc.compute(f);
        offlineProc.mfcc.push(features);
      });
    }

    this.audioSource.connect(this.featureExtractionNode);
    this.featureExtractionNode.connect(this.audioContext.destination);
  }


  initMeydaNode() {
    let postProcessing = function(mfcc) {
      offlineProc.mfcc.push(mfcc);
    }

    // this.meyda = Meyda.createMeydaAnalyzer({
    //   bufferSize: this.bufferSize,
    //   source: this.audioSource,
    //   audioContext: this.audioContext,
    //   hopSize: this.meydaHopSize,
    //   callback: postProcessing,
    //   sampleRate: this.sampleRate,
    //   melBands: this.melBands
    // });
  }

  getMFCC() {
    // this.meyda.start("mfcc");
    this.audioSource.start();

    this.audioContext.startRendering().then(function(renderedBuffer) {
      // offlineProc.meyda.stop();
      offlineProc.audioSource.disconnect();
      offlineProc.mfcc = offlineProc.mfcc.slice(0, offlineProc.mfccDataLength);
      // if data we get from meyda is shorter than what we expected
      // due to some delays between two audio processor
      if (offlineProc.mfcc.length < offlineProc.mfccDataLength) {
        while (offlineProc.mfcc.length != offlineProc.mfccDataLength) {
          // offlineProc.mfcc.push(new Array(40).fill(0));
          // firefox
          offlineProc.mfcc.push(new Array(80).fill(0));
        }
      }

      var flattened_mfcc = util.transposeFlatten2d(offlineProc.mfcc);

      // ZMUV
      flattened_mfcc.forEach(function(part, index) {
        this[index] = (this[index] - (zmuvConfig["mean"])) / zmuvConfig["std"]
      }, flattened_mfcc);

      offlineProc.deferred.resolve(flattened_mfcc);

    }).catch(function(err) {
      console.log('Offline processing failed: ' + err);
      // Note: The promise should reject when startRendering is called a second time on an OfflineAudioContext
      offlineProc.deferred.reject();
    });

    return this.deferred.promise();
  }
}

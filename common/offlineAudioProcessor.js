var _offlineProc;

class OfflineAudioProcessor {
  constructor(config, audioData) {
    _offlineProc = this;
    this.config = config
    this.audioData = audioData;

    this.sampleRate = config.sampleRate;
    this.melBands = config.featureExtractionConfig.melBands;
    this.HopSize = config.featureExtractionConfig.hopSize;
    this.inputWidth = config.modelConfig.input_shape[1];

    this.bufferSize = 512;
    // when audio features are down sampled to SR of 16000, each 30ms window will have size of 480
    // Unfortunately, minimum buffer size that meyda supports is 512.
    // which means that we have to pass in at least 32 ms
    // As a result, 32 ms length of feature is used for each 30 ms window

    // zmuv
    this.mean = config.zmuvConfig.mean;
    this.std = config.zmuvConfig.std;

    // to return the output
    this.deferred = $.Deferred();
    this.extracted_features = [];

    var samplePerWindow = config.windowSize * config.sampleRate

    this.audioContext = new OfflineAudioContext(1, samplePerWindow + config.micAudioProcessorConfig.paddingSize, this.sampleRate);
    // make length of the context long enough that extracted_features always gets enough buffers to process
    // consider the delay for starting/stopping the meyda audio context

    this.initBufferSourceNode();
    this.initMeydaNode();
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
    // this.audioData.length == samplePerWindow

    // Get an AudioBufferSourceNode.
    // This is the AudioNode to use when we want to play an AudioBuffer

    this.audioSource = this.audioContext.createBufferSource();
    this.audioSource.buffer = audioSourceBuffer;
  }

  initMeydaNode() {
    let collectFeatures = function(features) {
      _offlineProc.extracted_features.push(features);
    }

    this.meyda = Meyda.createMeydaAnalyzer({
      bufferSize: this.bufferSize,
      source: this.audioSource,
      audioContext: this.audioContext,
      hopSize: this.HopSize,
      callback: collectFeatures,
      sampleRate: this.sampleRate,
      melBands: this.melBands
    });
  }

  getMFCC() {
    this.meyda.start("mfcc");
    // Meyda is modified a little that it is not really extracted_features; it is log mel
    this.audioSource.start();

    this.audioContext.startRendering().then(function(renderedBuffer) {
      _offlineProc.meyda.stop();
      _offlineProc.audioSource.disconnect();
      _offlineProc.extracted_features = _offlineProc.extracted_features.slice(0, _offlineProc.inputWidth);

      // if data we get from meyda is shorter than what we expected
      // due to some delays between two audio processor
      if (_offlineProc.extracted_features.length < _offlineProc.inputWidth) {
        while (_offlineProc.extracted_features.length != _offlineProc.inputWidth) {
          _offlineProc.extracted_features.push(new Array(_offlineProc.melBands).fill(0));
        }
      }

      var extracted_features = util.transposeFlatten2d(_offlineProc.extracted_features);

      // ZMUV
      extracted_features.forEach(function(part, index) {
        this[index] = (this[index] - _offlineProc.mean) / _offlineProc.std
      }, extracted_features);

      _offlineProc.deferred.resolve(extracted_features);

    }).catch(function(err) {
      console.log('Offline processing failed: ' + err);
      // Note: The promise should reject when startRendering is called a second time on an OfflineAudioContext
      _offlineProc.deferred.reject();
    });

    return this.deferred.promise();
  }
}

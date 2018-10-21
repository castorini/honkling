var offlineProc;
// TODO :: stream of input is supported generating multiple processor,
// each async response should be able to fine the caller offline processor.

class OfflineAudioProcessor {
  constructor(config, audioData) {
    offlineProc = this;
    this.config = config;
    this.audioData = audioData;

    this.mfccDataLength = 101;
    this.bufferSize = 512;
    // when audio features are down sampled to SR of 16000, each 30ms window will have size of 480
    // Unfortunately, minimum buffer size that meyda supports is 512.
    // which means that we have to pass in at least 32 ms
    // As a result, 32 ms length of feature is used for each 30 ms window
    // TODO :: bufferSize and mfccDataLength can be dynamic based sampleRate & offlineWindowSize

    this.deferred = $.Deferred();
    this.mfcc = [];

    this.audioContext = new OfflineAudioContext(1, config.offlineSampleRate + (this.bufferSize * 20), config.offlineSampleRate);
    // make length of the context long enough that mfcc always gets enough buffers to process

    this.initBufferSourceNode();
    this.initMeydaNode();
  }

  initBufferSourceNode() {
    let audioSourceBuffer = this.audioContext.createBuffer(1, this.audioContext.length, this.config.offlineSampleRate);
    let audioSourceData = audioSourceBuffer.getChannelData(0);

    for (let i = 0; i < audioSourceBuffer.length; i++) {
      if (i < this.audioData.length) {
        audioSourceData[i] = this.audioData[i];
      } else {
        audioSourceData[i] = 0;
      }
    }

    // Get an AudioBufferSourceNode.
    // This is the AudioNode to use when we want to play an AudioBuffer
    this.audioSource = this.audioContext.createBufferSource();
    this.audioSource.buffer = audioSourceBuffer;
  }

  initMeydaNode() {
    let postProcessing = function(mfcc) {
      offlineProc.mfcc.push(mfcc);
    }

    var meydaHopSize = this.config.offlineSampleRate / 1000 * this.config.offlineHopSize;

    this.meyda = Meyda.createMeydaAnalyzer({
      bufferSize: this.bufferSize,
      source: this.audioSource,
      audioContext: this.audioContext,
      hopSize: meydaHopSize,
      callback: postProcessing,
      sampleRate: this.config.offlineSampleRate,
    });
  }

  getMFCC() {
    this.meyda.start("mfcc");
    this.audioSource.start();

    this.audioContext.startRendering().then(function(renderedBuffer) {
      offlineProc.meyda.stop();
      offlineProc.audioSource.disconnect();
      offlineProc.mfcc = offlineProc.mfcc.slice(0, offlineProc.mfccDataLength);
      if (offlineProc.mfcc.length < offlineProc.mfccDataLength) {
        while (offlineProc.mfcc.length != offlineProc.mfccDataLength) {
          offlineProc.mfcc.push(new Array(40).fill(0));
        }
      }
      offlineProc.mfcc = transposeFlatten2d(offlineProc.mfcc);
      offlineProc.deferred.resolve(offlineProc.mfcc);

    }).catch(function(err) {
      console.log('Offline processing failed: ' + err);
      // Note: The promise should reject when startRendering is called a second time on an OfflineAudioContext
      offlineProc.deferred.reject();
    });

    return this.deferred.promise();
  }
}

var that;

class Audio {
  constructor() {
    that = this;
    if (window.hasOwnProperty('webkitAudioContext') &&
      !window.hasOwnProperty('AudioContext')) {
        window.AudioContext = webkitAudioContext;
      }

    if (navigator.hasOwnProperty('webkitGetUserMedia') &&
      !navigator.hasOwnProperty('getUserMedia')) {
        navigator.getUserMedia = webkitGetUserMedia;
        if (!AudioContext.prototype.hasOwnProperty('createScriptProcessor')) {
          AudioContext.prototype.createScriptProcessor = AudioContext.prototype.createJavaScriptNode;
        }
      }

    this.context = new AudioContext();
    this.context.suspend();

    this.initData();

    this.processedDataLength = 4040;

    this.oldSR = this.context.sampleRate;
    this.newSR = 16000;

    this.srcBufferSize = 1024;
    // with buffer size of 1024, we can the most features of 44032 from original sample rate of 44100
    // once audio of 44100 features is down sampled to 16000 features,
    // resulting number of features is 15953

    this.meydaBufferSize = 512;
    // when audio features are down sampled to SR of 16000, each 30ms window will have size of 480
    // Unfortunately, minimum buffer size that meyda supports is 512.
    // which means that we have to pass in at least 32 ms
    // As a result, 32 ms length of feature is used for each 30 ms window

    this.meydaSampleRate = this.meydaBufferSize * 100;

    this.fallBackAudio =  $('#fallBackAudio');

    this.context = new AudioContext();

    this.initSrcNode();

    this.initDownSampleNode();
  }

  initData() {
    this.originalData = [];
    this.downSampledData = [];
    this.windowedData = [];
    this.mfcc = [];
  }

  initSrcNode() {
    var successCallback = function (micStream) {
      console.group();
      $('#audioControl').hide();
      console.log('User allowed microphone access.');
      console.log('Initializing AudioNode from MediaStream');
      that.micSource = that.context.createMediaStreamSource(micStream);
      console.log('Setting Meyda Source to Microphone');
      console.groupEnd();
    };

    var errorCallback = function (err) {
      console.group();
      console.log('Initializing microphone has failed. Falling back to default audio file', err);
      that.audioSource = that.context.createMediaElementSource(that.fallBackAudio[0]);
      that.audioSource.connect(that.context.destination); // connect to speaker
      console.groupEnd();
    };

    try {
      navigator.getUserMedia = navigator.webkitGetUserMedia ||
        navigator.getUserMedia || navigator.mediaDevices.getUserMedia;
      var constraints = { video: false, audio: true };

      console.log('Asking for permission...');

      navigator.mediaDevices.getUserMedia(constraints)
        .then(successCallback)
        .catch(errorCallback)
        .finally(function() {
          $('#extractBtn').prop('disabled', false);
        })
    } catch (err) {
      errorCallback(err);
      $('#extractBtn').prop('disabled', false);
    }
  };

  initDownSampleNode() {
    this.downSampleNode = this.context.createScriptProcessor(this.srcBufferSize, 1, 1);

    function interpolateArray(data, fitCount) {
      var linearInterpolate = function (before, after, atPoint) {
          return before + (after - before) * atPoint;
      };

      var newData = new Array();
      var springFactor = new Number((data.length - 1) / (fitCount - 1));
      newData[0] = data[0]; // for new allocation
      for ( var i = 1; i < fitCount - 1; i++) {
          var tmp = i * springFactor;
          var before = new Number(Math.floor(tmp)).toFixed();
          var after = new Number(Math.ceil(tmp)).toFixed();
          var atPoint = tmp - before;
          newData[i] = linearInterpolate(data[before], data[after], atPoint);
      }
      newData[fitCount - 1] = data[data.length - 1]; // for new allocation
      return newData;
    }

    this.downSampledBufferSize = (that.newSR / that.oldSR) * this.srcBufferSize;

    this.downSampleNode.onaudioprocess = function(audioProcessingEvent) {
      var inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
      var downSampledData = interpolateArray(inputData, that.downSampledBufferSize);
      that.originalData = that.originalData.concat(Array.from(inputData));
      that.downSampledData = that.downSampledData.concat(downSampledData);
    }
  }

  processAudio() {
    this.initData();

    if (this.micSource) {
      console.log('start recording');

      this.micSource.connect(this.downSampleNode);
      this.context.resume();

      setTimeout(function() {
        console.log('recording has stopped');
        that.context.suspend();
        that.micSource.disconnect(that.downSampleNode);

        that.getMFCC();
      }, 1000);
    } else {
      this.fallBackAudio[0].onpause = function() {
        console.log('audio has stopped');
        that.context.suspend();
        that.audioSource.disconnect(that.downSampleNode);

        that.getMFCC();
      }

      this.audioSource.connect(this.downSampleNode);
      this.context.resume();

      console.log('playing audio');
      this.fallBackAudio[0].play();
    }
  };

  getMFCC() {
    console.log('original data', this.originalData);
    console.log('downsampled data', this.downSampledData);

    // Create an empty 30ms stereo buffer at the sample rate of the AudioContext
    let audioSourceBuffer = this.context.createBuffer(1, this.meydaSampleRate, this.newSR);
    let audioSourceData = audioSourceBuffer.getChannelData(0);

    let downSampleIndex = 0;
    let windowIndex = 0;
    let hopSize = this.newSR / 100;

    for (let i = 0; i < audioSourceBuffer.length; i++) {
      if (downSampleIndex == this.meydaBufferSize) {
        windowIndex++;
        downSampleIndex = 0;
      }
      let audioSourceIndex = windowIndex * hopSize + downSampleIndex;
      if (audioSourceIndex < this.downSampledData.length) {
        audioSourceData[audioSourceIndex] = this.downSampledData[audioSourceIndex];
        this.windowedData.push(this.downSampledData[audioSourceIndex]); // for verification
      } else {
        audioSourceData[audioSourceIndex] = 0;
        this.windowedData.push(0);
      }
      downSampleIndex++;
    }

    console.log('windowed data', this.windowedData);

    // Get an AudioBufferSourceNode.
    // This is the AudioNode to use when we want to play an AudioBuffer
    this.downSampledSource = this.context.createBufferSource();
    this.downSampledSource.buffer = audioSourceBuffer;

    let postProcessing = function(mfcc) {
      that.mfcc = that.mfcc.concat(Array.from(mfcc));
      if (that.mfcc.length == that.processedDataLength) {
        that.meyda.stop();
        that.context.suspend();
        that.downSampledSource.disconnect();
        that.downSampledSource.stop();
        console.log('meyda processing completed');
        console.log('mfcc', that.mfcc);
      }
    }

    this.meyda = Meyda.createMeydaAnalyzer({
      bufferSize: this.meydaBufferSize,
      source: this.downSampledSource,
      audioContext: this.context,
      callback: postProcessing,
      sampleRate: this.meydaSampleRate,
    });

    console.log('start meyda processing');

    this.context.resume();
    this.meyda.start("mfcc");
    this.downSampledSource.start();
  }

  getData() {
    return this.mfcc;
  }
}
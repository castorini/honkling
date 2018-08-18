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

    this.onlineContext = new AudioContext();
    this.onlineContext.suspend();

    this.initData();

    this.oldSR = this.onlineContext.sampleRate;
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

    this.meydaHopSize = 160;

    this.mfccDataLength = 4040;

    this.noiseThreshold = 0.01;

    this.fallBackAudio =  $('#fallBackAudio');

    this.initSrcNode();

    this.initDownSampleNode();
  }

  initData() {
    this.originalData = [];
    this.downSampledData = [];
    this.mfcc = [];
  }

  initSrcNode() {
    var successCallback = function (micStream) {
      console.group();
      $('#audioControl').hide();
      console.log('User allowed microphone access.');
      console.log('Initializing AudioNode from MediaStream');
      that.micSource = that.onlineContext.createMediaStreamSource(micStream);
      console.log('Setting Meyda Source to Microphone');
      console.groupEnd();
      enableRecordBtn();
      disablePlayBtn();
    };

    var errorCallback = function (err) {
      console.group();
      console.log('Initializing microphone has failed. Falling back to default audio file', err);
      that.audioSource = that.onlineContext.createMediaElementSource(that.fallBackAudio[0]);
      that.audioSource.connect(that.onlineContext.destination); // connect to speaker
      console.groupEnd();
      disableRecordBtn();
      enablePlayBtn();
    };

    try {
      navigator.getUserMedia = navigator.webkitGetUserMedia ||
        navigator.getUserMedia || navigator.mediaDevices.getUserMedia;
      var constraints = { video: false, audio: true };

      console.log('Asking for permission...');

      navigator.mediaDevices.getUserMedia(constraints)
        .then(successCallback)
        .catch(errorCallback)
    } catch (err) {
      errorCallback(err);
    }
  };

  initDownSampleNode() {
    this.downSampleNode = this.onlineContext.createScriptProcessor(this.srcBufferSize, 1, 1);

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

      if (that.originalData.length == 0 && inputData.every(function(elem) {return elem < that.noiseThreshold})) {
        return;
      }

      var downSampledData = interpolateArray(inputData, that.downSampledBufferSize);

      that.originalData = that.originalData.concat(Array.from(inputData));
      that.downSampledData = that.downSampledData.concat(downSampledData);
    }
  }

  processMicData() {
    this.initData();
    enableRecordingBtn()

    setTimeout(function() {
      // allowing user to notice they can record
      that.micSource.connect(that.downSampleNode);
      that.onlineContext.resume();
    }, 500);

    setTimeout(function() {
      that.onlineContext.suspend();
      that.micSource.disconnect(that.downSampleNode);
      disableRecordBtn();

      that.getMFCC();
    }, 2500);
  }

  processAudioData() {
    this.initData();
    this.fallBackAudio[0].onpause = function() {
      that.onlineContext.suspend();
      that.audioSource.disconnect(that.downSampleNode);

      that.getMFCC();
    }

    this.audioSource.connect(this.downSampleNode);
    this.onlineContext.resume();

    disablePlayBtn()
    this.fallBackAudio[0].play();
  }

  getMFCC() {
    // this.printData('original data', this.originalData);
    // this.printData('downsampled data', this.downSampledData);

    var offlineContext = new OfflineAudioContext(1, this.newSR + (this.meydaBufferSize * 5), this.newSR);
    // make length of the context long enough that mfcc always gets enough buffers to process

    // Create an empty 30ms stereo buffer at the sample rate of the AudioContext
    let audioSourceBuffer = offlineContext.createBuffer(1, offlineContext.length, this.newSR);
    let audioSourceData = audioSourceBuffer.getChannelData(0);

    for (let i = 0; i < audioSourceBuffer.length; i++) {
      if (i < this.downSampledData.length) {
        audioSourceData[i] = this.downSampledData[i];
      } else {
        audioSourceData[i] = 0;
      }
    }

    // Get an AudioBufferSourceNode.
    // This is the AudioNode to use when we want to play an AudioBuffer
    this.downSampledSource = offlineContext.createBufferSource();
    this.downSampledSource.buffer = audioSourceBuffer;

    that.printData('input data', audioSourceBuffer.getChannelData(0));

    let postProcessing = function(mfcc) {
      that.mfcc = that.mfcc.concat(Array.from(mfcc));
    }

    this.meyda = Meyda.createMeydaAnalyzer({
      bufferSize: this.meydaBufferSize,
      source: this.downSampledSource,
      audioContext: offlineContext,
      hopSize: this.meydaHopSize,
      callback: postProcessing,
      sampleRate: this.newSR,
    });

    console.log('start meyda processing');

    this.meyda.start("mfcc");
    this.downSampledSource.start();

    offlineContext.startRendering().then(function(renderedBuffer) {
      that.meyda.stop();
      console.log('meyda processing completed');
      that.downSampledSource.disconnect();
      that.mfcc = that.mfcc.slice(0, that.mfccDataLength);
      that.printData('mfcc', that.mfcc);
    }).catch(function(err) {
      console.log('Offline processing failed: ' + err);
      // Note: The promise should reject when startRendering is called a second time on an OfflineAudioContext
    });
  }

  getData() {
    return this.mfcc;
  }

  isAllZero(data) {
    return data.every(function(elem) {return elem == 0})
  }

  printData(name, data) {
    if (data.length == 0) {
      console.log('\t', name, ' has length of 0');
    } else if (this.isAllZero(data)) {
      console.log(name, data);
      console.log('\t', name, ' is all zero array with length ', data.length);
    }
    console.log(name, data);

    if (Array.isArray(data[0])) {
      // 2D array
      var temp = data;
      data = [];

      for (var i = 0; i < temp.length; i++) {
        for (var j = 0; j < temp[i].length; j++) {
          data.push(temp[i][j]);
        }
      }
    }
    const arrMin = arr => Math.min(...arr);
    const arrMax = arr => Math.max(...arr);
    const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length

    console.log('\trange : ( ', arrMin(data), ' ~ ', arrMax(data), ' )');
    console.log('\tmean : ', arrAvg(data))

    var i = 0;
    while (data[i] == 0) {
      i++
    }
    console.log('\tfirst non zero element : ', i, ' - ', data[i]);

    i = data.length - 1;
    while (data[i] == 0) {
      i--;
    }
    console.log('\tlast non zero element : ', i, ' - ', data[i]);

  }
}
var onlineProc;

class OnlineAudioProcessor {
  constructor(config) {
    onlineProc = this;
    this.config = config;

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

    this.audioContext = new AudioContext();
    this.audioContext.suspend(); // to be removed once streaming audio is supported

    this.browserSampleRate = this.audioContext.sampleRate;// 44100
    this.srcBufferSize = 1024;
    // with buffer size of 1024, we can the most features of 44032 from original sample rate of 44100
    // once audio of 44100 features is down sampled to 16000 features,
    // resulting number of features is 15953

    this.micInputWaitThreshold = Math.floor(this.browserSampleRate / this.srcBufferSize) * config.micInputWaitTime; // wait for 5 seconds

    this.noiseThreshold = 0.015;

    this.remainingRecordTime = 0;

    this.initSrcNode();
    this.initDownSampleNode();
  }

  initData() {
    this.originalData = [];
    this.downSampledData = [];
    this.audioDeferred = $.Deferred();
    this.dataDeferred = $.Deferred();
    this.remainingRecordTime = this.config.micInputWaitTime;
  }

  initSrcNode() {
    var successCallback = function (micStream) {
      console.group();
      $('#audioControl').hide();
      console.log('User allowed microphone access.');
      console.log('Initializing AudioNode from MediaStream');
      onlineProc.micSource = onlineProc.audioContext.createMediaStreamSource(micStream);
      console.log('Setting Meyda Source to Microphone');
      console.groupEnd();
      disablePlayBtn();
      enableRecordBtn();
    };

    var errorCallback = function (err) {
      console.group();
      console.log('Initializing microphone has failed. Falling back to default audio file', err);
      onlineProc.audioSource = onlineProc.audioContext.createMediaElementSource( $('#fallBackAudio')[0] );
      onlineProc.audioSource.connect(onlineProc.audioContext.destination); // destination triggers polling
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
    this.downSampleNode = this.audioContext.createScriptProcessor(this.srcBufferSize, 1, 1);
    this.downSampledBufferSize = (this.config.offlineSampleRate / this.browserSampleRate) * this.srcBufferSize;

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

    this.downSampleNode.onaudioprocess = function(audioProcessingEvent) {
      var inputData = audioProcessingEvent.inputBuffer.getChannelData(0);

      if (onlineProc.originalData.length == 0) {
        if (onlineProc.remainingRecordTime == 0) {
          onlineProc.audioDeferred.reject();
        } else if (inputData.every(function(elem) {return elem < onlineProc.noiseThreshold})) {
          return;
        }
      }

      if (onlineProc.remainingRecordTime == 0) {
        onlineProc.audioDeferred.resolve();
        return;
      }

      if (onlineProc.originalData.length < onlineProc.browserSampleRate * 1.2) {
        // 1.2 multiplied to make sure data we process is longer than 1s
        onlineProc.originalData = onlineProc.originalData.concat(Array.from(inputData));
        var downSampledData = interpolateArray(inputData, onlineProc.downSampledBufferSize);
        onlineProc.downSampledData = onlineProc.downSampledData.concat(downSampledData);
      } else {
        onlineProc.audioDeferred.resolve();
      }
    }

    this.downSampleNode.connect(this.audioContext.destination); // destination triggers polling
  }

  postRecordingProcess() {
    disableRecordBtn();
    onlineProc.audioContext.suspend();
    onlineProc.micSource.disconnect(onlineProc.downSampleNode);
  }

  processMicData() {
    this.initData();
    enableRecordingBtn();

    displayRemainingRecordTime(onlineProc.remainingRecordTime);
    this.recordingTimeDisplayInterval = setInterval(
      function() {
        onlineProc.remainingRecordTime--;
        displayRemainingRecordTime(onlineProc.remainingRecordTime);
      }, 1000);

      onlineProc.micSource.connect(onlineProc.downSampleNode);
      onlineProc.audioContext.resume();

      function postRecordingProcess() {
        clearInterval(onlineProc.recordingTimeDisplayInterval);
        disableRecordBtn();
        onlineProc.audioContext.suspend();
        onlineProc.micSource.disconnect(onlineProc.downSampleNode);
      }

      this.audioDeferred.done(function() {
        clearInterval(onlineProc.recordingTimeDisplayInterval);
        onlineProc.postRecordingProcess();
        onlineProc.dataDeferred.resolve(onlineProc.downSampledData);
      }).fail(function() {
        clearInterval(onlineProc.recordingTimeDisplayInterval);
        onlineProc.postRecordingProcess();
        onlineProc.dataDeferred.reject();
      })

      return this.dataDeferred.promise();
    }

    startRecording() {
      if (this.remainingRecordTime > 0) {
        return;
      }

      this.initData();
      enableRecordingBtn()
      displayRecordingMsg();

      onlineProc.micSource.connect(onlineProc.downSampleNode);
      onlineProc.audioContext.resume();
    }

    stopRecording() {
      this.remainingRecordTime = 0;

      this.audioDeferred.done(function() {
        onlineProc.postRecordingProcess();
        onlineProc.dataDeferred.resolve(onlineProc.downSampledData);
      }).fail(function() {
        onlineProc.postRecordingProcess();
        onlineProc.dataDeferred.reject();
      })

      return this.dataDeferred.promise();
    }

    // fallback audio process

    processAudioData() {
      this.initData();

      this.fallBackAudio[0].onpause = function() {
        onlineProc.audioContext.suspend();
        onlineProc.audioSource.disconnect(onlineProc.downSampleNode);
        onlineProc.dataDeferred.resolve(onlineProc.downSampledData);
      }

      this.audioSource.connect(this.downSampleNode);
      this.audioContext.resume();

      disablePlayBtn()
      this.fallBackAudio[0].play();

      return this.dataDeferred.promise();
    }
  }

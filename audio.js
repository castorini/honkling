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

    this.data = [];

    this.context = new AudioContext();
    let mBufferSize = this.context.sampleRate / 1000 * 30;
    mBufferSize = Math.pow(2, Math.round(Math.log(mBufferSize) / Math.log(2)));

    this.fallBackAudio =  $('#fallBackAudio');

    this.audioSource = this.context.createMediaElementSource(this.fallBackAudio[0]);
    this.audioSource.connect(this.context.destination);
    this.meyda = Meyda.createMeydaAnalyzer({
      audioContext: this.context,
      source: this.audioSource,
      bufferSize: mBufferSize,
      hopSize: mBufferSize,
    });
    this.init_mic();
  };

  get(features) {
    this.context.resume();
    return this.meyda.get(features);
  };

  doSetTimeout(i) {
    setTimeout(function() {
        var features = null;
        features = that.get([
            'mfcc'
        ]);
        that.data.push(features.mfcc)
        if (that.data.length == 100) {
          console.log(that.data);
          that.data = [];
        }
    }, 30 + 10*i);
  };

  extractFeature() {
    if (!that.micSource) {
      that.fallBackAudio[0].play();
    }

    for (var i = 0; i < 100; ++i) {
      that.doSetTimeout(i);
    }
  };

  init_mic() {
    var successCallback = function (micStream) {
      console.group();
      $('#audioControl').hide();
      console.log('User allowed microphone access.');
      console.log('Initializing AudioNode from MediaStream');
      that.micSource = that.context.createMediaStreamSource(micStream);
      console.log('Setting Meyda Source to Microphone');
      that.meyda.setSource(that.micSource);
      console.groupEnd();
    };

    var errorCallback = function (err) {
      console.group();
      console.log('Initializing microphone has failed. Falling back to default audio file', err);
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
    }
    catch (err) {
      errorCallback(err);
      $('#extractBtn').prop('disabled', false);
    }
  };
}

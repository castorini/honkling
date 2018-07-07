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
    this.mfcc = [];

    this.context = new AudioContext();
    this.mBufferSize = this.context.sampleRate / 1000 * 30;
    this.mBufferSize = Math.pow(2, Math.round(Math.log(this.mBufferSize) / Math.log(2)));

    this.fallBackAudio =  $('#fallBackAudio');

    this.audioSource = this.context.createMediaElementSource(this.fallBackAudio[0]);
    this.audioSource.connect(this.context.destination);
    this.meyda = Meyda.createMeydaAnalyzer({
      audioContext: this.context,
      source: this.audioSource,
      bufferSize: this.mBufferSize
    });
    this.init_mic();
  };

  get(features, data) {
    this.context.resume();
    return this.meyda.get(features, data);
  };

  getInput() {
    this.context.resume();
    return this.meyda.getInput();
  };

  extractMicFeature() {
    var features = null;
    features = that.get([
        'mfcc'
    ]);
    that.data.push(features.mfcc)
  }

  isAllZero(arr) {
    let flag = true;
    for (var i = 0; i < arr.length; ++i) {
      if (arr[i] != 0) {
        flag = false;
        break;
      }
    }
    return flag;
  }

  extractMediaFeature() {
    if (that.data.length == 100) return;

    var curInput = that.getInput();

    that.data.push(curInput);
  }

  download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  processInput() {
    // clear previous data
    this.data = [];
    this.mfcc = [];
    this.mfcc_flattened = [];
    
    if (that.micSource) {
      // extract from mic
      var intervalFunc = function() {
        var iteration = 100;
        var interval = setInterval(function() {
          if (iteration < 1) {
              clearInterval(interval);
              console.log(that.data);
              // TODO : trigger next processing logic
              return;
          }
          that.extractMicFeature();
          iteration--;
        }, 10);
      };
      // wait for 30 milliseconds before extraction
      setTimeout(intervalFunc, 30);
    } else {
      // extract from fall back audio
      that.fallBackAudio[0].onplay = function() {
        var interval = setInterval(that.extractMediaFeature, 23.3);
        that.fallBackAudio[0].onended = function() {
          clearInterval(interval);
          var flattened = [];
          for (let i = 0; i < that.data.length; i++) {
             for (let j = 0; j < that.mBufferSize; j++) {
               flattened.push(that.data[i][j]);
             }
          }

          let i = 0;
          while (i + that.mBufferSize < flattened.length && that.mfcc.length < 100) {
            let window = flattened.slice(i, i + that.mBufferSize);
            i += Math.floor(that.mBufferSize/3);
            let curMfcc = that.get(['mfcc'], window);
            if (!that.isAllZero(curMfcc.mfcc) || that.mfcc.length > 0) {
              that.mfcc.push(curMfcc.mfcc);
            }
          }

          let mfcc_flattened_str = '';
          for (let i = 0; i < that.mfcc.length; i++) {
            for (let j = 0; j < 40; j++) {
              mfcc_flattened_str += '' + that.mfcc[i][j] + ' ';
              that.mfcc_flattened.push(that.mfcc[i][j]);
            }
          }
          let fname = that.fallBackAudio[0].currentSrc.replace(/^.*[\\\/]/, '');
          // that.download(fname+'.txt', mfcc_flattened_str);
          // TODO : trigger next processing logic
        };
      };
      that.fallBackAudio[0].play();
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

  get_data() {
    while (this.mfcc_flattened.length < 4000) {
      this.mfcc_flattened.push(0);
    }
    return this.mfcc_flattened;
  }
}

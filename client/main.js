function httpGetAsync(theUrl, callback, message)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("POST", theUrl, true); // true for asynchronous 
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.send(JSON.stringify({ mfcc: message }));
}

function callback(res) {
    console.log(res);
}
function doSetTimeout(a, i) {
    setTimeout(function() {
        var features = null;
        features = a.get([
            'mfcc'
        ]);
        console.log(features.mfcc)
        httpGetAsync('http://127.0.0.1:80', callback, features.mfcc);
    }, 500*i);
}  

function extractFeature(a) {
    //console.log(a)
    for (var i = 1; i <= 30; ++i) {
        doSetTimeout(a, i);
    }
}

class Audio {
    constructor(bufferSize) {
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
    //console.log(this.context.sampleRate)

    let elvis = document.getElementById('elvisSong');
    let stream = this.context.createMediaElementSource(elvis);
    stream.connect(this.context.destination);
    this.meyda = Meyda.createMeydaAnalyzer({
      audioContext: this.context,
      source: stream,
      bufferSize: bufferSize,
      hopSize: 160,
      callback: function(obj) {
        alert("call back");
      },
    });
    this.initializeMicrophoneSampling();
  };

  initializeMicrophoneSampling() {
    var errorCallback = function (err) {
      // We should fallback to an audio file here, but that's difficult on mobile
      if (that.context.state === 'suspended') {
        var resume = function () {
          that.context.resume();

          setTimeout(function () {
            if (that.context.state === 'running') {
              document.body.removeEventListener('touchend', resume, false);
            }
          }, 0);
        };

        document.body.addEventListener('touchend', resume, false);
      };
    };

    try {
      navigator.getUserMedia = navigator.webkitGetUserMedia ||
        navigator.getUserMedia || navigator.mediaDevices.getUserMedia;
      var constraints = { video: false, audio: true };
      var successCallback = function (mediaStream, context) {
        document.getElementById('audioControl').style.display = 'none';
        console.log('User allowed microphone access.');
        console.log('Initializing AudioNode from MediaStream');
        var source = that.context.createMediaStreamSource(mediaStream);
        console.log('Setting Meyda Source to Microphone');
        that.meyda.setSource(source);
        console.groupEnd();
        extractFeature(that);
      };

      console.log('Asking for permission...');
      let getUserMediaPromise = navigator.getUserMedia(
        constraints,
        successCallback,
        errorCallback
      );
      if (getUserMediaPromise) {
        p.then(successCallback());
        p.catch(errorCallback);
      }
    }
    catch (e) {
      errorCallback();
    }
  };

  get(features) {
    this.context.resume();
    return this.meyda.get(features);
  };

  start(features) {
    this.context.resume();
    this.meyda.start(features);
  };

  init(callback) {
    // do something async and call the callback:
    callback.bind(this)();
  }
}

const bufferSize = 1024;
var that;
let a = new Audio(bufferSize);;


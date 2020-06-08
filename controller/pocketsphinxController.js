// These will be initialized later
var recognizer, recorder, callbackManager, audioContext;

// Only when both recorder and recognizer do we have a ready application
var isRecorderReady = isRecognizerReady = false;

// A convenience function to post a message to the recognizer and associate
// a callback to its response
function postRecognizerJob(message, callback) {
  var msg = message || {};
  if (callbackManager) msg.callbackId = callbackManager.add(callback);
  if (recognizer) recognizer.postMessage(msg);
};

// This function initializes an instance of the recorder
// it posts a message right away and calls onReady when it
// is ready so that onmessage can be properly set
function spawnWorker(workerURL, onReady) {
    recognizer = new Worker(workerURL);
    recognizer.onmessage = function(event) {
      onReady(recognizer);
    };
    // As arguments, you can pass non-default path to pocketsphinx.js and pocketsphinx.wasm:
    // recognizer.postMessage({'pocketsphinx.wasm': '/path/to/pocketsphinx.wasm', 'pocketsphinx.js': '/path/to/pocketsphinx.js'});
    recognizer.postMessage({});
};

function updateUI() {
  if (isRecorderReady && isRecognizerReady) startBtn.disabled = stopBtn.disabled = false;
};

// Callback function once the user authorises access to the microphone
// in it, we instanciate the recorder
function startUserMedia(stream) {
  var input = audioContext.createMediaStreamSource(stream);
  // Firefox hack https://support.mozilla.org/en-US/questions/984179
  window.firefox_audio_hack = input;
  var audioRecorderConfig = {errorCallback: function(x) {updateStatus("Error from recorder: " + x);}};
  recorder = new AudioRecorder(input, audioRecorderConfig);
  // If a recognizer is ready, we pass it to the recorder
  if (recognizer) recorder.consumers = [recognizer];
  isRecorderReady = true;
  updateUI();
  updateStatus("Audio recorder ready");
};

// This starts recording. We first need to get the id of the keyword search to use
var startRecording = function() {
  if (recorder) {
    recorder.start(1);
    updateStatus("startRecording");
  }
};

// Stops recording
var stopRecording = function() {
  if (recorder) {
    recorder.stop();
    updateStatus("stopRecording");
  }
};

// Called once the recognizer is ready
// We then add the grammars to the input select tag and update the UI
var recognizerReady = function() {
  isRecognizerReady = true;
  updateUI();
  updateStatus("Recognizer ready");
};

// This adds a grammar from the grammars array
// We add them one by one and call it again as
// a callback.
// Once we are done adding all grammars, we can call
// recognizerReady()
var feedGrammar = function(g, index, id) {
  if (id && (grammarIds.length > 0)) grammarIds[0].id = id.id;
  if (index < g.length) {
    grammarIds.unshift({title: g[index].title});
    postRecognizerJob({command: 'addGrammar', data: g[index].g},
                        function(id) {feedGrammar(grammars, index + 1, {id:id});});
  } else {
    // We are adding keyword spotting which has id 0
    grammarIds.push({"id":0, "title": "Keyword spotting"});
    recognizerReady();
  }
};

// This adds words to the recognizer. When it calls back, we add grammars
var feedWords = function(words) {
     postRecognizerJob({command: 'addWords', data: words},
                  function() {feedGrammar(grammars, 0);});
};

// This initializes the recognizer. When it calls back, we add words
var initRecognizer = function() {
    // You can pass parameters to the recognizer, such as : {command: 'initialize', data: [["-hmm", "my_model"], ["-fwdflat", "no"]]}
    postRecognizerJob({command: 'initialize', data: [["-kws_threshold", "1e-25"]]},
                      function() {
                                  if (recorder) recorder.consumers = [recognizer];
                                  feedWords(wordList);
                                });
};

let prev_pred = "";

updateStatus("Initializing web audio and speech recognizer, waiting for approval to access the microphone");
callbackManager = new CallbackManager();
spawnWorker("lib/pocketsphinx/recognizer.js", function(worker) {
    // This is the onmessage function, once the worker is fully loaded
    worker.onmessage = function(e) {
        // This is the case when we have a callback id to be called
        if (e.data.hasOwnProperty('id')) {
          var clb = callbackManager.get(e.data['id']);
          var data = {};
          if ( e.data.hasOwnProperty('data')) data = e.data.data;
          if(clb) clb(data);
        }
        // This is a case when the recognizer has a new hypothesis
        if (e.data.hasOwnProperty('hyp')) {
          var hyp_len = e.data.hypseg.length;
          var newHyp = e.data.hypseg[hyp_len-1].word;
          updateToggledCommand(newHyp);
        }
        // This is the case when we have an error
        if (e.data.hasOwnProperty('status') && (e.data.status == "error")) {
          updateStatus("Error in " + e.data.command + " with code " + e.data.code);
        }
    };
    // Once the worker is fully loaded, we can call the initialize function
    initRecognizer();
});

// The following is to initialize Web Audio
try {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  window.URL = window.URL || window.webkitURL;
  audioContext = new AudioContext();
} catch (e) {
  updateStatus("Error initializing Web Audio browser");
}
if (navigator.mediaDevices.getUserMedia) navigator.mediaDevices.getUserMedia({audio: true}).then(startUserMedia).catch(function(e) {
                                updateStatus("No live audio input in this browser");
                            });
else updateStatus("No web audio support in this browser");


// Wiring JavaScript to the UI
var startBtn = document.getElementById('startBtn');
var stopBtn = document.getElementById('stopBtn');
startBtn.disabled = true;
stopBtn.disabled = true;
startBtn.onclick = startRecording;
stopBtn.onclick = stopRecording;

// This is the list of words that need to be added to the recognizer
// This follows the CMU dictionary format
var wordList = [["HEY", "HH EY"], ["FIRE", "F AY ER"], ["FOX", "F AA K S"]];

var grammarHeyFireFox = {numStates: 1, start: 0, end: 0, transitions: [{from: 0, to: 0, word: "HEY"}, {from: 0, to: 0, word: "FIRE"}, {from: 0, to: 0, word: "FOX"}]};
var grammars = [{title: "HeyFireFox", g: grammarHeyFireFox}];
var grammarIds = [];

// list initialization
init_view(commands);

// These will be initialized later
var recognizer, recorder, callbackManager, audioContext;

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

// This adds a grammar from the grammars array
// We add them one by one and call it again as
// a callback.

// This is the list of words that need to be added to the recognizer
// This follows the CMU dictionary format
var wordList = [["HEY", "HH EY"], ["FIRE", "F AY ER"], ["FOX", "F AA K S"]];

var grammarHeyFireFox = {numStates: 1, start: 0, end: 0, transitions: [{from: 0, to: 0, word: "HEY"}, {from: 0, to: 0, word: "FIRE"}, {from: 0, to: 0, word: "FOX"}]};
var grammars = [{title: "HeyFireFox", g: grammarHeyFireFox}];
var grammarIds = [];

var feedGrammar = function(g, index, id) {
  if (id && (grammarIds.length > 0)) grammarIds[0].id = id.id;
  if (index < g.length) {
    grammarIds.unshift({title: g[index].title});
    postRecognizerJob({
            command: 'addGrammar',
            data: g[index].g},
        function(id) {
            feedGrammar(grammars, index + 1, {id:id});
        });
  } else {
    // We are adding keyword spotting which has id 0
    grammarIds.push({"id":0, "title": "Keyword spotting"});
  }
};

// This adds words to the recognizer. When it calls back, we add grammars
var feedWords = function(words) {
    postRecognizerJob({
            command: 'addWords',
            data: words},
        function() {
                feedGrammar(grammars, 0);
            });
};

// This initializes the recognizer. When it calls back, we add words
var initRecognizer = function() {
    // You can pass parameters to the recognizer, such as : {command: 'initialize', data: [["-hmm", "my_model"], ["-fwdflat", "no"]]}
    postRecognizerJob({
        command: 'initialize',
        data: [["-kws_threshold", "1e-25"]]},
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

var successCallback = function (micStream) {
    var input = audioContext.createMediaStreamSource(micStream);
    console.log('User allowed microphone access.');

    window.firefox_audio_hack = input;
    var audioRecorderConfig = {errorCallback: function(x) {updateStatus("Error from recorder: " + x);}};
    recorder = new AudioRecorder(input, audioRecorderConfig);

    if (recognizer) {
        recorder.consumers = [recognizer];
    }

    recorder.start(1);
    updateStatus("Audio recorder ready");

    visualizer({
        parent: "#waveform",
        stream: micStream
    });
};

var errorCallback = function (err) {
  console.log('Initializing microphone has failed. Falling back to default audio file', err);
  updateStatus('Please enabble mic access')
};

try {
  navigator.getUserMedia = navigator.webkitGetUserMedia ||
  navigator.getUserMedia || navigator.mediaDevices.getUserMedia;
  audioContext = new AudioContext();

  var constraints = { video: false, audio: true };

  console.log('Asking for permission...');

  navigator.mediaDevices.getUserMedia(constraints)
  .then(successCallback)
  .catch(errorCallback);
} catch (err) {
  errorCallback(err);
}

// list initialization
init_view(commands);

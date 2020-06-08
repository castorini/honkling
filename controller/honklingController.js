let micAudioProcessor = new MicAudioProcessor(audioConfig);
let model = new SpeechResModel("RES8", commands);
let inferenceEngine = new InferenceEngine(inferConfig, commands);

micAudioProcessor.getMicPermission().done(function() {
  setInterval(function() {
    // micAudioProcessor.getData().length = 16324 * window_size_in_sec

    let offlineProcessor = new OfflineAudioProcessor(audioConfig, micAudioProcessor.getData());
    offlineProcessor.getMFCC().done(function(mfccData) {

      command = inferenceEngine.infer(mfccData, model, commands);
      updateToggledCommand(command);
    });
  }, predictionFrequency);
}).fail(function() {
  alert('mic permission is required, please enable the mic usage!');
});

// list initialization
init_view(commands);

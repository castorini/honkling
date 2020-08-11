let micAudioProcessor = new MicAudioProcessor(config);
let model = new SpeechResModel("RES8", config);
let inferenceEngine = new InferenceEngine(config);

micAudioProcessor.getMicPermission().done(function() {
  setInterval(function() {
    let offlineProcessor = new OfflineAudioProcessor(config, micAudioProcessor.getData());
    offlineProcessor.getMFCC().done(function(mfccData) {

      command = inferenceEngine.infer(mfccData, model, config.commands);
      updateToggledCommand(command);

      if (inferenceEngine.sequencePresent()) {
        toggleFullWord();
      }
    });
  }, config.predictionFrequency * 1000);
}).fail(function() {
  alert('mic permission is required, please enable the mic usage!');
});

// list initialization
init_view();

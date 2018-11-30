const commands_2048 = ["silence", "unknown", "left", "right", "up", "down"];

let micAudioProcessor = new MicAudioProcessor(audioConfig);
let model = new SpeechResModel("2048", commands_2048);

micAudioProcessor.getMicPermission().done(function() {
  setInterval(function() {
    let offlineProcessor = new OfflineAudioProcessor(audioConfig, micAudioProcessor.getData());
    offlineProcessor.getMFCC().done(function(mfccData) {
	  let command = predict(mfccData, model);
	  if (command != "unknown" && command != "silence") {
	  	console.log(command)
	  }
    })
  }, predictionFrequency);
}).fail(function() {
  alert('mic permission is required, please enable the mic usage!')
})
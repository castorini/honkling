var audioProcessor = require('./audioProcessor');
const config = require('./config');
const matrix = require('./matrix');
const SpeechResModel = require('./speechResModel');

function KeywordSpotter(modelName="RES8", modelType = "RES8", predThreshold = config.predictionThreshold) {
  this.predThreshold = predThreshold;
  if (modelName == "light") {
    this.model = new SpeechResModel(modelName, "RES8", config.lightCommands, predThreshold);
  } else if (modelName == "mojibar") {
    this.model = new SpeechResModel("iui", "RES8", config.iuiCommands, predThreshold);
  } else {
    this.model = new SpeechResModel(modelType, modelType, config.commands, predThreshold);
  }
}

KeywordSpotter.prototype.predict = function(rawAudioData) {
  let mfccData = audioProcessor.getMFCC(rawAudioData);
  return this.model.predict(matrix.transposeFlatten2d(mfccData));
}

KeywordSpotter.prototype.getCommands = function() {
  return this.model.commands;
}

KeywordSpotter.prototype.getPredThreshold = function() {
  return this.predThreshold;
}

module.exports = KeywordSpotter;

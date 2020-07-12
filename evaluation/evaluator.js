const SpeechResModel = require('./speechResModel');
const evaluationConfig = require('./config');
const DataLoader = require('./dataLoader');
const MelSpectrogram = require('./melSpectrogram');
const InferenceEngine = require('./inferenceEngine');
const util = require('./util');

function Evaluator() {
  console.logevalua
  this.model = new SpeechResModel(
    "RES8", 
    evaluationConfig['commands'], 
    evaluationConfig['modelConfig'], 
    evaluationConfig['modelWeights']);

  this.dataLoader = new DataLoader(evaluationConfig['dataLoaderConfig']);

  this.melSpectrogram = new MelSpectrogram(evaluationConfig['melSpectrogramConfig']);

  this.inferenceEngine = new InferenceEngine(evaluationConfig['inferenceEngineConfig'], evaluationConfig['commands']);

  this.input_length = evaluationConfig['dataLoaderConfig']["sample_rate"] * evaluationConfig['dataLoaderConfig']["window_size_seconds"];
}

Evaluator.prototype.evaluate = function() {
  this.status = 0;
  this.expected = false;
  this.detected = false;
  let metric = {
    'tp': 0,
    'fp': 0,
    'tn': 0,
    'fn': 0
  }

  let data = this.dataLoader.getNextWindow();

  this.file_name = "";

  let start = false;

  while (!util.isEmpty(data)) {

    if (start && data['file_name'] != this.file_name) {
      this.file_name = data['file_name'];

      if (this.inferenceEngine.sequencePresent()) {
        this.detected = true;
      }

      if (this.expected && this.detected) {
        metric['tp'] += 1;
        console.log(metric);
      } else if (!this.expected && this.detected) {
        metric['fp'] += 1;
      } else if (this.expected && !this.detected) {
        metric['fn'] += 1;
        console.log(metric);
      } else {
        metric['tn'] += 1;
      }

      this.detected = false;
      this.expected = data['label'];
    }

    this.expected = data['label'];

    let mel_spectrogram_data = this.melSpectrogram.extract(data['data'].slice(0, this.input_length));

    let log_mels_data = mel_spectrogram_data.add(0.0000007).log();

    let zmuv_sample = log_mels_data.sub(evaluationConfig['zmuvConfig']["mean"]).div(evaluationConfig['zmuvConfig']["std"])

    this.inferenceEngine.infer(zmuv_sample, this.model, this.commands);

    // next iteration
    data = this.dataLoader.getNextWindow();
    start = true;
  }

  if (this.expected && this.detected) {
    metric['tp'] += 1;
    console.log(metric);
  } else if (!this.expected && this.detected) {
    metric['fp'] += 1;
  } else if (this.expected && !this.detected) {
    metric['fn'] += 1;
    console.log(metric);
  } else {
    metric['tn'] += 1;
  }

  console.log("---- final ----")
  console.log(metric);

}

evaluator = new Evaluator();
evaluator.evaluate();
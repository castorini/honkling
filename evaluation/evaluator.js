const DataLoader = require('./dataLoader');
const MelSpectrogram = require('./melSpectrogram');
const InferenceEngine = require('../common/inferenceEngine');
const SpeechResModel = require('../models/speechResModel');
const config = require('../common/config');
const util = require('../common/util').util;


function Evaluator() {
  // this.model = new SpeechResModel(
  //   "RES8", 
  //   evaluationConfig['commands'], 
  //   evaluationConfig['modelConfig'], 
  //   evaluationConfig['modelWeights']);

  this.dataLoader = new DataLoader(config);

  this.melSpectrogram = new MelSpectrogram(config);

  this.inferenceEngine = new InferenceEngine(config);

  this.model = new SpeechResModel("RES8", config)

  this.input_length = config.sampleRate * config.windowSize;
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
  let timestemp = 0;

  let audio_length = 5000; // for the first sample

  while (!util.isEmpty(data)) {

    if (start && data['file_name'] != this.file_name) {
      this.file_name = data['file_name'];

      if (this.inferenceEngine.sequencePresent(timestemp, audio_length)) {
        this.detected = true;
      }

      audio_length = data['audio_length_ms'];

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

    // let mel_spectrogram_data = this.melSpectrogram.extract(data['data'].slice(0, this.input_length));
    let mel_spectrogram_data = this.melSpectrogram.extract(data['data']);

    let log_mels_data = mel_spectrogram_data.add(0.0000007).log();

    let zmuv_sample = log_mels_data.sub(config.zmuvConfig.mean).div(config.zmuvConfig.std)

    this.inferenceEngine.infer(zmuv_sample, this.model, timestemp);

    // next iteration
    data = this.dataLoader.getNextWindow();
    start = true;
    timestemp += (config.dataLoaderConfig.stride_size_seconds * 1000)
  }

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

  console.log("---- final ----")
  console.log(metric);

}

evaluator = new Evaluator();
evaluator.evaluate();
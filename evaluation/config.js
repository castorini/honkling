
let dataLoaderConfig = {
  'sample_rate' : 16000,
  'noise_threshold' : 0.050,
  'stride_size_seconds': 0.1,
  'window_size_seconds' : 0.75, // in s
  'padding_size_seconds': 0.1,
  'metadata_file' : '/data/speaker-id-split-medium/metadata-test.jsonl',
  'audio_file_path' : '/data/speaker-id-split-medium/audio/'
}

// dataLoaderConfig['metadata_file'] = '/data/speaker-id-split-medium/test.jsonl';

let inferenceEngineConfig = {
  'inference_window_ms' : 1000,
  'smoothing_window_ms' : 500,
  'tolerance_window_ms' : 200,
  'inference_weights' : [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  'inference_sequence' : [0, 1, 2],
  'stride_size' : 250
}

let commands = ["hey", "fire", "fox", "unknown", "unknown4", "unknown5", "unknown6", "unknown7", "unknown8", "unknown9"];
const weights_2words = require('../honkling-models/honkling-node/RES8-2words');
const weights_4words = require('../honkling-models/honkling-node/RES8-4words');

const modelConfig = {
  input_shape : [80, 61, 1],
  n_layers : 6,
  n_feature_maps : 45,
  res_pool : [4, 3],
  conv_size : [3, 3],
  conv_stride : [1, 1],
  use_dilation : false,
}

let zmuvConfig = {
  "mean": -2.0045,
  "std": 4.0985
}


let melSpectrogramConfig = {
  'use_precomputed' : true,
  'sample_rate' : 16000,
  'spectrogram' : null,
  'n_fft' : 512,
  'hop_length' : 200,
  'win_length' : null,
  'window' : 'hann',
  'center' : true,
  'pad_mode' : 'reflect',
  'power' : 2.0,
  'n_mels' : 80,
  'f_min' : 0,
  'f_max' : 8000,
  'htk' : true,
  'norm' : false
}

let evaluationConfig = {
  'commands': commands,
  'dataLoaderConfig': dataLoaderConfig,
  'inferenceEngineConfig': inferenceEngineConfig,
  'modelWeights': weights_4words,
  'modelConfig': modelConfig,
  'melSpectrogramConfig': melSpectrogramConfig,
  'zmuvConfig': zmuvConfig
}


let hey_firefox = true;
if (hey_firefox) {
  evaluationConfig['commands'] = ["hey", "firefox", "unknown2", "unknown3", "unknown4", "unknown5", "unknown6", "unknown7", "unknown8", "unknown9"];
  evaluationConfig['modelWeights'] = weights_2words;
  evaluationConfig['modelConfig']['input_shape'] = [80, 81, 1];
  evaluationConfig['dataLoaderConfig']['window_size_seconds'] = 1;
  evaluationConfig['inferenceEngineConfig']['inference_sequence'] = [0, 1]
}


module.exports = evaluationConfig



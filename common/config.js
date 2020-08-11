if (typeof util === 'undefined') {
  // loaded by node.js
  util = require('../common/util').util;
}

// in-browser related configs
// units are all in seconds unless specified otherwise

var config = {
  'commands': ["hey", "fire", "fox", "unknown3", "unknown4", "unknown5", "unknown6", "unknown7", "unknown8", "unknown9"],
  'predictionFrequency': 0.062, // 62 ms
  'windowSize' : 0.5, // 500 ms
  'sampleRate': 16000
}


var micAudioProcessorConfig = {
  'paddingSize' : 6000, // in samples
}

config['micAudioProcessorConfig'] = micAudioProcessorConfig

var featureExtractionConfig = {
  'melBands': 40, // n_mels (only used for Meyda) 
  'hopSize': config.sampleRate * 0.0125 // hop by 12.5 ms
}


config['featureExtractionConfig'] = featureExtractionConfig


var zmuvConfig = {
  'mean': -2.0045,
  'std': 4.0985
}

config['zmuvConfig'] = zmuvConfig


var inferenceEngineConfig = {
  'inference_window_ms' : 2000,
  'smoothing_window_ms' : 50,
  'tolerance_window_ms' : 500,
  'inference_weights' : [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  'inference_sequence' : [0, 1, 2]
}

config['inferenceEngineConfig'] = inferenceEngineConfig


let input_width = config.sampleRate * config.windowSize / featureExtractionConfig.hopSize + 1;
let input_height = featureExtractionConfig.melBands;

let modelConfig = {
  weight_name : "v1.0.0",
  input_shape : [input_height, input_width, 1],
  n_layers : 6,
  n_feature_maps : 45,
  res_pool : [4, 3],
  conv_size : [3, 3],
  conv_stride : [1, 1],
  use_dilation : false
}

config['modelConfig'] = modelConfig


// evaluation related configs

let dataLoaderConfig = {
  'noise_threshold' : 0.050,
  'stride_size_seconds': config.predictionFrequency / 1000,
  'padding_size_seconds': 0.1,
  'metadata_file' : '/data/speaker-id-split-medium/metadata-test.jsonl',
  'audio_file_path' : '/data/speaker-id-split-medium/audio/'
}

config['dataLoaderConfig'] = dataLoaderConfig

let melSpectrogramConfig = {
  'use_precomputed' : true,
  'spectrogram' : null,
  'n_fft' : 512,
  'win_length' : null,
  'window' : 'hann',
  'center' : true,
  'pad_mode' : 'reflect',
  'power' : 2.0,
  'f_min' : 0,
  'f_max' : 8000,
  'htk' : true,
  'norm' : false
}

config['featureExtractionConfig'] = util.extendObj(featureExtractionConfig, melSpectrogramConfig);


if (typeof module !== 'undefined') {
  module.exports = config;
}
weights = {}; // placeholder for dynamic weights loading
melBasis = {}; // placeholder for dynamic weights loading

var config = {
  'commands': ["hey", "fire", "fox", "unknown3", "unknown4", "unknown5", "unknown6", "unknown7", "unknown8", "unknown9"],
  'predictionFrequency': 62,
  'hopSize' : 12.5,
  'sampleRate': 16000
}


var micAudioProcessorConfig = {
  'paddingSize' : 6000, // in samples
  'windowSize' : 0.5 // in s
}

config['micAudioProcessorConfig'] = micAudioProcessorConfig

var featureExtractionConfig = {
  'melBands': 40, // n_mels (only used for Meyda) 
  'hopSize': config.sampleRate / 1000 * config.hopSize
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


let input_width = config.sampleRate * micAudioProcessorConfig.windowSize / featureExtractionConfig.hopSize + 1;
let input_height = featureExtractionConfig.melBands;

let modelConfig = {
  weight_name : "MEYDA",
  input_shape : [input_height, input_width, 1],
  n_layers : 6,
  n_feature_maps : 45,
  res_pool : [4, 3],
  conv_size : [3, 3],
  conv_stride : [1, 1],
  use_dilation : false
}

config['modelConfig'] = modelConfig
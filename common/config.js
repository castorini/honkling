const serverURL = 'http://localhost:8000';

const commands = ["hey", "fire", "fox", "unknown", "unknown4", "unknown5", "unknown6", "unknown7", "unknown8", "unknown9"];

let detectCounterThreshold = 10;
const predictionFrequency = 100; // predict every 100 ms

// firefox version
const audioConfig = {
	'offlineSampleRate' : 16000,
	'offlineHopSize' : 12.5, // in ms (half of offlineWindowSize)
	'offlineWindowSize' : 32, // in ms
	'micInputWaitTime' : 5, // in s
	'noiseThreshold' : 0.050,
	'window_size' : 0.75, // in s
	'padding_size' : 6000 // in samples
}

const inferConfig = {
	'predictionThreshold' : 0.7,
	'num_smoothing_frame' : 3,
	'num_confidence_frame' : 10
}
weights = {}; // placeholder for dynamic weights loading

const modelConfig = {
	RES8 : {
		input_shape : [80, 61, 1],
		n_layers : 6,
		n_feature_maps : 45,
		res_pool : [4, 3],
		conv_size : [3, 3],
		conv_stride : [1, 1],
		use_dilation : false
	}
}

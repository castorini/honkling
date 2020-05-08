const serverURL = 'https://honkling.xyz:443';
// const serverURL = 'http://localhost:8080';

// const commands = ["unknown", "hey_firefox", "unknown2", "unknown3", "unknown4", "unknown5", "unknown6", "unknown7", "unknown8", "unknown9"];
const commands = ["hey", "fire", "fox", "unknown", "unknown4", "unknown5", "unknown6", "unknown7", "unknown8", "unknown9"];

// const predictionFrequency = 350; // ms between mic audio prediction
// const audioConfig = {
// 	'offlineSampleRate' : 16000,
// 	'offlineHopSize' : 10, // in ms
// 	'offlineWindowSize' : 30, // in ms
// 	'micInputWaitTime' : 5, // in s
// 	'noiseThreshold' : 0.050
// }

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

// // ww4ff version
// const inferConfig = {
// 	'predictionThreshold' : 0.9,
// 	'alpha' : 0.9
// }

const inferConfig = {
	'predictionThreshold' : 0.7,
	'num_smoothing_frame' : 3,
	'num_confidence_frame' : 10
}

const personalizationConfig = {
	epochs : 50,
	validationSplit : 0,
	shuffle: true,
	expectedTimeRate : 0.5,
	learningRate : 0.01
}

weights = {}; // placeholder for dynamic weights loading

const modelConfig = {
	2048 : {
		input_shape : [40, 101, 1],
		n_layers : 6,
		n_feature_maps : 19,
		res_pool : [3, 4],
		use_dilation : false,
		conv_size : [3, 3],
		conv_stride : [1, 1]
	},
	// CNN_TRAD_POOL2 : {
	// 	input_shape : [101, 40, 1],
	// 	dropout_prob : 0.5,
	// 	height : 101,
	// 	width : 40,
	// 	n_feature_maps1 : 64,
	// 	n_feature_maps2 : 64,
	// 	conv1_size : [20, 8],
	// 	conv2_size : [10, 4],
	// 	conv1_stride : [1, 1],
	// 	conv2_stride : [1, 1],
	// 	conv1_pool : [2, 2],
	// 	conv2_pool : [1, 1],
	// 	tf_variant : true
	// },
	// CNN_ONE_STRIDE1 : {
	// 	input_shape : [101, 40, 1],
	// 	dropout_prob : 0.5,
	// 	height : 101,
	// 	width : 40,
	// 	n_feature_maps1 : 186,
	// 	conv1_size : [100, 8],
	// 	conv1_pool : [1, 1],
	// 	conv1_stride : [1, 1],
	// 	dnn1_size : 128,
	// 	dnn2_size : 128,
	// 	tf_variant : true
	// },
	// CNN_TSTRIDE2 : {
	// 	input_shape : [101, 40, 1],
	// 	dropout_prob : 0.5,
	// 	height : 101,
	// 	width : 40,
	// 	n_feature_maps1 : 78,
	// 	n_feature_maps2 : 78,
	// 	conv1_size : [16, 8],
	// 	conv2_size : [9, 4],
	// 	conv1_pool : [1, 3],
	// 	conv1_stride : [2, 1],
	// 	conv2_stride : [1, 1],
	// 	conv2_pool : [1, 1],
	// 	dnn1_size : 128,
	// 	dnn2_size : 128
	// },
	// CNN_TSTRIDE4 : {
	// 	input_shape : [101, 40, 1],
	// 	dropout_prob : 0.5,
	// 	height : 101,
	// 	width : 40,
	// 	n_feature_maps1 : 100,
	// 	n_feature_maps2 : 78,
	// 	conv1_size : [16, 8],
	// 	conv2_size : [5, 4],
	// 	conv1_pool : [1, 3],
	// 	conv1_stride : [4, 1],
	// 	conv2_stride : [1, 1],
	// 	conv2_pool : [1, 1],
	// 	dnn1_size : 128,
	// 	dnn2_size : 128
	// },
	// CNN_TSTRIDE8 : {
	// 	input_shape : [101, 40, 1],
	// 	dropout_prob : 0.5,
	// 	height : 101,
	// 	width : 40,
	// 	n_feature_maps1 : 126,
	// 	n_feature_maps2 : 78,
	// 	conv1_size : [16, 8],
	// 	conv2_size : [5, 4],
	// 	conv1_pool : [1, 3],
	// 	conv1_stride : [8, 1],
	// 	conv2_stride : [1, 1],
	// 	conv2_pool : [1, 1],
	// 	dnn1_size : 128,
	// 	dnn2_size : 128
	// },
	// CNN_TPOOL2 : {
	// 	input_shape : [101, 40, 1],
	// 	dropout_prob : 0.5,
	// 	height : 101,
	// 	width : 40,
	// 	n_feature_maps1 : 94,
	// 	n_feature_maps2 : 94,
	// 	conv1_size : [21, 8],
	// 	conv2_size : [6, 4],
	// 	conv1_pool : [2, 3],
	// 	conv1_stride : [1, 1],
	// 	conv2_stride : [1, 1],
	// 	conv2_pool : [1, 1],
	// 	dnn1_size : 128,
	// 	dnn2_size : 128
	// },
	// CNN_TPOOL3 : {
	// 	input_shape : [101, 40, 1],
	// 	dropout_prob : 0.5,
	// 	height : 101,
	// 	width : 40,
	// 	n_feature_maps1 : 94,
	// 	n_feature_maps2 : 94,
	// 	conv1_size : [15, 8],
	// 	conv2_size : [6, 4],
	// 	conv1_pool : [3, 3],
	// 	conv1_stride : [1, 1],
	// 	conv2_stride : [1, 1],
	// 	conv2_pool : [1, 1],
	// 	dnn1_size : 128,
	// 	dnn2_size : 128
	// },
	// CNN_ONE_FPOOL3 : {
	// 	input_shape : [101, 40, 1],
	// 	dropout_prob : 0.5,
	// 	height : 101,
	// 	width : 40,
	// 	n_feature_maps1 : 54,
	// 	conv1_size : [100, 8],
	// 	conv1_pool : [1, 3],
	// 	conv1_stride : [1, 1],
	// 	dnn1_size : 128,
	// 	dnn2_size : 128
	// },
	// CNN_ONE_FSTRIDE4 : {
	// 	input_shape : [101, 40, 1],
	// 	dropout_prob : 0.5,
	// 	height : 101,
	// 	width : 40,
	// 	n_feature_maps1 : 186,
	// 	conv1_size : [101, 8],
	// 	conv1_pool : [1, 1],
	// 	conv1_stride : [1, 4],
	// 	dnn1_size : 128,
	// 	dnn2_size : 128
	// },
	// CNN_ONE_FSTRIDE8 : {
	// 	input_shape : [101, 40, 1],
	// 	dropout_prob : 0.5,
	// 	height : 101,
	// 	width : 40,
	// 	n_feature_maps1 : 336,
	//
	// 	conv1_size : [101, 8],
	// 	conv1_pool : [1, 1],
	// 	conv1_stride : [1, 8],
	// 	dnn1_size : 128,
	// 	dnn2_size : 128
	// },
	//
	// // ResNet Config
	//
	// Firefox
	// RES8 : {
	// 	input_shape : [201, 80, 1],
	// 	n_layers : 6,
	// 	n_feature_maps : 45,
	// 	res_pool : [3, 4],
	// 	conv_size : [3, 3],
	// 	conv_stride : [1, 1],
	// 	use_dilation : false
	// },
	RES8 : {
		input_shape : [80, 61, 1],
		n_layers : 6,
		n_feature_maps : 45,
		res_pool : [4, 3],
		conv_size : [3, 3],
		conv_stride : [1, 1],
		use_dilation : false
	},
	RES8_40 : {
		input_shape : [40, 101, 1],
		n_layers : 6,
		n_feature_maps : 45,
		n_kept_feature : 27,
		res_pool : [3, 4],
		conv_size : [3, 3],
		conv_stride : [1, 1],
		use_dilation : false
	},
	RES8_80 : {
		input_shape : [40, 101, 1],
		n_layers : 6,
		n_feature_maps : 45,
		n_kept_feature : 9,
		res_pool : [3, 4],
		conv_size : [3, 3],
		conv_stride : [1, 1],
		use_dilation : false
	},
	// RES15 : {
	// 	input_shape : [40, 101, 1],
	// 	use_dilation : true,
	// 	n_layers : 13,
	// 	n_feature_maps : 45,
	// 	conv_size : [3, 3],
	// 	conv_stride : [1, 1],
	// },
	// RES26 : {
	// 	input_shape : [40, 101, 1],
	// 	n_layers : 24,
	// 	n_feature_maps : 45,
	// 	res_pool : [2, 2],
	// 	conv_size : [3, 3],
	// 	conv_stride : [1, 1],
	// 	use_dilation : false
	// },
	RES8_NARROW : {
		input_shape : [40, 101, 1],
		n_layers : 6,
		n_feature_maps : 19,
		res_pool : [3, 4],
		use_dilation : false,
		conv_size : [3, 3],
		conv_stride : [1, 1]
	},
	// RES15_NARROW : {
	// 	input_shape : [40, 101, 1],
	// 	use_dilation : true,
	// 	n_layers : 13,
	// 	n_feature_maps : 19,
	// 	conv_size : [3, 3],
	// 	conv_stride : [1, 1]
	// },
	// RES26_NARROW : {
	// 	input_shape : [40, 101, 1],
	// 	n_layers : 24,
	// 	n_feature_maps : 19,
	// 	res_pool : [2, 2],
	// 	use_dilation : false,
	// 	conv_size : [3, 3],
	// 	conv_stride : [1, 1]
	// }
	RES8_NARROW_40 : {
		input_shape : [40, 101, 1],
		n_layers : 6,
		n_feature_maps : 19,
		n_kept_feature : 12,
		res_pool : [3, 4],
		use_dilation : false,
		conv_size : [3, 3],
		conv_stride : [1, 1]
	},
	RES8_NARROW_80 : {
		input_shape : [40, 101, 1],
		n_layers : 6,
		n_feature_maps : 19,
		n_kept_feature : 4,
		res_pool : [3, 4],
		use_dilation : false,
		conv_size : [3, 3],
		conv_stride : [1, 1]
	},
}

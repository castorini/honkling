serverURL = 'https://honkling.xyz:443';
// serverURL = 'http://localhost:8080';

modelNames = ["RES8", "RES8_40", "RES8_80", "RES8_NARROW", "RES8_NARROW_40", "RES8_NARROW_80"];
commands = ["silence", "unknown", "yes", "no", "up", "down", "left", "right", "on", "off", "stop", "go"];

modelConfig = {
	RES8 : {
		input_shape : [40, 101, 1],
		n_layers : 6,
		n_feature_maps : 45,
		res_pool : [3, 4],
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
	RES8_NARROW : {
		input_shape : [40, 101, 1],
		n_layers : 6,
		n_feature_maps : 19,
		res_pool : [3, 4],
		use_dilation : false,
		conv_size : [3, 3],
		conv_stride : [1, 1]
	},
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


audioConfig = {
  'meydaBufferSize' : 512,
	'offlineSampleRate' : 16000,
	'offlineHopSize' : 10, // in ms
	'offlineWindowSize' : 30, // in ms
	'micInputWaitTime' : 5, // in s
	'noiseThreshold' : 0.015
}

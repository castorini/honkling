// valid model names are :
// 	"RES8", "RES8_40", "RES8_80", "RES8_NARROW", "RES8_NARROW_40", "RES8_NARROW_80"
exports.modelName = "RES8_NARROW";

exports.commands = ["silence", "unknown", "yes", "no", "up", "down", "left", "right", "on", "off", "stop", "go"];
exports.mojibarCommands = ["silence", "unknown", "workplace", "volume", "up", "down", "wikipedia", "canada", "list", "one", "two", "three", "four", "right", "left", "open", "top", "memory"];
exports.iuiCommands = ["silence", "unknown", "workspace", "volume", "up", "down", "list", "one", "two", "three", "four", "right", "left", "open", "top"];

exports.lightCommands = ["silence", "unknown", "on", "off", "up", "down"];

exports.predictionFrequency = 350; // ms between mic audio prediction
exports.predictionThreshold = 0.90;
exports.noiseThreshold = 0.015;
exports.sampleRate = 16000;
exports.meydaBufferSize = 512;
exports.meydaWindowSlidingSize = 10; // ms

exports.modelConfigs = {
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

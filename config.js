const modelConfig = {
	CNN_TRAD_POOL2 : {
		input_shape : [40, 100, 1],
		n_labels : 10,
		dropout_prob : 0.5,
		height : 40,
		width : 100,
		n_feature_maps1 : 64,
	    n_feature_maps2 : 64,
	    conv1_size : [20, 8],
	    conv2_size : [10, 4],
	    conv1_stride : [1, 1],
	    conv2_stride : [1, 1],
	    conv1_pool : [2, 2],
	    conv2_pool : [1, 1],
	    tf_variant : true
	},
	CNN_TSTRIDE8 : {
		input_shape : [40, 100, 1],
		n_labels : 10,
		dropout_prob : 0.5,
		height : 40,
		width : 100,
		n_feature_maps1 : 126,
        n_feature_maps2 : 78,
        conv1_size : [16, 8],
        conv2_size : [5, 4],
        conv1_pool : [1, 3],
        conv1_stride : [8, 1],
        conv2_stride : [1, 1],
        conv2_pool : [1, 1],
        dnn1_size : 128,
        dnn2_size : 128
	},

	// ResNet Config
	RES8 : {
		input_shape : [40, 100, 1],
		n_labels : 10,
		n_layers : 6,
		n_feature_maps : 45,
		conv_size : [3, 3],
		res_pool : [3, 4],
		conv_stride : [1, 1],
		use_dilation : false
	}
}

const audioConfig = {
    group_speakers_by_id : true,
    silence_prob : 0.1,
    noise_prob : 0.8,
    n_dct_filters : 40,
    input_length : 16000,
    n_mels : 40,
    timeshift_ms : 100,
    unknown_prob : 0.1,
    train_pct : 80,
    dev_pct : 10,
    test_pct : 10,
    wanted_words : ["command", "random"],
    data_folder : "data",
    mic : true
}
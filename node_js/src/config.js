// serverURL = 'https://honkling.xyz:443';
serverURL = 'http://localhost:8080';

commands = ["silence", "unknown", "yes", "no", "up", "down", "left", "right", "on", "off", "stop", "go"];

modelConfig = {
  input_shape : [40, 101, 1],
  n_layers : 6,
  n_feature_maps : 19,
  res_pool : [3, 4],
  use_dilation : false,
  conv_size : [3, 3],
  conv_stride : [1, 1],
  n_labels : commands.length
}

audioConfig = {
  'meydaBufferSize' : 512,
	'offlineSampleRate' : 16000,
	'offlineHopSize' : 10, // in ms
	'offlineWindowSize' : 30, // in ms
	'micInputWaitTime' : 5, // in s
	'noiseThreshold' : 0.015
}

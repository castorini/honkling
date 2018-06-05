var speechResModel;

class SpeechResModel {

	constructor() {
		speechResModel = this;
		// for training
		this.iteration = 5;

		// this config is place holder (copied from RES8)
		this.config = {
			n_labels : 12,
			n_layers : 6,
			n_feature_maps : 45,
			res_pool : (4, 3),
			use_dilation : false
		}

		// layer definition

        // self.conv1 = nn.Conv2d(1, n_featmaps1, conv1_size, stride=conv1_stride)
        // => torch.nn.Conv2d(in_channels, out_channels, kernel_size, stride=1, padding=0, dilation=1, groups=1, bias=True)

		this.conv1 = tf.layers.conv2d({
			filters: this.config['n_feature_maps1'],
			inputShape: this.config['input_shape'],
			kernelSize: this.config['conv1_size'],
			strides: this.config['conv1_stride'],
			kernelInitializer: tf.initializers.zeros(),
			biasInitializer: tf.initializers.zeros(),
		})

	}

	// Our actual model
	compile() {
		this.model = tf.sequential();

	}

	predict(x) {
		let x = tf.tensor(x);
		input_x = x.reshape(this.config['input_shape'].unshift(-1));
	    let output = this.model.predict(x);

	    let axis = 1;
	    console.log(output.dataSync());
	    let predictions = output.argMax(axis).dataSync();
	    console.log('prediction result : ', predictions)
	}
}
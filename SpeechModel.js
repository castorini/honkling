class SpeechModel {

	constructor() {
		// this config is place holder (copied from CNN_TRAD_POOL2)
		this.config = {
			input_shape : [40, 100, 1],
			n_labels : 10,
			dropout_prob : 0.5,
			height : 101,
			width : 40,
			n_feature_maps1 : 64,
		    n_feature_maps2 : 64,
		    conv1_size : [20, 8],
		    conv2_size : [10, 4],
		    conv1_stride : [1, 1],
		    conv2_stride : [1, 1],
		    conv1_pool : [2, 2],
		    conv2_pool : [1, 1],
		    tf_variant : true
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

		// def truncated_normal(tensor, std_dev=0.01):
		//     tensor.zero_()
		//     tensor.normal_(std=std_dev)
		//     while torch.sum(torch.abs(tensor) > 2 * std_dev) > 0:
		//         t = tensor[torch.abs(tensor) > 2 * std_dev]
		//         t.zero_()
		//         tensor[torch.abs(tensor) > 2 * std_dev] = torch.normal(t, std=std_dev)

        // if tf_variant:
        //     truncated_normal(self.conv1.weight.data)
        //     self.conv1.bias.data.zero_()

		if (this.config['tf_variant']) {
			this.conv1.kernelInitializer = tf.initializers.truncatedNormal({
				std_dev: 0.01
			});

			// TODO :: Making sure abs(initial weights) < 2 * std_dev
		}

		// self.pool1 = nn.MaxPool2d(conv1_pool)
		// => torch.nn.MaxPool2d(kernel_size, stride=None, padding=0, dilation=1, return_indices=False, ceil_mode=False)[source]

		this.pool1 = tf.layers.maxPooling2d({
			poolSize: this.config['conv1_pool'],
			padding: 'same',
		})

		if (this.config['conv2_size']) {
			// self.conv2 = nn.Conv2d(n_featmaps1, n_featmaps2, conv2_size, stride=conv2_stride)
			let conv2_input_shape = this.config['input_shape'].slice();
			conv2_input_shape[2] = this.config['n_feature_maps1']; // update channel size

			this.conv2 = tf.layers.conv2d({
				filters: this.config['n_feature_maps2'],
				inputShape: conv2_input_shape,
				kernelSize: this.config['conv2_size'],
				strides: this.config['conv2_stride'],
				kernelInitializer: tf.initializers.zeros(),
				biasInitializer: tf.initializers.zeros(),
			})

            // if tf_variant:
            //     truncated_normal(self.conv2.weight.data)
            //     self.conv2.bias.data.zero_()

			if (this.config['tf_variant']) {
				this.conv1.kernelInitializer = tf.initializers.truncatedNormal({
					std_dev: 0.01
				});

				// TODO :: Making sure abs(initial weights) < 2 * std_dev
			}

            // self.pool2 = nn.MaxPool2d(conv2_pool)

            this.pool2 = tf.layers.maxPooling2d({
				poolSize: this.config['conv2_pool'],
				padding: 'same',
			})
		}

		// if not tf_variant:
		// 	self.lin = nn.Linear(conv_net_size, 32) 

		if (!this.config['tf_variant']) {
			this.lin = tf.layers.dense({
				units: 32,
				activation: 'linear',
				biasInitializer : tf.initializers.zeros()
			})
		}

		if (this.config['dnn1_size']) {
			// to be implemented after verifying tfjs version of nn.Linear 
		}

		// self.output = nn.Linear(last_size, n_labels)
		// TODO :: double checking following two lines are equal to nn.Linear operation

		this.output = tf.layers.dense({
			units: this.config['n_labels'],
			activation: 'linear',
			biasInitializer : tf.initializers.zeros()
		})

		if (this.config['tf_variant']) {
			this.output.kernelInitializer = tf.initializers.truncatedNormal({
				std_dev: 0.01
			})
			// TODO :: Making sure abs(initial weights) < 2 * std_dev
		}

		// self.dropout = nn.Dropout(dropout_prob)
		this.dropout = tf.layers.dropout(this.config['dropout_prob'])

		// flatten layer to be applied before dense layer
		this.flatten = tf.layers.flatten()

		// ReLU layer
		this.relu = tf.layers.leakyReLU({alpha:0});
	}


	// Our actual model
	compile() {
		this.model = tf.sequential();

		this.model.add(this.conv1);
		this.model.add(this.pool1);

		// if hasattr(self, "conv2"):
        //     x = F.relu(self.conv2(x)) # shape: (batch, o1, i2, o2)
        //     x = self.dropout(x)
        //     x = self.pool2(x)

		if (this.conv2d) {
			this.model.add(this.conv2);
			this.model.add(this.relu);
			this.model.add(this.dropout);
			this.model.add(this.pool2);
		}

		// x = x.view(x.size(0), -1) # shape: (batch, o3)
		this.model.add(this.flatten);

        // if hasattr(self, "lin"):
        //     x = self.lin(x)
		
		if (this.lin) {
			this.model.add(this.lin);
		}

        // if hasattr(self, "dnn1"):
        //     x = self.dnn1(x)
        //     if not self.tf_variant:
        //         x = F.relu(x)
        //     x = self.dropout(x)  

        if (this.dnn1) {
        }

        // if hasattr(self, "dnn2"):
        //     x = self.dnn2(x)
        //     x = self.dropout(x)

        if (this.dnn2) {
        }

		// simply for verification of the model construction
		this.model.add(this.output);
		this.model.add(this.dropout);

		const LEARNING_RATE = 0.15;
		const optimizer = tf.train.sgd(LEARNING_RATE);
		this.model.compile({
		  optimizer: optimizer,
		  loss: 'categoricalCrossentropy',
		  metrics: ['accuracy'],
		});
	}

	// to be removed in the future
	// simply used as code reference & verification of the model link
	async train() {
		let batch_size = 20;

		for (var j = 0; j < 10; j++) {
			let batch_x = tf.truncatedNormal([batch_size, 40, 100, 1], 2, 0.5);
			let raw_batch_y = [];
			for (var i = 0; i < batch_size; i++) {
				let item = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
				item[Math.floor((Math.random() * 10))] = 1;
				raw_batch_y.push(item);
			}
			let batch_y = tf.tensor(raw_batch_y);

			await this.model.fit(batch_x, batch_y, {batchSize: batch_size});
			console.log(j + 'th Model weights (normalized):',
				this.model.trainableWeights); // access to weight of each layer
				// to see actual numbers, you must dataSync()
				// this.model.trainableWeights[0].read().dataSync()
		}
	}

	predict(x) {
		if (!(x instanceof tf.Tensor)) {
			x = tf.tensor(x);
		}
		let input_shape = this.config['input_shape'].slice();
		input_shape.unshift(-1);
	    let output = this.model.predict(x.reshape(input_shape));

	    let axis = 1;
	    let predictions = output.argMax(axis).dataSync();
	    console.log('prediction result : ', predictions);
	}
}
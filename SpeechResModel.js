class SpeechResModel {

	constructor() {
		// this config is place holder (copied from RES8)
		this.config = {
			input_shape : [40, 100, 1],
			n_labels : 10,
			n_layers : 6,
			n_feature_maps : 45,
			conv_size : [3, 3],
			res_pool : [3, 4],
			conv_stride : [1, 1],
			use_dilation : false
		}

		// layer definition

        // self.conv0 = nn.Conv2d(1, n_maps, (3, 3), padding=(1, 1), bias=False)
        // => torch.nn.Conv2d(in_channels, out_channels, kernel_size, stride=1, padding=0, dilation=1, groups=1, bias=True)

		this.conv0 = tf.layers.conv2d({
			filters: this.config['n_feature_maps'],
			// inputShape: this.config['input_shape'],
			kernelSize: this.config['conv_size'],
			strides: this.config['conv_stride'],
			padding: "same",
			useBias: false,
			kernelInitializer: tf.initializers.zeros(),
			biasInitializer: tf.initializers.zeros(),
		})

		// if "res_pool" in config:
  		// self.pool = nn.AvgPool2d(config["res_pool"])

		if (this.config['res_pool']) {
			this.pool = tf.layers.averagePooling2d({
				poolSize: this.config['res_pool']
			})
		}

		// dilation = config["use_dilation"]
        // if dilation:
		if (this.config['use_dilation']) {
			// 	self.convs = [nn.Conv2d(n_maps, n_maps, (3, 3), padding=int(2**(i // 3)), dilation=int(2**(i // 3)), 
            //     bias=False) for i in range(n_layers)]
			// => torch.nn.Conv2d(in_channels, out_channels, kernel_size, stride=1, padding=0, dilation=1, groups=1, bias=True)
			//     self.add_module("conv{}".format(i + 1), conv)
			for (var i  = 0; i < (this.config['n_layers']); i++) {
				this['conv'+ (i+1)] = tf.layers.conv2d({
					filters: this.config['n_feature_maps'],
					// inputShape: this.config['n_feature_maps'],
					kernelSize: this.config['conv_size'],
					padding: "same",
					dilation: Math.pow(2, Math.floor(i/3)),
					useBias: false,
					kernelInitializer: tf.initializers.zeros(),
					biasInitializer: tf.initializers.zeros(),
				})
			}
		} else {
			// else:
            // self.convs = [nn.Conv2d(n_maps, n_maps, (3, 3), padding=1, dilation=1, 
            //     bias=False) for _ in range(n_layers)]
			// => torch.nn.Conv2d(in_channels, out_channels, kernel_size, stride=1, padding=0, dilation=1, groups=1, bias=True)
			//     self.add_module("conv{}".format(i + 1), conv)
			for (var i  = 0; i < (this.config['n_layers']); i++) {
				this['conv'+ (i+1)] = tf.layers.conv2d({
					filters: this.config['n_feature_maps'],
					// inputShape: this.config['n_feature_maps'],
					kernelSize: this.config['conv_size'],
					padding: "same",
					dilation: 1,
					useBias: false,
					kernelInitializer: tf.initializers.zeros(),
					biasInitializer: tf.initializers.zeros(),
				})
			}
		}

		// for i, conv in enumerate(self.convs):
        //     self.add_module("bn{}".format(i + 1), nn.BatchNorm2d(n_maps, affine=False))
        // 
        // Affine = False is equal to gamma = 1 and beta = 0 (https://discuss.pytorch.org/t/affine-parameter-in-batchnorm/6005)
        // Axis must be index of channel dimnsion. Given data_format is channel_last, default (-1) is good 
        for (var i  = 0; i < (this.config['n_layers']); i++) {
        	this['bn'+ (i+1)] = tf.layers.batchNormalization({
				epsilon: 0.00001,
				momentum: 0.1,
				gammaInitializer: tf.initializers.ones(),
				betaInitializer: tf.initializers.zeros(),
			})
		}

		// self.output = nn.Linear(n_maps, n_labels)
		this.output = tf.layers.dense({
			units: this.config['n_labels'],
			activation: 'linear',
			biasInitializer : tf.initializers.zeros()
		});

		// addition layer
		this.add = tf.layers.add();

		// globalAveragePooling layer
		this.globalAvgPool = tf.layers.globalAveragePooling2d({});

		// ReLU layer
		this.relu = tf.layers.leakyReLU({alpha:0});
	}

	// Our actual model
	compile() {
		// input layer
		const input = tf.input({shape: this.config['input_shape']});
		let x = input; // [40, 100, 1]
		let y, old_x;

		// for i in range(self.n_layers + 1):
		for (var i  = 0; i < (this.config['n_layers'] + 1); i++) {
			// y = F.relu(getattr(self, "conv{}".format(i))(x))
			y = this['conv'+ i].apply(x);
			y = this.relu.apply(y);

			// if i == 0:
            //     if hasattr(self, "pool"):
            //         y = self.pool(y)
            //     old_x = y
            if (i == 0) {
            	if (this.pool) {
            		y = this.pool.apply(y);
            	}
    			old_x = y;
            }

            // if i > 0 and i % 2 == 0:
            //     x = y + old_x
            //     old_x = x
            if ((i > 0) && (i % 2 == 0)) {
            	x = this.add.apply([y, old_x]);
            	old_x = x;

        	// else:
            //     x = y
            } else {
            	x = y;
            }

        	// if i > 0:
            //     x = getattr(self, "bn{}".format(i))(x)
            if (i > 0) {
            	x = this['bn'+ i].apply(x)
            }
		}

		// x = x.view(x.size(0), x.size(1), -1) # shape: (batch, feats, o3)
        // x = torch.mean(x, 2)
        // generate average of single layer; result shape is (batch, feats)
		x = this.globalAvgPool.apply(x);

		const output = this.output.apply(x);

		this.model = tf.model({
			inputs: input,
			outputs: output,
		});

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
		let batch_size = 20

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
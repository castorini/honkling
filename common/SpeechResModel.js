class SpeechResModel {

	constructor(modelName) {
		this.modelName = modelName;
		this.config = modelConfig[modelName];
		this.weights = this.processWeights(weights);
		this.config['n_labels'] = commands.length;

		this.layers = {}
		// layer definition

		// self.conv0 = nn.Conv2d(1, n_maps, (3, 3), padding=(1, 1), bias=False)
		// => torch.nn.Conv2d(in_channels, out_channels, kernel_size, stride=1, padding=0, dilation=1, groups=1, bias=True)

		this.layers['conv0'] = tf.layers.conv2d({
			filters: this.config['n_feature_maps'],
			kernelSize: this.config['conv_size'],
			strides: this.config['conv_stride'],
			padding: "same",
			useBias: false,
			activation: 'relu',
			kernelInitializer: 'glorotUniform',
			biasInitializer: tf.initializers.zeros(),
			name: "conv0",
		})

		// if "res_pool" in config:
		// self.pool = nn.AvgPool2d(config["res_pool"])

		if (this.config['res_pool']) {
			this.layers['pool'] = tf.layers.averagePooling2d({
				poolSize: this.config['res_pool'],
				name: "pool",
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
				this.layers['conv'+ (i+1)] = tf.layers.conv2d({
					filters: this.config['n_feature_maps'],
					// inputShape: this.config['n_feature_maps'],
					kernelSize: this.config['conv_size'],
					padding: "same",
					dilation: Math.pow(2, Math.floor(i/3)),
					useBias: false,
					activation: 'relu',
					kernelInitializer: 'glorotUniform',
					biasInitializer: tf.initializers.zeros(),
					name: "conv"+(i+1),
				})
			}
		} else {
			// else:
			// self.convs = [nn.Conv2d(n_maps, n_maps, (3, 3), padding=1, dilation=1,
			//     bias=False) for _ in range(n_layers)]
			// => torch.nn.Conv2d(in_channels, out_channels, kernel_size, stride=1, padding=0, dilation=1, groups=1, bias=True)
			//     self.add_module("conv{}".format(i + 1), conv)
			for (var i  = 0; i < (this.config['n_layers']); i++) {
				this.layers['conv'+ (i+1)] = tf.layers.conv2d({
					filters: this.config['n_feature_maps'],
					// inputShape: this.config['n_feature_maps'],
					kernelSize: this.config['conv_size'],
					padding: "same",
					dilation: 1,
					useBias: false,
					activation: 'relu',
					kernelInitializer: 'glorotUniform',
					biasInitializer: tf.initializers.zeros(),
					name: "conv"+(i+1),
				})
			}
		}

		// for i, conv in enumerate(self.convs):
		//     self.add_module("bn{}".format(i + 1), nn.BatchNorm2d(n_maps, affine=False))
		//
		// Affine = False is equal to gamma = 1 and beta = 0 (https://discuss.pytorch.org/t/affine-parameter-in-batchnorm/6005)
		// Axis must be index of channel dimnsion. Given data_format is channel_last, default (-1) is good
		for (var i  = 0; i < (this.config['n_layers']); i++) {
			this.layers['bn'+ (i+1)] = tf.layers.batchNormalization({
				epsilon: 0.00001,
				momentum: 0.1,
				gammaInitializer: tf.initializers.ones(),
				betaInitializer: tf.initializers.zeros(),
				name: "bn"+(i+1),
			})
		}

		// self.output = nn.Linear(n_maps, n_labels)
		this.layers['output'] = tf.layers.dense({
			units: this.config['n_labels'],
			activation: 'linear',
			biasInitializer : tf.initializers.zeros(),
			name: "output",
		});

		// addition layer
		for (var i  = 2; i < (this.config['n_layers'] + 1); i++) {
			if (i % 2 == 0) {
				this.layers['add'+i] = tf.layers.add({name: "add" + i});
			}
		}

		// globalAveragePooling layer
		this.layers['globalAvgPool'] = tf.layers.globalAveragePooling2d({});

		// softmax
		this.layers['softmax'] = tf.layers.softmax();
	}

	// Our actual model
	compile() {
		// input layer
		const input = tf.input({shape: this.config['input_shape']});
		let x = input;

		let y, old_x;

		// for i in range(self.n_layers + 1):
		for (var i  = 0; i < (this.config['n_layers'] + 1); i++) {
			// y = F.relu(getattr(self, "conv{}".format(i))(x))
			y = this.layers['conv'+ i].apply(x);
			// if i == 0:
			//     if hasattr(self, "pool"):
			//         y = self.pool(y)
			//     old_x = y
			if (i == 0) {
				if (this.layers.pool) {
					y = this.layers['pool'].apply(y);
				}
				old_x = y;
			}

			// if i > 0 and i % 2 == 0:
			//     x = y + old_x
			//     old_x = x
			if ((i > 0) && (i % 2 == 0)) {
				x = this.layers['add'+ i].apply([y, old_x]);
				old_x = x;

				// else:
				//     x = y
			} else {
				x = y;
			}

			// if i > 0:
			//     x = getattr(self, "bn{}".format(i))(x)
			if (i > 0) {
				x = this.layers['bn'+ i].apply(x)
			}
		}

		// x = x.view(x.size(0), x.size(1), -1) # shape: (batch, feats, o3)
		// x = torch.mean(x, 2)
		// generate average of single layer; result shape is (batch, feats)
		x = this.layers['globalAvgPool'].apply(x);

		x = this.layers['output'].apply(x);

		const softmax = this.layers['softmax'].apply(x);

		this.model = tf.model({
			inputs: input,
			outputs: softmax,
		});

		this.model.summary();

		this.model.compile({
			optimizer: 'sgd',
			loss: 'categoricalCrossentropy',
			metrics: ['accuracy'],
		});
	}

	// to be removed in the future
	// simply used as code reference & verification of the model link
	async train(x) {
		// let batch_size = x.length;
		let batch_size = 1;
		let n_labels = this.config['n_labels']
		for (var j = 0; j < 5; j++) {
			let batch_x = tf.tensor4d(x, [1,40,100,1], 'float32');
			let raw_batch_y = [];
			for (var i = 0; i < batch_size; i++) {
				let item = Array.from(Array(n_labels), () => 0);
				item[0] = 1;
				raw_batch_y.push(item);
			}
			let batch_y = tf.tensor(raw_batch_y);

			await this.model.fit(batch_x, batch_y, {batchSize: batch_size});
			// console.log(j + 'th Model weights:',
			// 	this.model.trainableWeights); // access to weight of each layer
			// 	// to see actual numbers, you must dataSync()
			console.log(j + 'th Model conv0 weights:', this.model.trainableWeights[0].read().dataSync());
		}
	}

	processWeights(weights) {
		let processed = {};

		let weightNames = Object.keys(weights);
		for (var index in weightNames) {
			let weightName = weightNames[index];
			let nameSplit = weightName.split(".");
			let layer = nameSplit[0];

			if (!(layer in processed)) {
				processed[layer] = {};
			}
			processed[layer][nameSplit[1]] = weights[weightName];
		}

		return processed;
	}

	load() {
		function reformatConvKernel(weight) {
			let reformat = [];
			for (var colsIndex = 0; colsIndex < weight[0][0][0].length; colsIndex++) {
				reformat.push([]);
				for (var rowsIndex = 0; rowsIndex < weight[0][0].length; rowsIndex++) {
					reformat[colsIndex].push([]);
					for (var inFilterIndex = 0; inFilterIndex < weight[0].length; inFilterIndex++) {
						reformat[colsIndex][rowsIndex].push([]);
					}
				}
			}

			for (var outFilterIndex = 0; outFilterIndex < weight.length; outFilterIndex++) {
				for (var inFilterIndex = 0; inFilterIndex < weight[0].length; inFilterIndex++) {
					for (var rowsIndex = 0; rowsIndex < weight[0][0].length; rowsIndex++) {
						for (var colsIndex = 0; colsIndex < weight[0][0][0].length; colsIndex++) {
							reformat[colsIndex][rowsIndex][inFilterIndex].push(weight[outFilterIndex][inFilterIndex][rowsIndex][colsIndex]);
						}
					}
				}
			}
			return reformat;
		}

		for (var key in this.layers) {
			let w = [];
			if (key.includes("conv")) {
				// weight index 0 = kernel
				let convKernelShape = this.layers[key].getWeights()[0].shape;
				let convKernel = reformatConvKernel(this.weights[key]['weight']);
				w.push(tf.tensor4d(convKernel, convKernelShape, 'float32'));
			}
			if (key.includes("bn")) {
				// weight index 0 = gamma - 1 (due to Affine = false)
				let bnGammaShape = this.layers[key].getWeights()[0].shape;
				w.push(tf.tensor1d(new Array(bnGammaShape[0]).fill(1), 'float32'));

				// weight index 1 = beta - 0 (due to Affine = false)
				let bnBetaShape = this.layers[key].getWeights()[1].shape;
				w.push(tf.tensor1d(new Array(bnBetaShape[0]).fill(0), 'float32'));

				// weight indes 2 = moving_mean
				w.push(tf.tensor1d(this.weights[key]['running_mean'], 'float32'));

				// weight index 3 = moving_variance
				w.push(tf.tensor1d(this.weights[key]['running_var'], 'float32'));
			}
			if (key.includes("output")) {

				// weight index 0 = kernel
				let denseKernelShape = this.layers[key].getWeights()[0].shape;
				let denseKernel = transpose2d(this.weights[key]['weight']);
				w.push(tf.tensor2d(denseKernel, denseKernelShape, 'float32'));

				// weight index 1 = bias
				w.push(tf.tensor1d(this.weights[key]['bias'], 'float32'));
			}
			this.layers[key].setWeights(w);
		}
	}

	async save() {
		const saveResult = await this.model.save('downloads://speech_res_model')
		console.log('saving model has completed', saveResult);
	}

	predict(x) {
		return this.model.predict(x);
	}
}

class SpeechResModel {

	constructor(model_name) {
		this.model_name = model_name;
		this.config = modelConfig[model_name];
		this.weights = weights[this.model_name];

		init_view(this.weights['commands']);

		this.config['n_labels'] = this.weights['commands'].length;

		this.layers = {}
		// layer definition

        // self.conv0 = nn.Conv2d(1, n_maps, (3, 3), padding=(1, 1), bias=False)
        // => torch.nn.Conv2d(in_channels, out_channels, kernel_size, stride=1, padding=0, dilation=1, groups=1, bias=True)

		this.layers['conv0'] = tf.layers.conv2d({
			filters: this.config['n_feature_maps'],
			// inputShape: this.config['input_shape'],
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
        for (var i  = 0; i < (this.config['n_layers'] + 1); i++) {
        	this.layers['bn'+ i] = tf.layers.batchNormalization({
				epsilon: 0.00001,
				momentum: 0.1,
				gammaInitializer: tf.initializers.ones(),
				betaInitializer: tf.initializers.zeros(),
				name: "bn"+i,
			})
		}

		// self.output = nn.Linear(n_maps, n_labels)
		this.layers['dense'] = tf.layers.dense({
			units: this.config['n_labels'],
			activation: 'linear',
			biasInitializer : tf.initializers.zeros(),
			name: "dense",
		});

		// addition layer
		this.layers['add'] = tf.layers.add();

		// globalAveragePooling layer
		this.layers['globalAvgPool'] = tf.layers.globalAveragePooling2d({});

		// softmax
		this.layers['output'] = tf.layers.softmax();
	}

	// Our actual model
	compile() {
		// input layer
		const input = tf.input({shape: this.config['input_shape']});
		let x = input; // [40, 100, 1]
		x = this.layers['bn0'].apply(x)

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
            	x = this.layers['add'].apply([y, old_x]);
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

		x = this.layers['dense'].apply(x);

		const output = this.layers['output'].apply(x);

		this.model = tf.model({
			inputs: input,
			outputs: output,
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

	load() {
		let w
		for (var key in this.layers) {
			w = [];
			for (var i = 0; i < this.layers[key].getWeights().length; i++) {
				let shape = this.layers[key].getWeights()[i].shape
				switch (shape.length) {
					case 1:
						w.push(tf.tensor1d(this.weights[key+'_'+i], 'float32'))
						break;
					case 2:
						w.push(tf.tensor2d(this.weights[key+'_'+i], shape, 'float32'))
						break;
					case 3:
						w.push(tf.tensor3d(this.weights[key+'_'+i], shape, 'float32'))
						break;
					case 4:
						w.push(tf.tensor4d(this.weights[key+'_'+i], shape, 'float32'))
						break;
					case 4:
						w.push(tf.tensor5d(this.weights[key+'_'+i], shape, 'float32'))
						break;
					default:
						console.log('Invalid size of weight shape');
				}
			}

			this.layers[key].setWeights(w);
		}
	}

	predict(x) {
		if (!(x instanceof tf.Tensor)) {
			x = tf.tensor(x);
		}

		let input_shape = this.config['input_shape'].slice();
		input_shape.unshift(-1);

	    let output = this.model.predict(x.reshape(input_shape));
	    console.log('model prediction result : ', output.dataSync());

	    let axis = 1;
	    let predictions = output.argMax(axis).dataSync()[0];

	    console.log('prediction : ', this.weights['commands'][predictions]);

	    toggleCommand(this.weights['commands'][predictions]);
	}
}
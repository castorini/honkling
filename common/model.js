// Model Definition

// let speechModel = new SpeechModel(modelConfig["CNN_TSTRIDE8"]);
// speechModel.compile();

let modelName = "RES8_NARROW";

let model = new SpeechResModel(modelName);
model.compile();
model.load();

function predict(x, modelName, model) {
	if (!(x instanceof tf.Tensor)) {
		x = tf.tensor(x);
	}

	let config = modelConfig[modelName];

	let input_shape = config['input_shape'].slice();
	input_shape.unshift(-1);

	let output = model.predict(x.reshape(input_shape));
	console.log('model prediction result : ', output.dataSync());

	let axis = 1;
	let predictions = output.argMax(axis).dataSync()[0];

	console.log('prediction : ', commands[predictions]);

	return commands[predictions];
}

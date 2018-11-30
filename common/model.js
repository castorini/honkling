function predict(x, model) {
	if (!(x instanceof tf.Tensor)) {
		x = tf.tensor(x);
	}
	let input_shape = model.config['input_shape'].slice();
	input_shape.unshift(-1);

	let output = model.predict(x.reshape(input_shape));
	let prediction = commands.indexOf("unknown");

	maxProb = output.max(axis = 1).dataSync()[0];
	if (maxProb > predictionThreshold) {
		prediction = output.argMax(axis).dataSync()[0];
		if (prediction > 2) { // if it is not silence nor unknown
			console.log('prediction : ', commands[prediction], maxProb);
		}
	}

	return commands[prediction];
}

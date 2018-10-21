function predict(x, model) {
	if (!(x instanceof tf.Tensor)) {
		x = tf.tensor(x);
	}
	let input_shape = model.config['input_shape'].slice();
	input_shape.unshift(-1);

	let output = model.predict(x.reshape(input_shape));
	console.log('model prediction result : ', output.dataSync());

	let axis = 1;
	let predictions = output.argMax(axis).dataSync()[0];

	console.log('prediction : ', commands[predictions]);

	return commands[predictions];
}

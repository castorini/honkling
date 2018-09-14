// Model Loading / Saving
async function loadModel(param) {
	model = await tf.loadModel(param);
}

$(document).on('click', '#saveBtn:enabled', function() {
	model.save();
});

$(document).on('click', '#loadBtn:enabled', function() {
	const jsonUpload = $("#json-upload")[0];
	const weightsUpload = $("#weights-upload")[0];
	loadModel(tf.io.browserFiles([jsonUpload.files[0], weightsUpload.files[0]]))
	console.log('loading model has completed', model);
});

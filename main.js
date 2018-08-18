function init_view(commands) {
	// list of commands view
	commands.forEach(function(command) {
		$('#commandList').append(
			$('<li>').attr('class','list-group-item ' + command + '_button').append(command));
	})
	$('#commandList .unknown_button').addClass('list-group-item-dark');
}

var toggleTime = 2000;

function toggleCommand(command) {
	if (command == 'unknown') {
		$('#statusBar').text('Failed to identified keyword spoken. Please try again');
	} else {
		$('#statusBar').text('keyword spoken is ... ' + command.toUpperCase() + ' !!');
	}
	
	$('#commandList .active').removeClass('active');
	$('#commandList .'+command+'_button').addClass('active');
	setTimeout(function(){
		$('#commandList .'+command+'_button').removeClass('active');
	}, toggleTime);
}

function enableRecordBtn() {
	$('#recordBtn').removeClass('btn-secondary');
	$('#recordBtn').addClass('btn-primary');
	$('#recordBtn').prop('disabled', false);
	$('#statusBar').text('Press RECORD button and say a keyword listed below');
}

function disableRecordBtn() {
	$('#recordBtn').removeClass('btn-danger');
	$('#recordBtn').prop('disabled', true);
	$('#statusBar').text('interpreting ...');
}

function enableRecordingBtn() {
	$('#recordBtn').removeClass('btn-primary');
	$('#recordBtn').addClass('btn-danger');
	$('#recordBtn').prop('disabled', false);
	$('#statusBar').text('Recording ... say a keyword listed below within 4 seconds');
}

function enablePlayBtn() {
	$('#playBtn').removeClass('btn-secondary');
	$('#playBtn').addClass('btn-primary');
	$('#playBtn').prop('disabled', false);
	$('#statusBar').text('Press PLAY button to trigger audio');
}

function disablePlayBtn() {
	$('#playBtn').removeClass('btn-primary');
	$('#playBtn').prop('disabled', true);
	$('#statusBar').text('interpreting ...');
}

let audio = new Audio();

// let speechModel = new SpeechModel(modelConfig["CNN_TSTRIDE8"]);
// speechModel.compile();

let modelName = "RES8_NARROW";
let model = new SpeechResModel(modelName);
model.compile();
model.load();

async function loadModel(param) {
	model = await tf.loadModel(param);
}

function predict(x, modelName, model) {
	if (!(x instanceof tf.Tensor)) {
		x = tf.tensor(x);
	}

	let config = modelConfig[modelName];
	let commands = weights[modelName]['commands'];

	let input_shape = config['input_shape'].slice();
	input_shape.unshift(-1);

	let output = model.predict(x.reshape(input_shape));
	console.log('model prediction result : ', output.dataSync());

	let axis = 1;
	let predictions = output.argMax(axis).dataSync()[0];

	console.log('prediction : ', commands[predictions]);

	toggleCommand(commands[predictions]);
}

// predictions
$(document).on('click', '#recordBtn:enabled', function() {
	var deferred = audio.processMicData();

	deferred.done(function() {
		predict(audio.getData(), modelName, model);
	}).fail(function() {
		// silence
		toggleCommand('unknown');
	}).always(function() {
		setTimeout(function(){
			enableRecordBtn();
		}, toggleTime);
	});
});

$(document).on('click', '#playBtn:enabled', function() {
	var deferred = audio.processAudioData();

	deferred.done(function() {
		predict(audio.getData(), modelName, model);
		setTimeout(function(){
			enablePlayBtn();
		}, toggleTime);
	})
});

// model loading/saving
$(document).on('click', '#saveBtn:enabled', function() {
	model.save();
});

$(document).on('click', '#loadBtn:enabled', function() {
	const jsonUpload = $("#json-upload")[0];
	const weightsUpload = $("#weights-upload")[0];
	loadModel(tf.io.browserFiles([jsonUpload.files[0], weightsUpload.files[0]]))
	console.log('loading model has completed', model);
});

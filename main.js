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


// Audio Processing

var audioConfig = {
	'offlineSampleRate' : 16000,
	'offlineHopSize' : 10, // in ms
	'offlineWindowSize' : 30, // in ms
	'micInputWaitTime' : 5, // in s
	'noiseThreshold' : 0.015
}

let audio = new OnlineAudioProcessor(audioConfig);

// predictions
$(document).on('click', '#recordBtn:enabled', function() {
	var deferred = audio.processMicData();

	deferred.done(function(downSampledData) {
		printData('down-sampled data', downSampledData);
		// TODO :: delete offlineProcessor & clean up async calls
		let offlineProcessor = new OfflineAudioProcessor(audioConfig, downSampledData);

		offlineProcessor.getMFCC().done(function(mfccData) {
			printData('mfcc data', mfccData);
			predict(mfccData, modelName, model);
		})

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

	deferred.done(function(downSampledData) {
		printData('down-sampled data', downSampledData);

		let offlineProcessor = new OfflineAudioProcessor(audioConfig, downSampledData);
		offlineProcessor.getMFCC().done(function(mfccData) {
			printData('mfcc data', mfccData);
			predict(mfccData, modelName, model);
		})

		setTimeout(function(){
			enablePlayBtn();
		}, toggleTime);
	})
});

$(document).keyup(function( event ) {
	if ( event.which == 32 ) {
		var deferred = audio.stopRecording();

		deferred.done(function(downSampledData) {
			printData('down-sampled data', downSampledData);

			let offlineProcessor = new OfflineAudioProcessor(audioConfig, downSampledData);
			offlineProcessor.getMFCC().done(function(mfccData) {
				printData('mfcc data', mfccData);
				predict(mfccData, modelName, model);
			})
		}).fail(function() {
			// silence
			toggleCommand('unknown');
		}).always(function() {
			setTimeout(function(){
				enableRecordBtn();
			}, toggleTime);
		});
	}
}).keydown(function( event ) {
	if ( event.which == 32 ) {
		audio.startRecording();
	}
});


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

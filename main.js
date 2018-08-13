function init_view(commands) {
	// list of commands view
	commands.forEach(function(command) {
		$('#commandList').append(
			$('<li>').attr('class','list-group-item ' + command + '_button').append(command));
	})
}

function toggleCommand(command, btn) {
	$('#commandList .active').removeClass('active');
	$('#commandList .'+command+'_button').addClass('active');
	setTimeout(function(){
		$('#commandList .'+command+'_button').removeClass('active');
		if (btn == 'recordBtn') {
			enableRecordBtn();
		} else {
			enablePlayBtn();
		}
	}, 1500);
}

function enableRecordBtn() {
	$('#recordBtn').removeClass('btn-secondary');
	$('#recordBtn').addClass('btn-primary');
	$('#recordBtn').prop('disabled', false);
}

function disableRecordBtn() {
	$('#recordBtn').removeClass('btn-danger');
	$('#recordBtn').prop('disabled', true);
}

function enableRecordingBtn() {
	$('#recordBtn').removeClass('btn-primary');
	$('#recordBtn').addClass('btn-danger');
	$('#recordBtn').prop('disabled', false);
}

function enablePlayBtn() {
	$('#playBtn').removeClass('btn-secondary');
	$('#playBtn').addClass('btn-primary');
	$('#playBtn').prop('disabled', false);
}

function disablePlayBtn() {
	$('#playBtn').removeClass('btn-primary');
	$('#playBtn').prop('disabled', true);
}

let audio = new Audio();

// let speechModel = new SpeechModel(modelConfig["CNN_TSTRIDE8"]);
// speechModel.compile();

let speechResModel = new SpeechResModel("RES8_NARROW");
speechResModel.compile();
speechResModel.load();

$(document).on('click', '#recordBtn:enabled', function() {
	audio.processMicData();
	setTimeout(function(){
		speechResModel.predict(audio.getData(), 'recordBtn')
	}, 2000);
});

$(document).on('click', '#playBtn:enabled', function() {
	audio.processAudioData();
	setTimeout(function(){
		speechResModel.predict(audio.getData(), 'playBtn')
	}, 1500);
});

function init_view(commands) {
	// list of commands view
	commands.forEach(function(command) {
		$('#commandList').append(
			$('<li>').attr('class','list-group-item ' + command + '_button').append(command));
	})
}

function toggleCommand(command) {
	$('#commandList .active').removeClass('active');
	$('#commandList .'+command+'_button').addClass('active');
	setTimeout(function(){
		$('#commandList .'+command+'_button').removeClass('active');
	}, 5000);
}

let audio = new Audio();

// let speechModel = new SpeechModel(modelConfig["CNN_TSTRIDE8"]);
// speechModel.compile();

let speechResModel = new SpeechResModel("RES8_NARROW");
speechResModel.compile();
speechResModel.load();

$(document).on('click', '#extractBtn:enabled', function() {
	audio.processInput();
	setTimeout(function(){
		speechResModel.predict(audio.get_data())
	}, 3000);
});

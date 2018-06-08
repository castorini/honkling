// list of commands view
const commands = ['command1', 'command2', 'command3'];

commands.forEach(function(command) {
  $('#commandList').append(
    $('<li>').attr('class','list-group-item ' + command + '_button').append(command));
})

function toggleCommand(command) {
  $('#commandList .active').removeClass('active');
  $('#commandList .'+command+'_button').addClass('active');
}

toggleCommand('command2');

let audio = new Audio();
$(document).on('click', '#extractBtn:enabled', audio.processInput);

let model = new SpeechModel();
model.compile();
// trigger train for now as a verification of model construction
model.train();

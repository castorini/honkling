let toggleTime = 1500;

function init_view(commands) {
  reordered = [];
  commands.forEach(function(command) {
    if (command != "silence" && command != "unknown") {
      reordered.push(command);
    }
  });

  let split = Math.floor(reordered.length/2)
  for (var i = 0; i < split; i++) {
      $('#commandList1').append(
        $('<li>').attr('class','list-group-item ' + reordered[i] + '_button text-center').append(reordered[i]));
  }

  for (var i = split; i < reordered.length; i++) {
      $('#commandList2').append(
        $('<li>').attr('class','list-group-item ' + reordered[i] + '_button text-center').append(reordered[i]));
  }

  $('#commandList3').append(
    $('<li>').attr('class','list-group-item unknown_button text-center').append("unknown"));

  $('.unknown_button').addClass('list-group-item-dark');
}

let lastCommand;
let lastToggleTime = 0;

function toggleCommand(command) {
  lastCommand = command;
  lastToggleTime = new Date().getTime();
  $('.commandList .active').removeClass('active');
  $('.commandList .'+command+'_button').addClass('active');
}

function updateToggledCommand(command) {
  if (command == 'silence') {
    command = 'unknown';
  }

  currentTime = new Date().getTime();

  if (command != 'unknown') {
    if (lastCommand != command) {
      $('#statusBar').text('keyword spoken is ... ' + command.toUpperCase() + ' !!');
      toggleCommand(command);
    }
  } else if (lastCommand != 'unknown' && currentTime > lastToggleTime + toggleTime) {
    // current command is unknown
    $('#statusBar').text('Say one of the following keywords');
    toggleCommand(command);
  }
}

let micAudioProcessor = new MicAudioProcessor(audioConfig);
let model = new SpeechResModel("RES8_NARROW", commands);

micAudioProcessor.getMicPermission().done(function() {
  setInterval(function() {
    let offlineProcessor = new OfflineAudioProcessor(audioConfig, micAudioProcessor.getData());
    offlineProcessor.getMFCC().done(function(mfccData) {
      updateToggledCommand(predict(mfccData, model, commands));
    })
  }, predictionFrequency);
}).fail(function() {
  alert('mic permission is required, please enable the mic usage!')
})

// list initialization
init_view(commands);

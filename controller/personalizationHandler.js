// mic initialization

let micAudioProcessor = new MicAudioProcessor(audioConfig);

micAudioProcessor.getMicPermission().done(function() {
  // Due to the dynamic load of canvas, visualizer fails if wave starts hidden
  // Timeout is unavoidable to keep the functionality
  setTimeout(function(){
    $('#waveformWrapper').hide();
    $('#startBtn').show();
  }, 3);
}).fail(function() {
  alert('mic permission is required, please enable the mic usage!');
});

// display updates

function hideAllButtons() {
  $('#startBtn').hide();
  $('#practiceBtn').hide();
  $('#recordBtn').hide();
}

function showRecordingDisplay() {
  $('#countDownDiv').show();
  $('#waveformWrapper').show();
}

function hideRecordingDisplay() {
  $('#countDownDiv').hide();
  $('#waveformWrapper').hide();
}

// personalization setting

let defaultDataSize = '3';
let dataSizes = ['1','3','5'];
let expectedAccGains = [4, 5, 6];
let recordingCommands = [];

for (var i = 0; i < dataSizes.length; i++) {
  $('#dataSizeSelect').append('<option value="'+dataSizes[i]+'" selected="true">'+dataSizes[i]+'</option>');
}

$('#dataSizeSelect').val(defaultDataSize);

function displayExpectedAccGain(dataSize) {
  index = dataSizes.indexOf(dataSize);
  recordingTime = Math.round(parseInt(dataSize)/2);
  recordingCommands = shuffleArray(duplicateElements(commands.slice(2), dataSize));

  text = 'Spend ' + recordingTime + ' minutes and get extra ' + expectedAccGains[index] + '% in accuracy!<br><br>'
  text += 'Number of keywords to record : ' + recordingCommands.length;
  $('#statusBar').html(text);
}

displayExpectedAccGain($('#dataSizeSelect option:selected').val());

$('#dataSizeSelect').change(function() {
  displayExpectedAccGain($('#dataSizeSelect option:selected').val());
})

// recording

let timeleft = null;
countDownInterval = null;
function resetCountDown() {
  countDownInterval = null;
  timeleft = 3;
}

let recordingDeferred = null

function record(keyword) {
  $('#statusBar').html("Keyword is ... " + keyword.toUpperCase());
  let recordingDeferred = $.Deferred();

  resetCountDown();
  $('#countDownText').html('Recording starts in ' + timeleft);
  showRecordingDisplay();
  
  countDownInterval = setInterval(function(){
    timeleft -= 1;
    if (timeleft > 0) {
      $('#countDownText').html('Recording starts in ' + timeleft);
    } else if (timeleft == 0) {
      $('#countDownText').html('Recording ...');
    } else {
      clearInterval(countDownInterval);
      hideRecordingDisplay();

      // TODO :: Record Audio and Play
      recordingDeferred.resolve();
    }
  }, 1000);

  return recordingDeferred.promise();
}

$('#startBtn').click(function() {
  $('#statusBar').html("Let's practice recording!");
  $('#personalizationSettingDiv').hide();
  hideAllButtons();
  $('#practiceBtn').show();
});

$('#practiceBtn').click(function() {
  hideAllButtons();
  record("honkling").done(function() {
    $('#statusBar').html("Recording was successful!<br><br>Click RECORD to start personalization and PRACTICE to practie again");
    $('#practiceBtn').show();
    $('#recordBtn').show();
  }).fail(function() {
    // TODO :: Handle failing case
    $('#statusBar').html("Recording has failed. Let's try again!");
    $('#practiceBtn').show();
  });
});

let recordingIndex = 0;

$('#recordBtn').click(function() {
  hideAllButtons();
  record(recordingCommands[recordingIndex]).done(function() {
    recordingIndex += 1;
    if (recordingIndex < recordingCommands.length) {
      text = "Recording was successful!<br><br>";
      text += 'Next keyword is ... ' + recordingCommands[recordingIndex].toUpperCase() + '<br><br>';
      text += (recordingCommands.length - recordingIndex) +' more keywords to record';

      $('#statusBar').html(text);
      $('#recordBtn').show();
    } else {
      $('#statusBar').html("Recording was successful!<br><br>Please wait while Honkling retrains");
      // TODO :: Personalize the model
    }
  }).fail(function() {
    // TODO :: Handle failing case
    $('#statusBar').html("Recording has failed. Let's try again!");
    $('#recordBtn').show();
  });
});

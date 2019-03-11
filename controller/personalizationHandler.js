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
});

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
      recordingDeferred.resolve(micAudioProcessor.getData());
    }
  }, 1000);

  return recordingDeferred.promise();
}

$('#startBtn').click(function() {
  let confirmation = true;
  if (typeof(Storage) !== "undefined") {
    if (localStorage.getItem("personalized")) {
      confirmation = confirm("Honkling is already personalized.\nIt will replace existing version.\nDo you want to personalize your Honkling again?");
    }
  }

  if (confirmation) {
    localStorage.removeItem("personalized");
    $('#statusBar').html("Let's practice recording!");
    $('#personalizationSettingDiv').hide();
    hideAllButtons();
    $('#practiceBtn').show();
  }
});

$('#practiceBtn').click(function() {
  hideAllButtons();
  record("honkling").done(function(recorded_data) {
    $('#statusBar').html("Recording was successful!<br><br>Click RECORD to start personalization and PRACTICE to practie again");
    $('#practiceBtn').show();
    $('#recordBtn').show();
  }).fail(function() {
    // TODO :: Handle failing case
    $('#statusBar').html("Recording has failed. Let's try again!");
    $('#practiceBtn').show();
  });
});

function displayPersonalizationResult(result) {
  hideRecordingDisplay();
  let baseAcc = Math.round(result.baseAcc * 100);
  let perAcc = Math.round(result.personalizedAcc * 100);
  text = "Personalization Completed!!<br><br>";
  text += 'Accuracy before personalization : ' + baseAcc + " %<br>";
  text += 'Accuracy after personalization : ' + perAcc + " %<br>";
  $('#statusBar').html(text);
}

let recordingIndex = 0;
let processedData = [];
let labels = [];

$('#recordBtn').click(function() {
  hideAllButtons();
  record(recordingCommands[recordingIndex]).done(function(recorded_data) {
    labels.push(commands.indexOf(recordingCommands[recordingIndex]));
    recordingIndex += 1;
    if (recordingIndex < recordingCommands.length) {
      text = "Recording was successful!<br><br>";
      text += 'Next keyword is ... ' + recordingCommands[recordingIndex].toUpperCase() + '<br><br>';
      text += (recordingCommands.length - recordingIndex) +' more keywords to record';

      $('#statusBar').html(text);
      $('#recordBtn').show();
    } else {
      $('#statusBar').html("Recording was successful!<br><br>Please wait while Honkling gets personalized!");
    }

    let offlineProcessor = new OfflineAudioProcessor(audioConfig, recorded_data);
    offlineProcessor.getMFCC().done(function(mfccData) {
      processedData.push(mfccData);
      if (recordingIndex >= recordingCommands.length) {
        let model = new SpeechResModel("RES8_NARROW", commands);
        model.train(processedData, labels).then(function(result) {
          displayPersonalizationResult(result);
        });
      }
    });
  }).fail(function() {
    // TODO :: Handle failing case
    $('#statusBar').html("Recording has failed. Let's try again!");
    $('#recordBtn').show();
  });
});

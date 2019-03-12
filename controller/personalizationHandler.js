// mic initialization

let micAudioProcessor = new MicAudioProcessor(audioConfig);
let recordingPlayer = new AudioPlayer();

micAudioProcessor.getMicPermission().done(function() {
  // Due to the dynamic load of canvas, visualizer fails if wave starts hidden
  // Timeout is unavoidable to keep the functionality
  setTimeout(function(){
    $('#waveformWrapper').hide();
    $('#startBtn').show();
    displayResetBtn();
  }, 3);
}).fail(function() {
  alert('mic permission is required, please enable the mic usage!');
});

// display updates

function hideAllButtons() {
  $('#startBtn').hide();
  $('#practiceBtn').hide();
  $('#recordBtn').hide();
  $('#yesBtn').hide();
  $('#noBtn').hide();
  $('#resetBtn').hide();
}

function showRecordingDisplay() {
  $('#countDownDiv').show();
  $('#waveformWrapper').show();
}

function hideRecordingDisplay() {
  $('#countDownDiv').hide();
  $('#waveformWrapper').hide();
}

function showYesNoBtn(onYes, onNo) {
  $('#yesBtn').show();
  $('#noBtn').show();
  $('#yesBtn').unbind('click');
  $('#noBtn').unbind('click');
  $('#yesBtn').click(onYes);
  $('#noBtn').click(onNo);
}

// reset personalization
function displayResetBtn() {
  if (typeof(Storage) !== "undefined") {
    if (localStorage.getItem("personalized")) {
      $('#resetBtn').show();
    }
  }
}

$('#resetBtn').click(function() {
  localStorage.removeItem("personalized");
  $('#resetBtn').hide();
});

// personalization setting

let unknownKeyword = "honkling";
let defaultDataSize = '3';
let dataSizes = ['1','3','5'];
let expectedAccGains = [4, 5, 6];
let recordingCommands = [];

for (var i = 0; i < dataSizes.length; i++) {
  $('#dataSizeSelect').append('<option value="'+dataSizes[i]+'" selected="true">'+dataSizes[i]+'</option>');
}

$('#dataSizeSelect').val(defaultDataSize);

function displayExpectedAccGain(dataSize) {
  hideAllButtons();
  $('#personalizationSettingDiv').show();
  index = dataSizes.indexOf(dataSize);
  recordingTime = Math.round(parseInt(dataSize)/2);
  recordingCommands = commands.slice(2);
  recordingCommands.push(unknownKeyword);
  recordingCommands = shuffleArray(duplicateElements(recordingCommands, dataSize));

  text = 'Total recordings : ' + recordingCommands.length + '<br>';
  text += 'Expected gain in Accuracy : ' + expectedAccGains[index] + ' %<br>';
  text += 'Expected tuning time : ' + (personalizationConfig.expectedTimeRate * personalizationConfig.epochs * dataSize).toFixed(2) + ' mins';
  $('#statusBar').html(text);
}

displayExpectedAccGain($('#dataSizeSelect option:selected').val());

$('#dataSizeSelect').change(function() {
  displayExpectedAccGain($('#dataSizeSelect option:selected').val());
  $('#startBtn').show();
  displayResetBtn();
});

// recording

let timeleft = null;
countDownInterval = null;
function resetCountDown() {
  countDownInterval = null;
  timeleft = 3;
}

let recordingDeferred = null;
let currentRecording = null;

function recordNext() {
  $('#yesBtn').hide();
  $('#noBtn').hide();
  recordingDeferred.resolve(currentRecording);
}

function recordAgain() {
  $('#yesBtn').hide();
  $('#noBtn').hide();
  if (recordingIndex < 0) {
    record(unknownKeyword).done(onPracticeCompleted);
  } else {
    while (labels.length > recordingIndex) {
      labels.pop();
    }
    record(recordingCommands[recordingIndex]).done(onRecordingCompleted);
  }
}

function playRecordingCallBack() {
  showYesNoBtn(recordNext, recordAgain);
}

function record(keyword) {
  hideAllButtons();
  $('#statusBar').html("Keyword is ... " + keyword.toUpperCase());

  if (recordingDeferred && recordingDeferred.state() == "pending") {
    recordingDeferred.reject();
  }
  recordingDeferred = $.Deferred();

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

      $('#statusBar').html("Do you want to keep this recording?");
      currentRecording = micAudioProcessor.getData();
      recordingPlayer.play(currentRecording, playRecordingCallBack);
    }
  }, 1000);

  return recordingDeferred.promise();
}

$('#startBtn').click(function() {
  let cachedPersonalization = false;
  hideAllButtons();
  $('#personalizationSettingDiv').hide();

  if (typeof(Storage) !== "undefined") {
    if (localStorage.getItem("personalized")) {
      cachedPersonalization = true;
    }
  }

  function displayStartPage() {
    $('#statusBar').html("Let's practice recording!");
    $('#personalizationSettingDiv').hide();
    $('#practiceBtn').show();
    $('#yesBtn').hide();
    $('#noBtn').hide();
  }

  if (cachedPersonalization) {
    let text = "Honkling is already personalized<br><br>";
    text += "It will replace existing version<br><br>";
    text += "Do you want to personalize your Honkling again?";

    $('#statusBar').html(text);

    showYesNoBtn(function() {
      localStorage.removeItem("personalized");
      displayStartPage();
    }, function() {
      displayExpectedAccGain($('#dataSizeSelect option:selected').val());
      $('#startBtn').show();
      displayResetBtn();
    });
  } else {
    displayStartPage();
  }
});

function onPracticeCompleted() {
  $('#statusBar').html("Recording was successful!<br><br>Click RECORD to start personalization");
  $('#recordBtn').show();
  recordingIndex = 0;
}

$('#practiceBtn').click(function() {
  record(unknownKeyword).done(onPracticeCompleted);
});

function displayPersonalizationResult(result) {
  hideRecordingDisplay();
  let baseAcc = Math.round(result.baseAcc * 100);
  let perAcc = Math.round(result.personalizedAcc * 100);
  text = "Personalization Completed!!<br><br>";
  text += 'Accuracy before personalization : ' + baseAcc + " %<br>";
  text += 'Accuracy after personalization : ' + perAcc + " %<br>";
  text += 'Training took ' + result.trainingTime + " mins";
  $('#statusBar').html(text);
}

let recordingIndex = -1; // practice keyword
let processedData = [];
let labels = [];
let model = null;

function onRecordingCompleted(recording) {
  let label = commands.indexOf(recordingCommands[recordingIndex]);
  if (label < 0) {
    label = 1;
  }
  labels.push(label);
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

  let offlineProcessor = new OfflineAudioProcessor(audioConfig, recording);
  offlineProcessor.getMFCC().done(function(mfccData) {
    processedData.push(mfccData);
    if (recordingIndex >= recordingCommands.length) {
      model = new SpeechResModel("RES8_NARROW", commands);
      model.train(processedData, labels, $('#statusBar')).then(function(result) {
        displayPersonalizationResult(result);
      });
    }
  });
}

$('#recordBtn').click(function() {
  record(recordingCommands[recordingIndex]).done(onRecordingCompleted);
});

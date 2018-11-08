var toggleTime = 2000;

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

function toggleCommand(command) {
  if (command == 'silence') {
    command = 'unknown'
  }

  if (command == 'unknown') {
    $('#statusBar').text('Failed to identify keyword spoken. Please try again');
  } else {
    $('#statusBar').text('keyword spoken is ... ' + command.toUpperCase() + ' !!');
  }

  $('.commandList .active').removeClass('active');
  $('.commandList .'+command+'_button').addClass('active');
  setTimeout(function(){
    $('.commandList .'+command+'_button').removeClass('active');
  }, toggleTime);
}

function enableRecordBtn() {
  $('#recordBtn').removeClass('btn-secondary');
  $('#recordBtn').addClass('btn-primary');
  $('#recordBtn').prop('disabled', false);
  if (isMobile) {
    $('#statusBar').text('Press RECORD button to record a keyword listed below');
  } else {
    $('#statusBar').text('Press RECORD button or hold spacebar to record a keyword listed below');
  }
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
}

function displayRemainingRecordTime(remaining) {
  $('#statusBar').text('Recording ... say a keyword listed below within ' + remaining + ' seconds');
}

function displayRecordingMsg(remaining) {
  $('#statusBar').text('Recording ... release spacebar after saying a keyword');
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

// list initialization
init_view(commands);

// Audio Processing

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
      toggleCommand(predict(mfccData, model));
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
      toggleCommand(predict(mfccData, model));
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
        toggleCommand(predict(mfccData, model));
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

let model = new SpeechResModel("RES8_NARROW");

// TODO :: properly handle failure cases

let reports = {}
let singlePredictionReport = {}

let commandIndex = 0;
let audioIndex = 0;
let fileName;

let perfMeasDeferred;
let offlineProcessor;

let prevEvalCompleteTime;
let EvalCompleteTime;

let totalAudioCount;
let processedAudioCount;

function displayCurrProgress() {
  $('#statusBar').text('Measuring performance for command ' + model.weights['commands'][commandIndex] + ' ('+audioIndex+'/'+evaluationConfig['numAudioFilesPerCommand']+')');
  updateProgressBar();
}

function displayEvaluationCompete() {
  $('#statusBar').text('Performance evaluation has completed!');
}

function initProgressBar() {
  $('#evaluateProgressBarWrapper').show();
  $('#evaluateProgressBar').attr('aria-valuemax', totalAudioCount);
  $('#evaluateProgressBar').attr('aria-valuemin', 0);
  $('#evaluateProgressBar').attr('aria-valuenow', 0);
  $('#evaluateProgressBar').css('width', 0);
}

function updateProgressBar() {
  let percent = Math.floor(processedAudioCount/totalAudioCount*100);
  $('#evaluateProgressBar').attr('aria-valuenow', processedAudioCount);
  $('#evaluateProgressBar').css('width', percent+'%');
  $('#evaluateProgressBar').text(percent + ' % ( ' +processedAudioCount + ' / ' + totalAudioCount + ' )');
}

function initReport() {
  let command;
  for (var i = 0; i < model.weights['commands'].length ; i++) {
    command = model.weights['commands'][i];

    let report = {}
    report['total'] = evaluationConfig['numAudioFilesPerCommand'];
    report['processedCount'] = 0;

    report['mfccGenTimeAvg'] = 0;
    report['mfccGenTimeMin'] = 0;
    report['mfccGenTimeMax'] = 0;

    report['inferenceTimeAvg'] = 0;
    report['inferenceTimeMin'] = 0;
    report['inferenceTimeMax'] = 0;

    report['predictionSuccessCount'] = 0;

    reports[command] = report;
  }
}

function prepareEvaluation() {
  initProgressBar();
  initReport();
}

function summarizeResult() {
  singlePredictionReport.mfccPrepTime = singlePredictionReport.mfccPrepCompleted - singlePredictionReport.startTime;
  singlePredictionReport.inferenceTime = singlePredictionReport.endTime - singlePredictionReport.mfccPrepCompleted;
  singlePredictionReport.totalElapsedTime = singlePredictionReport.endTime - singlePredictionReport.startTime;
  singlePredictionReport.result = singlePredictionReport.label == singlePredictionReport.prediction;

  if (singlePredictionReport.command == 'unknown') {
    console.log('< Generated report - negative case >');
  } else {
    console.log('< Generated report - positive case >');
  }
  console.log('  Command = '+ singlePredictionReport.command + ', index = ' + audioIndex + ' file name = ' + fileName)
  console.log('  mfccPrepTime (ms) = ' + singlePredictionReport.mfccPrepTime)
  console.log('  inferenceTime (ms) = ' + singlePredictionReport.inferenceTime)
  console.log('  totalElapsedTime (ms) = ' + singlePredictionReport.totalElapsedTime)
  console.log('  prediction = ' + singlePredictionReport.label + ' -> ' + singlePredictionReport.prediction + ' ( '+singlePredictionReport.result+' )')
}

function measurePerf(data) {
  singlePredictionReport.startTime = performance.now();
  offlineProcessor = new OfflineAudioProcessor(audioConfig, data);
  offlineProcessor.getMFCC().done(function(mfccData) {
    singlePredictionReport.mfccPrepCompleted = performance.now();
    singlePredictionReport.prediction = predict(mfccData, modelName, model);
    singlePredictionReport.endTime = performance.now();
    perfMeasDeferred.resolve();
  }).fail(function(err) {
    console.log('performance measuring for ' + singlePredictionReport.label + 'for ' + audioIndex + ' th audio failed')
    perfMeasDeferred.reject(err);
  })
}

// retrieval of single audio
function getAudioAndMeasurePerf(command, index) {
  return $.ajax({
    dataType: 'json',
    url: 'http://honkling.cs.uwaterloo.ca:8080/get_audio',
    crossDomain: true,
    data: {command:command, index:index}
  }).done(function(data) {
    fileName = data['fileName']
    singlePredictionReport.label = data['command']
    measurePerf(data['features']);
  }).fail(function(err) {
    console.log('audio retrieval failed for ' + audioIndex + ' th audio of ' + singlePredictionReport.label);
    console.log(err);
  });
}

function evaluate() {
  // base case
  if (model.weights['commands'].length == commandIndex) {
    audioIndex = 0;
    commandIndex = 0;
    displayEvaluationCompete();
    return;
  }

  perfMeasDeferred = $.Deferred();

  singlePredictionReport.command = model.weights['commands'][commandIndex];
  console.log('start evaluation for ' + singlePredictionReport.command + ' with index ' + audioIndex);

  getAudioAndMeasurePerf(singlePredictionReport.command, audioIndex);
  perfMeasDeferred.done(function() {
    summarizeResult();
    audioIndex++;
    if (audioIndex == evaluationConfig['numAudioFilesPerCommand']) {
      commandIndex++;
      audioIndex = 0;
    }
    processedAudioCount++;
    displayCurrProgress();
    lastEvalTime = performance.now();
    delete offlineProcessor;
    evaluate();
  }).fail(function(err) {
    console.log('performance measuring failed');
    console.log(err);
  });;
}

$('#statusBar').text('command list : ' + model.weights['commands'].join(', '));

// triggering audio file list initialization
$(document).on('click', '#evaluateBtn:enabled', function() {
  $.ajax({
    dataType : 'json',
    url : 'http://honkling.cs.uwaterloo.ca:8080/init',
    crossDomain: true,
    data : {
      commands : model.weights['commands'].toString(),
      size : evaluationConfig['numAudioFilesPerCommand'],
      sampleRate : audioConfig['offlineSampleRate']
   },
  }).done(function(initSummary) {
    // TODO :: display details about evaluation process with summary provided
    console.log('server initialization completed');
    console.log(initSummary)

    processedAudioCount = 0;
    totalAudioCount = initSummary['positiveAudioCount'] * initSummary['commands'].length;

    prepareEvaluation();

    evalStartTime = performance.now();
    evaluate();

  }).fail(function(err) {
    console.log('server initialization failed');
    console.log(err);
  });
});

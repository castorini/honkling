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

let evaluationInterrupt;

function enableStopEvaluateBtn() {
  $('#stopEvaluateBtn').show();
  $('#evaluateBtn').hide();
}
function enableEvaluateBtn() {
  $('#stopEvaluateBtn').hide();
  $('#evaluateBtn').show();
}

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

function getEmptyReport() {
  let report = {};
  report['processedCount'] = 0;

  report['mfccGenTimeSum'] = 0;
  report['mfccGenTimeAvg'] = 0;
  report['mfccGenTimeMin'] = Number.MAX_SAFE_INTEGER;
  report['mfccGenTimeMax'] = 0;

  report['inferenceTimeSum'] = 0;
  report['inferenceTimeAvg'] = 0;
  report['inferenceTimeMin'] = Number.MAX_SAFE_INTEGER;
  report['inferenceTimeMax'] = 0;

  report['predictionSuccessCount'] = 0;
  report['accuracy'] = 0;

  return report;
}

function initReports() {
  let command;
  for (var i = 0; i < model.weights['commands'].length ; i++) {
    command = model.weights['commands'][i];
    reports[command] = getEmptyReport();
  }
}

function prepareEvaluation() {
  initProgressBar();
  initReports();
}

function summarizeResult() {
  singlePredictionReport.mfccPrepTime = singlePredictionReport.mfccPrepCompleted - singlePredictionReport.startTime;
  singlePredictionReport.inferenceTime = singlePredictionReport.endTime - singlePredictionReport.mfccPrepCompleted;
  singlePredictionReport.totalElapsedTime = singlePredictionReport.endTime - singlePredictionReport.startTime;
  singlePredictionReport.result = singlePredictionReport.label == singlePredictionReport.prediction;

  let command = singlePredictionReport.command;

  if (command == 'unknown') {
    console.log('< Generated report - negative case >');
  } else {
    console.log('< Generated report - positive case >');
  }
  console.log('  Command = '+ command + ', index = ' + audioIndex + ' file name = ' + fileName);
  console.log('  mfccPrepTime (ms) = ' + singlePredictionReport.mfccPrepTime);
  console.log('  inferenceTime (ms) = ' + singlePredictionReport.inferenceTime);
  console.log('  totalElapsedTime (ms) = ' + singlePredictionReport.totalElapsedTime);
  console.log('  prediction = ' + singlePredictionReport.label + ' -> ' + singlePredictionReport.prediction + ' ( '+singlePredictionReport.result+' )');

  // accuracy aggregation
  reports[command]['processedCount']++;
  if (singlePredictionReport.result) {
    reports[command]['predictionSuccessCount']++;
    reports[command]['accuracy'] = reports[command]['predictionSuccessCount'] / reports[command]['processedCount'];
  }

  // mfcc generation data aggregation
  reports[command]['mfccGenTimeSum'] += singlePredictionReport.mfccPrepTime;
  if (singlePredictionReport.mfccPrepTime < reports[command]['mfccGenTimeMin']) {
    reports[command]['mfccGenTimeMin'] = singlePredictionReport.mfccPrepTime;
  }
  if (singlePredictionReport.mfccPrepTime > reports[command]['mfccGenTimeMax']) {
    reports[command]['mfccGenTimeMax'] = singlePredictionReport.mfccPrepTime;
  }
  reports[command]['mfccGenTimeAvg'] = reports[command]['mfccGenTimeSum'] / reports[command]['processedCount'];

  // inference data aggregation
  reports[command]['inferenceTimeSum'] += singlePredictionReport.inferenceTime;
  if (singlePredictionReport.inferenceTime < reports[command]['inferenceTimeMin']) {
    reports[command]['inferenceTimeMin'] = singlePredictionReport.inferenceTime;
  }
  if (singlePredictionReport.inferenceTime > reports[command]['inferenceTimeMax']) {
    reports[command]['inferenceTimeMax'] = singlePredictionReport.inferenceTime;
  }
  reports[command]['inferenceTimeAvg'] = reports[command]['inferenceTimeSum'] / reports[command]['processedCount'];
}

function generateSummary() {
  let summary = getEmptyReport();

  for (var i = 0; i < model.weights['commands'].length ; i++) {
    command = model.weights['commands'][i];

    summary['processedCount'] += reports[command]['processedCount'];

    summary['mfccGenTimeSum'] += reports[command]['mfccGenTimeSum'];
    if (reports[command]['mfccGenTimeMin'] < summary['mfccGenTimeMin']) {
      summary['mfccGenTimeMin'] = reports[command]['mfccGenTimeMin'];
    }
    if (reports[command]['mfccGenTimeMax'] > summary['mfccGenTimeMax']) {
      summary['mfccGenTimeMax'] = reports[command]['mfccGenTimeMax'];
    }

    summary['inferenceTimeSum'] += reports[command]['inferenceTimeSum'];
    if (reports[command]['inferenceTimeMin'] < summary['inferenceTimeMin']) {
      summary['inferenceTimeMin'] = reports[command]['inferenceTimeMin'];
    }
    if (reports[command]['inferenceTimeMax'] > summary['inferenceTimeMax']) {
      summary['inferenceTimeMax'] = reports[command]['inferenceTimeMax'];
    }

    summary['predictionSuccessCount'] += reports[command]['predictionSuccessCount'];
  }
  summary['mfccGenTimeAvg'] = summary['mfccGenTimeSum']/summary['processedCount'];
  summary['inferenceTimeAvg'] = summary['inferenceTimeSum']/summary['processedCount'];
  summary['accuracy'] = summary['predictionSuccessCount']/summary['processedCount'];

  reports['summary'] = summary;
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
    console.log('performance measuring for ' + singlePredictionReport.label + 'for ' + audioIndex + ' th audio failed');
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
  if (model.weights['commands'].length == commandIndex || evaluationInterrupt) {
    audioIndex = 0;
    commandIndex = 0;
    displayEvaluationCompete();
    console.log('result ', reports);
    generateSummary();
    console.log('summary', reports['summary']);
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
  });
}

$('#statusBar').text('command list : ' + model.weights['commands'].join(', '));

$(document).on('click', '#stopEvaluateBtn', function() {
  evaluationInterrupt = true;
});

// triggering audio file list initialization
$(document).on('click', '#evaluateBtn', function() {
  evaluationInterrupt = false;
  enableStopEvaluateBtn();
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

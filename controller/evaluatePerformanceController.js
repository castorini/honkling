// TODO :: properly handle failure cases

// display updates

// progress bar
let totalTestCount;
let processedTestCount;

function initEvalPerf() {
  $('#testSizeInput').val(evaluationConfig['testSizePerCommand']);
  $('#statusBar').text('There are ' + model.weights['commands'].length + ' commands for evaluation. Recommanded test size is '+ evaluationConfig['testSizePerCommand']);
}

function displayInitMsg() {
  $('#statusBar').text('Preparing test data set ...');
  $('#testSizeInputWrapper').hide();
}

function enableStopEvaluateBtn() {
  $('#stopEvaluateBtn').show();
  $('#evaluateBtn').hide();
}

function enableEvaluateBtn() {
  $('#stopEvaluateBtn').hide();
  $('#evaluateBtn').show();
}

function resetEvalPerf() {
  initProgressBar();
  $('#evaluateProgressBarWrapper').hide();
  $('#testSizeInputWrapper').show();
  $('#summaryTableWrapper').hide();
  enableEvaluateBtn();
  initEvalPerf();
}

function initProgressBar() {
  $('#evaluateProgressBarWrapper').show();
  $('#evaluateProgressBar').attr('aria-valuemax', totalTestCount);
  $('#evaluateProgressBar').attr('aria-valuemin', 0);
  $('#evaluateProgressBar').attr('aria-valuenow', 0);
  $('#evaluateProgressBar').css('width', 0);
}

function updateProgressBar() {
  let percent = Math.floor(processedTestCount/totalTestCount*100);
  $('#evaluateProgressBar').attr('aria-valuenow', processedTestCount);
  $('#evaluateProgressBar').css('width', percent+'%');
  $('#evaluateProgressBar').text(percent + ' % ( ' +processedTestCount + ' / ' + totalTestCount + ' )');
}

function displayCurrProgress() {
  $('#statusBar').text('Measuring performance for command ' + model.weights['commands'][commandIndex] + ' ('+audioIndex+'/'+evaluationConfig['testSizePerCommand']+')');
  updateProgressBar();
}

function displaySummaryTable() {
  $('#summaryTableWrapper').show();
  generateTable($('#summaryTable'), reports['summary']);
}

function displayEvalCompete() {
  $('#statusBar').text('Performance evaluation has completed!');
  $('#evaluateProgressBarWrapper').hide();
  displaySummaryTable();
  $('#evaluateProgressBarWrapper').hide();
  $('#testSizeInputWrapper').show();
  enableEvaluateBtn();
}

// table generation

let subHeadingTemplate = '<th rowspan="rowCount" scope="rowgroup">heading</th>';
let trTemplate = "<tr><th>key</th><td>value</td><td>unit</td></tr>";

function addTableEntry(table, key, value, unit) {
  let trHtml = trTemplate.replace("key", key);
  trHtml = trHtml.replace("value", value);
  trHtml = trHtml.replace("unit", unit);
  if (table.find('tr:last')[0]) {
    table.find('tr:last').after(trHtml);
  } else {
    table.find('tbody').append(trHtml);
  }
}

function addTableEntryWithHeading(table, key, value, unit, heading, rowCount) {
  addTableEntry(table, key, value, unit);
  let subHeadingHtml = subHeadingTemplate.replace("heading", heading);
  subHeadingHtml = subHeadingHtml.replace("rowCount", rowCount);
  table.find('tr:last').prepend(subHeadingHtml);
}

function formatNumber(num) {
  return numberWithCommans(roundTo(num, 2));
}

function generateTable(table, report) {
  addTableEntryWithHeading(table, "total count", report["processedTestCount"], "", "ACCURACY", 3);
  addTableEntry(table, "success count", report["successCount"], "");
  addTableEntry(table, "accuracy", formatNumber(report["accuracy"] * 100, 2), "%");

  addTableEntryWithHeading(table, "total mfcc compute time", formatNumber(report["mfccCompTimeSum"]/60000, 2), "m", "MFCC COMPUTATION", 4);
  addTableEntry(table, "avg mfcc compute time", formatNumber(report["mfccCompTimeAvg"], 2), "ms");
  addTableEntry(table, "min mfcc compute time", formatNumber(report["mfccCompTimeMin"], 2), "ms");
  addTableEntry(table, "max mfcc compute time", formatNumber(report["mfccCompTimeMax"], 2), "ms");

  addTableEntryWithHeading(table, "total inference time", formatNumber(report["inferenceTimeSum"]/60000, 2), "m", "INFERENCE", 4);
  addTableEntry(table, "avg inference time", formatNumber(report["inferenceTimeAvg"], 2), "ms");
  addTableEntry(table, "min inference time", formatNumber(report["inferenceTimeMin"], 2), "ms");
  addTableEntry(table, "max inference time", formatNumber(report["inferenceTimeMax"], 2), "ms");

  addTableEntryWithHeading(table, "total process time", formatNumber(report["processingTimeSum"]/60000, 2), "m", "OVERALL", 4);
  addTableEntry(table, "avg process time", formatNumber(report["processingTimeAvg"], 2), "ms");
  addTableEntry(table, "min process time", formatNumber(report["processingTimeMin"], 2), "ms");
  addTableEntry(table, "max process time", formatNumber(report["processingTimeMax"], 2), "ms");
}

// report generation

let reports = {};
let evalResult = {};

function getEmptyReport() {
  let report = {};
  report['processedTestCount'] = 0;

  report['mfccCompTimeSum'] = 0;
  report['mfccCompTimeAvg'] = 0;
  report['mfccCompTimeMin'] = Number.MAX_SAFE_INTEGER;
  report['mfccCompTimeMax'] = 0;

  report['inferenceTimeSum'] = 0;
  report['inferenceTimeAvg'] = 0;
  report['inferenceTimeMin'] = Number.MAX_SAFE_INTEGER;
  report['inferenceTimeMax'] = 0;

  report['processingTimeSum'] = 0;
  report['processingTimeAvg'] = 0;
  report['processingTimeMin'] = Number.MAX_SAFE_INTEGER;
  report['processingTimeMax'] = 0;

  report['successCount'] = 0;
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

function saveResult() {
  let command = evalResult.command;
  evalResult.mfccCompTime = evalResult.mfccCompEndTime - evalResult.startTime;
  evalResult.inferenceTime = evalResult.endTime - evalResult.mfccCompEndTime;
  evalResult.processingTime = evalResult.endTime - evalResult.startTime;
  evalResult.result = command == evalResult.prediction;

  // if (command == 'unknown') {
  //   console.log('< Generated report - negative case >');
  // } else {
  //   console.log('< Generated report - positive case >');
  // }
  // console.log('  audio = '+ evalResult.label + ', index = ' + audioIndex + ' file name = ' + currAudioFile);
  // console.log('  mfccCompTime (ms) = ' + evalResult.mfccCompTime);
  // console.log('  inferenceTime (ms) = ' + evalResult.inferenceTime);
  // console.log('  processingTime (ms) = ' + evalResult.processingTime);
  // console.log('  prediction = ' + command + ' -> ' + evalResult.prediction + ' ( '+evalResult.result+' )');

  // accuracy aggregation
  reports[command]['processedTestCount']++;
  if (evalResult.result) {
    reports[command]['successCount']++;
    reports[command]['accuracy'] = reports[command]['successCount'] / reports[command]['processedTestCount'];
  }

  // mfcc generation data aggregation
  reports[command]['mfccCompTimeSum'] += evalResult.mfccCompTime;
  if (evalResult.mfccCompTime < reports[command]['mfccCompTimeMin']) {
    reports[command]['mfccCompTimeMin'] = evalResult.mfccCompTime;
  }
  if (evalResult.mfccCompTime > reports[command]['mfccCompTimeMax']) {
    reports[command]['mfccCompTimeMax'] = evalResult.mfccCompTime;
  }
  reports[command]['mfccCompTimeAvg'] = reports[command]['mfccCompTimeSum'] / reports[command]['processedTestCount'];

  // inference data aggregation
  reports[command]['inferenceTimeSum'] += evalResult.inferenceTime;
  if (evalResult.inferenceTime < reports[command]['inferenceTimeMin']) {
    reports[command]['inferenceTimeMin'] = evalResult.inferenceTime;
  }
  if (evalResult.inferenceTime > reports[command]['inferenceTimeMax']) {
    reports[command]['inferenceTimeMax'] = evalResult.inferenceTime;
  }
  reports[command]['inferenceTimeAvg'] = reports[command]['inferenceTimeSum'] / reports[command]['processedTestCount'];

  // overall processing time (mfcc generation + inference)
  reports[command]['processingTimeSum'] += evalResult.processingTime;
  if (evalResult.processingTime < reports[command]['processingTimeMin']) {
    reports[command]['processingTimeMin'] = evalResult.processingTime;
  }
  if (evalResult.processingTime > reports[command]['processingTimeMax']) {
    reports[command]['processingTimeMax'] = evalResult.processingTime;
  }
  reports[command]['processingTimeAvg'] = reports[command]['processingTimeSum'] / reports[command]['processedTestCount'];
}

function generateSummary() {
  let summary = getEmptyReport();

  for (var i = 0; i < model.weights['commands'].length ; i++) {
    command = model.weights['commands'][i];

    summary['processedTestCount'] += reports[command]['processedTestCount'];

    summary['mfccCompTimeSum'] += reports[command]['mfccCompTimeSum'];
    if (reports[command]['mfccCompTimeMin'] < summary['mfccCompTimeMin']) {
      summary['mfccCompTimeMin'] = reports[command]['mfccCompTimeMin'];
    }
    if (reports[command]['mfccCompTimeMax'] > summary['mfccCompTimeMax']) {
      summary['mfccCompTimeMax'] = reports[command]['mfccCompTimeMax'];
    }

    summary['inferenceTimeSum'] += reports[command]['inferenceTimeSum'];
    if (reports[command]['inferenceTimeMin'] < summary['inferenceTimeMin']) {
      summary['inferenceTimeMin'] = reports[command]['inferenceTimeMin'];
    }
    if (reports[command]['inferenceTimeMax'] > summary['inferenceTimeMax']) {
      summary['inferenceTimeMax'] = reports[command]['inferenceTimeMax'];
    }

    summary['processingTimeSum'] += reports[command]['processingTimeSum'];
    if (reports[command]['processingTimeMin'] < summary['processingTimeMin']) {
      summary['processingTimeMin'] = reports[command]['processingTimeMin'];
    }
    if (reports[command]['processingTimeMax'] > summary['processingTimeMax']) {
      summary['processingTimeMax'] = reports[command]['processingTimeMax'];
    }

    summary['successCount'] += reports[command]['successCount'];
  }
  summary['mfccCompTimeAvg'] = summary['mfccCompTimeSum']/summary['processedTestCount'];
  summary['inferenceTimeAvg'] = summary['inferenceTimeSum']/summary['processedTestCount'];
  summary['processingTimeAvg'] = summary['processingTimeSum']/summary['processedTestCount'];
  summary['accuracy'] = summary['successCount']/summary['processedTestCount'];

  reports['summary'] = summary;
}

// performance evaluation

let evaluationInterrupt;
let evalDeferred;
let offlineProcessor;
let commandIndex = 0;
let audioIndex = 0;

let currAudioFile;

function measurePerf(data) {
  evalResult.startTime = performance.now();
  offlineProcessor = new OfflineAudioProcessor(audioConfig, data);
  offlineProcessor.getMFCC().done(function(mfccData) {
    evalResult.mfccCompEndTime = performance.now();
    evalResult.prediction = predict(mfccData, modelName, model);
    evalResult.endTime = performance.now();
    evalDeferred.resolve();
  }).fail(function(err) {
    console.log('performance measuring for ' + evalResult.label + 'for ' + audioIndex + ' th audio failed');
    evalDeferred.reject(err);
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
    currAudioFile = data['fileName'];
    evalResult.label = data['command'];
    measurePerf(data['features']);
  }).fail(function(err) {
    console.log('audio retrieval failed for ' + audioIndex + ' th audio of ' + evalResult.label);
    console.log(err);
  });
}

function evaluate() {
  if (evaluationInterrupt) {
    resetEvalPerf();
    return;
  }

  // base case
  if (model.weights['commands'].length == commandIndex) {
    console.log('result ', reports);
    generateSummary();
    console.log('summary', reports['summary']);
    displayEvalCompete();
    return;
  }

  evalDeferred = $.Deferred();

  evalResult.command = model.weights['commands'][commandIndex];
  // console.log('start evaluation for ' + evalResult.command + ' with index ' + audioIndex);

  getAudioAndMeasurePerf(evalResult.command, audioIndex);
  evalDeferred.done(function() {
    saveResult();
    audioIndex++;
    if (audioIndex == evaluationConfig['testSizePerCommand']) {
      commandIndex++;
      audioIndex = 0;
    }
    processedTestCount++;
    displayCurrProgress();
    delete offlineProcessor;
    evaluate();
  }).fail(function(err) {
    console.log('performance measuring failed');
    console.log(err);
  });
}

function initEvalState() {
  audioIndex = 0;
  commandIndex = 0;
  evaluationInterrupt = false;
  evaluationConfig['testSizePerCommand'] = $('#testSizeInput').val();
}

function prepareEval() {
  initEvalState();
  enableStopEvaluateBtn();
  displayInitMsg();
}

function startEval() {
  initProgressBar();
  initReports();
}

$(document).on('click', '#stopEvaluateBtn', function() {
  evaluationInterrupt = true;
});

// triggering audio file list initialization
$(document).on('click', '#evaluateBtn', function() {
  prepareEval();
  $.ajax({
    dataType : 'json',
    url : 'http://honkling.cs.uwaterloo.ca:8080/init',
    crossDomain: true,
    data : {
      commands : model.weights['commands'].toString(),
      size : evaluationConfig['testSizePerCommand'],
      sampleRate : audioConfig['offlineSampleRate']
   },
  }).done(function(initSummary) {
    console.log('server initialization completed', initSummary);

    // TODO :: display details about evaluation process with summary provided
    processedTestCount = 0;
    totalTestCount = initSummary['positiveAudioCount'] * initSummary['commands'].length;

    startEval();
    evalStartTime = performance.now();
    evaluate();

  }).fail(function(err) {
    console.log('server initialization failed');
    console.log(err);
  });
});

$(document).on('click', '#stopEvaluateBtn', function() {
  evaluationInterrupt = true;
});

resetEvalPerf();

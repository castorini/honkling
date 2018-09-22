// display updates

// progress bar
let totalCount;
let index;

function initEvalPerf() {
  $('#statusBar').text('Keywords for evaluation : ' + model.weights['commands'] + ' ('+ model.weights['commands'].length +')');
}

function displayInitMsg() {
  $('#statusBar').text('Preparing test data set ...');
}

function displayFailedMsg(msg) {
  $('#statusBar').text(msg);
  enableEvaluateBtn();
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
  $('#statusBar').text('Please wait for completion');
  initProgressBar();
  $('#evaluateProgressBarWrapper').hide();
  $('#reportTableWrapper').hide();
  enableEvaluateBtn();
  initEvalPerf();
}

function initProgressBar() {
  $('#evaluateProgressBarWrapper').show();
  $('#evaluateProgressBar').attr('aria-valuemax', totalCount);
  $('#evaluateProgressBar').attr('aria-valuemin', 0);
  $('#evaluateProgressBar').attr('aria-valuenow', 0);
  $('#evaluateProgressBar').css('width', 0);
}

function updateProgressBar() {
  let percent = Math.floor(index/totalCount*100);
  $('#evaluateProgressBar').attr('aria-valuenow', index);
  $('#evaluateProgressBar').css('width', percent+'%');
  $('#evaluateProgressBar').text(percent + ' % ( ' + index + ' / ' + totalCount + ' )');
}

function displaySummaryTable() {
  $('#reportTableWrapper').show();
  generateTable($('#summaryReportTable'), reports['summary']);
  generateTable($('#posReportTable'), reports['positive']);
  generateTable($('#negReportTable'), reports['negative']);
}

function displayEvalCompete() {
  $('#statusBar').text('Performance evaluation has completed for ' + evalResult['positive']['totalCount'] + ' positive and ' + evalResult['negative']['totalCount'] + ' keywords!');
  $('#evaluateProgressBarWrapper').hide();
  displaySummaryTable();
  $('#evaluateProgressBarWrapper').hide();
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
  return numberWithCommas(roundTo(num, 2));
}

function generateTable(table, report) {
  addTableEntryWithHeading(table, "total count", report["totalCount"], "", "ACCURACY", 3);
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
let evaluation = {};
let evalResult = {};

function getEmptyEvalResult() {
  let result = {};
  result['mfccCompTime'] = [];
  result['inferenceTime'] = [];
  result['processingTime'] = [];
  result['successCount'] = 0;
  result['totalCount'] = 0;
  return result;
}

function initEvalResults() {
  evalResult['positive'] = getEmptyEvalResult();
  evalResult['negative'] = getEmptyEvalResult();
  evalResult['summary'] = getEmptyEvalResult();
}

function saveResult() {
  let command = evaluation['audio']['command'];
  let classification = evaluation['audio']['class'];

  let mfccCompTime = evaluation.mfccCompEndTime - evaluation.startTime;
  let inferenceTime = evaluation.endTime - evaluation.mfccCompEndTime;
  let processingTime = evaluation.endTime - evaluation.startTime;
  let predResult = command == evaluation.prediction;

  // console.log('< Generated report >');
  // console.log('  label = '+ command + ', index = ' + index);
  // console.log('  mfccCompTime (ms) = ' + mfccCompTime);
  // console.log('  inferenceTime (ms) = ' + inferenceTime);
  // console.log('  processingTime (ms) = ' + processingTime);
  // console.log('  prediction = ' + evaluation.prediction + ' ( '+predResult+' )');

  // accuracy aggregation
  if (predResult) {
      evalResult[classification]['successCount']++;
      evalResult['summary']['successCount']++;
  }

  evalResult[classification]['mfccCompTime'].push(mfccCompTime);
  evalResult['summary']['mfccCompTime'].push(mfccCompTime);
  evalResult[classification]['inferenceTime'].push(inferenceTime);
  evalResult['summary']['inferenceTime'].push(inferenceTime);
  evalResult[classification]['processingTime'].push(processingTime);
  evalResult['summary']['processingTime'].push(processingTime);
}

function getEmptyReport() {
  let report = {};

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

function generateReport(data) {
  let report = getEmptyReport();

  report['successCount'] = data['successCount'];
  report['totalCount'] = data['totalCount'];
  report['accuracy'] = report['successCount'] / report['totalCount'];

  for (var i = 0; i < data['totalCount']; i++) {
    report['mfccCompTimeSum'] += data['mfccCompTime'][i];
    if (data['mfccCompTime'][i] < report['mfccCompTimeMin']) {
      report['mfccCompTimeMin'] = data['mfccCompTime'][i];
    }
    if (data['mfccCompTime'][i] > report['mfccCompTimeMax']) {
      report['mfccCompTimeMax'] = data['mfccCompTime'][i];
    }

    report['inferenceTimeSum'] += data['inferenceTime'][i];
    if (data['inferenceTime'][i] < report['inferenceTimeMin']) {
      report['inferenceTimeMin'] = data['inferenceTime'][i];
    }
    if (data['inferenceTime'][i] > report['inferenceTimeMax']) {
      report['inferenceTimeMax'] = data['inferenceTime'][i];
    }

    report['processingTimeSum'] += data['processingTime'][i];
    if (data['processingTime'][i] < report['processingTimeMin']) {
      report['processingTimeMin'] = data['processingTime'][i];
    }
    if (data['processingTime'][i] > report['processingTimeMax']) {
      report['processingTimeMax'] = data['processingTime'][i];
    }
  }

  report['mfccCompTimeAvg'] = report['mfccCompTimeSum'] / report['totalCount'];
  report['inferenceTimeAvg'] = report['inferenceTimeSum'] / report['totalCount'];
  report['processingTimeAvg'] = report['processingTimeSum'] / report['totalCount'];

  return report;
}

// performance evaluation

let evaluationInterrupt;
let evalDeferred;
let offlineProcessor;

function measurePerf(data) {
  evaluation.startTime = performance.now();
  offlineProcessor = new OfflineAudioProcessor(audioConfig, data);
  offlineProcessor.getMFCC().done(function(mfccData) {
    evaluation.mfccCompEndTime = performance.now();
    evaluation.prediction = predict(mfccData, modelName, model);
    evaluation.endTime = performance.now();
    evalDeferred.resolve();
  }).fail(function(err) {
    console.log('performance measuring for ' + evaluation.label + 'for ' + index + ' th audio failed');
    evalDeferred.reject(err);
  })
}

// retrieval of single audio
function getAudioAndMeasurePerf(index) {
  return $.ajax({
    dataType: 'json',
    url: 'http://honkling.cs.uwaterloo.ca:8080/get_audio',
    crossDomain: true,
    data: {index:index}
  }).done(function(data) {
    evaluation['audio'] = data;
    measurePerf(data['features']);
  }).fail(function(err) {
    let errMsg = 'audio retrieval for ' + index + ' th audio failed';
    console.log(errMsg);
    console.log(err);
    displayFailedMsg(errMsg);
  });
}

function evaluate() {
  if (evaluationInterrupt) {
    resetEvalPerf();
    return;
  }

  // base case
  if (index == totalCount) {
    reports = {
        'positive' : generateReport(evalResult['positive']),
        'negative' : generateReport(evalResult['negative']),
        'summary' : generateReport(evalResult['summary'])
    }
    displayEvalCompete();
    return;
  }

  evalDeferred = $.Deferred();

  getAudioAndMeasurePerf(index);
  evalDeferred.done(function() {
    saveResult();
    index++;
    updateProgressBar();
    delete offlineProcessor;
    evaluate();
  }).fail(function(err) {
    let errMsg = 'Performance measuring failed. Please try again'
    console.log(errMsg);
    console.log(err);
    displayFailedMsg(errMsg);
  });
}

function initEvalState() {
  index = 0;
  evaluationInterrupt = false;
  initEvalResults();
}

function prepareEval() {
  initEvalState();
  enableStopEvaluateBtn();
  displayInitMsg();
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
      randomSeed :10,
      sampleRate : audioConfig['offlineSampleRate']
   },
  }).done(function(initSummary) {
    console.log('server initialization completed', initSummary);

    // TODO :: display details about evaluation process with summary provided
    index = 0;
    totalCount = initSummary['totalCount'];
    evalResult['summary']['totalCount'] = totalCount;
    evalResult['positive']['totalCount'] = initSummary['posCount'];
    evalResult['negative']['totalCount'] = initSummary['negCount'];

    initProgressBar();
    evaluate();

  }).fail(function(err) {
    let errMsg = 'Failed to prepare test data set. Please try again'
    console.log(errMsg);
    console.log(err);
    displayFailedMsg(errMsg);
  });
  // warming up model prediction
  for (var i = 0; i < sampleDataLabel.length; i++) {
    predict(mfccData[sampleDataLabel[i]], modelName, model);
  }
});

$(document).on('click', '#stopEvaluateBtn', function() {
  evaluationInterrupt = true;
});

resetEvalPerf();

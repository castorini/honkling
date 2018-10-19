let progressBarInterval;

function updateStatus(msg) {
  $('#statusBar').text(msg);
}

function enableStopEvaluateBtn() {
  $('#stopEvaluateBtn').show();
  $('#evaluateBtn').hide();
  $('#continueBtn').hide();
}

function enableEvaluateBtn() {
  $('#stopEvaluateBtn').hide();
  $('#evaluateBtn').show();
}

function resetDisplay() {
  $('.typeRadioWrapper').hide();
  $('.evaluateProgressBarWrapper').hide();
  updateProgress(0, 1);
  $('.evaluateProgressBar').text('');
}

function hideAllTables() {
  $('.valEvaluation .reportTableWrapper').hide();
  $('.testEvaluation .reportTableWrapper').hide();
}

// progressBar display

function updateProgress(curr, total) {
  let percent = Math.floor(curr/total*100);
  $('.evaluateProgressBar').attr('aria-valuenow', curr);
  $('.evaluateProgressBar').css('width', percent+'%');
  $('.evaluateProgressBar').text(percent + ' % ( ' + curr + ' / ' + total + ' )');
}

function updateProgressBar() {
  let curr;
  let total;
  if (targetType == 'all') {
    curr = valEvaluator.currIndex + testEvaluator.currIndex;
    total = valEvaluator.totalCount + testEvaluator.totalCount;
  } else if (targetType == 'val') {
    curr = valEvaluator.currIndex;
    total = valEvaluator.totalCount;
  } else {
    curr = testEvaluator.currIndex;
    total = testEvaluator.totalCount;
  }
  updateProgress(curr, total);
}

function startProgressBarInterval() {
  progressBarInterval = setInterval(function() {
    updateProgressBar();
  }, 1000);
}

function displayCompleteEvaluation() {
  $('.evaluateProgressBarWrapper').hide();
  $('.typeRadioWrapper').show();
  enableEvaluateBtn();
  updateStatus('performance evaluation is completed');
}

function drawTable(type, dataSet, data) {
  let table = $('.'+type+'Evaluation .' + dataSet + 'ReportTable');
  let tableGenerator = new TableGenerator(table);
  tableGenerator.generateTable(data);
}

function retrieveReport(type) {
  let wrapper = $('.'+type+'Evaluation .reportTableWrapper');
  $.ajax({
    dataType : 'json',
    url: 'https://honkling.xyz:443/get_report',
    // url: 'http://localhost:8080/get_report',
    crossDomain: true,
    data : {
      'appId' : appId,
      'type' : type
    }
  }).done(function(data) {
    wrapper.find('.reportName').text('Summary');

    let dataSetKeys = Object.keys(data);
    for (var i in dataSetKeys) {
      let dataSet = dataSetKeys[i];
      drawTable(type, dataSet, data[dataSet]);
    }
    wrapper.find('.showBtns').show();
  }).fail(function() {
    wrapper.find('.reportName').text('Failed to retrieve report');
    wrapper.find('.showBtns').hide();
  }).always(function() {
    $('.'+type+'Evaluation .reportTableWrapper').show();
  });
}

function hookDisplayUpdate() {
  valEvalDeferred.done(function() {
    updateStatus('performance evaluation on validation dataset is completed');
    retrieveReport(currType);

    if (targetType == 'val') {
      displayCompleteEvaluation();
    }
  })

  testEvalDeferred.done(function() {
    updateStatus('performance evaluation on test dataset is completed');
    retrieveReport(currType);

    if (targetType != 'val') {
      displayCompleteEvaluation();
    }
  })
}

// table display

function updateToShowBtn(btn, dataSet) {
  btn.removeClass('btn-outline-secondary');
  btn.addClass('btn-outline-primary');
  btn.text('show ' + dataSet + ' summary');
}

function updateToHideBtn(btn, dataSet) {
  btn.removeClass('btn-outline-primary');
  btn.addClass('btn-outline-secondary');
  btn.text('hide ' + dataSet + ' summary');
}

function hookTableBtnOps(type, dataSet) {
  let btn = $('.'+type+'Evaluation .'+dataSet+'TableBtn');
  let table = $('.'+type+'Evaluation .'+dataSet+'ReportTableWrapper');

  btn.click(function() {
    if (table.is(":hidden")) {
      table.show();
      updateToHideBtn(btn, dataSet);
    } else {
      table.hide();
      updateToShowBtn(btn, dataSet);
    }
  });
}

hookTableBtnOps('val', 'positive');
hookTableBtnOps('val', 'negative');
hookTableBtnOps('test', 'positive');
hookTableBtnOps('test', 'negative');

// browser evaluation

let appId = new Date().getTime();
let targetType, currType;
let valEvaluator, testEvaluator;
let valEvalDeferred, testEvalDeferred;

function setTargetType() {
  let radios = $('.typeRadio');
  for (var i = 0; i < radios.length; i++) {
    if ($(radios[i]).is(':checked')) {
      targetType = radios[i].getAttribute("value");
    }
  }
}

function measurePerformance() {
  $('.evaluateProgressBarWrapper').show();
  let statusMsg;
  startProgressBarInterval();
  if (currType == 'val') {
    statusMsg = 'evaluating performance on validation dataset';
    updateStatus(statusMsg);
    evaluator = valEvaluator;
  } else {
    statusMsg = 'evaluating performance on test dataset';
    evaluator = testEvaluator;
  }

  console.log(statusMsg);
  updateStatus(statusMsg);

  evaluator.collectMeasurement().done(function() {
    if (currType == 'val') {
      valEvalDeferred.resolve();
      if (targetType != 'val') {
        currType = 'test';
        measurePerformance();
      }
    } else {
      testEvalDeferred.resolve();
    }
  }).fail(function(msg) {
    valEvalDeferred.reject(msg);
    testEvalDeferred.reject(msg);
    clearInterval(progressBarInterval);
    updateStatus(msg);
    $('.typeRadioWrapper').show();
    $('#continueBtn').show();
    enableEvaluateBtn();
  })
}

$(document).on('click', '#stopEvaluateBtn', function() {
  evaluator.stopEvaluation();
});

$(document).on('click', '#continueBtn', function() {
  enableStopEvaluateBtn();
  if (valEvalDeferred) {
    valEvalDeferred = undefined;
  }
  if (testEvalDeferred) {
    testEvalDeferred = undefined;
  }
  valEvalDeferred = $.Deferred();
  testEvalDeferred = $.Deferred();
  measurePerformance();
  hookDisplayUpdate();
});

// triggering audio file list initialization
$(document).on('click', '#evaluateBtn', function() {
  if (valEvaluator) {
    valEvaluator = undefined;
  }
  if (testEvaluator) {
    testEvaluator = undefined;
  }
  setTargetType();
  resetDisplay();
  enableStopEvaluateBtn();
  $.ajax({
    dataType : 'json',
    url: 'https://honkling.xyz:443/init',
    // url: 'http://localhost:8080/init',
    crossDomain: true,
    data : {
      commands : commands.toString(),
      randomSeed :10,
      sampleRate : audioConfig['offlineSampleRate'],
      appId : appId
   },
  }).done(function(initSummary) {
    console.log('server initialization completed', initSummary);
    $('#initSummary').text('App ID : ' + appId + ', validation size : ' + initSummary['valCount'] + ', test size : ' + initSummary['testCount'])

    valEvaluator = new PerformanceEvaluator(appId, 'val', initSummary['valCount']);
    testEvaluator = new PerformanceEvaluator(appId, 'test', initSummary['testCount']);

    valEvalDeferred = $.Deferred();
    testEvalDeferred = $.Deferred();

    if (targetType == 'all') {
      currType = 'val';
      $('.valEvaluation .reportTableWrapper').hide();
      $('.testEvaluation .reportTableWrapper').hide();
    } else if (targetType == 'test') {
      currType = 'test';
      $('.testEvaluation .reportTableWrapper').hide();
    } else {
      currType = 'val';
      $('.valEvaluation .reportTableWrapper').hide();
    }

    measurePerformance();
    hookDisplayUpdate();
  }).fail(function() {
    updateStatus('initialization failed because server is unreachable');
    enableEvaluateBtn();
  }).always(function() {
      if (warmUpProcessor) {
        warmUpProcessor = undefined;
      }
  });
});

// warming up model prediction
let warmUpProcessor = new OfflineAudioProcessor(audioConfig, audioData["no"]);
warmUpProcessor.getMFCC().done(function(mfccData) {
  predict(mfccData, modelName, model);
});

updateStatus('Keywords for evaluation : ' + commands + ' ('+ commands.length +')');

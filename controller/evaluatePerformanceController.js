let progressBarInterval;

function updateStatus(msg) {
  $('#statusBar').text(msg);
}

function enableStopEvaluateBtn() {
  $('#evalSettingInputWrapper').hide();
  $('#stopEvaluateBtn').show();
  $('#evaluateBtn').hide();
  $('#continueBtn').hide();
}

function enableEvaluateBtn() {
  $('#evalSettingInputWrapper').show();
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
    url: serverURL+'/get_report',
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
      if (dataSet == "type") continue;
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

let model = new SpeechResModel("RES8_NARROW", commands); // default model for warmup
let appId = new Date().getTime();
let modelName;
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
  appId = $('#appIdInput').val();
  modelName = $('.modelSelect').val();
  model = new SpeechResModel(modelName, commands);

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
    url: serverURL+'/init',
    crossDomain: true,
    data : {
      commands : commands.toString(),
      sampleRate : audioConfig['offlineSampleRate'],
      appId : appId
   },
  }).done(function(initSummary) {
    console.log('server initialization completed', initSummary);
    $('#initSummary').text('Model Name : ' + modelName + ', App ID : ' + appId + ', validation size : ' + initSummary['valTotal'] + ', test size : ' + initSummary['testTotal'])

    valEvaluator = new PerformanceEvaluator(appId, 'val', initSummary['valCount'], initSummary['valTotal']);
    testEvaluator = new PerformanceEvaluator(appId, 'test', initSummary['testCount'], initSummary['testTotal']);

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
        audioData = undefined;
        warmUpProcessor = undefined;
      }
  });
});

let warmUpCount = 5;
let warmUpProcessor;
function warmUpCompuation() {
  // warming up model prediction
  warmUpProcessor = new OfflineAudioProcessor(audioConfig, audioData["no"]);
  warmUpProcessor.getMFCC().done(function(mfccData) {
    predict(mfccData, model, commands);
    warmUpCount--;
    if (warmUpCount != 0) {
      warmUpCompuation();
    }
  });
}
warmUpCompuation();

$('#appIdInput').val(appId);
let modelList = Object.keys(weights);

for (var i = 0; i < modelList.length; i++) {
  let modelName = modelList[i];
  $('.modelSelect').append('<option value="'+modelName+'">'+modelName+'</option>')
}

updateStatus('Please select model and data set to use');

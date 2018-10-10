let progressBarInterval;

function updateStatus(msg) {
  $('#statusBar').text(msg);
}

function enableStopEvaluateBtn() {
  $('#stopEvaluateBtn').show();
  $('#evaluateBtn').hide();
}

function enableEvaluateBtn() {
  $('#stopEvaluateBtn').hide();
  $('#evaluateBtn').show();
}

function resetDisplay() {
  $('.evaluateProgressBarWrapper').hide();
  updateProgress(0, 1);
  $('.evaluateProgressBar').text('');
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
  let curr = valEvaluator.currIndex + testEvaluator.currIndex;
  let total = valEvaluator.totalCount + testEvaluator.totalCount;
  updateProgress(curr, total);
}

function startProgressBarInterval() {
  progressBarInterval = setInterval(function() {
    updateProgressBar();
  }, 1000);
}

function hookDisplayUpdate() {
  valEvalDeferred.done(function() {
    $('.valEvaluation .reportTableWrapper').show();
    updateProgressBar();
    updateStatus('performance evaluation on validation dataset is completed');
  })

  testEvalDeferred.done(function() {
    $('.testEvaluation .reportTableWrapper').show();
    updateStatus('performance evaluation is completed');
  }).always(function() {
    clearInterval(progressBarInterval);
    $('.evaluateProgressBarWrapper').hide();
    enableEvaluateBtn();
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

let type;
let valEvaluator, testEvaluator;
let valEvalDeferred, testEvalDeferred;

function measurePerformance() {
  $('.evaluateProgressBarWrapper').show();
  if (type == 'val') {
    updateStatus('evaluating performance on validation dataset');
    startProgressBarInterval();
    evaluator = valEvaluator;
  } else {
    updateStatus('evaluating performance on test dataset');
    evaluator = testEvaluator;
  }

  evaluator.collectMeasurement().done(function() {
    if (type == 'val') {
      valEvalDeferred.resolve();
      type = 'test';
      measurePerformance();
    } else {
      testEvalDeferred.resolve();
    }
  }).fail(function(msg) {
    valEvalDeferred.reject(msg);
    testEvalDeferred.reject(msg);
    updateStatus(msg)
  })
}

$(document).on('click', '#stopEvaluateBtn', function() {
  evaluator.stopEvaluation();
});

// triggering audio file list initialization
$(document).on('click', '#evaluateBtn', function() {
  resetDisplay();
  enableStopEvaluateBtn();
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
    $('#initSummary').text('validation size : ' + initSummary['valCount'] + ', test size : ' + initSummary['testCount'])

    valEvaluator = new PerformanceEvaluator('val', initSummary['valCount']);
    testEvaluator = new PerformanceEvaluator('test', initSummary['testCount']);

    valEvalDeferred = $.Deferred();
    testEvalDeferred = $.Deferred();

    type = 'val';
    measurePerformance();
    hookDisplayUpdate();
  }).fail(function(err) {
    updateStatus('initialization faield because ' + err);
  });
  // warming up model prediction
  for (var i = 0; i < sampleDataLabel.length; i++) {
    predict(mfccData[sampleDataLabel[i]], modelName, model);
  }
});

updateStatus('Keywords for evaluation : ' + model.weights['commands'] + ' ('+ model.weights['commands'].length +')');

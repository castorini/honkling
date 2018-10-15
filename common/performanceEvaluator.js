let evaluator;

class PerformanceEvaluator {
  constructor(appId, type, totalCount) {
    this.appId = appId;
    this.type = type;
    this.totalCount = totalCount;
    this.deferred = $.Deferred();
    this.dataCollector = new PerformanceDataCollector(type, this.deferred);
    this.interrupt = false;
    this.currIndex = 0;
  }

  printData(data) {
    console.log('  label = '+ data['command'] + ', index = ' + this.currIndex);
    console.log('    mfccCompTime (ms) = ' + data['mfccCompTime']);
    console.log('    inferenceTime (ms) = ' + data['inferenceTime']);
    console.log('    processingTime (ms) = ' + data['processingTime']);
    console.log('  prediction = ' + this.prediction + ' ( ' + data['result'] + ' )');
  }

  collectData() {
    let data = {
      'command' : this.audio['command'],
      'class' : this.audio['class'],
      'mfccCompTime' : this.mfccCompEndTime - this.startTime,
      'inferenceTime' : this.endTime - this.mfccCompEndTime,
      'processingTime' : this.endTime - this.startTime,
      'result' : this.audio['command'] == this.prediction
    }

    this.dataCollector.insert(data);
  }

  measurePerformance(data) {
    this.startTime = performance.now();
    let offlineProcessor = new OfflineAudioProcessor(audioConfig, data);
    offlineProcessor.getMFCC().done(function(mfccData) {
      evaluator.mfccCompEndTime = performance.now();
      evaluator.prediction = predict(mfccData, modelName, model);
      evaluator.endTime = performance.now();
      evaluator.audioRetrievalDeferred.resolve();
    }).fail(function(err) {
      evaluator.audioRetrievalDeferred.reject(err);
    })
  }

  getAudioAndMeasurePerf(index) {
    return $.ajax({
      dataType: 'json',
      url: 'https://honkling.xyz:443/get_audio',
      // url: 'http://localhost:8080/get_audio',
      crossDomain: true,
      data: {
        index:this.currIndex,
        type:this.type,
        appId:this.appId
      }
    }).done(function(data) {
      evaluator.audio = data
      evaluator.measurePerformance(data['features'])
    }).fail(function() {
      evaluator.audioRetrievalDeferred.reject('audio retrieval for ' + index + ' th audio failed');
    });
  }

  evaluate() {
    if (this.interrupt) {
      this.deferred.reject('evaluation is interrupted');
      return;
    }

    // base case
    if (this.currIndex == this.totalCount) {
      this.dataCollector.generateReport();
      this.deferred.resolve();
      return;
    }

    this.audioRetrievalDeferred = $.Deferred();
    this.getAudioAndMeasurePerf(this.type, this.currIndex);
    this.audioRetrievalDeferred.done(function() {
      evaluator.currIndex++;
      evaluator.collectData();
      evaluator.evaluate();
    }).fail(function(err) {
      evaluator.deferred.reject(err);
    });
  }

  collectMeasurement() {
    evaluator = this;
    this.evaluate();
    return this.deferred.promise();
  }

  stopEvaluation() {
    this.interrupt = true;
  }
}

let evaluator;

class PerformanceEvaluator {
  constructor(appId, type, index, totalCount) {
    this.appId = appId;
    this.type = type;
    this.currIndex = index;
    this.totalCount = totalCount;
    this.deferred = $.Deferred();
    this.interrupt = false;
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
      'appId' : this.appId,
      'type' : this.type,
      'command' : this.audio['command'],
      'class' : this.audio['class'],
      'mfccCompTime' : this.mfccCompEndTime - this.startTime,
      'inferenceTime' : this.endTime - this.mfccCompEndTime,
      'result' : this.audio['command'] == this.prediction
    }

    $.ajax({
      dataType: 'json',
      url: serverURL+'/store_data',
      crossDomain: true,
      data: data
    }).done(function() {
      evaluator.evaluate();
    }).fail(function() {
      evaluator.deferred.reject('Failed to deliver measurement to server');
    });
  }

  measurePerformance(data) {
    this.startTime = performance.now();
    this.offlineProcessor = new OfflineAudioProcessor(audioConfig, data);
    this.offlineProcessor.getMFCC().done(function(mfccData) {
      evaluator.mfccCompEndTime = performance.now();
      let output = model.predict(mfccData);
      evaluator.endTime = performance.now();
      let index = commands.indexOf("unknown");
      let max_prob = 0;
      for (let i = 0; i < commands.length; i++) {
        if (output[i] > max_prob) {
          index = i;
          max_prob = output[i];
        }
      }
      evaluator.prediction = commands[index];
      evaluator.audioRetrievalDeferred.resolve();
    }).fail(function(err) {
      evaluator.audioRetrievalDeferred.reject(err);
    })
  }

  getAudioAndMeasurePerf(index) {
    return $.ajax({
      dataType: 'json',
      url: serverURL+'/get_audio',
      crossDomain: true,
      data: {
        index: this.currIndex,
        type: this.type,
        appId: this.appId,
        mfcc: false
      }
    }).done(function(data) {
      evaluator.audio = data
      evaluator.measurePerformance(data['features'])
    }).fail(function() {
      evaluator.audioRetrievalDeferred.reject('audio retrieval for ' + evaluator.currIndex + ' th audio failed');
    });
  }

  evaluate() {
    if (this.interrupt) {
      this.deferred.reject('evaluation is interrupted');
      this.interrupt = false;
      this.deferred = $.Deferred();
      return;
    }

    // base case
    if (this.currIndex == this.totalCount) {
      this.deferred.resolve();
      return;
    }

    if (this.audioRetrievalDeferred) {
      this.audioRetrievalDeferred = undefined;
    }

    this.audioRetrievalDeferred = $.Deferred();
    this.getAudioAndMeasurePerf(this.type, this.currIndex);
    this.audioRetrievalDeferred.done(function() {
      evaluator.currIndex++;
      evaluator.collectData();
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

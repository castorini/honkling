require('./audioProcessor.js');
var deferred = require('deferred');
let request = require('request');

let evaluator;

function Evaluator(appId, model, type, total) {
  this.appId = appId
  this.model = model;
  this.totalCount = total;
  this.type = type;
  this.currIndex = 0;
  this.deferred = deferred();
}

Evaluator.prototype.evaluate = function() {
  request(encodeData(serverURL+'/get_audio', {
    index : this.currIndex,
    type : this.type,
    appId : this.appId
  }), function (error, response, body) {
    if (error != null) {
      let msg = 'retrieving audio data for '
        + evaluator.appId + ' '
        + evaluator.type + ' '
        + evaluator.currIndex + ' th audio failed : ' + error;
      evaluator.deferred.reject(msg);
      return;
    }
    let audio = JSON.parse(body);
    let mfccCompStart = process.hrtime();
    let mfcc = transposeFlatten2d(getMFCC(audio['features']));
    let mfccCompEnd = process.hrtime(mfccCompStart);
    let inferenceStart = process.hrtime();
    let prediction = evaluator.model.predict(mfcc);
    let inferenceEnd = process.hrtime(inferenceStart);

    let result = {
      'appId' : evaluator.appId,
      'type' : evaluator.type,
      'command' : audio['command'],
      'class' : audio['class'],
      'mfccCompTime' : hrtimeToMs(mfccCompEnd),
      'inferenceTime' : hrtimeToMs(inferenceEnd),
      'result' :audio['command'] == prediction
    }
    evaluator.store_data(result);
  });
}

Evaluator.prototype.store_data = function(data) {
  request(encodeData(serverURL+'/store_data', data), function (error, response, body) {
    if (error != null) {
      let msg = 'storing data for '
        + evaluator.appId + ' '
        + evaluator.type + ' '
        + evaluator.currIndex + ' th audio failed : ' + error;
      evaluator.deferred.reject(msg);
      return;
    }

    let prev = Math.floor((evaluator.currIndex / evaluator.totalCount) * 20);
    evaluator.currIndex++;

    if (evaluator.currIndex == evaluator.totalCount) {
      evaluator.deferred.resolve();
      return;
    }

    evaluator.evaluate();

    let next = Math.floor((evaluator.currIndex / evaluator.totalCount) * 20);
    if (prev != next) {
      console.log('\t' + next * 5 + ' % completed');
    }
  });
}

Evaluator.prototype.collectMeasurement = function() {
  evaluator = this;
  this.evaluate();
  return this.deferred.promise;
}

module.exports = Evaluator;

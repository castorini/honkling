require('./config.js');
var Evaluator = require('./evaluator.js');
var Model = require('./model.js');
var deferred = require('deferred');
var request = require('request');

let appId = new Date().getTime();
let model = new Model();

function displayResult(type) {
  request(encodeData(serverURL+'/get_report', {
    type : type,
    appId : appId
  }), function (error, response, body) {
    if (error != null) {
      console.log('retrieval of report has failed :', error);
      return;
    }
    let parsed = JSON.parse(body);
    console.log(parsed);
    console.log('===========================================\n');
  });
}

function initEval(valSize, testSize) {
  console.log('validation set size : ', valSize);
  console.log('test set size : ', testSize);
  console.log('===========================================\n');

  evaluate('val', valSize)(function() {
    console.log('< validation dataset evaluation completed >');
    displayResult('val');

    evaluate('test', testSize)(function() {
      console.log('< test dataset evaluation completed >');
      displayResult('test');
    },function(msg) {
      console.log('< test dataset evaluation failed >');
    });

  },function(msg) {
    console.log('< val dataset evaluation failed >');
  });
}

function evaluate(type, size) {
  let evaluator = new Evaluator(appId, model, type, size);
  return evaluator.collectMeasurement();
}

let warmUpDeferred;
function warmUp() {
  warmUpDeferred = deferred();
  request(encodeData(serverURL+'/get_audio', {
    index : 0,
    type : 'test',
    appId : 0
  }), function (error, response, body) {
    if (error != null) {
      let msg = 'retrieving audio data for warm up failed : ' + error;
      warmUpDeferred.reject(msg);
      return;
    }
    let audio = JSON.parse(body);
    for (var i = 0; i < 5; i++) {
      let mfcc = transposeFlatten2d(getMFCC(audio['features']));
      model.predict(mfcc);
    }
    warmUpDeferred.resolve();
  });
  return warmUpDeferred.promise;
}

warmUp()(function() {
  request(encodeData(serverURL+'/init', {
    commands : commands.toString(),
    randomSeed :10,
    sampleRate : audioConfig['offlineSampleRate'],
    appId : appId
  }), function (error, response, body) {
    if (error != null) {
      console.log('server initialization has failed :', error);
      return;
    }
    let parsed = JSON.parse(body);
    initEval(parsed["valCount"], parsed["testCount"]);
  });
},function(msg) {
  console.log('warming up failed : ' + msg);
});

require('./config.js');
var Evaluator = require('./evaluator.js');
var Model = require('./model.js');
var deferred = require('deferred');
var request = require('request');

let appId = 0;
let model = new Model("RES8_NARROW"); // for warm up

function displayResult(type) {
  request(encodeData(serverURL+'/get_report', {
    type : type,
    appId : appId
  }), function (error, response, body) {
    if (error != null) {
      console.log('retrieval of report has failed :', error);

      evalCompleteDeferred.reject(error);
      return;
    }
    let parsed = JSON.parse(body);
    console.log(parsed);
    console.log('==================\n');


    if (parsed.type == 'test') {
      evalCompleteDeferred.resolve();
    }
  });
}

let serverInitDeferred;
function initServer() {
  serverInitDeferred = deferred();
  request(encodeData(serverURL+'/init', {
    commands : commands.toString(),
    sampleRate : audioConfig['offlineSampleRate'],
    appId : appId
  }), function (error, response, body) {
    if (error != null) {
      let msg = 'server initialization has failed :' + error;
      serverInitDeferred.rejected(msg);
      return;
    }
    let parsed = JSON.parse(body);
    serverInitDeferred.resolve(parsed);
  });
  return serverInitDeferred.promise;
}

let evalCompleteDeferred;
function evalModel(modelName) {
  evalCompleteDeferred = deferred();
  model = new Model(modelName);

  console.log('\n\n\n\n\n====== evaluation of model ' + modelName + ', ID : ' + appId + ' ======\n');

  initServer()(function(initSummary) {
    evaluate(initSummary["valTotal"], initSummary["testTotal"])()(function () {
    evalCompleteDeferred.resolve();
    }, function(err) {
      console.log('evaluation model '+modelNames[modelIndex]+' failed', err);
      evalCompleteDeferred.reject(err);
    })
  }, function(err) {
    evalCompleteDeferred.reject(err);
  })
  return evalCompleteDeferred.promise;
}

function collectData(type, size) {
  let evaluator = new Evaluator(appId, model, type, size);
  return evaluator.collectMeasurement();
}

function evaluate(valSize, testSize) {
  console.log('validation set size : ', valSize);
  console.log('test set size : ', testSize);
  console.log('===========================================\n');

  collectData('val', valSize)(function() {
    console.log('//// validation dataset evaluation completed ////\n');
    displayResult('val');

    collectData('test', testSize)(function() {
      console.log('//// test dataset evaluation completed ////\n');
      displayResult('test');
    },function(msg) {
      console.log('//// test dataset evaluation failed ////\n');
      evalCompleteDeferred.reject(msg);
    });

  },function(msg) {
    console.log('//// val dataset evaluation failed ////\n');
    evalCompleteDeferred.reject(msg);
  });
}

let modelIndex = 0;
let overAllEvaluationDeferred = deferred();
function evalAllModels() {
  appId = new Date().getTime();
  evalModel(modelNames[modelIndex])(function() {
    modelIndex++;
    if (modelIndex < modelNames.length) {
      evalAllModels();
    } else {
      overAllEvaluationDeferred.resolve();
    }
  }, function(err) {
    console.log('model eval failed');
    overAllEvaluationDeferred.reject();
  });
  return overAllEvaluationDeferred.promise;
}

let warmUpDeferred;
function warmUp() {
  warmUpDeferred = deferred();
  initServer()(function() {
    request(encodeData(serverURL+'/get_audio', {
      index : 0,
      type : 'test',
      appId : appId,
      mfcc : false
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
  }, function(err) {
    let msg = 'init server for warm up failed : ' + error;
    warmUpDeferred.reject(msg);
  })
  return warmUpDeferred.promise;
}

warmUp()(function() {
  console.log('warm up is completed');
  evalAllModels()(function() {
    console.log('evaluation is completed');
  });

},function(msg) {
  console.log('warming up failed : ' + msg);
});

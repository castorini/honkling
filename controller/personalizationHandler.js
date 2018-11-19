
let model = new SpeechResModel("RES8_NARROW");
let appId = new Date().getTime();

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
  console.log(initSummary);

  // sample code for test training
  $.ajax({
    dataType: 'json',
    url: serverURL+'/get_audio_batch',
    crossDomain: true,
    data: {
      index: 13,
      type: 'test',
      appId: appId,
      mfcc: true,
      batch_size: 10
    }
  }).done(function(data) {

    y = []
    for (var i = 0; i < data.batch_size; i++) {
      y.push(commands.indexOf(data.command[i]))
    }
    x = data.features
    model.train(x, y);

  }).fail(function() {
    console.log('audio retrieval failed');
  });

}).fail(function() {
  console.log('initialization failed because server is unreachable');
});

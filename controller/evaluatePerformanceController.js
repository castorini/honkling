const dataSizePerCommand = 20;
console.log(model.weights['commands']);

// retrieval of single audio
function getAudio(command, index) {
  $.ajax({
    dataType: 'json',
    url: 'http://honkling.cs.uwaterloo.ca:8080/get_audio',
    crossDomain: true,
    data: {command:command, index:index}
  }).done(function(data) {
    console.log('audio received');
    console.log(data);
  }).fail(function(err) {
    console.log('failed');
    console.log(err);
  });
}

// triggering audio file list initialization
$.ajax({
  dataType: 'json',
  url: 'http://honkling.cs.uwaterloo.ca:8080/init',
  crossDomain: true,
  data: {commands:model.weights['commands'].toString(), size:dataSizePerCommand},
}).done(function() {
  console.log('completed');
  getAudio('stop', 3)

}).fail(function(err) {
  console.log('failed');
  console.log(err);
});

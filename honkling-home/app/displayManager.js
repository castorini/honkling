const visualizer = require('visualizer.js')

const viz = visualizer({
  parent: '#waveform'
})
const listSize = 4;

module.exports.displayAudio = function() {
  $('.displayDiv').removeClass('visible');
  $('.displayDiv').hide();
  $('#waveform').show();
  $('#waveform').addClass('visible');
}

module.exports.displayProcess = function(port) {
  $('.displayDiv').removeClass('visible');
  $('.displayDiv').hide();
  $('#processDiv').show();
  $('#processDiv').addClass('visible');
  $('#processDiv').html('<object data="http://localhost:'+port+'">');
}

module.exports.displayList = function() {
  $('.displayDiv').removeClass('visible');
  $('.displayDiv').hide();
  $('#listDiv').show();
  $('#listDiv').addClass('visible');
}

module.exports.updateList = function(heading, items, index) {
  let currentListSize = 0;
  $("#listWrapper").empty();

  let num = Math.ceil(index / listSize) + 1;
  let den = Math.ceil(items.length / listSize)
  $("#listWrapper").append($("<b>").text(heading + " (" + num + "/" + den + ")"));

  while (index < items.length && currentListSize < listSize) {
    $("#listWrapper").append($("<li>").text(items[index]));
    index++;
    currentListSize++;
  }

  if (index < items.length) {
    let remaining = items.length - index;
    $("#listWrapper").append($("<span>").text(remaining + " more exist"));
  } else {
    $("#listWrapper").append($("<span>").text("total size : " + items.length));
  }

  return index;
}

let previousWindow = undefined;

module.exports.displayStatusBar = function(msg) {
  $('.displayDiv').hide();
  $('#statusBarDiv').show();
  $('#statusBar').text(msg);

  setTimeout(function() {
    $('#statusBarDiv').hide();
    $('.visible').show();
  }, 3000)
}

module.exports.updateCommandText = function(text) {
  $('.js-search').val(text)
}

module.exports.listSize = listSize;

require('./config.js');
var Model = require('./model.js');
var request = require('request');

let appId = new Date().getTime();

let data = {
  commands : commands.toString(),
  randomSeed :10,
  sampleRate : audioConfig['offlineSampleRate'],
  appId : appId
}

request(encodeData(serverURL+'/init', data), function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  console.log('body:', body); // Print the HTML for the Google homepage.
});

let model = new Model();

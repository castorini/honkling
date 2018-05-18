// const tf = require('@tensorflow/tfjs');
const config = require('config');
//const audioLoader = require('audio-loader')

function SpeechDataset() {
  this.dataConfig = config.get('Data');
}

SpeechDataset.prototype.preprocess = function(fileName, silence=false) {
	fileName = this.dataConfig.data_folder +'/'+ fileName;

	audioLoader(fileName).then(function (buffers) {
		console.log(buffers);
	}, function (error) {
		console.log(error);
	})
	// let context = new AudioContext();

	// let tune = new Audio(fileName);
	// let source = context.createMediaElementSource(tune);

	// 	let option = {
	//   "audioContext":context, // required
	//   "source":source, // required
	//   "bufferSize": this.dataConfig.input_length, // required
	//   // "hopSize": 256, // optional
	//   // "windowingFunction": "hamming", // optional
	//   // "featureExtractors": ["rms"], // optional - A string, or an array of strings containing the names of features you wish to extract.
	//   // "callback": Function // optional callback in which to receive the features for each buffer
	// }

	// let meydaAnalyzer = Meyda.createMeydaAnalyzer(options);
}

SpeechDataset.prototype.load = async function() {
	if (this.dataConfig.mic) {

	} else {
		this.preprocess('test.wav');
	}
}

SpeechDataset.prototype.nextTrainBatch = function(batchSize) {}

SpeechDataset.prototype.nextTestBatch = function(batchSize) {}

SpeechDataset.prototype.nextBatch = function(batchSize, data, index) {}

module.exports = SpeechDataset;
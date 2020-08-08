const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
var urlencodedParser = bodyParser.urlencoded({extended: false});

var fs = require('fs');
var WaveFile = require('wavefile').WaveFile;

function DataLoader(config) {
	this.config = config;
	this.file_path = this.config.dataLoaderConfig.audio_file_path
  console.log("metadata_file: ", this.config.dataLoaderConfig.metadata_file)

  let rawMetaData = fs.readFileSync(this.config.dataLoaderConfig.metadata_file);
  let MetaDataJson = String(rawMetaData)
      .replace(/\n/gi, ',')
      .slice(0, -1);

  this.total_audio_length = 0;
  this.metadata= JSON.parse(`[${MetaDataJson}]`);

  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  this.metadata = shuffle(this.metadata);

  // default values
  this.sample_rate = this.config.sampleRate;
  this.window_size = this.sample_rate * this.config.windowSize;
  this.stride_size = this.sample_rate * this.config.dataLoaderConfig.stride_size_seconds;
  this.padding_size = this.sample_rate * this.config.dataLoaderConfig.padding_size_seconds;

  this.total_test_data = this.metadata.length;
  this.current_frame_index = 0;
  this.current_file_index = 0;
  this.current_sample = null;
}

DataLoader.prototype.loadSample = function(file_name, transcription) {
  // load data from file_name
  let buffer = fs.readFileSync(this.file_path + file_name);
  let wav = new WaveFile(buffer);
  wav.toBitDepth("32f");
  // in case the file has different sample rate
  wav.toSampleRate(this.sample_rate);

  let samples = [].slice.call( wav.getSamples())

  var padding = new Array(this.padding_size);
  for (var i = 0; i < this.padding_size; i++) {
      padding[i] = Math.random() * this.config.dataLoaderConfig.noise_threshold;
  }

  this.current_sample = {
      'file_name': file_name,
      'data': samples.concat(padding),
      'transcription': transcription,
      'label': transcription.toLowerCase() == "hey firefox"
  }

  console.log('#################');
  console.log('index: ', this.current_file_index, " / ", this.total_test_data);
  console.log('loaded audio: ', this.file_path+file_name);
  // console.log('\tbyteRate: ', wav.fmt.byteRate);
  // console.log('\tsampleRate: ', wav.fmt.sampleRate);
  // console.log('\tnumChannels: ', wav.fmt.numChannels);
  // console.log('\taudioFormat: ', wav.fmt.audioFormat);
  // console.log('\tformat: ', wav.format);
  // console.log('\tbitDepth: ', wav.bitDepth);
  console.log('\tnum_samples: ', this.current_sample['data'].length, "(", this.current_sample['data'].length / this.sample_rate, "s)");
  console.log('\tlabel: ', this.current_sample['label'], "(", transcription, ")");
  console.log('#################');

  this.total_audio_length += (this.current_sample['data'].length / this.sample_rate);
}

DataLoader.prototype.getNextWindow = function() {

  this.current_frame_index += this.stride_size;

  if (this.current_sample == null) {
      // base case
      this.current_frame_index = 0;
      this.current_file_index = 0;
      this.total_audio_length = 0;

      this.loadSample(this.metadata[this.current_file_index]["path"], this.metadata[this.current_file_index]["transcription"]);
  } else {
      let remaining_frames = this.current_sample['data'].length - this.current_frame_index;
      if (remaining_frames < this.window_size) {
          // not enough remaining_frames

          this.current_frame_index = 0;
          this.current_file_index += 1;

          if (this.current_file_index == this.metadata.length) {
              console.log("no more data")
              console.log('total audio length:', this.total_audio_length, 's');
              return {};
          }

          this.loadSample(this.metadata[this.current_file_index]["path"], this.metadata[this.current_file_index]["transcription"]);
      }
  }

  let sample_window = this.current_sample['data'].slice(this.current_frame_index, this.current_frame_index + this.window_size);

  let sample = {
    'file_name': this.current_sample['file_name'],
    'audio_length_ms': (this.current_sample['data'].length / this.sample_rate) * 1000,
    'data': sample_window,
    'transcription': this.current_sample['transcription'],
    'label': this.current_sample['label']
  }

  // let start_s = this.current_frame_index / this.sample_rate;
  // let end_s = (this.current_frame_index + this.window_size) / this.sample_rate;
  //
  // console.log('returned sample: ', sample['file_name']);
  // console.log('\tnum_samples: ', sample['data'].length, "(", sample['data'].length / this.sample_rate, "s)");
  // console.log('\tduration: ', start_s, "s ~ ", end_s, "s");
  // console.log('\tlabel: ', sample['label'], "(", this.current_sample['transcription'], ")");
  
  return sample
}

module.exports = DataLoader;

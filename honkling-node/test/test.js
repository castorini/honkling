const audioProcessor = require('../audioProcessor');
var expect = require('chai').expect;
const config = require('../config');
var fs = require('fs');
const matrix = require('../matrix');
var wav = require('node-wav');
const KeywordSpotter = require('../main');
const SpeechResModel = require('../speechResModel');

describe('#audioProcessor', function() {
    it('padding audio when raw audio is shorter than 1s', function() {
      let buffer = fs.readFileSync('test/cat.wav');
      let result = wav.decode(buffer);
      let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
      let mfccData = audioProcessor.getMFCC(rawAudioData);

      expect(mfccData[0].length).to.equal(40);
      expect(mfccData.length).to.equal(101);
    });

    it('slicing audio when raw audio is greater than 1s', function() {
      let buffer = fs.readFileSync('test/cat.wav');
      let result = wav.decode(buffer);
      let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
      rawAudioData = rawAudioData.concat(rawAudioData);
      let mfccData = audioProcessor.getMFCC(rawAudioData);

      expect(mfccData[0].length).to.equal(40);
      expect(mfccData.length).to.equal(101);
    });
});

describe('#modelPrediction', function() {
    // negative tests

    it('negative prediction w/ RES8 - cat', function() {
      let model = new SpeechResModel("RES8", "RES8", config.commands);
      let buffer = fs.readFileSync('test/cat.wav');
      let result = wav.decode(buffer);
      let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
      let mfccData = audioProcessor.getMFCC(rawAudioData);
      let prediction = model.predict(matrix.transposeFlatten2d(mfccData));
      expect(prediction).to.equal("unknown");
    });

    it('negative prediction w/ RES8_40 - dog', function() {
      let model = new SpeechResModel("RES8_40", "RES8_40", config.commands);
      let buffer = fs.readFileSync('test/dog.wav');
      let result = wav.decode(buffer);
      let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
      let mfccData = audioProcessor.getMFCC(rawAudioData);
      let prediction = model.predict(matrix.transposeFlatten2d(mfccData));
      expect(prediction).to.equal("unknown");
    });

    it('negative prediction w/ RES8_80 - house', function() {
      let model = new SpeechResModel("RES8_80", "RES8_80", config.commands);
      let buffer = fs.readFileSync('test/house.wav');
      let result = wav.decode(buffer);
      let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
      let mfccData = audioProcessor.getMFCC(rawAudioData);
      let prediction = model.predict(matrix.transposeFlatten2d(mfccData));
      expect(prediction).to.equal("unknown");
    });

    it('negative prediction w/ RES8_NARROW - house', function() {
      let model = new SpeechResModel("RES8_NARROW", "RES8_NARROW", config.commands);
      let buffer = fs.readFileSync('test/house.wav');
      let result = wav.decode(buffer);
      let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
      let mfccData = audioProcessor.getMFCC(rawAudioData);
      let prediction = model.predict(matrix.transposeFlatten2d(mfccData));
      expect(prediction).to.equal("unknown");
    });

    it('negative prediction w/ RES8_NARROW_40 - dog', function() {
      let model = new SpeechResModel("RES8_NARROW_40", "RES8_NARROW_40", config.commands);
      let buffer = fs.readFileSync('test/dog.wav');
      let result = wav.decode(buffer);
      let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
      let mfccData = audioProcessor.getMFCC(rawAudioData);
      let prediction = model.predict(matrix.transposeFlatten2d(mfccData));
      expect(prediction).to.equal("unknown");
    });

    it('negative prediction w/ RES8_NARROW_80 - bird', function() {
      let model = new SpeechResModel("RES8_NARROW_80", "RES8_NARROW_80", config.commands);
      let buffer = fs.readFileSync('test/bird.wav');
      let result = wav.decode(buffer);
      let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
      let mfccData = audioProcessor.getMFCC(rawAudioData);
      let prediction = model.predict(matrix.transposeFlatten2d(mfccData));
      expect(prediction).to.equal("unknown");
    });


    // positive tests

    it('positive prediction w/ RES8 - no', function() {
      let model = new SpeechResModel("RES8", "RES8", config.commands);
      let buffer = fs.readFileSync('test/no.wav');
      let result = wav.decode(buffer);
      let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
      let mfccData = audioProcessor.getMFCC(rawAudioData);
      let prediction = model.predict(matrix.transposeFlatten2d(mfccData));
      expect(prediction).to.equal("no");
    });

    it('positive prediction w/ RES8_40 - yes', function() {
      let model = new SpeechResModel("RES8_40", "RES8_40", config.commands);
      let buffer = fs.readFileSync('test/yes.wav');
      let result = wav.decode(buffer);
      let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
      let mfccData = audioProcessor.getMFCC(rawAudioData);
      let prediction = model.predict(matrix.transposeFlatten2d(mfccData));
      expect(prediction).to.equal("yes");
    });

    it('positive prediction w/ RES8_80 - stop', function() {
      let model = new SpeechResModel("RES8_80", "RES8_80", config.commands);
      let buffer = fs.readFileSync('test/stop.wav');
      let result = wav.decode(buffer);
      let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
      let mfccData = audioProcessor.getMFCC(rawAudioData);
      let prediction = model.predict(matrix.transposeFlatten2d(mfccData));
      expect(prediction).to.equal("stop");
    });

    it('positive prediction w/ RES8_NARROW - go', function() {
      let model = new SpeechResModel("RES8_NARROW", "RES8_NARROW", config.commands);
      let buffer = fs.readFileSync('test/go.wav');
      let result = wav.decode(buffer);
      let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
      let mfccData = audioProcessor.getMFCC(rawAudioData);
      let prediction = model.predict(matrix.transposeFlatten2d(mfccData));
      expect(prediction).to.equal("go");
    });

    it('positive prediction w/ RES8_NARROW_40 - no', function() {
      let model = new SpeechResModel("RES8_NARROW_40", "RES8_NARROW_40", config.commands);
      let buffer = fs.readFileSync('test/no.wav');
      let result = wav.decode(buffer);
      let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
      let mfccData = audioProcessor.getMFCC(rawAudioData);
      let prediction = model.predict(matrix.transposeFlatten2d(mfccData));
      expect(prediction).to.equal("no");
    });

    it('positive prediction w/ RES8_NARROW_80 - yes', function() {
      let model = new SpeechResModel("RES8_NARROW_80", "RES8_NARROW_80", config.commands);
      let buffer = fs.readFileSync('test/yes.wav');
      let result = wav.decode(buffer);
      let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
      let mfccData = audioProcessor.getMFCC(rawAudioData);
      let prediction = model.predict(matrix.transposeFlatten2d(mfccData));
      expect(prediction).to.equal("yes");
    });
});

describe('#keywordSpotter', function() {
  it('getCommands', function() {
    let keywordSpotter = new KeywordSpotter();
    let commands = keywordSpotter.getCommands();
    expect(commands.length).to.equal(12);
  });

  // negative tests

  it('negative prediction w/ RES8 - cat', function() {
    let keywordSpotter = new KeywordSpotter("RES8");
    let buffer = fs.readFileSync('test/cat.wav');
    let result = wav.decode(buffer);
    let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
    let prediction = keywordSpotter.predict(rawAudioData);
    expect(prediction).to.equal("unknown");
  });

  it('negative prediction w/ RES8_40 - dog', function() {
    let keywordSpotter = new KeywordSpotter("RES8_40");
    let buffer = fs.readFileSync('test/dog.wav');
    let result = wav.decode(buffer);
    let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
    let prediction = keywordSpotter.predict(rawAudioData);
    expect(prediction).to.equal("unknown");
  });

  it('negative prediction w/ RES8_80 - house', function() {
    let keywordSpotter = new KeywordSpotter("RES8_80");
    let buffer = fs.readFileSync('test/house.wav');
    let result = wav.decode(buffer);
    let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
    let prediction = keywordSpotter.predict(rawAudioData);
    expect(prediction).to.equal("unknown");
  });

  it('negative prediction w/ RES8_NARROW - house', function() {
    let keywordSpotter = new KeywordSpotter("RES8_NARROW");
    let buffer = fs.readFileSync('test/house.wav');
    let result = wav.decode(buffer);
    let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
    let prediction = keywordSpotter.predict(rawAudioData);
    expect(prediction).to.equal("unknown");
  });

  it('negative prediction w/ RES8_NARROW_40 - dog', function() {
    let keywordSpotter = new KeywordSpotter("RES8_NARROW_40");
    let buffer = fs.readFileSync('test/dog.wav');
    let result = wav.decode(buffer);
    let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
    let prediction = keywordSpotter.predict(rawAudioData);
    expect(prediction).to.equal("unknown");
  });

  it('negative prediction w/ RES8_NARROW_80 - bird', function() {
    let keywordSpotter = new KeywordSpotter("RES8_NARROW_80");
    let buffer = fs.readFileSync('test/bird.wav');
    let result = wav.decode(buffer);
    let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
    let prediction = keywordSpotter.predict(rawAudioData);
    expect(prediction).to.equal("unknown");
  });


  // positive tests

  it('positive prediction w/ RES8 - no', function() {
    let keywordSpotter = new KeywordSpotter("RES8");
    let buffer = fs.readFileSync('test/no.wav');
    let result = wav.decode(buffer);
    let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
    let prediction = keywordSpotter.predict(rawAudioData);
    expect(prediction).to.equal("no");
  });

  it('positive prediction w/ RES8_40 - yes', function() {
    let keywordSpotter = new KeywordSpotter("RES8_40");
    let buffer = fs.readFileSync('test/yes.wav');
    let result = wav.decode(buffer);
    let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
    let prediction = keywordSpotter.predict(rawAudioData);
    expect(prediction).to.equal("yes");
  });

  it('positive prediction w/ RES8_80 - stop', function() {
    let keywordSpotter = new KeywordSpotter("RES8_80");
    let buffer = fs.readFileSync('test/stop.wav');
    let result = wav.decode(buffer);
    let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
    let prediction = keywordSpotter.predict(rawAudioData);
    expect(prediction).to.equal("stop");
  });

  it('positive prediction w/ RES8_NARROW - go', function() {
    let keywordSpotter = new KeywordSpotter("RES8_NARROW");
    let buffer = fs.readFileSync('test/go.wav');
    let result = wav.decode(buffer);
    let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
    let prediction = keywordSpotter.predict(rawAudioData);
    expect(prediction).to.equal("go");
  });

  it('positive prediction w/ RES8_NARROW_40 - no', function() {
    let keywordSpotter = new KeywordSpotter("RES8_NARROW_40");
    let buffer = fs.readFileSync('test/no.wav');
    let result = wav.decode(buffer);
    let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
    let prediction = keywordSpotter.predict(rawAudioData);
    expect(prediction).to.equal("no");
  });

  it('positive prediction w/ RES8_NARROW_80 - yes', function() {
    let keywordSpotter = new KeywordSpotter("RES8_NARROW_80");
    let buffer = fs.readFileSync('test/yes.wav');
    let result = wav.decode(buffer);
    let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
    let prediction = keywordSpotter.predict(rawAudioData);
    expect(prediction).to.equal("yes");
  });
});

describe('#mojibar model prediction', function() {
  it('getCommands', function() {
    let keywordSpotter = new KeywordSpotter("mojibar");
    let commands = keywordSpotter.getCommands();
    expect(commands.length).to.equal(18);
  });

  // negative tests

  it('mojibar positive prediction - one', function() {
    let keywordSpotter = new KeywordSpotter("mojibar");
    let buffer = fs.readFileSync('test/one.wav');
    let result = wav.decode(buffer);
    let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
    let prediction = keywordSpotter.predict(rawAudioData);
    expect(prediction).to.equal("one");
  });

  it('mojibar positive prediction - three', function() {
    let keywordSpotter = new KeywordSpotter("mojibar");
    let buffer = fs.readFileSync('test/three.wav');
    let result = wav.decode(buffer);
    let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
    let prediction = keywordSpotter.predict(rawAudioData);
    expect(prediction).to.equal("three");
  });


  it('mojibar negative prediction - dog', function() {
    let keywordSpotter = new KeywordSpotter("mojibar");
    let buffer = fs.readFileSync('test/dog.wav');
    let result = wav.decode(buffer);
    let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
    let prediction = keywordSpotter.predict(rawAudioData);
    expect(prediction).to.equal("unknown");
  });

  it('mojibar negative prediction - house', function() {
    let keywordSpotter = new KeywordSpotter("mojibar");
    let buffer = fs.readFileSync('test/house.wav');
    let result = wav.decode(buffer);
    let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
    let prediction = keywordSpotter.predict(rawAudioData);
    expect(prediction).to.equal("unknown");
  });
});

describe('#light model prediction', function() {
  it('getCommands', function() {
    let keywordSpotter = new KeywordSpotter("light", "res8", 0.7);
    let commands = keywordSpotter.getCommands();
    expect(commands.length).to.equal(6);

    let threshold = keywordSpotter.getPredThreshold();
    expect(threshold).to.equal(0.7);
  });

  // negative tests

  it('light positive prediction - up', function() {
    let keywordSpotter = new KeywordSpotter("light");
    let buffer = fs.readFileSync('test/off.wav');
    let result = wav.decode(buffer);
    let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
    let prediction = keywordSpotter.predict(rawAudioData);
    expect(prediction).to.equal("off");
  });

  it('light positive prediction - down', function() {
    let keywordSpotter = new KeywordSpotter("light");
    let buffer = fs.readFileSync('test/down.wav');
    let result = wav.decode(buffer);
    let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
    let prediction = keywordSpotter.predict(rawAudioData);
    expect(prediction).to.equal("down");
  });


  it('light negative prediction - dog', function() {
    let keywordSpotter = new KeywordSpotter("light");
    let buffer = fs.readFileSync('test/dog.wav');
    let result = wav.decode(buffer);
    let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
    let prediction = keywordSpotter.predict(rawAudioData);
    expect(prediction).to.equal("unknown");
  });

  it('light negative prediction - house', function() {
    let keywordSpotter = new KeywordSpotter("light");
    let buffer = fs.readFileSync('test/dog.wav');
    let result = wav.decode(buffer);
    let rawAudioData = Array.prototype.slice.call(result.channelData[0]);
    let prediction = keywordSpotter.predict(rawAudioData);
    expect(prediction).to.equal("unknown");
  });
});

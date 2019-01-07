const config = require('./config');
const Meyda = require('./meyda/main');

let meydaHopSize = config.sampleRate / 1000 * config.meydaWindowSlidingSize;

exports.getMFCC = function(data) {
  if (data.length <= config.sampleRate) {
    // center algin by padding both size with zeros
    let padding_size = Math.floor((config.sampleRate + meydaHopSize - data.length) / 2);
    let padding = new Array(padding_size).fill(0);
    data = padding.concat(data.concat(padding));
  } else if (data.length >= (config.sampleRate + meydaHopSize)) {
    // console.warn('raw audio should be less than ', config.sampleRate + meydaHopSize);
    data = data.slice(0, config.sampleRate + meydaHopSize);
  }

  let mfcc = [];
  let startIndex = 0;
  let frame = data.slice(0, config.meydaBufferSize);
  while (frame.length != 0) {
    if (frame.length < config.meydaBufferSize) {
      // pad last window with zeros
      let padding = new Array(config.meydaBufferSize - frame.length).fill(0);
      frame = frame.concat(padding);
    }
    mfcc.push(Meyda.extract('mfcc', frame));
    data = data.slice(meydaHopSize);
    frame = data.slice(0, config.meydaBufferSize);
  }

  return mfcc;
}

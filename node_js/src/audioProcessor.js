require('./config.js');
let Meyda = require('../meyda/main.js');

let meydaHopSize = audioConfig.offlineSampleRate / 1000 * audioConfig.offlineHopSize;

getMFCC = function(data) {
  let padding = new Array(meydaHopSize/2).fill(0);
  data = padding.concat(data.concat(padding)); // librosa.pad_center
  let mfcc = [];
  let startIndex = 0;
  let frame = data.slice(0, audioConfig.meydaBufferSize);
  while (frame.length != 0) {
    if (frame.length < audioConfig.meydaBufferSize) {
      let padding = new Array(audioConfig.meydaBufferSize - frame.length).fill(0);
      frame = frame.concat(padding);
    }
    mfcc.push(Meyda.extract('mfcc', frame));
    data = data.slice(meydaHopSize);
    frame = data.slice(0, audioConfig.meydaBufferSize);
  }
  return mfcc;
}

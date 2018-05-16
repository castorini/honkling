# wav-decoder
[![Build Status](https://img.shields.io/travis/mohayonao/wav-decoder.svg?style=flat-square)](https://travis-ci.org/mohayonao/wav-decoder)
[![NPM Version](https://img.shields.io/npm/v/wav-decoder.svg?style=flat-square)](https://www.npmjs.org/package/wav-decoder)
[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](https://mohayonao.mit-license.org/)

> promise-based wav decoder

## Installation

```
$ npm install wav-decoder
```

## API

- `decode(src: ArrayBuffer, [opts: object]): Promise<AudioData>`
  - if provide an instance of `Buffer`, it is converted to `ArrayBuffer` like `Uint8Array.from(src).buffer` implicitly.
  - `opts.symmetric` decode to symmetrical values (see [#14](https://github.com/mohayonao/wav-decoder/issues/14))
- `decode.sync(src: ArrayBuffer, [opts: object]): AudioData`
  - synchronous version

##### Returns

```js
interface AudioData {
  sampleRate: number;
  channelData: Float32Array[];
}
```

## Usage

```js
const fs = require("fs");
const WavDecoder = require("wav-decoder");

const readFile = (filepath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, (err, buffer) => {
      if (err) {
        return reject(err);
      }
      return resolve(buffer);
    });
  });
};

readFile("foobar.wav").then((buffer) => {
  return WavDecoder.decode(buffer);
}).then(function(audioData) {
  console.log(audioData.sampleRate);
  console.log(audioData.channelData[0]); // Float32Array
  console.log(audioData.channelData[1]); // Float32Array
});
```

## License
MIT

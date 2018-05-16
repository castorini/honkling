# is-wav [![Build Status](https://travis-ci.org/hemanth/is-wav.svg?branch=master)](https://travis-ci.org/hemanth/is-wav)

> Check if a Buffer/Uint8Array is a WAV file.

## Install

```sh
$ npm install --save is-wav
```

```sh
$ bower install --save is-wav
```

```sh
$ component install hemanth/is-wav
```


## Usage

##### Node.js

```js
var readChunk = require('read-chunk'); // npm install read-chunk
var isWav = require('is-wav');
var buffer = readChunk('meow.wav', 0, 12);

isWav(buffer);
//=> true
```

##### Browser

```js
var xhr = new XMLHttpRequest();
xhr.open('GET', 'meow.wav');
xhr.responseType = 'arraybuffer';

xhr.onload = function () {
	isWav(new Uint8Array(this.response));
	//=> true
};

xhr.send();
```


## API

### isWav(buffer)

Accepts a Buffer (Node.js) or Uint8Array.

It only needs the first 12 bytes.


## License

MIT © [Hemanth.HM](http://h3manth.com)

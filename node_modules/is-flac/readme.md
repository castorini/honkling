# is-flac [![Build Status](https://travis-ci.org/hemanth/is-flac.svg?branch=master)](https://travis-ci.org/hemanth/is-flac)

> Check if a Buffer/Uint8Array is a FLAC file.

## Install

```sh
$ npm install --save is-flac
```

```sh
$ bower install --save is-flac
```

```sh
$ component install hemanth/is-flac
```


## Usage

##### Node.js

```js
var readChunk = require('read-chunk'); // npm install read-chunk
var isFlac = require('is-flac');
var buffer = readChunk('meow.wav', 0, 4);

isFlac(buffer);
//=> true
```

##### Browser

```js
var xhr = new XMLHttpRequest();
xhr.open('GET', 'meow.flac');
xhr.responseType = 'arraybuffer';

xhr.onload = function () {
	isFlac(new Uint8Array(this.response));
	//=> true
};

xhr.send();
```


## API

### isFlac(buffer)

Accepts a Buffer (Node.js) or Uint8Array.

It only needs the first 4 bytes.


## License

MIT © [Hemanth.HM](http://h3manth.com)

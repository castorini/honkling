# is-mp3 [![Build Status](https://travis-ci.org/hemanth/is-mp3.svg?branch=master)](https://travis-ci.org/hemanth/is-mp3)

> Check if a Buffer/Uint8Array is a MP3 file.

## Install

```sh
$ npm install --save is-mp3
```

```sh
$ bower install --save is-mp3
```

```sh
$ component install hemanth/is-mp3
```


## Usage

##### Node.js

```js
var readChunk = require('read-chunk'); // npm install read-chunk
var isMp3 = require('is-mp3');
var buffer = readChunk('meow.mp3', 0, 3);

isMp3(buffer);
//=> true
```

##### Browser

```js
var xhr = new XMLHttpRequest();
xhr.open('GET', 'meow.mp3');
xhr.responseType = 'arraybuffer';

xhr.onload = function () {
	isMp3(new Uint8Array(this.response));
	//=> true
};

xhr.send();
```


## API

### isMp3(buffer)

Accepts a Buffer (Node.js) or Uint8Array.

It only needs the first 4 bytes.


## License

MIT © [Hemanth.HM](http://h3manth.com)

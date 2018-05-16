# is-m4a [![Build Status](https://travis-ci.org/hemanth/is-m4a.svg?branch=master)](https://travis-ci.org/hemanth/is-m4a)

> Check if a Buffer/Uint8Array is a m4a file.

## Install

```sh
$ npm install --save is-m4a
```

```sh
$ bower install --save is-m4a
```

```sh
$ component install hemanth/is-m4a
```


## Usage

##### Node.js

```js
var readChunk = require('read-chunk'); // npm install read-chunk
var isM4a = require('is-m4a');
var buffer = readChunk('meow.m4a', 0, 8);

isM4a(buffer);
//=> true
```

##### Browser

```js
var xhr = new XMLHttpRequest();
xhr.open('GET', 'meow.m4a');
xhr.responseType = 'arraybuffer';

xhr.onload = function () {
	isM4a(new Uint8Array(this.response));
	//=> true
};

xhr.send();
```


## API

### isM4a(buffer)

Accepts a Buffer (Node.js) or Uint8Array.

It only needs the first 4 bytes.


## License

MIT © [Hemanth.HM](http://h3manth.com)

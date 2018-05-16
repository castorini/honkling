# is-ogg [![Build Status](https://travis-ci.org/hemanth/is-ogg.svg?branch=master)](https://travis-ci.org/hemanth/is-ogg)

> Check if a Buffer/Uint8Array is an [OGG](http://en.wikipedia.org/wiki/Ogg) file.

## Install

```sh
$ npm install --save is-ogg
```

```sh
$ bower install --save is-ogg
```

```sh
$ component install hemanth/is-ogg
```


## Usage

##### Node.js

```js
var readChunk = require('read-chunk'); // npm install read-chunk
var isOgg = require('is-ogg');
var buffer = readChunk('meow.ogg', 0, 4);

isOgg(buffer);
//=> true
```

##### Browser

```js
var xhr = new XMLHttpRequest();
xhr.open('GET', 'meow.ogg');
xhr.responseType = 'arraybuffer';

xhr.onload = function () {
	isOgg(new Uint8Array(this.response));
	//=> true
};

xhr.send();
```


## API

### isOgg(buffer)

Accepts a Buffer (Node.js) or Uint8Array.

It only needs the first 4 bytes.


## License

MIT © [Hemanth.HM](http://h3manth.com)

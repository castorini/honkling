AudioBuffer
=============

An implementation of [Web Audio API's AudioBuffer](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#AudioBuffer) for node.js.
With extra-sugar for slicing, concatenating, creating, ... audiobuffers.

Getting started 
=================

Install `AudioBuffer` with `npm` :

```
npm install audiobuffer
```

Then import it in your code, and do your stuff :

```javascript
var AudioBuffer = require('audiobuffer')
var audioBuffer = new AudioBuffer(1, 100000, 44100)
```


API
=====

###AudioBuffer(numberOfChannels, length, sampleRate)

Creates an empty `AudioBuffer` with `numberOfChannels` channels and `length` frames.


####getChannelData(channel)

Returns a `channel`.


####slice(start, end)

Returns a slice of the calling `AudioBuffer`.
The arguments have the same meaning as a standard `Array.slice`.
The slice happens in the length, therefore the returned buffer has the same number of channels and the same sample rate as the calling `AudioBuffer`.


####concat(audioBuffer)

Returns a new `AudioBuffer`, result of the concatenation of the calling instance with `audioBuffer`.
`audioBuffer` must have the same number of channels and the same sample rate as the calling instance, or an error will be thrown.
This method behaves similarly to `Array.concat`.
The concatenation happens in the length, therefore the returned buffer has the same number of channels and the same sample rate than the calling `AudioBuffer`.


####set(audioBuffer, offset)

Sets the calling audio buffer channels with the values from `audioBuffer`, starting at `offset`


###Class methods

####filledWithVal(val, numberOfChannels, length, sampleRate)

Returns an `AudioBuffer`, each sample filled with `val`.


####fromArray(array, sampleRate)

Returns an `AudioBuffer`, with data taken from `array`. Example :

```javascript
// Creates a stereo AudioBuffer of length 5 and sample rate 22050.
var audioBuffer = AudioBuffer.fromArray([
  [1, 0.5, 0.2, 1, 0.5],
  [-1, -0.8, -0.7, -0.6, 0.3],
], 22050)
```


Changelog
===========

0.2.0

- AudioBuffer.set

0.1.0

- first release

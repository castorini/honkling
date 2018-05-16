var _ = require('underscore')
  , inherits = require('util').inherits
  , Transform = require('stream').Transform
  , chai = require('chai')
  , expect = chai.expect
chai.Assertion.includeStack = true

// This creates a read/write stream, which takes buffers of data as input,
// and outputs decoded data as arrays.
// The data is decoded using a `BufferDecoder`, and `format` is the same as for `BufferDecoder`.
var StreamDecoder = module.exports.StreamDecoder = function(format, opts) {
  var self = this
  Transform.call(this, {})
  this.opts = _.defaults(opts || {}, {
    pad: false
  })
  this.format = format
  this._decoder = new BufferDecoder(format)
  this._bytesPerFrame = Math.round(this.format.bitDepth / 8) * this.format.numberOfChannels
  this.once('end', function() { self._hasEnded = true })
}
inherits(StreamDecoder, Transform)

_.extend(StreamDecoder.prototype, Transform.prototype, {

  // Reads a block 
  read: function(frameCount) {
    var buffer, size
    if (frameCount !== undefined) size = frameCount * this._bytesPerFrame
    buffer = Transform.prototype.read.call(this, size)
    if (buffer && buffer.length < size && this.opts.pad) {
      var block = this._decoder(buffer)
      return concatBlocks(block, makeBlock(this.format.numberOfChannels, frameCount - block[0].length))
    } else return buffer ? this._decoder(buffer) : buffer
  },

  _transform: function(buffer, encoding, done) {
    this.push(buffer)
    done()
  }

})

// This creates a read/write stream, which takes arrays as input, and outputs
// buffers of encoded data.
// The data is encoded using a `BufferEncoder`, and `format` is the same as for `BufferEncoder`.
var StreamEncoder = module.exports.StreamEncoder = function(format, opts) {
  Transform.call(this, {})
  this.format = format
  this._encoder = new BufferEncoder(format)
}
inherits(StreamEncoder, Transform)

_.extend(StreamEncoder.prototype, Transform.prototype, {

  write: function(block) {
    return Transform.prototype.write.call(this, this._encoder(block))
  },

  _transform: function(buffer, encoding, done) {
    this.push(buffer)
    done()
  }

})

// Creates and returns a function which decodes node `Buffer`
// to an array of `Float32Array`, each corresponding to one channel.
// `format` configures the decoder, and should contain `bitDepth` and `numberOfChannels`.
// !!! If the data contains some incomplete samples they will be dropped
// TODO : format.signed, pcmMax is different if unsigned
var BufferDecoder = module.exports.BufferDecoder = function(format) {
  format = validateFormat(format)
  var byteDepth = Math.round(format.bitDepth / 8)
    , numberOfChannels = format.numberOfChannels
    , pcmMax = Math.pow(2, format.bitDepth) / 2 - 1
    , decodeFunc = 'readInt' + (format.signed ? '' : 'U') + format.bitDepth + format.endianness
    , i, ch, chArray, array, frameCount

  return function(data) {
    frameCount = Math.round(data.length / (byteDepth * numberOfChannels))
    array = []

    // Push samples to each channel
    for (ch = 0; ch < numberOfChannels; ch++) {
      chArray = new Float32Array(frameCount)
      array.push(chArray)
      for (i = 0; i < frameCount; i++)
        chArray[i] = data[decodeFunc](byteDepth * (i * numberOfChannels + ch)) / pcmMax
    }
    return array
  }
}

// Creates and returns a function which encodes an array of Float32Array - each of them
// a separate channel - to a node `Buffer`.
// `format` configures the encoder, and should contain `bitDepth` and `numberOfChannels`.
// !!! This does not check that the data received matches the specified 'format'.
// TODO : format.signed, pcmMax is different if unsigned
var BufferEncoder = module.exports.BufferEncoder = function(format) {
  format = validateFormat(format)
  var byteDepth = Math.round(format.bitDepth / 8)
    , numberOfChannels = format.numberOfChannels
    , pcmMult = Math.pow(2, format.bitDepth) / 2
    , pcmMax = pcmMult - 1
    , pcmMin = -pcmMult
    , encodeFunc = 'writeInt' + (format.signed ? '' : 'U') + format.bitDepth + format.endianness
    , i, ch, chArray, buffer, frameCount

  return function(array) {
    frameCount = array[0].length
    buffer = new Buffer(frameCount * byteDepth * numberOfChannels)

    for (ch = 0; ch < numberOfChannels; ch++) {
      chArray = array[ch]
      for (i = 0; i < frameCount; i++)
        buffer[encodeFunc](
          Math.max(Math.min(Math.round(chArray[i] * pcmMult), pcmMax), pcmMin),
          byteDepth * (i * numberOfChannels + ch)
        )
    }

    return buffer
  }
}

var makeBlock = module.exports.makeBlock = function(numberOfChannels, length) {
  var block = [], ch
  for (ch = 0; ch < numberOfChannels; ch++)
    block.push(new Float32Array(length))
  return block
}

var concatBlocks = module.exports.concatBlocks = function(block1, block2) {
  var numberOfChannels = block1.length
    , block1Length = block1[0].length
    , newBlock = makeBlock(numberOfChannels, block1Length + block2[0].length)
    , ch, chArray
  for (ch = 0; ch < numberOfChannels; ch++) {
    chArray = newBlock[ch]
    chArray.set(block1[ch])
    chArray.set(block2[ch], block1Length)
  }
  return newBlock
}

var sliceBlock = module.exports.sliceBlock = function(block) {
  var sliceArgs = _.toArray(arguments).slice(1)
  return block.map(function(chArray) {
    return chArray.slice.apply(chArray, sliceArgs)
  })
}

var validateFormat = module.exports.validateFormat = function(format) {
  _.defaults(format, {
    bitDepth: 16,
    endianness: 'LE',
    signed: true
  })

  expect(format.bitDepth).to.be.a('number')
    .and.to.satisfy(_oneOf([8, 16, 32]))

  expect(format.numberOfChannels).to.be.a('number')
    .and.to.be.above(0)

  expect(format.endianness).to.be.a('string')
    .and.to.satisfy(_oneOf(['LE', 'BE']))

  expect(format.signed).to.be.a('boolean')
  return format
}

var _oneOf = function(values) {
  return function(val) {
    return _.contains(values, val)
  }
}
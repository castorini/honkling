import clamp from 'clamp'
import colorMap from './big-color-map.js'


// an image that's colored to the beat
export default function vizImage (options={}) {
  let { ctx, cv, bandCount, image, fftSize } = options

  const dampen = true

  let width, height, tX, tY, scale, bufferImgData

  const greyscaled = []

  // offscreen image buffer
  let bufferCv, bufferCtx

  let hueOffset = 0


  const draw = function (spectrum) {
    // if the image hasn't loaded yet, don't render the visualization
    if (!bufferImgData)
      return

    ctx.save()
    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.translate(tX, tY)
    hueOffset += 1

    for (let i = 0; i < greyscaled.length; i++) {
      let frequency = greyscaled[i]
      let hue = Math.floor(spectrum[frequency] + hueOffset) % 360

      let brightness = Math.sqrt((frequency / spectrum.length) * (spectrum[frequency] / fftSize)) * 100
      brightness = clamp(Math.floor(brightness), 0, 99)
      let color = colorMap.bigColorMap2[hue * 100 + brightness]
      bufferImgData.data[i*4]   = color[0]
      bufferImgData.data[i*4+1] = color[1]
      bufferImgData.data[i*4+2] = color[2]
    }

    bufferCtx.putImageData(bufferImgData, 0, 0)
    ctx.scale(scale, scale)
    ctx.drawImage(bufferCv, 0, 0)
    ctx.restore()
  }


  const resize = function () {
    bufferCv.width = width
    bufferCv.height = height

    const w = cv.parentElement.innerWidth || cv.parentElement.clientWidth
    const h = cv.parentElement.innerHeight || cv.parentElement.clientHeight

    const sW = Math.floor(w / width)
    const sH = Math.floor(h / height)
    scale = Math.min(sW, sH)

    if (scale === 0)
      scale = 1

    scale *= (window.devicePixelRatio || 1)

    tX = Math.floor((cv.width - (width * scale)) / 2)
    tY = Math.floor((cv.height - (height * scale)) / 2)

    ctx.webkitImageSmoothingEnabled = false
    ctx.msImageSmoothingEnabled = false
    ctx.imageSmoothingEnabled = false
  }


  const _generateGreyscaleBuckets = function (image) {
    width = image.width
    height = image.height

    bufferCv = document.createElement('canvas')
    bufferCv.width = width
    bufferCv.height = height
    bufferCtx = bufferCv.getContext('2d')
    bufferCtx.clearRect(0, 0, width, height)
    bufferCtx.drawImage(image, 0, 0, width, height)

    const imageData = bufferCtx.getImageData(0, 0, width, height)

    // create temporary frame to be modified each draw call
    bufferImgData = bufferCtx.createImageData(width, height)

    // analyze each pixel
    for (let i = 0; i < width * height; i++) {
      let grey = Math.round(imageData.data[i*4]   * 0.2126 +
                            imageData.data[i*4+1] * 0.7152 +
                            imageData.data[i*4+2] * 0.0722)

      // fit to spectrum
      greyscaled.push(Math.round(clamp(grey, 0, 255) / 255 * bandCount))
      // set alpha, near-black parts are invisible
      bufferImgData.data[i*4+3] = (grey < 1) ? 0 : 255
    }
  }


  // only load the image if the optional url is defined
  if (image) {
    let img = document.createElement('img')
    img.onload = function() {
      _generateGreyscaleBuckets(img)
      resize()
    }

    img.src = image
  }

  return Object.freeze({ dampen, resize, draw })
}

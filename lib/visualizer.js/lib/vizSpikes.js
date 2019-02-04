import clamp from 'clamp'
import colorMap from './big-color-map.js'


// spikes coming from off screen
export default function vizSpikes (options={}) {
  let { ctx, cv, bandCount, rotateAmount } = options
  const dampen = true

  let centerRadius, hypotenuse, shortestSide
  let hueOffset = 0


  const draw = function (spectrum) {
    hueOffset += 1
    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.translate(cv.width / 2, cv.height / 2)
    ctx.rotate(Math.PI / 2)

    for (let i = 0; i < bandCount; i++) {
      let hue = Math.floor(360.0 / bandCount * i + hueOffset) % 360
      let brightness = clamp(Math.floor(spectrum[i] / 1.5), 15, 99)
      ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness]

      let inner = shortestSide / 2
      inner = inner - (inner - centerRadius) * (spectrum[i] / 255)
      ctx.beginPath()
      ctx.arc(0, 0, hypotenuse / 2, -rotateAmount / 2, rotateAmount / 2)
      ctx.lineTo(inner, 0)
      ctx.fill()
      ctx.closePath()
      ctx.rotate(rotateAmount)
    }
    //allRotate += 0.002

    // reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }


  const resize = function () {
    shortestSide = Math.min(cv.width, cv.height)
    hypotenuse = Math.sqrt(cv.width * cv.width + cv.height * cv.height)
    centerRadius = 85.0 / 800 * shortestSide
  }


  return Object.freeze({ dampen, resize, draw })
}

import clamp from 'clamp'
import HSVtoRGB from './hsv-to-rgb.js'


// bars flying from center
export default function vizFlyout (options={}) {
  let { ctx, cv, bandCount, rotateAmount } = options

  const dampen = false
  let allRotate = 0
  let variant = 0
  let longestSide, heightMultiplier, bars, offset, maxDistance

  const variants = [[2], [3]]

  const distances = []
  for (let i = 0; i < bandCount; i++)
    distances.push(0)


  const draw = function (spectrum) {
    ctx.save()
    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.translate(cv.width / 2, cv.height / 2)
    ctx.rotate(allRotate)
    for (let i = 0; i < bandCount; i++) {
      ctx.rotate(rotateAmount)
      ctx.lineWidth = 1 + (spectrum[i] / 256 * 5)

      let hue = (360.0 / bandCount * i) / 360.0
      let brightness = clamp(spectrum[i] * 1.0 / 150, 0.3, 1)
      ctx.strokeStyle = HSVtoRGB(hue, 1, brightness)

      distances[i] += (Math.max(50, spectrum[i]) * heightMultiplier / 40)
      distances[i] %= offset
      for (var j = 0; j < bars; j++)
        _arc(distances[i] + j * offset, rotateAmount * .75)
    }
    allRotate += 0.002

    ctx.restore()
  }


  const resize = function () {
    const shortestSide = Math.min(cv.width, cv.height)
    longestSide = Math.max(cv.width, cv.height)
    heightMultiplier = 1.0 / 800 * shortestSide

    maxDistance = longestSide * 0.71
    offset = maxDistance / bars
  }


  const vary = function () {
    variant = (variant + 1) % variants.length
    bars = variants[variant][0]
  }


  const _arc = function (distance, angle) {
    ctx.beginPath()
    ctx.arc(0, 0, distance, 0, angle)
    ctx.stroke()
    ctx.closePath()
  }


  vary()

  return Object.freeze({ dampen, resize, draw, vary })
}

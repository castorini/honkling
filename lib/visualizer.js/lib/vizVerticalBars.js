import clamp from 'clamp'
import colorMap from './big-color-map.js'


export default function vizVerticalBars (options={}) {
  let { ctx, cv, bandCount, rotateAmount } = options

  const dampen = true
  let allRotate = 0

  let centerRadius, heightMultiplier, gap, fade

  let variant = 0
  const variants = [[false, true], [true, false], [false, false]]


  const vary = function () {
    variant = (variant + 1) % variants.length
    gap = variants[variant][0]
    fade = variants[variant][1]
  }


  const resize = function () {
    const shortestSide = Math.min(cv.width, cv.height)
    centerRadius = 85.0 / 800 * shortestSide
    heightMultiplier = 1.0 / 800 * shortestSide
  }


  const draw = function (spectrum) {
    ctx.clearRect(0, 0, cv.width, cv.height)
    let barWidth = cv.width / bandCount

    for (let i = 0; i < bandCount; i++) {
      let hue = Math.floor(360.0 / bandCount * i)
      let brightness = fade ? clamp(Math.floor(spectrum[i] / 1.5), 25, 99) : 99

      ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness]

      let barHeight = cv.height * (spectrum[i] / 255)
      ctx.fillRect(i * barWidth, cv.height - barHeight, barWidth, barHeight)
    }
  }


  vary()

  return Object.freeze({ dampen, vary, resize, draw })
}

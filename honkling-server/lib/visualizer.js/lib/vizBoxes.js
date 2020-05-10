import clamp from 'clamp'
import colorMap from './big-color-map.js'


// a wall of boxes that brighten
export default function vizBoxes (options={}) {
  let { ctx, cv } = options
  const dampen = true
  let variant = 0
  let variants = [[false], [true]]

  let grow, longestSide
  let hueOffset = 0


  const draw = function (spectrum) {
    hueOffset += 0.25
    //spectrum = reduceBuckets(spectrum, 81)
    ctx.clearRect(0, 0, cv.width, cv.height)

    let size = 11
    let i = 0
    let x = Math.floor((size - 1) / 2)
    let y = x
    let loop = 0

    let dx = 0
    let dy = 0

    let cw = cv.width / size
    let ch = cv.height / size

    while (i < size * size) {
      switch (loop % 4) {
        case 0: dx = 1; dy = 0; break;
        case 1: dx = 0; dy = 1; break;
        case 2: dx = -1; dy = 0; break;
        case 3: dx = 0; dy = -1; break;
      }

      for (var j = 0; j < Math.floor(loop / 2) + 1; j++) {
        let hue = Math.floor(360.0 / (size * size) * i + hueOffset) % 360
        let brightness = clamp(Math.floor(spectrum[i] / 1.5), 10, 99)
        ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness]
        let intensity = 0.9
        if (grow)
          intensity = spectrum[i] / 255 / 4 + 0.65
        ctx.fillRect(x * cw + cw / 2 * (1 - intensity),
          y * ch + ch / 2 * (1 - intensity), cw * intensity, ch * intensity)

        x += dx
        y += dy
        i++
      }
      loop++
    }

    // reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }


  const resize = function () {
    longestSide = Math.max(cv.width, cv.height)
  }


  const vary = function () {
    variant = (variant + 1) % variants.length
    grow = variants[variant][0]
  }


  vary()

  return Object.freeze({ dampen, vary, resize, draw })
}

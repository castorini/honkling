import HSVtoRGB from './hsv-to-rgb.js'


const bigColorMap = [ ]
const bigColorMap2 = [ ]


function generateColors () {
  for (let hue = 0; hue < 360; hue++) {
    for (let brightness = 0; brightness < 100; brightness++) {
      const color = HSVtoRGB(hue / 360, 1, brightness / 100, true, false)
      bigColorMap.push(color)
      const color2 = HSVtoRGB(hue / 360, 1, brightness / 100, false, true)
      bigColorMap2.push(color2)
    }
  }
}


generateColors()

export default { bigColorMap, bigColorMap2 }

import clamp from 'clamp'
import colorMap from './big-color-map.js'
import texture from './create-gradient-texture.js'


// particles drawn as a cloud of smoke
function Particle () {
  this.cx = -200
  this.cy = -200
  this.regenerate()
}

Particle.prototype.regenerate = function () {
  var angle = Math.random() * 2 * Math.PI
  this.x = Math.cos(angle) * Math.random() * 500 + this.cx
  this.y = Math.sin(angle) * Math.random() * 500 + this.cy
  angle = Math.random() * 2 * Math.PI
  this.dx = Math.cos(angle)
  this.dy = Math.sin(angle)
  this.intensity = 0
  this.di = 0.01 + Math.random() / 50
  }

Particle.prototype.move = function () {
  this.x += this.dx * Math.random() * 4
  this.y += this.dy * Math.random() * 4
  this.intensity += this.di
  if (this.intensity < 0) {
    this.regenerate()
  } else if (this.intensity > 1) {
    this.intensity = 1
    this.di *= -1
  }
}

// sunburst, optionally on clouds
export default function vizSunburst (options={}) {
  let { ctx, cv, bandCount, rotateAmount } = options

  const dampen = true
  let variant = 0
  let variants = [ true, false ]

  let allRotate = 0
  let clouds, longestSide

  const particleImage = document.createElement('img')
  texture(particleImage)

  const particles = []
  for (let i = 0; i < 25; i++)
    particles.push(new Particle())


  const draw = function(spectrum) {
    ctx.save()

    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, cv.width, cv.height)
    ctx.translate(cv.width / 2, cv.height / 2)

    if (clouds) {
      ctx.globalCompositeOperation = 'screen'
      for (let i = 0; i < particles.length; i++) {
        ctx.globalAlpha = particles[i].intensity
        ctx.drawImage(particleImage, particles[i].x,
          particles[i].y)
        particles[i].move()
      }
    }

    ctx.rotate(allRotate)
    if (clouds) {
      ctx.globalCompositeOperation = 'multiply'
      ctx.globalAlpha = 1.0
    }

    for (let i = 0; i < bandCount; i++) {
      ctx.rotate(rotateAmount)
      let hue = Math.floor(360.0 / bandCount * i) % 360
      let brightness = clamp(Math.floor(spectrum[i] / 2), 10, 99)
      ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness]
      ctx.beginPath()
      ctx.arc(0, 0, longestSide * 1.5, 0, rotateAmount + 0.1)
      ctx.lineTo(0, 0)
      ctx.fill()
      ctx.closePath()
    }
    allRotate += 0.002

    ctx.restore()
  }


  const resize = function () {
    longestSide = Math.max(cv.width, cv.height)
  }


  const vary = function () {
    variant = (variant + 1) % variants.length
    clouds = variants[variant]
  }


  vary()

  return Object.freeze({ dampen, vary, resize, draw })
}

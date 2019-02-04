export default function textureImage (image) {
  const canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d')

  canvas.width = 300
  canvas.height = 300

  // Create gradient
  const grd = ctx.createRadialGradient(150.000, 150.000, 0.000, 150.000, 150.000, 150.000)

  // Add colors
  grd.addColorStop(0.000, 'rgba(255, 255, 255, 1.000)')
  grd.addColorStop(1.000, 'rgba(255, 255, 255, 0.000)')

  // Fill with gradient
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, 300.000, 300.000)

  image.src = canvas.toDataURL()
}

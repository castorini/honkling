// http://stackoverflow.com/a/5624139
function componentToHex (c) {
    const hex = c.toString(16)
    return hex.length === 1 ? '0' + hex : hex
}

// http://stackoverflow.com/a/17243070
export default function HSVtoRGB(h, s, v, hex, separate) {
  let r, g, b, i, f, p, q, t
  if (h && s === undefined && v === undefined) {
    s = h.s, v = h.v, h = h.h
  }
  i = Math.floor(h * 6)
  f = h * 6 - i
  p = v * (1 - s)
  q = v * (1 - f * s)
  t = v * (1 - (1 - f) * s)
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  r = Math.floor(r * 255)
  g = Math.floor(g * 255)
  b = Math.floor(b * 255)
  if (hex)
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
  else if (separate)
    return [r, g, b]
  else
    return 'rgb(' + r + ',' + g + ',' + b + ')'
}

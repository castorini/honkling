var clamp_1 = clamp;

function clamp(value, min, max) {
  return min < max
    ? (value < min ? min : value > max ? max : value)
    : (value < max ? max : value > min ? min : value)
}

// http://stackoverflow.com/a/5624139
function componentToHex (c) {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex
}

// http://stackoverflow.com/a/17243070
function HSVtoRGB(h, s, v, hex, separate) {
  let r, g, b, i, f, p, q, t;
  if (h && s === undefined && v === undefined) {
    s = h.s, v = h.v, h = h.h;
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  r = Math.floor(r * 255);
  g = Math.floor(g * 255);
  b = Math.floor(b * 255);
  if (hex)
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
  else if (separate)
    return [r, g, b]
  else
    return 'rgb(' + r + ',' + g + ',' + b + ')'
}

const bigColorMap = [ ];
const bigColorMap2 = [ ];


function generateColors () {
  for (let hue = 0; hue < 360; hue++) {
    for (let brightness = 0; brightness < 100; brightness++) {
      const color = HSVtoRGB(hue / 360, 1, brightness / 100, true, false);
      bigColorMap.push(color);
      const color2 = HSVtoRGB(hue / 360, 1, brightness / 100, false, true);
      bigColorMap2.push(color2);
    }
  }
}


generateColors();

var colorMap = { bigColorMap, bigColorMap2 };

// arcs coming out from a circle
function vizRadialArcs (options={}) {
  let { ctx, cv, bandCount, rotateAmount } = options;

  const dampen = true;
  let allRotate = 0;

  let centerRadius, heightMultiplier, gap, fade;

  let variant = 0;
  const variants = [[false, true], [true, false], [false, false]];


  const vary = function () {
    variant = (variant + 1) % variants.length;
    gap = variants[variant][0];
    fade = variants[variant][1];
  };


  const resize = function () {
    const shortestSide = Math.min(cv.width, cv.height);
    centerRadius = 85.0 / 800 * shortestSide;
    heightMultiplier = 1.0 / 800 * shortestSide;
  };


  const draw = function (spectrum) {
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.translate(cv.width / 2, cv.height / 2);
    ctx.rotate(allRotate);
    for (let i = 0; i < bandCount; i++) {
      ctx.rotate(rotateAmount);
      let hue = Math.floor(360.0 / bandCount * i);
      let brightness = 99;
      if (fade)
        brightness = clamp_1(Math.floor(spectrum[i] / 1.5), 25, 99);

      ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness];

      ctx.beginPath();
      if (gap) {
        ctx.arc(0, 0, centerRadius + Math.max(spectrum[i] * heightMultiplier, 2),
          0, rotateAmount / 2);
      } else {
        ctx.arc(0, 0, centerRadius + Math.max(spectrum[i] * heightMultiplier, 2),
          0, rotateAmount + 0.005);
      }
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.closePath();
    }
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, centerRadius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
    allRotate += 0.002;

    // reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };


  vary();

  return Object.freeze({ dampen, vary, resize, draw })
}

// bars coming out from a circle
function vizRadialBars (options={}) {
  let { ctx, cv, bandCount, rotateAmount, lastVolumes } = options;

  let bandWidth, fade, centerRadius, heightMultiplier;
  const dampen = true;
  let variant = 0;
  let variants = [[false], [true]];
  let allRotate = 0;


  const draw = function (spectrum) {
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.translate(cv.width / 2, cv.height / 2);
    ctx.rotate(allRotate);
    for (let i = 0; i < bandCount; i++) {
      ctx.rotate(rotateAmount);
      let hue = Math.floor(360.0 / bandCount * i);
      if (fade) {
        let brightness = clamp_1(Math.floor(spectrum[i] / 1.5), 25, 99);
        ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness];
        ctx.fillRect(-bandWidth / 2, centerRadius, bandWidth,
          Math.max(2, spectrum[i] * heightMultiplier));
      } else {
        let avg = 0;
        avg = (spectrum[i] + lastVolumes[i]) / 2;
        ctx.fillStyle = colorMap.bigColorMap[hue * 100 + 50];
        ctx.fillRect(-bandWidth / 2, centerRadius + avg, bandWidth, 2);
        ctx.fillStyle = colorMap.bigColorMap[hue * 100 + 99];
        ctx.fillRect(-bandWidth / 2, centerRadius, bandWidth,
          spectrum[i] * heightMultiplier);
      }
    }
    allRotate += 0.002;

    // reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };

  const vary = function () {
    variant = (variant + 1) % variants.length;
    fade = variants[variant][0];
  };

  const resize = function () {
    const shortestSide = Math.min(cv.width, cv.height);
    centerRadius = 85.0 / 800 * shortestSide;
    heightMultiplier = 1.0 / 800 * shortestSide;
    bandWidth = Math.PI * 2 * centerRadius / bandCount;
  };

  vary();

  return Object.freeze({ dampen, vary, resize, draw })
}

// bars flying from center
function vizFlyout (options={}) {
  let { ctx, cv, bandCount, rotateAmount } = options;

  const dampen = false;
  let allRotate = 0;
  let variant = 0;
  let longestSide, heightMultiplier, bars, offset, maxDistance;

  const variants = [[2], [3]];

  const distances = [];
  for (let i = 0; i < bandCount; i++)
    distances.push(0);


  const draw = function (spectrum) {
    ctx.save();
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.translate(cv.width / 2, cv.height / 2);
    ctx.rotate(allRotate);
    for (let i = 0; i < bandCount; i++) {
      ctx.rotate(rotateAmount);
      ctx.lineWidth = 1 + (spectrum[i] / 256 * 5);

      let hue = (360.0 / bandCount * i) / 360.0;
      let brightness = clamp_1(spectrum[i] * 1.0 / 150, 0.3, 1);
      ctx.strokeStyle = HSVtoRGB(hue, 1, brightness);

      distances[i] += (Math.max(50, spectrum[i]) * heightMultiplier / 40);
      distances[i] %= offset;
      for (var j = 0; j < bars; j++)
        _arc(distances[i] + j * offset, rotateAmount * .75);
    }
    allRotate += 0.002;

    ctx.restore();
  };


  const resize = function () {
    const shortestSide = Math.min(cv.width, cv.height);
    longestSide = Math.max(cv.width, cv.height);
    heightMultiplier = 1.0 / 800 * shortestSide;

    maxDistance = longestSide * 0.71;
    offset = maxDistance / bars;
  };


  const vary = function () {
    variant = (variant + 1) % variants.length;
    bars = variants[variant][0];
  };


  const _arc = function (distance, angle) {
    ctx.beginPath();
    ctx.arc(0, 0, distance, 0, angle);
    ctx.stroke();
    ctx.closePath();
  };


  vary();

  return Object.freeze({ dampen, resize, draw, vary })
}

function textureImage (image) {
  const canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');

  canvas.width = 300;
  canvas.height = 300;

  // Create gradient
  const grd = ctx.createRadialGradient(150.000, 150.000, 0.000, 150.000, 150.000, 150.000);

  // Add colors
  grd.addColorStop(0.000, 'rgba(255, 255, 255, 1.000)');
  grd.addColorStop(1.000, 'rgba(255, 255, 255, 0.000)');

  // Fill with gradient
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 300.000, 300.000);

  image.src = canvas.toDataURL();
}

// particles drawn as a cloud of smoke
function Particle () {
  this.cx = -200;
  this.cy = -200;
  this.regenerate();
}

Particle.prototype.regenerate = function () {
  var angle = Math.random() * 2 * Math.PI;
  this.x = Math.cos(angle) * Math.random() * 500 + this.cx;
  this.y = Math.sin(angle) * Math.random() * 500 + this.cy;
  angle = Math.random() * 2 * Math.PI;
  this.dx = Math.cos(angle);
  this.dy = Math.sin(angle);
  this.intensity = 0;
  this.di = 0.01 + Math.random() / 50;
  };

Particle.prototype.move = function () {
  this.x += this.dx * Math.random() * 4;
  this.y += this.dy * Math.random() * 4;
  this.intensity += this.di;
  if (this.intensity < 0) {
    this.regenerate();
  } else if (this.intensity > 1) {
    this.intensity = 1;
    this.di *= -1;
  }
};

// sunburst, optionally on clouds
function vizSunburst (options={}) {
  let { ctx, cv, bandCount, rotateAmount } = options;

  const dampen = true;
  let variant = 0;
  let variants = [ true, false ];

  let allRotate = 0;
  let clouds, longestSide;

  const particleImage = document.createElement('img');
  textureImage(particleImage);

  const particles = [];
  for (let i = 0; i < 25; i++)
    particles.push(new Particle());


  const draw = function(spectrum) {
    ctx.save();

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.translate(cv.width / 2, cv.height / 2);

    if (clouds) {
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < particles.length; i++) {
        ctx.globalAlpha = particles[i].intensity;
        ctx.drawImage(particleImage, particles[i].x,
          particles[i].y);
        particles[i].move();
      }
    }

    ctx.rotate(allRotate);
    if (clouds) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 1.0;
    }

    for (let i = 0; i < bandCount; i++) {
      ctx.rotate(rotateAmount);
      let hue = Math.floor(360.0 / bandCount * i) % 360;
      let brightness = clamp_1(Math.floor(spectrum[i] / 2), 10, 99);
      ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness];
      ctx.beginPath();
      ctx.arc(0, 0, longestSide * 1.5, 0, rotateAmount + 0.1);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.closePath();
    }
    allRotate += 0.002;

    ctx.restore();
  };


  const resize = function () {
    longestSide = Math.max(cv.width, cv.height);
  };


  const vary = function () {
    variant = (variant + 1) % variants.length;
    clouds = variants[variant];
  };


  vary();

  return Object.freeze({ dampen, vary, resize, draw })
}

// a wall of boxes that brighten
function vizBoxes (options={}) {
  let { ctx, cv } = options;
  const dampen = true;
  let variant = 0;
  let variants = [[false], [true]];

  let grow, longestSide;
  let hueOffset = 0;


  const draw = function (spectrum) {
    hueOffset += 0.25;
    //spectrum = reduceBuckets(spectrum, 81)
    ctx.clearRect(0, 0, cv.width, cv.height);

    let size = 11;
    let i = 0;
    let x = Math.floor((size - 1) / 2);
    let y = x;
    let loop = 0;

    let dx = 0;
    let dy = 0;

    let cw = cv.width / size;
    let ch = cv.height / size;

    while (i < size * size) {
      switch (loop % 4) {
        case 0: dx = 1; dy = 0; break;
        case 1: dx = 0; dy = 1; break;
        case 2: dx = -1; dy = 0; break;
        case 3: dx = 0; dy = -1; break;
      }

      for (var j = 0; j < Math.floor(loop / 2) + 1; j++) {
        let hue = Math.floor(360.0 / (size * size) * i + hueOffset) % 360;
        let brightness = clamp_1(Math.floor(spectrum[i] / 1.5), 10, 99);
        ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness];
        let intensity = 0.9;
        if (grow)
          intensity = spectrum[i] / 255 / 4 + 0.65;
        ctx.fillRect(x * cw + cw / 2 * (1 - intensity),
          y * ch + ch / 2 * (1 - intensity), cw * intensity, ch * intensity);

        x += dx;
        y += dy;
        i++;
      }
      loop++;
    }

    // reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };


  const resize = function () {
    longestSide = Math.max(cv.width, cv.height);
  };


  const vary = function () {
    variant = (variant + 1) % variants.length;
    grow = variants[variant][0];
  };


  vary();

  return Object.freeze({ dampen, vary, resize, draw })
}

// spikes coming from off screen
function vizSpikes (options={}) {
  let { ctx, cv, bandCount, rotateAmount } = options;
  const dampen = true;

  let centerRadius, hypotenuse, shortestSide;
  let hueOffset = 0;


  const draw = function (spectrum) {
    hueOffset += 1;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.translate(cv.width / 2, cv.height / 2);
    ctx.rotate(Math.PI / 2);

    for (let i = 0; i < bandCount; i++) {
      let hue = Math.floor(360.0 / bandCount * i + hueOffset) % 360;
      let brightness = clamp_1(Math.floor(spectrum[i] / 1.5), 15, 99);
      ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness];

      let inner = shortestSide / 2;
      inner = inner - (inner - centerRadius) * (spectrum[i] / 255);
      ctx.beginPath();
      ctx.arc(0, 0, hypotenuse / 2, -rotateAmount / 2, rotateAmount / 2);
      ctx.lineTo(inner, 0);
      ctx.fill();
      ctx.closePath();
      ctx.rotate(rotateAmount);
    }
    //allRotate += 0.002

    // reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };


  const resize = function () {
    shortestSide = Math.min(cv.width, cv.height);
    hypotenuse = Math.sqrt(cv.width * cv.width + cv.height * cv.height);
    centerRadius = 85.0 / 800 * shortestSide;
  };


  return Object.freeze({ dampen, resize, draw })
}

// an image that's colored to the beat
function vizImage (options={}) {
  let { ctx, cv, bandCount, image, fftSize } = options;

  const dampen = true;

  let width, height, tX, tY, scale, bufferImgData;

  const greyscaled = [];

  // offscreen image buffer
  let bufferCv, bufferCtx;

  let hueOffset = 0;


  const draw = function (spectrum) {
    // if the image hasn't loaded yet, don't render the visualization
    if (!bufferImgData)
      return

    ctx.save();
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.translate(tX, tY);
    hueOffset += 1;

    for (let i = 0; i < greyscaled.length; i++) {
      let frequency = greyscaled[i];
      let hue = Math.floor(spectrum[frequency] + hueOffset) % 360;

      let brightness = Math.sqrt((frequency / spectrum.length) * (spectrum[frequency] / fftSize)) * 100;
      brightness = clamp_1(Math.floor(brightness), 0, 99);
      let color = colorMap.bigColorMap2[hue * 100 + brightness];
      bufferImgData.data[i*4]   = color[0];
      bufferImgData.data[i*4+1] = color[1];
      bufferImgData.data[i*4+2] = color[2];
    }

    bufferCtx.putImageData(bufferImgData, 0, 0);
    ctx.scale(scale, scale);
    ctx.drawImage(bufferCv, 0, 0);
    ctx.restore();
  };


  const resize = function () {
    bufferCv.width = width;
    bufferCv.height = height;

    const w = cv.parentElement.innerWidth || cv.parentElement.clientWidth;
    const h = cv.parentElement.innerHeight || cv.parentElement.clientHeight;

    const sW = Math.floor(w / width);
    const sH = Math.floor(h / height);
    scale = Math.min(sW, sH);

    if (scale === 0)
      scale = 1;

    scale *= (window.devicePixelRatio || 1);

    tX = Math.floor((cv.width - (width * scale)) / 2);
    tY = Math.floor((cv.height - (height * scale)) / 2);

    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
  };


  const _generateGreyscaleBuckets = function (image) {
    width = image.width;
    height = image.height;

    bufferCv = document.createElement('canvas');
    bufferCv.width = width;
    bufferCv.height = height;
    bufferCtx = bufferCv.getContext('2d');
    bufferCtx.clearRect(0, 0, width, height);
    bufferCtx.drawImage(image, 0, 0, width, height);

    const imageData = bufferCtx.getImageData(0, 0, width, height);

    // create temporary frame to be modified each draw call
    bufferImgData = bufferCtx.createImageData(width, height);

    // analyze each pixel
    for (let i = 0; i < width * height; i++) {
      let grey = Math.round(imageData.data[i*4]   * 0.2126 +
                            imageData.data[i*4+1] * 0.7152 +
                            imageData.data[i*4+2] * 0.0722);

      // fit to spectrum
      greyscaled.push(Math.round(clamp_1(grey, 0, 255) / 255 * bandCount));
      // set alpha, near-black parts are invisible
      bufferImgData.data[i*4+3] = (grey < 1) ? 0 : 255;
    }
  };


  // only load the image if the optional url is defined
  if (image) {
    let img = document.createElement('img');
    img.onload = function() {
      _generateGreyscaleBuckets(img);
      resize();
    };

    img.src = image;
  }

  return Object.freeze({ dampen, resize, draw })
}

function vizVerticalBars (options={}) {
  let { ctx, cv, bandCount, rotateAmount } = options;

  const dampen = true;

  let gap, fade;

  let variant = 0;
  const variants = [[false, true], [true, false], [false, false]];


  const vary = function () {
    variant = (variant + 1) % variants.length;
    gap = variants[variant][0];
    fade = variants[variant][1];
  };


  const resize = function () {
    const shortestSide = Math.min(cv.width, cv.height);
  };


  const draw = function (spectrum) {
    ctx.clearRect(0, 0, cv.width, cv.height);
    let barWidth = cv.width / bandCount;

    for (let i = 0; i < bandCount; i++) {
      let hue = Math.floor(360.0 / bandCount * i);
      let brightness = fade ? clamp_1(Math.floor(spectrum[i] / 1.5), 25, 99) : 99;

      ctx.fillStyle = colorMap.bigColorMap[hue * 100 + brightness];

      let barHeight = cv.height * (spectrum[i] / 255);
      ctx.fillRect(i * barWidth, cv.height - barHeight, barWidth, barHeight);
    }
  };


  vary();

  return Object.freeze({ dampen, vary, resize, draw })
}

function visualizer (options={}) {
  const cv = document.createElement('canvas');

  let parent;
  if (options.parent) {
    parent = (typeof options.parent === 'string') ? document.querySelector(options.parent) : options.parent;
    parent.appendChild(cv);
  } else {
    cv.style.position = 'absolute';
    cv.style.left = '0';
    cv.style.top = '0';
    document.body.appendChild(cv);
    parent = window;
  }

  const ctx = cv.getContext('2d');

  const image = options.image;

  const visualizers = [];

  let analyser, spectrum, audioCtx, currentViz = 0;

  // for audio processing
  //let analyseInterval = 1000 / 30
  const fftSize = 256;

  // although the actual spectrum size is half the FFT size,
  // the highest frequencies aren't really important here
  const bandCount = Math.round(fftSize / 3);

  const lastVolumes = [];

  const rotateAmount = (Math.PI * 2.0) / bandCount;

  // sets up mic/line-in input
  const _getMediaStream = function (callback) {
    if (options.stream)
      return setTimeout(callback, 0, null, options.stream)

    navigator.mediaDevices.getUserMedia({ video: false, audio: true })
      .then(function (stream) {
        callback(null, stream);
      })
      .catch(function(e) {
        callback(e);
      });
  };


  const _init = function (stream) {
    // sets up the application loop

    // initialize nodes
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    setMediaStream(stream);

    // misc setup
    for (let i = 0; i < bandCount; i++)
      lastVolumes.push(0);

    // set up visualizer list
    const options = { cv, ctx, bandCount, rotateAmount, lastVolumes, image, fftSize };
    visualizers.push(vizVerticalBars(options));
    visualizers.push(vizRadialArcs(options));
    visualizers.push(vizRadialBars(options));
    visualizers.push(vizFlyout(options));
    visualizers.push(vizSunburst(options));
    visualizers.push(vizBoxes(options));
    visualizers.push(vizSpikes(options));
    visualizers.push(vizImage(options));

    _recalculateSizes();
    requestAnimationFrame(_visualize);

    window.onresize = function() {
      _recalculateSizes();
    };
  };


  // add a new visualizer module
  const addVisualization = function (viz) {
    const options = { cv, ctx, bandCount, rotateAmount, lastVolumes, image, fftSize };
    visualizers.push(viz(options));
  };


  const setMediaStream = function (stream) {
    const source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();

    // set node properties and connect
    analyser.smoothingTimeConstant = 0.2;
    analyser.fftSize = fftSize;

    spectrum = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);
  };


  const showNextVisualization = function () {
    currentViz = (currentViz + 1) % visualizers.length;
    _recalculateSizes();
  };


  const showVisualization = function (idx) {
    if (idx < 0)
      idx = 0;
    if (idx >= visualizers.length)
      idx = visualizers.length - 1;

    currentViz = idx;
    _recalculateSizes();
  };


  // varies the current visualization
  const vary = function () {
    if (visualizers[currentViz].vary)
      visualizers[currentViz].vary();
  };


  const _recalculateSizes = function () {
    const ratio = window.devicePixelRatio || 1;

    const w = parent.innerWidth || parent.clientWidth;
    const h = parent.innerHeight || parent.clientHeight;

    cv.width = w * ratio;
    cv.height = h * ratio;
    cv.style.width = w + 'px';
    cv.style.height = h + 'px';
    visualizers[currentViz].resize();
  };


  // called each audio frame, manages rendering of visualization
  const _visualize = function () {
    analyser.getByteFrequencyData(spectrum);

    // dampen falloff for some visualizations
    if (visualizers[currentViz].dampen === true)
      for (let i = 0; i < spectrum.length; i++)
        if (lastVolumes[i] > spectrum[i])
          spectrum[i] = (spectrum[i] + lastVolumes[i]) / 2;

    visualizers[currentViz].draw(spectrum);

    requestAnimationFrame(_visualize);
  };


  _getMediaStream(function (err, stream) {
    if (err) {
      console.log(err);
      throw new Error('Unable to start visualization. Make sure you\'re using a modern browser ' +
        'with a microphone set up, and that you allow the page to access the microphone.')
    }
    _init(stream);
  });

  return Object.freeze({ addVisualization, setMediaStream, showNextVisualization, showVisualization, vary })
}

export default visualizer;

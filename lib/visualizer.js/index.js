import vizRadialArcs from './lib/vizRadialArcs.js'
import vizRadialBars from './lib/vizRadialBars.js'
import vizFlyout     from './lib/vizFlyout.js'
import vizSunburst   from './lib/vizSunburst.js'
import vizBoxes      from './lib/vizBoxes.js'
import vizSpikes     from './lib/vizSpikes.js'
import vizImage      from './lib/vizImage.js'
import vizVertBars   from './lib/vizVerticalBars.js'


export default function visualizer (options={}) {
  const cv = document.createElement('canvas')

  let parent
  if (options.parent) {
    parent = (typeof options.parent === 'string') ? document.querySelector(options.parent) : options.parent
    parent.appendChild(cv)
  } else {
    cv.style.position = 'absolute'
    cv.style.left = '0'
    cv.style.top = '0'
    document.body.appendChild(cv)
    parent = window
  }

  const ctx = cv.getContext('2d')

  const image = options.image

  const visualizers = []

  let analyser, spectrum, audioCtx, currentViz = 0

  // for audio processing
  //let analyseInterval = 1000 / 30
  const fftSize = 256

  // although the actual spectrum size is half the FFT size,
  // the highest frequencies aren't really important here
  const bandCount = Math.round(fftSize / 3)

  const lastVolumes = []

  const rotateAmount = (Math.PI * 2.0) / bandCount

  // sets up mic/line-in input
  const _getMediaStream = function (callback) {
    if (options.stream)
      return setTimeout(callback, 0, null, options.stream)

    navigator.mediaDevices.getUserMedia({ video: false, audio: true })
      .then(function (stream) {
        callback(null, stream)
      })
      .catch(function(e) {
        callback(e)
      })
  }


  const _init = function (stream) {
    // sets up the application loop

    // initialize nodes
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()

    setMediaStream(stream)

    // misc setup
    for (let i = 0; i < bandCount; i++)
      lastVolumes.push(0)

    // set up visualizer list
    const options = { cv, ctx, bandCount, rotateAmount, lastVolumes, image, fftSize }
    visualizers.push(vizVertBars(options))
    visualizers.push(vizRadialArcs(options))
    visualizers.push(vizRadialBars(options))
    visualizers.push(vizFlyout(options))
    visualizers.push(vizSunburst(options))
    visualizers.push(vizBoxes(options))
    visualizers.push(vizSpikes(options))
    visualizers.push(vizImage(options))

    _recalculateSizes()
    requestAnimationFrame(_visualize)

    window.onresize = function() {
      _recalculateSizes()
    }
  }


  // add a new visualizer module
  const addVisualization = function (viz) {
    const options = { cv, ctx, bandCount, rotateAmount, lastVolumes, image, fftSize }
    visualizers.push(viz(options))
  }


  const setMediaStream = function (stream) {
    const source = audioCtx.createMediaStreamSource(stream)
    analyser = audioCtx.createAnalyser()

    // set node properties and connect
    analyser.smoothingTimeConstant = 0.2
    analyser.fftSize = fftSize

    spectrum = new Uint8Array(analyser.frequencyBinCount)
    source.connect(analyser)
  }


  const showNextVisualization = function () {
    currentViz = (currentViz + 1) % visualizers.length
    _recalculateSizes()
  }


  const showVisualization = function (idx) {
    if (idx < 0)
      idx = 0
    if (idx >= visualizers.length)
      idx = visualizers.length - 1

    currentViz = idx
    _recalculateSizes()
  }


  // varies the current visualization
  const vary = function () {
    if (visualizers[currentViz].vary)
      visualizers[currentViz].vary()
  }


  const _recalculateSizes = function () {
    const ratio = window.devicePixelRatio || 1

    const w = parent.innerWidth || parent.clientWidth
    const h = parent.innerHeight || parent.clientHeight

    cv.width = w * ratio
    cv.height = h * ratio
    cv.style.width = w + 'px'
    cv.style.height = h + 'px'
    visualizers[currentViz].resize()
  }


  // called each audio frame, manages rendering of visualization
  const _visualize = function () {
    analyser.getByteFrequencyData(spectrum)

    // dampen falloff for some visualizations
    if (visualizers[currentViz].dampen === true)
      for (let i = 0; i < spectrum.length; i++)
        if (lastVolumes[i] > spectrum[i])
          spectrum[i] = (spectrum[i] + lastVolumes[i]) / 2

    visualizers[currentViz].draw(spectrum)

    requestAnimationFrame(_visualize)
  }


  _getMediaStream(function (err, stream) {
    if (err) {
      console.log(err)
      throw new Error('Unable to start visualization. Make sure you\'re using a modern browser ' +
        'with a microphone set up, and that you allow the page to access the microphone.')
    }
    _init(stream)
  })

  return Object.freeze({ addVisualization, setMediaStream, showNextVisualization, showVisualization, vary })
}

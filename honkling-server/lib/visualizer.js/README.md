# Visualizer

A HTML5 audio visualizer for microphone or line-in input.

![](thumbnail.jpg)


## Requirements

A browser with `canvas` and `getUserMedia` support. (Currently Chrome, Firefox, Edge, and Opera)


## Including

If you're using es modules or commonjs (node) you can include visualizer:

```javascript
import visualizer from 'visualizer.js'  // modern es modules approach

// *OR*

const visualizer = require('visualizer.js') // commonjs (node) approach
```

Alternatively if you want to use this as an HTML script tag:

```html
<script src="dist/visualizer.global.min.js"></script>
```

This will expose `visualizer` as a javascript global variable.


## Configuration

Several parameters are supported when creating a visualizer instance. These are all optional.


```javascript
const options = {
  // string indicating which container element should hold the visualization.
  // If specified it will stretch to fit this container's width and height.
  // If omitted it will assume a full screen visualization and fit to the window.
  // You may pass a query selector string here, or a DOM element.
  parent: '#my-container-div',

  // specify the image that is used by the vizImage visualization
  image: 'my-image.png',

  // in some cases you may already have a media stream. You can pass it in to
  // the visualizer. If omitted it will create a new media stream
  stream: mediaStream
}

const viz = visualizer(options)
```


## Running the examples

open any of the index files in the `examples/` directory.

You'll be prompted to allow microphone access. Upon accepting, the visualizations will start playing.

* Press number keys `1` - `7` to select a visualization.
* Press `=` key to switch between variants of that visualization. Some visualizations don't have a variant.


## generating your own visualizations

The `visualizer` module is pluggable; you can write your own visualizations as long as they conform to the
expected interface. Look at any of the modules written in `lib/viz*` to see how this is done.

```javascript
import myVizPlugin from './some-visualizer-i-wrote.js'
const viz = visualizer()

viz.addVisualization(myVizPlugin)
```

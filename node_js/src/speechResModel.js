const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');
require('./weights.js');
require('./config.js');
require('./util.js');

function SpeechResModel() {

  // layer definition
  layers = {}

  layers['conv0'] = tf.layers.conv2d({
    filters: modelConfig['n_feature_maps'],
    kernelSize: modelConfig['conv_size'],
    strides: modelConfig['conv_stride'],
    padding: "same",
    useBias: false,
    activation: 'relu',
    kernelInitializer: 'glorotUniform',
    biasInitializer: tf.initializers.zeros(),
    name: "conv0",
  })

  if (modelConfig['res_pool']) {
    layers['pool'] = tf.layers.averagePooling2d({
      poolSize: modelConfig['res_pool'],
      name: "pool",
    })
  }

  if (modelConfig['use_dilation']) {
    for (var i  = 0; i < (modelConfig['n_layers']); i++) {
      layers['conv'+ (i+1)] = tf.layers.conv2d({
        filters: modelConfig['n_feature_maps'],
        kernelSize: modelConfig['conv_size'],
        padding: "same",
        dilation: Math.pow(2, Math.floor(i/3)),
        useBias: false,
        activation: 'relu',
        kernelInitializer: 'glorotUniform',
        biasInitializer: tf.initializers.zeros(),
        name: "conv"+(i+1),
      })
    }
  } else {
    for (var i  = 0; i < (modelConfig['n_layers']); i++) {
      layers['conv'+ (i+1)] = tf.layers.conv2d({
        filters: modelConfig['n_feature_maps'],
        kernelSize: modelConfig['conv_size'],
        padding: "same",
        dilation: 1,
        useBias: false,
        activation: 'relu',
        kernelInitializer: 'glorotUniform',
        biasInitializer: tf.initializers.zeros(),
        name: "conv"+(i+1),
      })
    }
  }

  for (var i  = 0; i < (modelConfig['n_layers']); i++) {
    layers['bn'+ (i+1)] = tf.layers.batchNormalization({
      epsilon: 0.00001,
      momentum: 0.1,
      gammaInitializer: tf.initializers.ones(),
      betaInitializer: tf.initializers.zeros(),
      name: "bn"+(i+1),
    })
  }

  layers['output'] = tf.layers.dense({
    units: modelConfig['n_labels'],
    activation: 'linear',
    biasInitializer : tf.initializers.zeros(),
    name: "output",
  });

  for (var i  = 2; i < (modelConfig['n_layers'] + 1); i++) {
    if (i % 2 == 0) {
      layers['add'+i] = tf.layers.add({name: "add" + i});
    }
  }

  layers['globalAvgPool'] = tf.layers.globalAveragePooling2d({});
  layers['softmax'] = tf.layers.softmax();

  // preprocee weights before assignment
  let processedWeights = {};

  let weightNames = Object.keys(weights);
  for (var index in weightNames) {
    let weightName = weightNames[index];
    let nameSplit = weightName.split(".");
    let layer = nameSplit[0];

    if (!(layer in processedWeights)) {
      processedWeights[layer] = {};
    }
    processedWeights[layer][nameSplit[1]] = weights[weightName];
  }

  // compile model

  const input = tf.input({shape: modelConfig['input_shape']});
  let x = input;

  let y, old_x;

  for (var i  = 0; i < (modelConfig['n_layers'] + 1); i++) {
    y = layers['conv'+ i].apply(x);

    if (i == 0) {
      if (layers['pool']) {
        y = layers['pool'].apply(y);
      }
      old_x = y;
    }

    if ((i > 0) && (i % 2 == 0)) {
      x = layers['add'+ i].apply([y, old_x]);
      old_x = x;
    } else {
      x = y;
    }

    if (i > 0) {
      x = layers['bn'+ i].apply(x)
    }
  }

  x = layers['globalAvgPool'].apply(x);
  x = layers['output'].apply(x);

  const softmax = layers['softmax'].apply(x);

  this.model = tf.model({
    inputs: input,
    outputs: softmax,
  });

  this.model.summary();

  this.model.compile({
    optimizer: 'sgd',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });


  // weights loading

  function reformatConvKernel(weight) {
    let reformat = [];
    for (var colsIndex = 0; colsIndex < weight[0][0][0].length; colsIndex++) {
      reformat.push([]);
      for (var rowsIndex = 0; rowsIndex < weight[0][0].length; rowsIndex++) {
        reformat[colsIndex].push([]);
        for (var inFilterIndex = 0; inFilterIndex < weight[0].length; inFilterIndex++) {
          reformat[colsIndex][rowsIndex].push([]);
        }
      }
    }

    for (var outFilterIndex = 0; outFilterIndex < weight.length; outFilterIndex++) {
      for (var inFilterIndex = 0; inFilterIndex < weight[0].length; inFilterIndex++) {
        for (var rowsIndex = 0; rowsIndex < weight[0][0].length; rowsIndex++) {
          for (var colsIndex = 0; colsIndex < weight[0][0][0].length; colsIndex++) {
            reformat[colsIndex][rowsIndex][inFilterIndex].push(weight[outFilterIndex][inFilterIndex][rowsIndex][colsIndex]);
          }
        }
      }
    }
    return reformat;
  }

  for (var key in layers) {
    let w = [];
    if (key.includes("conv")) {
      // weight index 0 = kernel
      let convKernelShape = layers[key].getWeights()[0].shape;
      let convKernel = reformatConvKernel(processedWeights[key]['weight']);
      w.push(tf.tensor4d(convKernel, convKernelShape, 'float32'));
    }
    if (key.includes("bn")) {
      // weight index 0 = gamma - 1 (due to Affine = false)
      let bnGammaShape = layers[key].getWeights()[0].shape;
      w.push(tf.tensor1d(new Array(bnGammaShape[0]).fill(1), 'float32'));

      // weight index 1 = beta - 0 (due to Affine = false)
      let bnBetaShape = layers[key].getWeights()[1].shape;
      w.push(tf.tensor1d(new Array(bnBetaShape[0]).fill(0), 'float32'));

      // weight indes 2 = moving_mean
      w.push(tf.tensor1d(processedWeights[key]['running_mean'], 'float32'));

      // weight index 3 = moving_variance
      w.push(tf.tensor1d(processedWeights[key]['running_var'], 'float32'));
    }
    if (key.includes("output")) {

      // weight index 0 = kernel
      let denseKernelShape = layers[key].getWeights()[0].shape;
      let denseKernel = transpose2d(processedWeights[key]['weight']);
      w.push(tf.tensor2d(denseKernel, denseKernelShape, 'float32'));

      // weight index 1 = bias
      w.push(tf.tensor1d(processedWeights[key]['bias'], 'float32'));
    }
    layers[key].setWeights(w);
  }
}

module.exports = SpeechResModel;

require('./config.js');
const tf = require('@tensorflow/tfjs');
var SpeechResModel = require('./speechResModel.js');

function Model(modelName) {
  this.model = new SpeechResModel(modelName);
};

Model.prototype.predict = function(x) {
  if (!(x instanceof tf.Tensor)) {
    x = tf.tensor(x);
  }
  let input_shape = this.model.modelConfig['input_shape'].slice();
  input_shape.unshift(-1);
  let output = this.model.predict(x.reshape(input_shape));

  let axis = 1;
  let predictions = output.argMax(axis).dataSync()[0];

  return commands[predictions];
};

module.exports = Model;

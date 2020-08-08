weights = {}; // placeholder for dynamic weights loading

if (typeof module !== 'undefined') {
	weights['v1.0.0'] = require('../honkling-models/honkling-node/firefox');
  module.exports = weights;
}
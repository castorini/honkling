RES8_weights = require('./models/honkling-node/RES8');
RES8_40_weights = require('./models/honkling-node/RES8_40');
RES8_80_weights = require('./models/honkling-node/RES8_80');
RES8_NARROW_weights = require('./models/honkling-node/RES8_NARROW');
RES8_NARROW_40_weights = require('./models/honkling-node/RES8_NARROW_40');
RES8_NARROW_80_weights = require('./models/honkling-node/RES8_NARROW_80');

assistant_weights = require('./models/honkling-node/res8_assistant')
light_weights = require('./models/honkling-node/res8_light')

module.exports = {
  "light" : light_weights,
  "assistant" : assistant_weights,
  "RES8" : RES8_weights,
  "RES8_40" : RES8_40_weights,
  "RES8_80" : RES8_80_weights,
  "RES8_NARROW" : RES8_NARROW_weights,
  "RES8_NARROW_40" : RES8_NARROW_40_weights,
  "RES8_NARROW_80" : RES8_NARROW_80_weights
};

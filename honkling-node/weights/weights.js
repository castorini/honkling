RES8_weights = require('./RES8');
mojibar_weights = require('./res8_mojibar')
light_weights = require('./res8_light')
RES8_40_weights = require('./RES8_40');
RES8_80_weights = require('./RES8_80');
RES8_NARROW_weights = require('./RES8_NARROW');
RES8_NARROW_40_weights = require('./RES8_NARROW_40');
RES8_NARROW_80_weights = require('./RES8_NARROW_80');

module.exports = {
  "light" : light_weights,
  "mojibar" : mojibar_weights,
  "RES8" : RES8_weights,
  "RES8_40" : RES8_40_weights,
  "RES8_80" : RES8_80_weights,
  "RES8_NARROW" : RES8_NARROW_weights,
  "RES8_NARROW_40" : RES8_NARROW_40_weights,
  "RES8_NARROW_80" : RES8_NARROW_80_weights
};

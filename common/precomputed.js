precomputed = {
	'melBasis': {}
};

if (typeof module !== 'undefined') {
	precomputed['melBasis']['40'] = require('./precomputed/melBasis_40');
	precomputed['melBasis']['80'] = require('./precomputed/melBasis_80');
	precomputed['hanningWindow'] = require('./precomputed/hanningWindow');
  module.exports = precomputed;
}
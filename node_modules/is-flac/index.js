'use strict';
module.exports = function (buf) {
	if (!buf || buf.length < 4) {
		return false;
	}

	return buf[0] === 102 &&
  buf[1] === 76 &&
  buf[2] === 97 &&
  buf[3] === 67; 
};

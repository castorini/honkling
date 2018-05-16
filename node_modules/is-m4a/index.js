'use strict';
module.exports = function (buf) {
	if (!buf || buf.length < 8) {
		return false;
	}

	return (buf[4] === 102 &&
		buf[5] === 116 &&
		buf[6] === 121 &&
		buf[7] === 112) || (
      buf[0] === 77 &&
      buf[1] === 52 &&
      buf[2] === 65 &&
      buf[3] === 32
    );
};

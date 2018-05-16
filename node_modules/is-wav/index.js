'use strict';
module.exports = function (buf) {
	if (!buf || buf.length < 12) {
		return false;
	}

	return buf[0] === 82 &&
		buf[1] === 73 &&
		buf[2] === 70 &&
		buf[3] === 70 &&
		buf[8] === 87 &&
		buf[9] === 65 &&
		buf[10] === 86 &&
		buf[11] === 69;
};

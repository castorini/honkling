'use strict';
module.exports = function (buf) {
	if (!buf || buf.length < 4) {
		return false;
	}

	return  buf[0] === 79 &&
		buf[1] === 103 &&
		buf[2] === 103 &&
                buf[3] === 83;
};

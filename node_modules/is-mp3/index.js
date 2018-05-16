'use strict';
module.exports = function (buf) {
	if (!buf || buf.length < 3) {
		return false;
	}

	return (buf[0] === 73 &&
		buf[1] === 68 &&
		buf[2] === 51) || ( 
      buf[0] === 255 &&
      (buf[1] === 251 || buf[1] === 250)
    );
  
};

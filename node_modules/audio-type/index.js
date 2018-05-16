'use strict';
module.exports = function (buf) {
	if (!buf) {
		return false;
	}

	if (require('is-mp3')(buf)) {
		return 'mp3';
	}

	if (require('is-wav')(buf)) {
		return 'wav';
	}

	if (require('is-ogg')(buf)) {
		return 'oga';
	}

	if (require('is-flac')(buf)) {
		return 'flac';
	}

	if (require('is-m4a')(buf)) {
		return 'm4a';
	}

	return false;
};

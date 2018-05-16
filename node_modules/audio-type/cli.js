#!/usr/bin/env node
'use strict';
var readChunk = require('read-chunk');
var pkg = require('./package.json');
var audioType = require('./index');
var input = process.argv[2];

function help() {
	console.log(pkg.description);
	console.log('');
	console.log('Usage');
	console.log('  $ cat <filename> | audio-type');
	console.log('  $ audio-type <filename>');
	console.log('');
	console.log('Example');
	console.log('  $ cat meow.mp3 | audio-type');
	console.log('  mp3');
}

function init(data) {
	var type = audioType(data);

	if (type) {
		console.log(type);
	} else {
		console.error('Unrecognized audio type');
		process.exit(65);
	}
}

if (process.argv.indexOf('-h') !== -1 || process.argv.indexOf('--help') !== -1) {
	help();
	return;
}

if (process.argv.indexOf('-v') !== -1 || process.argv.indexOf('--version') !== -1) {
	console.log(pkg.version);
	return;
}

if (process.stdin.isTTY) {
	if (!input) {
		help();
		return;
	}

	init(readChunk.sync(input, 0, 12));
} else {
	process.stdin.once('data', function (data) {
		init(data);
	});
}

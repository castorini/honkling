(function () {
'use strict';
const SpeechDataset = require('./data');
let data = new SpeechDataset();
data.load();

const url = require('url');
const http = require('http');
var express = require('express')
var bodyParser = require('body-parser')

var app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(function (req, res) {
    res.setHeader('Content-Type', 'text/plain')
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    res.write('you posted:\n')
    res.end(JSON.stringify(req.body.mfcc, null, 2))
  })
app.listen(80, '127.0.0.1');
})();
# hey_firefox

This branch contains minimal code for the pocketsphinx/honlking based hey firefox detection demo.

Unlike the existing implementation of Honkling, this implementation functions as a web service on its own exploiting Node.js.

## Instructions

* Fetch trained weights: `git submodule update --init --recursive`

* [Install Node.js & npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

* To install all the necessary packages: `npm install`

* To run the server: `npm run dev`

Open a browser (Firefox recommended) and navigate to `localhost:8000` for honkling-based implementation

PocketSphinx-based implementation is available at `localhost:8000/pocketsphinx`. For this implementation, user needs to click start manually.

# Honkling-node

Honkling is also available in Node.js!

[Honkling-assistant](https://github.com/castorini/honkling/tree/master/honkling-assistant) is an customizable voice-enabled virtual assistants implemented with Honkling-node

## Installation

1. First, run following command to clone submodule [Honkling-models](https://github.com/castorini/honkling-models)

&nbsp;&nbsp;&nbsp;&nbsp;`git submodule update --init --recursive`

2. Install necessary node packages

&nbsp;&nbsp;&nbsp;&nbsp;`npm install`

3. Verify that weights are being loaded correctly

&nbsp;&nbsp;&nbsp;&nbsp;`npm run test`

4. Link honkling-node to your project!

&nbsp;&nbsp;&nbsp;&nbsp;`npm link <path to honkling-node>`


## Usage

```
var KeywordSpotter = require('honkling-node')

// initialize KeywordSpotter with RES8 model
let keywordSpotter = new KeywordSpotter("RES8");

// list keywords
console.log("detectable keywords : " + keywordSpotter.getCommands());

// process raw audio data and detect keyword
let raw_audio_data = ...
let prediction = keywordSpotter.predict(raw_audio_data);
```

`KeywordSpotter` takes in 3 arguments.

| argument         | options | default | description |
|----------------|--------------|---------|-------------|
| `modelName`   | RES8, RES8_40, RES8_80, RES8_NARROW, RES8_NARROW_40, RES8_NARROW_80, light, mojibar       | RES8     | type of usage            |
| `modelType`   | RES8, RES8_40, RES8_80, RES8_NARROW, RES8_NARROW_40, RES8_NARROW_80       | RES8     | type of model            |
| `predThreshold`   | [0,1]       | 0.85     | threshold for prediction   |

### available keywords

`default` - [silence, unknown, yes, no, up, down, left, right, on, off, stop, go]

`light` -  [silence, unknown, on, off, up, down]

`mojibar` - [silence, unknown, workplace, volume, up, down, wikipedia, canada, list, one, two, three, four, right, left, open, top, memory]

Please refer to [honkling-assistant](https://github.com/castorini/honkling/tree/master/honkling-assistant) and [our testing code](https://github.com/castorini/honkling/blob/master/honkling-node/test/test.js) for more details!

## Customizing Honkling-node

Please refer [`honkling` branch of honk](https://github.com/castorini/honk/tree/honkling#training-model-for-honkling) to customize keyword set or train a new model.

Once you obtain weight file in json format using honk, move the file into `models/honkling-node/` directory. Next, prepend `module.exports =` &nbsp;to the json object and update [weights.js](https://github.com/castorini/honkling/blob/master/honkling-node/weights.js).

Depending on change, [config.js](`https://github.com/castorini/honkling/blob/master/honkling-node/config.js`) must be updated as well.

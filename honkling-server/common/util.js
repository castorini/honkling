function isNumeric(str) {
  return !isNaN(str)
}

function isAllZero(data) {
  return data.every(function(elem) {return elem == 0})
}

function duplicateElements(arr, times) {
  duplicated = []
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < times; j++) {
      duplicated.push(arr[i]);
    }
  }
  return duplicated
}

function shuffleArray(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function printData(name, data) {
  if (data.length == 0) {
    console.log('\t', name, ' has length of 0');
  } else if (this.isAllZero(data)) {
    console.log(name, data);
    console.log('\t', name, ' is all zero array with length ', data.length);
  }
  console.log(name, data);

  if (Array.isArray(data[0])) {
    // 2D array
    var temp = data;
    data = [];

    for (var i = 0; i < temp.length; i++) {
      for (var j = 0; j < temp[i].length; j++) {
        data.push(temp[i][j]);
      }
    }
  }
  const arrMin = arr => Math.min(...arr);
  const arrMax = arr => Math.max(...arr);
  const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length

  console.log('\trange : ( ', arrMin(data), ' ~ ', arrMax(data), ' )');
  console.log('\tmean : ', arrAvg(data))

  var i = 0;
  while (data[i] == 0) {
    i++;
  }
  console.log('\tfirst non zero element : ', i, ' - ', data[i]);

  i = data.length - 1;
  while (data[i] == 0) {
    i--;
  }
  console.log('\tlast non zero element : ', i, ' - ', data[i]);
}

function roundTo(num, place) {
  return +(Math.round(num + "e+" + place)  + "e-"+place);
}

function numberWithCommas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function sortNumberArray(arr) {
  arr.sort(function (a, b) { return a - b; });
}

function percentile(arr, p) {
  if (arr.length === 0) return 0;
  if (typeof p !== 'number') throw new TypeError('p must be a number');
  if (p <= 0) return arr[0];
  if (p >= 1) return arr[arr.length - 1];

  var index = (arr.length - 1) * p
      lower = Math.floor(index),
      upper = lower + 1,
      weight = index % 1;

  if (upper >= arr.length) return arr[lower];
  return arr[lower] * (1 - weight) + arr[upper] * weight;
}

function transpose2d(arr) {
  let row = arr.length;
  let col = arr[0].length;

  let transposed = [];
  for (var j = 0; j < col; j++) {
    transposed.push([]);
  }

  for (var i = 0; i < row; i++) {
    for (var j = 0; j < col; j++) {
      transposed[j].push(arr[i][j]);
    }
  }
  return transposed;
}

function flatten2d(arr) {
  let row = arr.length;
  let col = arr[0].length;

  let flattened = [];

  for (var i = 0; i < row; i++) {
    for (var j = 0; j < col; j++) {
      flattened.push(arr[i][j]);
    }
  }
  return flattened;
}

function transposeFlatten2d(arr) {
  let row = arr.length;
  let col = arr[0].length;

  let flattened = [];

  for (var j = 0; j < col; j++) {
    for (var i = 0; i < row; i++) {
      flattened.push(arr[i][j]);
    }
  }
  return flattened;
}

function calculateAccuracy(output, target) {
  if (output.length != target.length) {
    console.error('output(' + output.length + ') and target(' + target.length + ') have different size !');
  }
  let correct = 0;
  for (var i = 0; i < output.length; i++) {
    if (output[i] == target[i]) {
      correct += 1;
    }
  }
  return correct/output.length;
}

// old version
// function predictKeyword(x, model, commands) {
//   let output = model.predict(x);

//   let index = commands.indexOf("unknown");
//   let max_prob = 0;

//   for (let i = 0; i < commands.length; i++) {
//     if (output[i] > predictionThreshold && output[i] > max_prob) {
//       index = i;
//     }
//   }

//   return commands[index];
// }

// // ww4ff version
// class InferenceEngine {
//   constructor(config, commands) {
//     this.predictionThreshold = config['predictionThreshold'];
//     this.num_smoothing_frame = config['num_smoothing_frame'];
//     this.num_confidence_frame = config['num_confidence_frame'];

//     this.alpha = config['alpha'];
//     this.value = [];
//     for (var i = 0; i < commands.length; i++) {
//       this.value.push(0)
//     }
//   }

//   infer(x, model, commands) {
//     let output = model.predict(x);

//     let msg = ""

//     for (var i = 0; i < commands.length; i++) {
//       this.value[i] = this.value[i] * (1 - this.alpha) + this.alpha * output[i]

//       // msg += String(output[i])
//       // if (i < commands.length-1) {
//       //   msg += ", "
//       // }
//     }

//     let index = commands.indexOf("unknown");
//     let max_prob = 0;

//     for (let i = 0; i < commands.length; i++) {
//       if (this.value[i] > max_prob) {
//         index = i;
//         max_prob = this.value[i]
//       }

//       msg += String(this.value[i])
//       if (i < commands.length-1) {
//         msg += ", "
//       }
//     }

//     let command = commands[index]

//     if (command == "hey" || command == "fire" || command == "fox") {

//       if (max_prob > this.predictionThreshold) {
//         console.log("%c%s: %s", "color:green", command, msg);
//       } else if (max_prob > 0.75) {
//         console.log("%c%s: %s", "color:yellowgreen", command, msg);
//       } else if (max_prob > 0.5) {
//         console.log("%c%s: %s", "color:gold", command, msg);
//       } else if (max_prob > 0.25) {
//         console.log("%c%s: %s", "color:orange", command, msg);
//       } else {
//         console.log("%c%s: %s", "color:red", command, msg);
//       }
//     } else {
//       console.log("%s: %s", command, msg);
//     }

//     return command
//   }
// }

class InferenceEngine {
  constructor(config, commands) {
    this.predictionThreshold = config['predictionThreshold'];
    this.num_smoothing_frame = config['num_smoothing_frame'];
    this.num_confidence_frame = config['num_confidence_frame'];
    this.commands = commands;
    this.num_class = commands.length;

    // posterior smoothing
    this.pred_history = [];
    this.acum_pred_history = [];
    for (var i = 0; i < this.num_smoothing_frame; i++) {
      let history = [];
      for (var j = 0; j < this.num_class; j++) {
        history.push(0);
      }
      this.pred_history.push(history);
    }

    for (var j = 0; j < this.num_class; j++) {
      this.acum_pred_history.push(0);
    }

    // confidence
    this.smoothed_history = [];
    for (var i = 0; i < this.num_smoothing_frame; i++) {
      let smoothed = [];
      for (var j = 0; j < this.num_class; j++) {
        smoothed.push(0);
      }
      this.smoothed_history.push(smoothed);
    }

    // to prevent iterating again upon success
    this.final_prediction = 0;
    this.max_pred = 0;
  }

  calculateConfidence(pred) {
    let oldest_pred = this.pred_history[0];
    this.pred_history.shift();

    let oldest_conf = this.smoothed_history[0];
    this.smoothed_history.shift();

    let smoothed = [];

    this.final_prediction = 0;
    this.max_pred = 0;

    for (var i = 0; i < this.num_class; i++) {
      this.acum_pred_history[i] -= oldest_pred[i];
      this.acum_pred_history[i] += pred[i];
      smoothed.push(this.acum_pred_history[i]/this.num_smoothing_frame);

      // to prevent iterating again upon success
      if (smoothed[i] > this.max_pred) {
        this.max_pred = smoothed[i];
        this.final_prediction = i;
      }
    }

    this.pred_history.push(pred);
    this.smoothed_history.push(smoothed);

    // confidence score does not make sense
    return this.max_pred;

    // let msg = '';

    // let confidence = 1;
    // for (var i = 0; i < this.num_class; i++) {
    //   let highest_prob = 0;
    //   for (var j = 0; j < this.num_smoothing_frame; j++) {
    //     if (this.smoothed_history[j][i] > highest_prob) {
    //       highest_prob = this.smoothed_history[j][i];
    //     }
    //   }
    //   msg += "  " + String(highest_prob)

    //   confidence *= highest_prob;
    // }

    // console.log(msg);

    // return Math.pow(confidence, 1/this.num_class);
  }

  infer(x, model) {
    let pred = model.predict(x);

    let confidence = this.calculateConfidence(pred);

    // if (confidence < this.predictionThreshold) {
    //   this.final_prediction = this.commands.indexOf("unknown");
    // }

    let command = this.commands[this.final_prediction];

    if (command == "hey" || command == "fire" || command == "fox") {

      if (confidence > this.predictionThreshold) {
        console.log("%c%s: %s (%s)", "color:green", command, this.max_pred, confidence);
      } else if (confidence > 0.75) {
        console.log("%c%s: %s (%s)", "color:yellowgreen", command, this.max_pred, confidence);
      } else if (confidence > 0.5) {
        console.log("%c%s: %s (%s)", "color:gold", command, this.max_pred, confidence);
      } else if (confidence > 0.25) {
        console.log("%c%s: %s (%s)", "color:orange", command, this.max_pred, confidence);
      } else {
        console.log("%c%s: %s (%s)", "color:red", command, this.max_pred, confidence);
      }
    } else {
      // console.log("%s: %s (%s)", command, this.max_pred, confidence);
    }

    return command
  }
}

// Function to download data to a file
function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}
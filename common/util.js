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

class InferenceEngine {
  constructor(config, commands) {
    this.predictionThreshold = config['predictionThreshold'];
    this.inference_window = config['inference_window'] * 1000;
    this.tolerance_window = config['tolerance_window'] * 1000;
    this.inference_weights = config['inference_weights'];
    this.inference_sequence = config['inference_sequence'];
    this.commands = commands;
    this.num_class = commands.length;

    if (this.num_class != this.inference_weights.length) {
      alert('inference weights and number of commands mismatch');
    }

    // posterior smoothing
    this.pred_history = [];
    this.smoothed_history = [];
    this.label_history = [];
  }

  sequencePresent() {
    var d = new Date();
    let curr_time = d.getTime();

    this.label_history = this.dropOldEntries(curr_time, this.label_history, this.inference_window);

    let curr_index = -1;
    let target_index = 0;
    let valid_timestemp = 0;
    let target_label = null;
    let label = null;
    let curr_label = null;
    let curr_timestemp = null;

    for (var i = 0; i < this.label_history.length; i++) {
      curr_timestemp = this.label_history[i][0];
      label = this.label_history[i][1];
      target_label = this.inference_sequence[target_index];
      curr_label = this.inference_sequence[curr_index];

      if (curr_label == label) { // continue with the previous entry
        valid_timestemp = curr_timestemp;
      } else if (label == target_label) { // move to next entry
        curr_index += 1;
        target_index += 1;
        valid_timestemp = curr_timestemp;
        if (target_index == this.inference_sequence.length) { // detected if the last index
          return true;
        }
      } else if (valid_timestemp + this.tolerance_window < curr_timestemp) {
        curr_index = -1;
        target_index = 0;
        valid_timestemp = 0;
      }
    }
    return false;
  }

  dropOldEntries(curr_time, history_array, window_size) {
    let i;
    for (i = 0; i < history_array.length; i++) {
      if (curr_time - history_array[i][0] < window_size) {
        break;
      }
    }

    return history_array.slice(i, history_array.length);
  }

  accumulateArray(history_array) {
    let accum_history = [];
    for (var j = 0; j < this.num_class; j++) {
      accum_history.push(0);
    }

    for (var i = 0; i < history_array.length; i++) {
      for (var j = 0; j < this.num_class; j++) {
        accum_history[j] += history_array[i][1][j];
      }
    }
    return accum_history;
  }

  updatePredHistory(curr_time) {
    this.pred_history = this.dropOldEntries(curr_time, this.pred_history, this.inference_window);

    let accum_history = this.accumulateArray(this.pred_history);
    this.smoothed_history.push([curr_time, accum_history]);
  }

  getPrediction(curr_time) {
    this.smoothed_history = this.dropOldEntries(curr_time, this.smoothed_history, this.inference_window);

    this.final_score = this.accumulateArray(this.smoothed_history);

    let max_ind = 0;
    let max_val = 0;
    for (var i = 0; i < this.final_score.length; i++) {
      if (this.final_score[i] > max_val) {
        max_val = this.final_score[i];
        max_ind = i;
      }
    }

    this.label_history.push([curr_time, max_ind]);

    // this._update_label_history()
    return max_ind;
  }

  infer(x, model) {
    let pred = model.predict(x);

    let total = 0;

    for (var i = 0; i < this.num_class; i++) {
      pred[i] = pred[i] * this.inference_weights[i];
      total += pred[i];
    }

    for (var i = 0; i < this.num_class; i++) {
      pred[i] = pred[i] / total;
    }

    var d = new Date();
    this.pred_history.push([d.getTime(), pred]);
    this.updatePredHistory(d.getTime());
    let label = this.getPrediction(d.getTime());
    let command = this.commands[label];

    // if (command == "hey" || command == "firefox") {
    //
    //   if (this.final_score[label] > this.predictionThreshold) {
    //     console.log("%c%s (%s)", "color:green", command, this.final_score[label]);
    //   } else if (this.final_score[label] > 0.75) {
    //     console.log("%c%s (%s)", "color:yellowgreen", command, this.final_score[label]);
    //   } else if (this.final_score[label] > 0.5) {
    //     console.log("%c%s (%s)", "color:gold", command, this.final_score[label]);
    //   } else if (this.final_score[label] > 0.25) {
    //     console.log("%c%s (%s)", "color:orange", command, this.final_score[label]);
    //   } else {
    //     console.log("%c%s (%s)", "color:red", command, this.final_score[label]);
    //   }
    // } else {
    //   // console.log("%s: %s (%s)", command, this.final_score[label]);
    // }

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

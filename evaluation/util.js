const tf = require('@tensorflow/tfjs');

module.exports.isEmpty = function(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

module.exports.pad_center = function(data, size) {
  // assume it will always be one dimensional
  let n = data.shape[0]
  let lpad = Math.floor((size - n) / 2)
  let lengths = [lpad, (size - n - lpad)];
  return data.pad([lengths]);
}

module.exports.pad_reflect = function(data, size) {
  // padding with reflect mode
  let n = data.shape[0];

  let lpad_size = Math.floor((size - n) / 2);
  let lpad_index = tf.range(1, lpad_size+1).reverse();
  let lpad = data.gather(lpad_index.toInt());

  let rpad_size = (size - n - lpad_size);
  let rpad_index = tf.range(n-rpad_size-1, n-1).reverse();
  let rpad = data.gather(rpad_index.toInt());

  return lpad.concat(data).concat(rpad);
}

module.exports.transpose2d = function(arr) {
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

module.exports.flatten2d = function(arr) {
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

module.exports.transposeFlatten2d = function(arr) {
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

function log10(x) {
  let numerator = tf.log(x)
  let denominator = tf.log(tf.scalar(10))
  return numerator.div(denominator)
}

module.exports.hz_to_mel = function(frequencies, htk=false) {
  if (!(frequencies instanceof tf.Tensor)) {
    frequencies = tf.tensor(frequencies);
  }

  if (htk) {
    frequencies = frequencies.div(tf.scalar(700.0)).add(tf.scalar(1.0))
    return log10(frequencies).mul(tf.scalar(2595.0))
  }

  // Fill in the linear part
  let f_min = 0.0;
  let f_sp = 200.0/3;

  // Fill in the linear part
  let min_log_hz = 1000.0; // beginning of log region (Hz)
  let min_log_mel = (min_log_hz - f_min) / f_sp // beginning of log region (Mels)
  let logstep = Math.log(6.4) / 27.0;

  let mels = null;

  if (frequencies.shape.length == 0) {
    // constant case
    let freq_value = frequencies.dataSync()[0];

    mels = (freq_value - f_min)/f_sp
    if (freq_value >= min_log_hz) {
      mels = min_log_mel + Math.log(freq_value / min_log_hz) / logstep;
    }
    mels = tf.scalar(mels)
  } else {
    mels = frequencies.sub(f_min).div(f_sp);
    let indices = tf.lessEqual(frequencies, min_log_hz);
    let new_vals = tf.log(frequencies.div(min_log_hz)).div(logstep).add(min_log_mel)
    mels = mels.where(indices, new_vals)
  }

  return mels
}

module.exports.mel_to_hz = function(mels, htk=false) {
  if (!(mels instanceof tf.Tensor)) {
    mels = tf.tensor(mels);
  }

  if (htk) {
    return tf.scalar(10.0).pow(mels.div(tf.scalar(2595.0))).sub(tf.scalar(1.0)).mul(tf.scalar(700.0))
  }

  // Fill in the linear part
  let f_min = 0.0;
  let f_sp = 200.0/3;

  // Fill in the linear part
  let min_log_hz = 1000.0; // beginning of log region (Hz)
  let min_log_mel = (min_log_hz - f_min) / f_sp; // beginning of log region (Mels)
  let logstep = Math.log(6.4) / 27.0;

  let freqs = null;

  if (mels.shape.length == 0) {
    // constant case
    let mel_value = mels.dataSync[0];
    freqs = (mel_value * f_sp) + f_min;

    if (mel_value >= min_log_mel) {
      freqs = min_log_mel * Math.exp(logstep * (mels.get(i) - min_log_mel));
    }
    freqs = tf.scalar(freqs)
  } else {
    // array values
    freqs = mels.mul(f_sp).add(f_min);
    let indices = tf.lessEqual(mels, min_log_mel);
    let new_vals = tf.exp(mels.sub(min_log_mel).mul(logstep)).mul(min_log_hz)
    freqs = freqs.where(indices, new_vals);
  }
  return freqs
}

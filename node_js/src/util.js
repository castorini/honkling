encodeData = function(url, data) {
  let encoded = url + '?'
  let keys = Object.keys(data);
  for (var i = 0; i < keys.length; i++) {
    let key = keys[i];
    encoded = encoded + encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
    if (i < keys.length-1) {
      encoded += '&';
    }
  }
  return encoded;
}

transpose2d = function(arr) {
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

flatten2d = function(arr) {
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

transposeFlatten2d = function(arr) {
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

hrtimeToMs = function(arr) {
  return (arr[0] * 1000) + (arr[1] / 1000000);
}

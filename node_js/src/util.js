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

  console.log(encoded);
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
